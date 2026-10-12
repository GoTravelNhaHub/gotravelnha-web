import { defineEventHandler, getQuery } from 'h3'
import prisma from '~/server/utils/prisma'
import { channelOf } from '~/server/utils/attribution'

const MAX_CLICKS_FOR_CHANNELS = 20000

const round2 = (value: number) => Math.round(value * 100) / 100

// Per-order economics for self-checkout bookings plus affiliate clicks and commissions.
// Window is by booking/click creation date.
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const days = Math.min(Math.max(Number.parseInt(String(query.days ?? '30'), 10) || 30, 1), 365)
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

  const [bookings, clicksByProvider, conversions, detailViewSessions, checkoutStartSessions, conversionRows, clickRows] = await Promise.all([
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
        supplierStatus: true,
        discountAmount: true,
        attribution: true
      }
    }),
    prisma.affiliateClickEvent.groupBy({
      by: ['provider'],
      where: { createdAt: { gte: since } },
      _count: { _all: true }
    }),
    prisma.affiliateConversionEvent.groupBy({
      by: ['provider', 'currency'],
      where: { createdAt: { gte: since }, NOT: { status: 'rejected' } },
      _count: { _all: true },
      _sum: { commission: true, saleAmount: true }
    }),
    // Funnel steps, by unique visitor session (see utils/visitor-session.ts)
    prisma.userActivity.groupBy({
      by: ['sessionId'],
      where: { timestamp: { gte: since }, action: 'page_view', page: { startsWith: '/attractionsg/' } }
    }),
    prisma.userActivity.groupBy({
      by: ['sessionId'],
      where: { timestamp: { gte: since }, action: 'click', data: { path: ['element'], equals: 'checkout_started' } }
    }),
    prisma.affiliateConversionEvent.findMany({
      where: { createdAt: { gte: since }, NOT: { status: 'rejected' } },
      select: { subId: true, commission: true, currency: true }
    }),
    prisma.affiliateClickEvent.findMany({
      where: { createdAt: { gte: since } },
      select: { subId: true, metadata: true },
      orderBy: { createdAt: 'desc' },
      take: MAX_CLICKS_FOR_CHANNELS
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

  // Per acquisition channel (first touch). Commission is joined to clicks on subId.
  type ChannelRow = { channel: string; orders: number; gross: number; contribution: number; clicks: number; commission: Record<string, number> }
  const channels = new Map<string, ChannelRow>()
  const channelRow = (channel: string) => {
    let row = channels.get(channel)
    if (!row) {
      row = { channel, orders: 0, gross: 0, contribution: 0, clicks: 0, commission: {} }
      channels.set(channel, row)
    }
    return row
  }
  for (const b of paid) {
    const row = channelRow(channelOf(b.attribution))
    row.orders += 1
    row.gross += b.amount
    row.contribution += b.amount - (b.refundedAmount ?? 0) - (b.stripeFeeAmount ?? 0) - (b.resellerCost ?? 0)
  }
  const channelBySubId = new Map<string, string>()
  for (const click of clickRows) {
    const channel = channelOf((click.metadata as { attribution?: unknown } | null)?.attribution)
    channelRow(channel).clicks += 1
    if (click.subId) channelBySubId.set(click.subId, channel)
  }
  for (const conversion of conversionRows) {
    const row = channelRow(channelBySubId.get(conversion.subId) ?? 'unknown')
    const currency = conversion.currency ?? 'USD'
    row.commission[currency] = (row.commission[currency] ?? 0) + (conversion.commission ?? 0)
  }

  const discounts = paid.reduce((sum, b) => sum + (b.discountAmount ?? 0), 0)
  const clicksByProviderMap = new Map(clicksByProvider.map((row) => [row.provider, row._count._all]))

  return {
    success: true,
    data: {
      days,
      currency: 'SGD',
      funnel: {
        detailViewSessions: detailViewSessions.length,
        checkoutStartedSessions: checkoutStartSessions.length,
        checkoutSessionsCreated: checkoutsStarted,
        paidOrders: paid.length,
        viewToPaidRate: detailViewSessions.length ? round2((paid.length / detailViewSessions.length) * 100) : 0
      },
      byChannel: [...channels.values()]
        .map((row) => ({
          ...row,
          gross: round2(row.gross),
          contribution: round2(row.contribution),
          commission: Object.fromEntries(Object.entries(row.commission).map(([currency, value]) => [currency, round2(value)]))
        }))
        .sort((a, b) => b.contribution - a.contribution || b.clicks - a.clicks),
      channelClicksSampled: clickRows.length === MAX_CLICKS_FOR_CHANNELS,
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
        discounts: round2(discounts),
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
        conversions: conversions.map((row) => {
          const clicks = clicksByProviderMap.get(row.provider) ?? 0
          const commission = row._sum.commission ?? 0
          return {
            provider: row.provider,
            currency: row.currency ?? 'USD',
            conversions: row._count._all,
            sales: round2(row._sum.saleAmount ?? 0),
            commission: round2(commission),
            commissionPerClick: clicks ? Math.round((commission / clicks) * 10000) / 10000 : 0,
            conversionRate: clicks ? round2((row._count._all / clicks) * 100) : 0
          }
        })
      }
    }
  }
})
