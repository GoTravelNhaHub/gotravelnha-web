import Stripe from 'stripe'
import { defineEventHandler, createError, readRawBody } from 'h3'
import prisma from '~/server/utils/prisma'
import type { RuntimeConfig } from 'nuxt/schema'
import type { PrismaClient } from '@prisma/client'
import { sendEmail, escapeHtml } from '~/server/utils/email'
import { runPostPaymentSteps } from '~/server/services/booking-post-payment'
import { sendRefundNotice, supportEmail } from '~/server/services/booking-emails'

const db = prisma as PrismaClient
const bookings = (db as unknown as Record<string, any>)['attractionsgBooking']

let stripeClient: Stripe | null = null

function getStripeClient(secretKey: string) {
  if (!stripeClient) {
    stripeClient = new Stripe(secretKey, {
      apiVersion: '2024-06-20'
    })
  }
  return stripeClient
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const secretKey = config.STRIPE_SECRET_KEY
  const webhookSecret = config.STRIPE_WEBHOOK_SECRET

  if (!secretKey || !webhookSecret) {
    throw createError({
      statusCode: 500,
      message: 'Stripe webhook not configured.'
    })
  }

  const rawBody = await readRawBody(event, 'utf8')
  const signature = event.node.req.headers['stripe-signature']

  if (!rawBody || !signature) {
    throw createError({
      statusCode: 400,
      message: 'Invalid webhook payload.'
    })
  }

  const stripe = getStripeClient(secretKey)
  let stripeEvent: Stripe.Event

  try {
    stripeEvent = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
  } catch (err: any) {
    console.error('Stripe webhook signature verification failed:', err)
    throw createError({
      statusCode: 400,
      message: 'Invalid signature.'
    })
  }

  try {
    const clientRef = (stripeEvent.data.object as { client_reference_id?: string }).client_reference_id

    switch (stripeEvent.type) {
      case 'checkout.session.completed': {
        const session = stripeEvent.data.object as Stripe.Checkout.Session
        console.info('[stripe] checkout.session.completed', session.id, 'ref:', clientRef)
        await handleCheckoutCompleted(session, config)
        break
      }
      case 'checkout.session.async_payment_succeeded': {
        const session = stripeEvent.data.object as Stripe.Checkout.Session
        console.info('[stripe] checkout.session.async_payment_succeeded', session.id, 'ref:', clientRef)
        await handleCheckoutCompleted(session, config)
        break
      }
      case 'checkout.session.async_payment_failed': {
        const session = stripeEvent.data.object as Stripe.Checkout.Session
        console.warn('[stripe] checkout.session.async_payment_failed', session.id, 'ref:', clientRef)
        await bookings.updateMany({
          where: { stripeSessionId: session.id, status: 'PENDING' },
          data: { status: 'FAILED' }
        })
        break
      }
      case 'charge.refunded': {
        const charge = stripeEvent.data.object as Stripe.Charge
        console.info('[stripe] charge.refunded', charge.id, 'amount_refunded:', charge.amount_refunded)
        await handleChargeRefunded(charge)
        break
      }
      case 'checkout.session.expired': {
        const session = stripeEvent.data.object as Stripe.Checkout.Session
        console.info('[stripe] checkout.session.expired', session.id, 'ref:', clientRef)
        await bookings.updateMany({
          where: { stripeSessionId: session.id, status: 'PENDING' },
          data: { status: 'CANCELLED' }
        })
        break
      }
      case 'payment_intent.succeeded': {
        const paymentIntent = stripeEvent.data.object as Stripe.PaymentIntent
        console.info('[stripe] payment_intent.succeeded', paymentIntent.id, 'ref:', clientRef)
        await handlePaymentIntentSuccess(paymentIntent, config)
        break
      }
      case 'payment_intent.payment_failed': {
        const paymentIntent = stripeEvent.data.object as Stripe.PaymentIntent
        console.warn('[stripe] payment_intent.payment_failed', paymentIntent.id, 'ref:', clientRef)
        if (typeof paymentIntent.metadata?.stripeSessionId === 'string') {
          await bookings.updateMany({
            where: {
              stripeSessionId: paymentIntent.metadata.stripeSessionId,
              status: 'PENDING'
            },
            data: { status: 'FAILED' }
          })
        }
        break
      }
      default:
        console.info('[stripe] ignored event', stripeEvent.type, 'ref:', clientRef)
        break
    }
  } catch (err) {
    console.error('Stripe webhook handler error:', err)
    throw createError({
      statusCode: 500,
      message: 'Failed to process webhook.'
    })
  }

  return { received: true }
})

async function handleCheckoutCompleted(session: Stripe.Checkout.Session, config: RuntimeConfig) {
  // Async methods (e.g. PayNow) complete the session before funds settle;
  // checkout.session.async_payment_succeeded calls back in here once paid.
  if (session.payment_status !== 'paid' && session.payment_status !== 'no_payment_required') {
    console.info('Checkout completed but payment not settled yet:', session.id, session.payment_status)
    return
  }

  // Match on the session id only. Matching by event id could attach this payment
  // to another customer's pending booking for the same attraction.
  const targetBooking = await bookings.findUnique({
    where: { stripeSessionId: session.id }
  })

  if (!targetBooking) {
    console.error('Checkout completed but booking not found:', session.id, 'ref:', session.client_reference_id)
    return
  }

  const customerDetails = session.customer_details
  const paymentIntentId =
    typeof session.payment_intent === 'string'
      ? session.payment_intent
      : session.payment_intent?.id ?? targetBooking.stripePaymentIntentId
  const amountPaid =
    typeof session.amount_total === 'number' ? session.amount_total / 100 : targetBooking.amount
  const discount =
    typeof session.total_details?.amount_discount === 'number' ? session.total_details.amount_discount / 100 : 0
  const actualStripeFee = paymentIntentId ? await fetchActualStripeFee(paymentIntentId, config) : null
  const stripeFee = actualStripeFee ?? targetBooking.stripeFeeAmount

  // Atomic claim: Stripe sends both checkout.session.completed and
  // payment_intent.succeeded, and retries. Only one caller moves the booking to PAID.
  const claim = await bookings.updateMany({
    where: { id: targetBooking.id, status: { in: ['PENDING', 'FAILED', 'CANCELLED'] } },
    data: {
      status: 'PAID',
      paidAt: new Date(),
      amount: amountPaid,
      discountAmount: discount > 0 ? discount : null,
      stripeFeeAmount: stripeFee,
      netRevenue: typeof stripeFee === 'number' ? Number((amountPaid - stripeFee).toFixed(2)) : undefined,
      customerEmail: customerDetails?.email ?? targetBooking.customerEmail ?? undefined,
      customerName: customerDetails?.name ?? targetBooking.customerName ?? undefined,
      customerPhone: customerDetails?.phone ?? targetBooking.customerPhone ?? undefined,
      stripePaymentIntentId: paymentIntentId
    }
  })

  if (claim.count > 0) {
    console.info('Booking marked as paid:', targetBooking.id)
    if (discount > 0 && targetBooking.resellerCost !== null && amountPaid - (stripeFee ?? 0) < targetBooking.resellerCost) {
      console.warn('[stripe] Discounted booking is below supplier cost:', targetBooking.id)
    }
  }

  // Runs on the first delivery and again on retries; each step skips work already done
  await runPostPaymentSteps(targetBooking.id, config)
}

async function handlePaymentIntentSuccess(paymentIntent: Stripe.PaymentIntent, config: RuntimeConfig) {
  const secretKey = config.STRIPE_SECRET_KEY
  if (!secretKey) {
    console.warn('Stripe secret missing in payment intent handler')
    return
  }

  let session: Stripe.Checkout.Session | null = null

  if (typeof paymentIntent.metadata?.stripeSessionId === 'string') {
    try {
      const stripe = getStripeClient(secretKey)
      session = await stripe.checkout.sessions.retrieve(paymentIntent.metadata.stripeSessionId)
    } catch (err) {
      console.error('Failed to retrieve checkout session by id:', err)
    }
  }

  if (!session) {
    try {
      const stripe = getStripeClient(secretKey)
      const sessions = await stripe.checkout.sessions.list({
        payment_intent: paymentIntent.id,
        limit: 1
      })
      session = sessions.data[0] ?? null
    } catch (err) {
      console.error('Failed to list checkout sessions for payment intent:', err)
    }
  }

  if (session) {
    await handleCheckoutCompleted(session, config)
    return
  }

  if (typeof paymentIntent.metadata?.bookingId === 'string') {
    const bookingRecord = await bookings.findUnique({
      where: { id: paymentIntent.metadata.bookingId }
    })

    if (bookingRecord) {
      const claim = await bookings.updateMany({
        where: { id: bookingRecord.id, status: { in: ['PENDING', 'FAILED', 'CANCELLED'] } },
        data: {
          status: 'PAID',
          paidAt: new Date(),
          stripePaymentIntentId: paymentIntent.id
        }
      })
      if (claim.count > 0) {
        console.info('Marked booking paid via payment_intent.succeeded fallback:', bookingRecord.id)
      }
      await runPostPaymentSteps(bookingRecord.id, config)
    }
  } else {
    console.warn('payment_intent.succeeded received with no metadata. PaymentIntent ID:', paymentIntent.id)
  }
}

async function handleChargeRefunded(charge: Stripe.Charge) {
  const paymentIntentId =
    typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id
  if (!paymentIntentId) {
    console.warn('charge.refunded without payment intent:', charge.id)
    return
  }

  const booking = await bookings.findFirst({ where: { stripePaymentIntentId: paymentIntentId } })
  if (!booking) {
    console.warn('charge.refunded but no booking for payment intent:', paymentIntentId)
    return
  }

  const refunded = charge.amount_refunded / 100
  // Stripe sends one event per refund and retries; only act when the total grew
  if (refunded <= (booking.refundedAmount ?? 0)) return

  // A full refund on a ticket that was (or may be) ordered needs a supplier cancellation
  const needsSupplierCancel =
    charge.refunded && ['CONFIRMED', 'QUEUED', 'PLACING'].includes(booking.supplierStatus ?? '')

  await bookings.update({
    where: { id: booking.id },
    data: {
      refundedAmount: refunded,
      refundedAt: new Date(),
      // Partial refunds keep the booking PAID; the refunded amount is recorded
      ...(charge.refunded ? { status: 'REFUNDED' } : {}),
      ...(needsSupplierCancel ? { supplierStatus: 'CANCEL_NEEDED' } : {})
    }
  })

  try {
    await sendRefundNotice(booking, refunded, charge.refunded)
  } catch (err) {
    console.error('Failed to send refund notice:', booking.id, err)
  }

  if (needsSupplierCancel && supportEmail()) {
    try {
      await sendEmail({
        to: supportEmail(),
        subject: `ACTION NEEDED: cancel supplier order for refunded booking ${booking.reference}`,
        html: `
          <h2>Refunded booking needs a supplier cancellation</h2>
          <p><strong>Reference:</strong> ${escapeHtml(booking.reference)}</p>
          <p><strong>Attraction:</strong> ${escapeHtml(booking.eventTitle)}</p>
          <p><strong>Supplier order:</strong> ${escapeHtml(booking.supplierOrderId || 'not recorded')}</p>
          <p><strong>Refunded:</strong> ${escapeHtml(booking.currency)} ${refunded.toFixed(2)}</p>
          <p>Cancel the ticket in the reseller portal, then clear it in Admin → Bookings.</p>`
      })
    } catch (err) {
      console.error('Failed to send supplier cancellation alert:', booking.id, err)
    }
  }
}

/** Real Stripe fee from the balance transaction, in major units. Null if not available yet. */
async function fetchActualStripeFee(paymentIntentId: string, config: RuntimeConfig) {
  try {
    const stripe = getStripeClient(config.STRIPE_SECRET_KEY)
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId, {
      expand: ['latest_charge.balance_transaction']
    })
    const charge = paymentIntent.latest_charge
    const balanceTransaction =
      charge && typeof charge === 'object' ? charge.balance_transaction : null
    if (balanceTransaction && typeof balanceTransaction === 'object') {
      return balanceTransaction.fee / 100
    }
  } catch (err) {
    console.error('Failed to fetch Stripe fee for payment intent:', paymentIntentId, err)
  }
  return null
}
