import type { Prisma } from '@prisma/client'

// Self-checkout bookings someone needs to act on: paid but tickets not confirmed or the
// customer not emailed, or refunded with a supplier order still to cancel.
// Shared by Admin → Bookings and the dashboard count so the two never disagree.
export const BOOKING_ATTENTION_WHERE: Prisma.AttractionsgBookingWhereInput = {
  OR: [
    {
      status: 'PAID',
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
