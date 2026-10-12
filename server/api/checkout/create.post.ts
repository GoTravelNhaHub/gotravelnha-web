import { defineEventHandler, readBody, createError } from 'h3'
import Stripe from 'stripe'
import type { Prisma } from '@prisma/client'
import prisma from '~/server/utils/prisma'
import { estimateStripeFee } from '~/utils/pricing'
import { feeConfig, formatSgd, supplierOptions, ticketPrice } from '~/server/utils/attraction-pricing'
import { generateBookingReference } from '~/server/utils/booking-reference'
import { readAttribution, readVisitorSession } from '~/server/utils/attribution'
import { getSessionUser } from '~/server/utils/session'

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
  if (!secretKey) {
    throw createError({
      statusCode: 500,
      message: 'Stripe is not configured.'
    })
  }

  const body = await readBody(event)
  const eventId = typeof body?.eventId === 'string' ? body.eventId : undefined
  const cart = body?.cart && typeof body.cart === 'object' ? body.cart : null
  const selectedOption = body?.selectedOption && typeof body.selectedOption === 'object'
    ? body.selectedOption
    : null
  const parseCount = (value: unknown) => {
    const num = Number.parseInt(String(value ?? ''), 10)
    return Number.isFinite(num) && num > 0 ? num : 0
  }

  if (!cart) {
    throw createError({
      statusCode: 400,
      message: 'Cart is empty. Please add tickets before checkout.'
    })
  }

  const adultCount = parseCount(cart.adultCount ?? cart.quantityAdults)
  const childCount = parseCount(cart.childCount ?? cart.quantityChildren)
  let totalQuantity = parseCount(cart.quantity)

  if (adultCount + childCount > 0) {
    totalQuantity = adultCount + childCount
  }

  if (!Number.isFinite(totalQuantity) || totalQuantity <= 0) {
    throw createError({
      statusCode: 400,
      message: 'Please specify at least one ticket before proceeding to checkout.'
    })
  }
  if (totalQuantity > 20) {
    throw createError({
      statusCode: 400,
      message: 'You can book up to 20 tickets per order. Please contact us for group bookings.'
    })
  }
  const rawEmail = typeof body?.customerEmail === 'string' ? body.customerEmail.trim() : ''
  if (rawEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail)) {
    throw createError({ statusCode: 400, message: 'Please enter a valid email address.' })
  }
  let customerEmail: string | undefined = rawEmail || undefined
  const customerName = typeof body?.customerName === 'string' ? body.customerName : undefined
  const customerPhone = typeof body?.customerPhone === 'string' ? body.customerPhone : undefined

  if (!eventId) {
    throw createError({
      statusCode: 400,
      message: 'eventId is required.'
    })
  }

  const attraction = await prisma.attractionsgEvent.findUnique({
    where: { id: eventId }
  })

  if (!attraction || !attraction.isPublished || !attraction.isSelfBookable) {
    throw createError({
      statusCode: 404,
      message: 'Attraction not available for self checkout.'
    })
  }

  const rawOptions = supplierOptions(attraction)

  const normalize = (value: unknown) =>
    typeof value === 'string' ? value.trim().toLowerCase() : undefined

  const requestedCode = normalize(cart.optionCode) ?? normalize(selectedOption?.code)
  const requestedName = normalize(cart.optionName) ?? normalize(selectedOption?.name)

  // Price comes only from the DB. An option we can't match is rejected rather than
  // priced from the request body.
  const matchedOption = rawOptions.length
    ? (requestedCode && rawOptions.find((option) => normalize(option?.code) === requestedCode)) ||
      (requestedName && rawOptions.find((option) => normalize(option?.name) === requestedName)) ||
      (rawOptions.length === 1 ? rawOptions[0] : undefined)
    : undefined

  if (rawOptions.length && !matchedOption) {
    throw createError({
      statusCode: 409,
      message: 'This ticket option is no longer available. Please refresh the page and choose again.'
    })
  }

  const fees = feeConfig()
  const priced = ticketPrice(attraction, matchedOption ?? null, fees)

  if (!priced || priced.price <= 0) {
    throw createError({
      statusCode: 400,
      message: 'Unable to determine a valid ticket price for checkout.'
    })
  }
  if (priced.cost === null) {
    console.warn(`[checkout] No supplier cost for ${attraction.id}; margin will be unknown`)
  }

  const unitPublicPrice = priced.price
  const resellerUnitCost = priced.cost

  // The customer saw a price on the page; don't charge a different one silently
  const shownPrice = Number.parseFloat(String(cart.unitPrice ?? ''))
  if (Number.isFinite(shownPrice) && Math.abs(shownPrice - unitPublicPrice) >= 0.01) {
    throw createError({
      statusCode: 409,
      message: `The price for this ticket is now ${formatSgd(unitPublicPrice)}. Please refresh the page to review it before paying.`
    })
  }

  const currency = 'sgd'
  const unitAmount = Math.round(unitPublicPrice * 100)

  const stripe = getStripeClient(secretKey)
  const totalAmount = Number((unitPublicPrice * totalQuantity).toFixed(2))
  const totalStripeFeeEstimate = Number(estimateStripeFee(totalAmount, fees.stripePercent, fees.stripeFixed).toFixed(2))
  const totalResellerCost =
    resellerUnitCost !== null ? Number((resellerUnitCost * totalQuantity).toFixed(2)) : null
  const totalNetAfterFees = Number((totalAmount - totalStripeFeeEstimate).toFixed(2))

  const normalizedCart = {
    optionCode: matchedOption?.code ?? null,
    optionName: matchedOption?.name ?? null,
    unitPrice: unitPublicPrice,
    unitCurrency: currency.toUpperCase(),
    quantity: totalQuantity,
    adultCount,
    childCount,
    totalPrice: totalAmount,
    stripeFeeEstimate: totalStripeFeeEstimate,
    resellerCost: totalResellerCost,
    unitResellerPrice: resellerUnitCost
  }

  const sessionUser = await getSessionUser(event).catch(() => null)
  // Signed-in customers book under their account email unless they typed another
  customerEmail = customerEmail || sessionUser?.email || undefined
  const reference = generateBookingReference()

  const metadata: Record<string, string> = {
    bookingReference: reference,
    eventId: attraction.id,
    eventTitle: attraction.title,
    eventSlug: attraction.slug || '',
    quantity: String(totalQuantity),
    estimatedStripeFee: String(totalStripeFeeEstimate),
    resellerUnitCost: resellerUnitCost !== null ? String(resellerUnitCost) : '',
    totalResellerCost: totalResellerCost !== null ? String(totalResellerCost) : '',
    unitPrice: unitPublicPrice.toFixed(2),
    totalPrice: totalAmount.toFixed(2),
    adultCount: String(adultCount),
    childCount: String(childCount)
  }

  if (matchedOption?.code) metadata.optionCode = String(matchedOption.code)
  if (matchedOption?.name) metadata.optionName = String(matchedOption.name)
  if (customerName) metadata.customerName = customerName
  if (customerEmail) metadata.customerEmail = customerEmail

  const productDescriptorParts: string[] = []
  if (adultCount > 0) productDescriptorParts.push(`Adults: ${adultCount}`)
  if (childCount > 0) productDescriptorParts.push(`Children: ${childCount}`)

  const productName = normalizedCart.optionName
    ? `${attraction.title} – ${normalizedCart.optionName}`
    : `${attraction.title} Ticket`

  const lineItem = {
    price_data: {
      currency,
      unit_amount: unitAmount,
      product_data: {
        name: productName,
        description: productDescriptorParts.join(' | ') || attraction.location || undefined
      }
    },
    quantity: totalQuantity
  }

  const successUrlBase =
    config.public?.siteUrl || 'https://gotravelnha.com'

  // {CHECKOUT_SESSION_ID} lets the page look the booking up instead of trusting the URL
  const successUrl = `${successUrlBase}/attractionsg/${attraction.slug || attraction.id}?checkout=success&session_id={CHECKOUT_SESSION_ID}`
  const cancelUrl = `${successUrlBase}/attractionsg/${attraction.slug || attraction.id}?checkout=cancel`

  let session: Stripe.Checkout.Session
  try {
    session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [lineItem],
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: customerEmail,
      client_reference_id: attraction.id,
      metadata,
      payment_intent_data: {
        metadata,
        // Stripe's own receipt, sent when the payment succeeds
        ...(customerEmail ? { receipt_email: customerEmail } : {})
      },
      allow_promotion_codes: true,
      automatic_tax: { enabled: false }
    })
  } catch (err: any) {
    console.error('Stripe session error:', err)
    throw createError({
      statusCode: 500,
      message: 'Unable to create checkout session.'
    })
  }

  const booking = await prisma.attractionsgBooking.create({
    data: {
      reference,
      userId: sessionUser?.id ?? null,
      sessionId: readVisitorSession(event),
      attribution: (readAttribution(event) ?? undefined) as Prisma.InputJsonValue | undefined,
      eventId: attraction.id,
      eventTitle: attraction.title,
      eventSlug: attraction.slug,
      quantity: totalQuantity,
      adultCount,
      childCount,
      unitPrice: unitPublicPrice,
      amount: totalAmount,
      currency: (session.currency || 'sgd').toUpperCase(),
      status: 'PENDING',
      stripeSessionId: session.id,
      stripePaymentIntentId:
        typeof session.payment_intent === 'string'
          ? session.payment_intent
          : session.payment_intent?.id ?? null,
      customerEmail: customerEmail || session.customer_details?.email || null,
      customerName: customerName || session.customer_details?.name || null,
      customerPhone: customerPhone || session.customer_details?.phone || null,
      optionCode: normalizedCart.optionCode ?? null,
      optionName: normalizedCart.optionName ?? null,
      metadata: normalizedCart,
      notes: attraction.checkoutNotes ?? null,
      resellerCost: totalResellerCost,
      stripeFeeAmount: totalStripeFeeEstimate,
      netRevenue: totalNetAfterFees,
      cart: normalizedCart
    }
  })

  const enrichedMetadata = {
    ...metadata,
    bookingId: booking.id,
    stripeSessionId: session.id
  }

  try {
    await stripe.checkout.sessions.update(session.id, {
      metadata: enrichedMetadata
    })

    if (typeof session.payment_intent === 'string') {
      await stripe.paymentIntents.update(session.payment_intent, {
        metadata: enrichedMetadata
      })
    }
  } catch (err) {
    console.error('Failed to update Stripe metadata:', err)
  }

  return {
    success: true,
    url: session.url
  }
})

