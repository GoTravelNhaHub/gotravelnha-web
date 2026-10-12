import { defineEventHandler, getQuery } from 'h3'
import prisma from '~/server/utils/prisma'

const round2 = (value: number) => Math.round(value * 100) / 100

// Per-order economics for self-checkout bookings plus affiliate clicks and commissions.
// Window is by booking/click creation date.
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const days = Math.min(Math.max(Number.parseInt(String(query.days ?? '30'), 10) || 30, 1), 365)
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

  const [bookings, clicksByProvider, conversions] = await Promise.all([
    prisma.attractionsgBooking.findMany({
      where: { createdAt: { gte: since } },
      select: {
        eventId: true,
        eventTitle: true,
        status: true,
        amount: true,
        currency: true,
        stripeFeeAmount: true,
        resellerCost: true,
        refundedAmount: true,
        supplierStatus: true
      }
    }),
    prisma.affiliateClickEvent.groupBy({
      by: ['provider'],
      where: { createdAt: { gte: since } },
      _count: { _all: true }
    }),
    prisma.affiliateConversionEvent.groupBy({
      by: ['provider', 'currency'],
      where: { createdAt: { gte: since } },
      _count: { _all: true },
      _sum: { commission: true }
    })
  ])

  // Orders where money was taken (fully refunded orders stay in so refunds show up)
  const paid = bookings.filter((b) => b.status === 'PAID' || b.status === 'REFUNDED')

  const totals = paid.reduce(
    (acc, b) => {
      acc.gross += b.amount
      acc.refunds += b.refundedAmount ?? 0
      acc.stripeFees += b.stripeFeeAmount ?? 0
      acc.supplierCost += b.resellerCost ?? 0
      if (b.resellerCost === null) acc.missingCost += 1
      return acc
    },
    { gross: 0, refunds: 0, stripeFees: 0, supplierCost: 0, missingCost: 0 }
  )
  const contribution = totals.gross - totals.refunds - totals.stripeFees - totals.supplierCost

  const byAttraction = new Map<
    string,
    { eventTitle: string; orders: number; gross: number; contribution: number }
  >()
  for (const b of paid) {
    const row = byAttraction.get(b.eventId) ?? { eventTitle: b.eventTitle, orders: 0, gross: 0, contribution: 0 }
    row.orders += 1
    row.gross += b.amount
    row.contribution +=
      b.amount - (b.refundedAmount ?? 0) - (b.stripeFeeAmount ?? 0) - (b.resellerCost ?? 0)
    byAttraction.set(b.eventId, row)
  }

  const checkoutsStarted = bookings.length

  return {
    success: true,
    data: {
      days,
      currency: 'SGD',
      checkout: {
        started: checkoutsStarted,
        paid: paid.length,
        conversionRate: checkoutsStarted ? round2((paid.length / checkoutsStarted) * 100) : 0,
        refunded: paid.filter((b) => b.status === 'REFUNDED').length,
        awaitingSupplier: paid.filter((b) => b.status === 'PAID' && b.supplierStatus !== 'CONFIRMED').length
      },
      orders: {
        gross: round2(totals.gross),
        refunds: round2(totals.refunds),
        stripeFees: round2(totals.stripeFees),
        supplierCost: round2(totals.supplierCost),
        contribution: round2(contribution),
        contributionMargin: totals.gross ? round2((contribution / totals.gross) * 100) : 0,
        averageOrderValue: paid.length ? round2(totals.gross / paid.length) : 0,
        contributionPerOrder: paid.length ? round2(contribution / paid.length) : 0,
        ordersMissingSupplierCost: totals.missingCost
      },
      byAttraction: [...byAttraction.values()]
        .map((row) => ({ ...row, gross: round2(row.gross), contribution: round2(row.contribution) }))
        .sort((a, b) => b.contribution - a.contribution)
        .slice(0, 20),
      affiliate: {
        clicksByProvider: clicksByProvider
          .map((row) => ({ provider: row.provider, clicks: row._count._all }))
          .sort((a, b) => b.clicks - a.clicks),
        conversions: conversions.map((row) => ({
          provider: row.provider,
          currency: row.currency ?? 'USD',
          conversions: row._count._all,
          commission: round2(row._sum.commission ?? 0)
        }))
      }
    }
  }
})
