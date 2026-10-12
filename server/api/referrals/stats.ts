import { defineEventHandler } from 'h3'
import prisma from '~/server/utils/prisma'
import { requireUser } from '~/server/utils/session'

/** Referral stats for the signed-in user. The client cannot pick another userId. */
export default defineEventHandler(async (event) => {
  try {
    const user = await requireUser(event)
    const userId = user.id

    const [totalReferrals, signedUp, completedBookings, totalRewards] = await Promise.all([
      prisma.referral.count({ where: { referrerId: userId } }),
      prisma.referral.count({
        where: { referrerId: userId, status: { in: ['SIGNED_UP', 'COMPLETED_BOOKING', 'REWARDED'] } }
      }),
      prisma.referral.count({
        where: { referrerId: userId, status: { in: ['COMPLETED_BOOKING', 'REWARDED'] } }
      }),
      prisma.referral.aggregate({
        where: { referrerId: userId },
        _sum: { rewardPoints: true }
      })
    ])

    const referrals = await prisma.referral.findMany({
      where: { referrerId: userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        status: true,
        createdAt: true,
        signupAt: true,
        referee: { select: { id: true, firstName: true } }
      }
    })

    return {
      success: true,
      stats: {
        totalReferrals,
        signedUp,
        completedBookings,
        totalRewards: totalRewards._sum.rewardPoints || 0
      },
      recentReferrals: referrals
    }
  } catch (error: any) {
    console.error('Error fetching referral stats:', error)
    if (error?.statusCode && error.statusCode < 500) throw error
    return { success: false, error: 'Failed to fetch referral stats' }
  }
})
