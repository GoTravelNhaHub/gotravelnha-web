import { defineEventHandler, getQuery, createError } from 'h3'
import prisma from '~/server/utils/prisma'
import { getStripe } from '~/server/utils/stripe'
import { toCustomerBooking, maskEmail } from '~/server/utils/booking-view'

// Booking status for the page Stripe redirects back to. The Checkout session id is
// an unguessable secret only the paying browser has, so it is enough to show the
// customer view (no costs, full email or Stripe ids).
export default defineEventHandler(async (event) => {
  const sessionId = String(getQuery(event).session_id || '')
  if (!/^cs_(test|live)_[A-Za-z0-9]{10,200}$/.test(sessionId)) {
    throw createError({ statusCode: 400, message: 'Invalid checkout session.' })
  }

  const booking = await prisma.attractionsgBooking.findUnique({ where: { stripeSessionId: sessionId } })
  if (!booking) {
    throw createError({ statusCode: 404, message: 'Booking not found.' })
  }

  // The webhook can lag the redirect by a few seconds. Ask Stripe directly so the
  // page can say "payment received" without waiting for it.
  let paymentConfirmed = booking.status === 'PAID' || booking.status === 'REFUNDED'
  if (booking.status === 'PENDING') {
    try {
      const session = await getStripe().checkout.sessions.retrieve(sessionId)
      paymentConfirmed = session.payment_status === 'paid'
    } catch (error) {
      console.error('[checkout-status] Could not retrieve Stripe session:', sessionId, error)
    }
  }

  return {
    success: true,
    paymentConfirmed,
    email: maskEmail(booking.customerEmail),
    booking: toCustomerBooking(booking)
  }
})
