import { defineEventHandler, getQuery } from 'h3'
import prisma from '~/server/utils/prisma'
import { BOOKING_ATTENTION_WHERE } from '~/server/utils/booking-attention'

// Self-checkout bookings. view=attention (default) lists bookings someone needs to act on.
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const view = query.view === 'all' ? 'all' : 'attention'
  const limit = Math.min(Math.max(Number.parseInt(String(query.limit ?? '100'), 10) || 100, 1), 500)

  const where = view === 'attention' ? BOOKING_ATTENTION_WHERE : undefined

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
