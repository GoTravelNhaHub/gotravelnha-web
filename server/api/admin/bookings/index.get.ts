import { defineEventHandler, getQuery } from 'h3'
import prisma from '~/server/utils/prisma'

// Self-checkout bookings. view=attention (default) lists paid bookings the supplier
// has not confirmed yet: QUEUED, PLACING, FAILED, or never submitted.
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const view = query.view === 'all' ? 'all' : 'attention'
  const limit = Math.min(Math.max(Number.parseInt(String(query.limit ?? '100'), 10) || 100, 1), 500)

  const where =
    view === 'attention'
      ? {
          status: 'PAID' as const,
          OR: [{ supplierStatus: null }, { supplierStatus: { not: 'CONFIRMED' } }]
        }
      : undefined

  const bookings = await prisma.attractionsgBooking.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      id: true,
      eventTitle: true,
      optionName: true,
      quantity: true,
      amount: true,
      currency: true,
      status: true,
      paidAt: true,
      refundedAmount: true,
      supplierStatus: true,
      supplierOrderId: true,
      supplierPayload: true,
      customerName: true,
      customerEmail: true,
      stripePaymentIntentId: true,
      createdAt: true,
      updatedAt: true
    }
  })

  return { success: true, view, data: bookings }
})
