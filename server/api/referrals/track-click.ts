import { defineEventHandler, readBody } from 'h3'
import prisma from '~/server/utils/prisma'
import { enforceRateLimit } from '~/server/utils/activity-limits'

/** Record that a referral link was opened. Does not accept a user id or an email. */
export default defineEventHandler(async (event) => {
  try {
    enforceRateLimit(event, 'referral-click', 30, 10 * 60 * 1000)
    const body = await readBody(event)
    const code = typeof body?.code === 'string' ? body.code.trim() : ''

    if (!code || code.length > 40) {
      return { success: false, error: 'Referral code is required' }
    }

    const referral = await prisma.referral.findUnique({ where: { referralCode: code } })
    if (!referral || referral.status !== 'PENDING') {
      return { success: false, error: 'Invalid referral code' }
    }

    return { success: true, message: 'Referral click tracked' }
  } catch (error: any) {
    console.error('Error tracking referral click:', error)
    if (error?.statusCode && error.statusCode < 500) throw error
    return { success: false, error: 'Failed to track referral click' }
  }
})
