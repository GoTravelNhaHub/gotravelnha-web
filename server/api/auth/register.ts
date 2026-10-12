import * as bcrypt from 'bcrypt'
import { defineEventHandler, readBody } from 'h3'
import prisma from '~/server/utils/prisma'
import { setAuthSession } from '~/server/utils/session'
import { enforceRateLimit } from '~/server/utils/activity-limits'

export default defineEventHandler(async (event) => {
  enforceRateLimit(event, 'register', 5, 60 * 60 * 1000)
  try {
    const body = await readBody(event)

    // Validate input
    if (!body.username || !body.email || !body.password) {
      throw createError({
        statusCode: 400,
        message: 'Username, email, and password are required'
      })
    }

    // Check if username already exists
    const existingUsername = await prisma.user.findUnique({
      where: { username: body.username }
    })

    if (existingUsername) {
      throw createError({
        statusCode: 400,
        message: 'Username already exists'
      })
    }

    // Check if email already exists
    const existingEmail = await prisma.user.findUnique({
      where: { email: body.email }
    })

    if (existingEmail) {
      throw createError({
        statusCode: 400,
        message: 'Email already exists'
      })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(body.password, 10)

    // Create user (default role is USER)
    const user = await prisma.user.create({
      data: {
        username: body.username,
        email: body.email,
        password: hashedPassword,
        firstName: body.firstName,
        lastName: body.lastName,
        role: 'USER',
        isActive: true
      }
    })

    // Process referral if code provided
    if (typeof body.referralCode === 'string' && body.referralCode.length > 0 && body.referralCode.length <= 40) {
      try {
        const referral = await prisma.referral.findUnique({
          where: { referralCode: body.referralCode }
        })

        if (
          referral &&
          referral.status === 'PENDING' &&
          !referral.refereeId &&
          referral.referrerId !== user.id
        ) {
          const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
          const recentSignups = await prisma.referral.count({
            where: {
              referrerId: referral.referrerId,
              signupAt: { gte: dayAgo }
            }
          })

          const claimed = await prisma.referral.updateMany({
            where: { id: referral.id, status: 'PENDING', refereeId: null },
            data: {
              refereeId: user.id,
              status: 'SIGNED_UP',
              signupAt: new Date()
            }
          })

          // One code pays once, and a referrer can earn at most five signup rewards a day.
          if (claimed.count === 1 && recentSignups < 5) {
            await prisma.loyaltyPoint.create({
              data: {
                userId: referral.referrerId,
                points: 100,
                reason: 'Referral signup'
              }
            })
          }
        }
      } catch (referralError) {
        console.error('Error processing referral:', referralError)
        // Don't fail registration if referral processing fails
      }
    }

    await setAuthSession(event, user.id)

    // Return user data (without password)
    const { password, resetToken, resetTokenExpires, ...userWithoutPassword } = user

    return {
      success: true,
      user: userWithoutPassword,
      message: 'Account created successfully'
    }
  } catch (error: any) {
    console.error('Registration error:', error)
    if (error?.statusCode && error.statusCode < 500) throw error
    throw createError({ statusCode: 500, message: 'Could not create the account.' })
  }
})

