import { createError, defineEventHandler } from 'h3'
import prisma from '~/server/utils/prisma'
import { BOOKING_ATTENTION_WHERE } from '~/server/utils/booking-attention'
import { PLANNER_SITE_DAILY_LIMIT } from '~/server/services/itinerary-generator'

const DAY_MS = 24 * 60 * 60 * 1000

// Admin dashboard (admin-gated by server/middleware/auth-guard.ts). Everything here is
// read from the database or from which settings are present; nothing is a placeholder.
export default defineEventHandler(async () => {
  const now = Date.now()
  const dayAgo = new Date(now - DAY_MS)
  const weekAgo = new Date(now - 7 * DAY_MS)

  try {
    const [
      totalEntities,
      activeUsers,
      conversionRevenueSgd,
      conversionRevenueAll,
      latestOfferUpdate,
      bookingsNeedingAttention,
      openSupport,
      newUsers7d,
      aiPlans24h,
      aiPlans7d,
      affiliateClicks7d,
      paidBookings7d,
      latestSupport,
      latestAttentionBookings
    ] = await Promise.all([
      prisma.affiliateEntity.count({ where: { status: 'active' } }),
      prisma.user.count({ where: { isActive: true } }),
      prisma.affiliateConversionEvent.aggregate({ where: { currency: 'SGD' }, _sum: { commission: true } }),
      prisma.affiliateConversionEvent.aggregate({ _sum: { commission: true } }),
      prisma.affiliateOffer.aggregate({ _max: { updatedAt: true } }),
      prisma.attractionsgBooking.count({ where: BOOKING_ATTENTION_WHERE }),
      prisma.contactMessage.count({ where: { handledAt: null } }),
      prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.itineraryGeneration.count({ where: { createdAt: { gte: dayAgo } } }),
      prisma.itineraryGeneration.count({ where: { createdAt: { gte: weekAgo }, status: 'SUCCESS' } }),
      prisma.affiliateClickEvent.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.attractionsgBooking.aggregate({
        where: { paidAt: { gte: weekAgo }, currency: 'SGD' },
        _count: { _all: true },
        _sum: { amount: true }
      }),
      prisma.contactMessage.findMany({
        where: { handledAt: null },
        orderBy: { createdAt: 'desc' },
        take: 4,
        select: { id: true, name: true, message: true, reference: true, createdAt: true }
      }),
      prisma.attractionsgBooking.findMany({
        where: BOOKING_ATTENTION_WHERE,
        orderBy: { createdAt: 'desc' },
        take: 4,
        select: { id: true, reference: true, eventTitle: true, customerName: true, supplierStatus: true, createdAt: true }
      })
    ])

    const revenue = conversionRevenueSgd._sum.commission ?? conversionRevenueAll._sum.commission ?? 0
    const config = useRuntimeConfig()

    return {
      success: true,
      data: {
        totalEvents: totalEntities,
        activeUsers,
        revenue: Number(revenue) || 0,
        lastScrapeAt: latestOfferUpdate._max.updatedAt,
        attention: {
          bookings: bookingsNeedingAttention,
          support: openSupport
        },
        week: {
          newUsers: newUsers7d,
          aiPlans: aiPlans7d,
          affiliateClicks: affiliateClicks7d,
          paidBookings: paidBookings7d._count._all,
          bookingRevenue: Number(paidBookings7d._sum.amount) || 0
        },
        planner: {
          last24h: aiPlans24h,
          siteDailyLimit: PLANNER_SITE_DAILY_LIMIT
        },
        queue: {
          support: latestSupport.map((item) => ({
            ...item,
            message: item.message.replace(/\s+/g, ' ').slice(0, 140)
          })),
          bookings: latestAttentionBookings
        },
        // Whether each setting is present. Values are never returned.
        config: {
          email: Boolean(config.SMTP_HOST),
          supportInbox: Boolean(config.SELF_BOOKING_NOTIFY_EMAIL || config.SMTP_USER),
          payments: Boolean(config.STRIPE_SECRET_KEY && config.STRIPE_WEBHOOK_SECRET),
          aiPlanner: Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN)
        }
      }
    }
  } catch (error: any) {
    console.error('Admin dashboard stats fetch error:', error)
    throw createError({ statusCode: 500, message: 'Failed to load dashboard stats' })
  }
})
