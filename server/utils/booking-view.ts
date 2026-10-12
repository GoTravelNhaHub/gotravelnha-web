import type { AttractionsgBooking } from '@prisma/client'

export type CustomerBookingState =
  | 'awaiting_payment'
  | 'processing'
  | 'confirmed'
  | 'refunded'
  | 'cancelled'
  | 'failed'

/** What the customer sees for a booking: no costs, Stripe ids or supplier payloads. */
export function toCustomerBooking(booking: AttractionsgBooking) {
  const state: CustomerBookingState =
    booking.status === 'PAID'
      ? booking.supplierStatus === 'CONFIRMED'
        ? 'confirmed'
        : 'processing'
      : booking.status === 'REFUNDED'
        ? 'refunded'
        : booking.status === 'CANCELLED'
          ? 'cancelled'
          : booking.status === 'FAILED'
            ? 'failed'
            : 'awaiting_payment'

  return {
    reference: booking.reference,
    state,
    eventTitle: booking.eventTitle,
    eventSlug: booking.eventSlug,
    optionName: booking.optionName,
    quantity: booking.quantity,
    adultCount: booking.adultCount,
    childCount: booking.childCount,
    amount: booking.amount,
    currency: booking.currency,
    discountAmount: booking.discountAmount,
    refundedAmount: booking.refundedAmount,
    createdAt: booking.createdAt,
    paidAt: booking.paidAt,
    // Tickets only once the supplier has confirmed
    voucherUrl: state === 'confirmed' ? booking.voucherUrl : null,
    voucherNote: state === 'confirmed' ? booking.voucherNote : null
  }
}

export const STATE_LABELS: Record<CustomerBookingState, string> = {
  awaiting_payment: 'Awaiting payment',
  processing: 'Payment received – confirming your tickets',
  confirmed: 'Confirmed',
  refunded: 'Refunded',
  cancelled: 'Cancelled – you were not charged',
  failed: 'Payment failed – you were not charged'
}

/** Masks an email for pages reachable without signing in: j***@gmail.com */
export const maskEmail = (email: string | null) => {
  if (!email) return null
  const [name, domain] = email.split('@')
  if (!domain) return null
  return `${name.slice(0, 1)}***@${domain}`
}
