import * as bcrypt from 'bcrypt'
import { defineEventHandler, readBody } from 'h3'
import prisma from '~/server/utils/prisma'
import { setAuthSession } from '~/server/utils/session'
import { enforceRateLimit } from '~/server/utils/activity-limits'

export default defineEventHandler(async (event) => {
  enforceRateLimit(event, 'login', 10, 15 * 60 * 1000)
  try {
    const body = await readBody(event)

    // Validate input
    if (!body.username || !body.password) {
      throw createError({
        statusCode: 400,
        message: 'Username and password are required'
      })
    }

    // Find user by username or email
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: body.username },
          { email: body.username }
        ],
        isActive: true
      }
    })

    if (!user) {
      throw createError({
        statusCode: 401,
        message: 'Invalid username or password'
      })
    }

    // Verify password
    if (!user.password || !(await bcrypt.compare(body.password, user.password))) {
      throw createError({
        statusCode: 401,
        message: 'Invalid username or password'
      })
    }

    await setAuthSession(event, user.id)

    // Return user data (without password)
    const { password, resetToken, resetTokenExpires, ...userWithoutPassword } = user

    return {
      success: true,
      user: userWithoutPassword,
      role: user.role
    }
  } catch (error: any) {
    console.error('Login error:', error)
    if (error?.statusCode && error.statusCode < 500) throw error
    throw createError({ statusCode: 500, message: 'Could not sign in.' })
  }
})

