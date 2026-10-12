// Customer view of a self-checkout booking (server/utils/booking-view.ts)

export type CustomerBookingState =
  | 'awaiting_payment'
  | 'processing'
  | 'confirmed'
  | 'refunded'
  | 'cancelled'
  | 'failed'

export interface CustomerBooking {
  reference: string | null
  state: CustomerBookingState
  eventTitle: string
  eventSlug: string | null
  optionName: string | null
  quantity: number
  adultCount: number
  childCount: number
  amount: number
  currency: string
  discountAmount: number | null
  refundedAmount: number | null
  createdAt: string
  paidAt: string | null
  voucherUrl: string | null
  voucherNote: string | null
}
