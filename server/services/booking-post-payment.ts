import type { RuntimeConfig } from 'nuxt/schema'
import prisma from '~/server/utils/prisma'
import {
  fulfillBookingWithSupplier,
  isSupplierAutomationEnabled,
  queueBookingForManualFulfillment
} from '~/server/services/attractionsg-fulfillment'
import { ensureUserFromCheckout } from '~/server/services/checkout-onboarding'
import { sendOpsNewBooking, sendPaymentReceived } from '~/server/services/booking-emails'

/**
 * Everything that happens after a booking becomes PAID. Safe to call more than once:
 * each step checks or claims its own marker, so a webhook retry after a crash resumes
 * where the last attempt stopped instead of skipping or repeating work.
 *
 * Email failures don't throw. The marker stays empty and Admin → Bookings shows it,
 * with a resend action.
 */
export async function runPostPaymentSteps(bookingId: string, config: RuntimeConfig) {
  const booking = await prisma.attractionsgBooking.findUnique({
    where: { id: bookingId },
    include: { event: true }
  })
  if (!booking || booking.status !== 'PAID') return

  // Account: only the first pass, so retries don't send repeated password emails.
  // Bookings are linked only to accounts we just created for this email; an existing
  // account with the same email is not proof the same person made the booking.
  if (!booking.userId && !booking.confirmationSentAt && booking.customerEmail) {
    try {
      const account = await ensureUserFromCheckout({
        email: booking.customerEmail,
        name: booking.customerName,
        bookingId: booking.reference ?? booking.id
      })
      if (account?.newlyCreated) {
        await prisma.attractionsgBooking.update({ where: { id: booking.id }, data: { userId: account.userId } })
      }
    } catch (error) {
      console.error('[post-payment] Failed to ensure user account:', booking.id, error)
    }
  }

  // Supplier: only bookings never submitted. Failed submissions are retried by an admin.
  if (booking.supplierStatus === null) {
    const automation = isSupplierAutomationEnabled(config)
    if (booking.event?.isSelfBookable && automation) {
      try {
        await fulfillBookingWithSupplier(booking.id, config)
      } catch (error) {
        console.error('[post-payment] Unexpected supplier error:', booking.id, error)
        await prisma.attractionsgBooking.updateMany({
          where: { id: booking.id, supplierStatus: 'PLACING' },
          data: {
            supplierStatus: 'FAILED',
            supplierPayload: { error: error instanceof Error ? error.message : String(error) }
          }
        })
      }
    } else {
      await queueBookingForManualFulfillment(booking.id, automation)
    }
  }

  await sendOnce(booking.id, 'opsNotifiedAt', sendOpsNewBooking)
  await sendOnce(booking.id, 'confirmationSentAt', sendPaymentReceived)
}

type EmailMarker = 'opsNotifiedAt' | 'confirmationSentAt' | 'ticketSentAt'

/**
 * Claims the marker, sends, and releases the claim if sending fails, so concurrent
 * webhooks send at most one email and a failure can be retried.
 */
export async function sendOnce(
  bookingId: string,
  marker: EmailMarker,
  send: (booking: any) => Promise<boolean>,
  { force = false } = {}
) {
  const claimedAt = new Date()
  // A forced resend puts the earlier timestamp back if it fails
  const previous = force
    ? ((await prisma.attractionsgBooking.findUnique({ where: { id: bookingId }, select: { [marker]: true } })) as
        | Record<EmailMarker, Date | null>
        | null)?.[marker] ?? null
    : null

  const claim = await prisma.attractionsgBooking.updateMany({
    where: { id: bookingId, ...(force ? {} : { [marker]: null }) },
    data: { [marker]: claimedAt }
  })
  if (claim.count === 0) return false

  const release = () =>
    prisma.attractionsgBooking.updateMany({
      where: { id: bookingId, [marker]: claimedAt },
      data: { [marker]: previous }
    })

  const booking = await prisma.attractionsgBooking.findUniqueOrThrow({
    where: { id: bookingId },
    include: { event: true }
  })

  try {
    const sent = await send(booking)
    if (!sent) await release()
    return sent
  } catch (error) {
    console.error(`[post-payment] Failed to send ${marker} email for booking`, bookingId, error)
    await release()
    return false
  }
}
