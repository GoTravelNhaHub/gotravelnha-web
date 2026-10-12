import { defineEventHandler, readBody, getRouterParam, createError } from 'h3'
import prisma from '~/server/utils/prisma'
import { getStripe } from '~/server/utils/stripe'
import { fulfillBookingWithSupplier } from '~/server/services/attractionsg-fulfillment'
import { sendOnce } from '~/server/services/booking-post-payment'
import { sendPaymentReceived, sendTicketReady } from '~/server/services/booking-emails'

// Admin actions on a booking (route is admin-gated in server/middleware/auth-guard.ts):
// - retry-supplier: resubmit a QUEUED/FAILED booking to the supplier webhook
// - mark-fulfilled: record the issued ticket (voucher link and/or note) and email it
// - resend-ticket / resend-confirmation: send the customer email again
// - refund: full or partial Stripe refund; the charge.refunded webhook updates the booking
// - supplier-cancelled: the supplier order of a refunded booking has been cancelled
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const action = body?.action

  if (!id) {
    throw createError({ statusCode: 400, message: 'Booking id is required.' })
  }

  if (action === 'retry-supplier') {
    const booking = await fulfillBookingWithSupplier(id, useRuntimeConfig())
    if (!booking) {
      throw createError({
        statusCode: 409,
        message: 'Booking must be PAID with supplier status QUEUED, FAILED or empty to retry.'
      })
    }
    return { success: true, data: booking }
  }

  if (action === 'mark-fulfilled') {
    const text = (value: unknown, max: number) =>
      typeof value === 'string' && value.trim() ? value.trim().slice(0, max) : undefined
    const supplierOrderId = text(body?.supplierOrderId, 200)
    const voucherUrl = text(body?.voucherUrl, 2000)
    const voucherNote = text(body?.voucherNote, 2000)

    if (voucherUrl && !/^https:\/\/\S+$/.test(voucherUrl)) {
      throw createError({ statusCode: 400, message: 'The ticket link must start with https://' })
    }
    if (!voucherUrl && !voucherNote) {
      throw createError({ statusCode: 400, message: 'Add a ticket link or a note for the customer.' })
    }

    const result = await prisma.attractionsgBooking.updateMany({
      where: { id, status: 'PAID' },
      data: {
        supplierStatus: 'CONFIRMED',
        voucherUrl: voucherUrl ?? null,
        voucherNote: voucherNote ?? null,
        ...(supplierOrderId ? { supplierOrderId } : {})
      }
    })
    if (result.count === 0) {
      throw createError({ statusCode: 409, message: 'Only PAID bookings can be marked fulfilled.' })
    }

    const emailed = await sendOnce(id, 'ticketSentAt', sendTicketReady, { force: true })
    return { success: true, emailed }
  }

  if (action === 'resend-ticket' || action === 'resend-confirmation') {
    const booking = await prisma.attractionsgBooking.findUnique({ where: { id } })
    if (!booking || booking.status !== 'PAID') {
      throw createError({ statusCode: 409, message: 'Only PAID bookings can be emailed.' })
    }
    if (action === 'resend-ticket' && booking.supplierStatus !== 'CONFIRMED') {
      throw createError({ statusCode: 409, message: 'Mark the booking fulfilled before sending tickets.' })
    }
    const emailed =
      action === 'resend-ticket'
        ? await sendOnce(id, 'ticketSentAt', sendTicketReady, { force: true })
        : await sendOnce(id, 'confirmationSentAt', sendPaymentReceived, { force: true })
    if (!emailed) {
      throw createError({ statusCode: 502, message: 'The email could not be sent. Check the SMTP settings.' })
    }
    return { success: true }
  }

  if (action === 'refund') {
    const booking = await prisma.attractionsgBooking.findUnique({ where: { id } })
    if (!booking || booking.status !== 'PAID' || !booking.stripePaymentIntentId) {
      throw createError({ statusCode: 409, message: 'Only PAID bookings with a Stripe payment can be refunded.' })
    }

    const remaining = Number((booking.amount - (booking.refundedAmount ?? 0)).toFixed(2))
    const requested = body?.amount === undefined || body?.amount === null ? remaining : Number(body.amount)
    if (!Number.isFinite(requested) || requested <= 0 || requested > remaining) {
      throw createError({ statusCode: 400, message: `Refund amount must be between 0.01 and ${remaining.toFixed(2)}.` })
    }

    try {
      const refund = await getStripe().refunds.create(
        {
          payment_intent: booking.stripePaymentIntentId,
          amount: Math.round(requested * 100),
          metadata: { bookingId: booking.id, bookingReference: booking.reference ?? '' }
        },
        // Same booking + amount + prior refunds → same key, so a double click refunds once
        { idempotencyKey: `refund-${booking.id}-${Math.round(requested * 100)}-${Math.round((booking.refundedAmount ?? 0) * 100)}` }
      )
      return { success: true, refundId: refund.id, status: refund.status }
    } catch (error: any) {
      console.error('[admin] Stripe refund failed:', booking.id, error)
      throw createError({ statusCode: 502, message: error?.message || 'Stripe refund failed.' })
    }
  }

  if (action === 'supplier-cancelled') {
    const result = await prisma.attractionsgBooking.updateMany({
      where: { id, supplierStatus: 'CANCEL_NEEDED' },
      data: { supplierStatus: 'CANCELLED' }
    })
    if (result.count === 0) {
      throw createError({ statusCode: 409, message: 'This booking is not waiting for a supplier cancellation.' })
    }
    return { success: true }
  }

  throw createError({ statusCode: 400, message: 'Unknown action.' })
})
