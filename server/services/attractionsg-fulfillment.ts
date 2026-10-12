import type { RuntimeConfig } from 'nuxt/schema'
import prisma from '~/server/utils/prisma'
import { sendEmail } from '~/server/utils/email'
import { placeSupplierOrder } from '~/server/services/attractionsg-supplier'

// Supplier states a paid booking can be (re)submitted from. PLACING is set while a
// request is in flight so concurrent webhooks or admin retries cannot double-order.
const RETRYABLE_SUPPLIER_STATUSES = ['QUEUED', 'FAILED']

export const isSupplierAutomationEnabled = (config: RuntimeConfig) =>
  (config.ATTRACTIONSG_SUPPLIER_AUTOMATION_ENABLED ??
    process.env.ATTRACTIONSG_SUPPLIER_AUTOMATION_ENABLED ??
    'false')
    .toString()
    .trim()
    .toLowerCase() === 'true'

/**
 * Sends a paid booking to the supplier exactly once per claim.
 * Returns null when the booking is not paid or another caller already holds the claim.
 */
export async function fulfillBookingWithSupplier(bookingId: string, config: RuntimeConfig) {
  const claim = await prisma.attractionsgBooking.updateMany({
    where: {
      id: bookingId,
      status: 'PAID',
      OR: [{ supplierStatus: null }, { supplierStatus: { in: RETRYABLE_SUPPLIER_STATUSES } }]
    },
    data: { supplierStatus: 'PLACING' }
  })

  if (claim.count === 0) {
    console.info('[supplier] Booking not claimable for supplier order:', bookingId)
    return null
  }

  const booking = await prisma.attractionsgBooking.findUniqueOrThrow({ where: { id: bookingId } })

  const result = await placeSupplierOrder(
    {
      bookingId: booking.id,
      eventId: booking.eventId,
      eventTitle: booking.eventTitle,
      optionCode: booking.optionCode,
      optionName: booking.optionName,
      quantity: booking.quantity,
      adultCount: booking.adultCount ?? undefined,
      childCount: booking.childCount ?? undefined,
      unitPrice: booking.unitPrice ?? undefined,
      totalAmount: booking.amount ?? undefined,
      resellerUnitCost:
        booking.resellerCost && booking.quantity ? booking.resellerCost / booking.quantity : null,
      totalResellerCost: booking.resellerCost ?? null,
      customerName: booking.customerName,
      customerEmail: booking.customerEmail,
      customerPhone: booking.customerPhone,
      notes: booking.notes,
      cart: booking.cart ?? undefined
    },
    {
      webhookUrl: config.ATTRACTIONSG_SUPPLIER_WEBHOOK || process.env.ATTRACTIONSG_SUPPLIER_WEBHOOK,
      webhookSecret:
        config.ATTRACTIONSG_SUPPLIER_WEBHOOK_SECRET || process.env.ATTRACTIONSG_SUPPLIER_WEBHOOK_SECRET
    }
  )

  const updated = await prisma.attractionsgBooking.update({
    where: { id: booking.id },
    data: {
      supplierOrderId: result.orderId ?? booking.supplierOrderId,
      supplierStatus: result.status,
      supplierPayload: toJson(result.rawResponse ?? result.message ?? null)
    }
  })

  if (result.status === 'FAILED') {
    await alertSupplierFailure(updated, result.message, config)
  }

  return updated
}

/** Marks a paid booking for manual processing when automation is off or not applicable. */
export async function queueBookingForManualFulfillment(bookingId: string, automationEnabled: boolean) {
  await prisma.attractionsgBooking.updateMany({
    where: { id: bookingId, supplierStatus: null },
    data: {
      supplierStatus: 'QUEUED',
      ...(automationEnabled
        ? {}
        : { supplierPayload: { message: 'Supplier automation disabled. Manual processing required.' } })
    }
  })
}

async function alertSupplierFailure(
  booking: { id: string; eventTitle: string; customerEmail: string | null; amount: number },
  reason: string | undefined,
  config: RuntimeConfig
) {
  const notifyEmail = config.SELF_BOOKING_NOTIFY_EMAIL || config.SMTP_USER
  if (!notifyEmail) {
    console.warn('[supplier] No notification email configured for supplier failure alert:', booking.id)
    return
  }

  try {
    await sendEmail({
      to: notifyEmail,
      subject: `ACTION NEEDED: supplier order failed - ${booking.eventTitle}`,
      html: `
        <h2>⚠️ Supplier order failed for a paid booking</h2>
        <p>The customer has paid but the ticket was not ordered from the supplier.</p>
        <p><strong>Booking:</strong> ${booking.id}</p>
        <p><strong>Attraction:</strong> ${booking.eventTitle}</p>
        <p><strong>Amount Paid:</strong> SGD ${booking.amount.toFixed(2)}</p>
        <p><strong>Customer Email:</strong> ${booking.customerEmail || 'N/A'}</p>
        <p><strong>Reason:</strong> ${reason || 'Unknown'}</p>
        <p>Retry or process manually from Admin → Bookings, or refund the customer in Stripe.</p>
      `
    })
  } catch (err) {
    console.error('[supplier] Failed to send supplier failure alert:', err)
  }
}

const toJson = (value: unknown) => {
  if (value === null || value === undefined) return undefined
  if (value instanceof Error) return { error: value.message }
  try {
    return JSON.parse(JSON.stringify(value))
  } catch {
    return { error: String(value) }
  }
}
