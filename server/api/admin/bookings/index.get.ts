import { defineEventHandler, getQuery } from 'h3'
import prisma from '~/server/utils/prisma'

// Self-checkout bookings. view=attention (default) lists bookings someone needs to act on.
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const view = query.view === 'all' ? 'all' : 'attention'
  const limit = Math.min(Math.max(Number.parseInt(String(query.limit ?? '100'), 10) || 100, 1), 500)

  // Needs attention: paid but tickets not confirmed or customer not emailed, or
  // refunded with a supplier order still to cancel
  const where =
    view === 'attention'
      ? {
          OR: [
            {
              status: 'PAID' as const,
              OR: [
                { supplierStatus: null },
                { supplierStatus: { not: 'CONFIRMED' } },
                { confirmationSentAt: null },
                { ticketSentAt: null }
              ]
            },
            { supplierStatus: 'CANCEL_NEEDED' }
          ]
        }
      : undefined

  const bookings = await prisma.attractionsgBooking.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      id: true,
      reference: true,
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
      voucherUrl: true,
      voucherNote: true,
      discountAmount: true,
      opsNotifiedAt: true,
      confirmationSentAt: true,
      ticketSentAt: true,
      createdAt: true,
      updatedAt: true
    }
  })

  return { success: true, view, data: bookings }
})
