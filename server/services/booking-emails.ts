import type { AttractionsgBooking, AttractionsgEvent } from '@prisma/client'
import { sendEmail, escapeHtml } from '~/server/utils/email'

// Emails for self-checkout bookings. Every value that came from a customer, the
// supplier or a crawl is escaped before it goes into HTML.

type BookingWithEvent = AttractionsgBooking & { event?: AttractionsgEvent | null }

const config = () => useRuntimeConfig()
export const supportEmail = () => config().SELF_BOOKING_NOTIFY_EMAIL || config().SMTP_USER || ''
const siteUrl = () => config().public?.siteUrl || 'https://gotravelnha.com'

const money = (amount: number | null | undefined, currency = 'SGD') =>
  typeof amount === 'number' ? `${currency} ${amount.toFixed(2)}` : 'N/A'

const guests = (booking: AttractionsgBooking) => {
  const parts: string[] = []
  if (booking.adultCount) parts.push(`${booking.adultCount} adult${booking.adultCount === 1 ? '' : 's'}`)
  if (booking.childCount) parts.push(`${booking.childCount} child${booking.childCount === 1 ? '' : 'ren'}`)
  return parts.join(' + ') || `${booking.quantity} ticket${booking.quantity === 1 ? '' : 's'}`
}

export const trackingUrl = (booking: AttractionsgBooking) =>
  `${siteUrl()}/bookings?ref=${encodeURIComponent(booking.reference || '')}`

const footer = () => {
  const support = escapeHtml(supportEmail())
  return `
    <p>Track your booking any time: use your booking reference and email on our <a href="${siteUrl()}/bookings">booking status page</a>.</p>
    <p>Questions? Reply to this email or write to <a href="mailto:${support}">${support}</a>.</p>
    <p>The GoTravelNha Team</p>`
}

const summary = (booking: AttractionsgBooking) => `
  <p>
    <strong>Booking reference:</strong> ${escapeHtml(booking.reference)}<br/>
    <strong>Attraction:</strong> ${escapeHtml(booking.eventTitle)}<br/>
    ${booking.optionName ? `<strong>Ticket:</strong> ${escapeHtml(booking.optionName)}<br/>` : ''}
    <strong>Guests:</strong> ${escapeHtml(guests(booking))}<br/>
    <strong>Amount paid:</strong> ${money(booking.amount, booking.currency)}
    ${booking.discountAmount ? `<br/><strong>Discount applied:</strong> ${money(booking.discountAmount, booking.currency)}` : ''}
  </p>`

/** Payment received. Tickets follow in a separate email once the supplier confirms. */
export async function sendPaymentReceived(booking: AttractionsgBooking) {
  if (!booking.customerEmail) return false
  await sendEmail({
    to: booking.customerEmail,
    replyTo: supportEmail() || undefined,
    subject: `Payment received – booking ${booking.reference}`,
    html: `
      <h2>Thanks for booking with GoTravelNha</h2>
      <p>We have received your payment. Your booking is not confirmed yet: we are now ordering your tickets from our supplier.</p>
      ${summary(booking)}
      <p><strong>What happens next:</strong> we will email your tickets as soon as the supplier confirms them.</p>
      <p><a href="${trackingUrl(booking)}">Check your booking status</a></p>
      ${footer()}`
  })
  return true
}

/** Tickets issued. Includes the voucher link and any notes from the team. */
export async function sendTicketReady(booking: AttractionsgBooking) {
  if (!booking.customerEmail) return false
  const voucher = booking.voucherUrl
    ? `<p style="margin:24px 0;"><a href="${escapeHtml(booking.voucherUrl)}" style="background:#10b981;color:#fff;padding:12px 28px;border-radius:8px;font-weight:600;text-decoration:none;">Open your tickets</a></p>`
    : ''
  await sendEmail({
    to: booking.customerEmail,
    replyTo: supportEmail() || undefined,
    subject: `Your tickets are ready – booking ${booking.reference}`,
    html: `
      <h2>Your booking is confirmed</h2>
      ${summary(booking)}
      ${voucher}
      ${booking.voucherNote ? `<p style="white-space:pre-wrap">${escapeHtml(booking.voucherNote)}</p>` : ''}
      ${footer()}`
  })
  return true
}

export async function sendRefundNotice(booking: AttractionsgBooking, refundedAmount: number, full: boolean) {
  if (!booking.customerEmail) return false
  await sendEmail({
    to: booking.customerEmail,
    replyTo: supportEmail() || undefined,
    subject: `${full ? 'Refund' : 'Partial refund'} issued – booking ${booking.reference}`,
    html: `
      <h2>${full ? 'Your booking has been refunded' : 'A partial refund has been issued'}</h2>
      <p>We have refunded <strong>${money(refundedAmount, booking.currency)}</strong> to your original payment method. Banks usually take 5–10 business days to show it.</p>
      ${summary(booking)}
      ${footer()}`
  })
  return true
}

/** Internal alert for a new paid booking. */
export async function sendOpsNewBooking(booking: BookingWithEvent) {
  const to = supportEmail()
  if (!to) {
    console.warn('[booking-emails] No notification email configured for bookings.')
    return false
  }
  const row = (label: string, value: unknown) =>
    value === null || value === undefined || value === '' ? '' : `<p><strong>${label}:</strong> ${escapeHtml(value)}</p>`

  await sendEmail({
    to,
    subject: `New paid booking ${booking.reference} – ${booking.eventTitle.replace(/[\r\n]+/g, ' ')}`,
    html: `
      <h2>New paid booking</h2>
      ${row('Reference', booking.reference)}
      ${row('Attraction', booking.eventTitle)}
      ${row('Ticket option', [booking.optionName, booking.optionCode].filter(Boolean).join(' - '))}
      ${row('Guests', guests(booking))}
      ${row('Amount paid', money(booking.amount, booking.currency))}
      ${row('Discount', booking.discountAmount ? money(booking.discountAmount, booking.currency) : null)}
      ${row('Supplier cost', booking.resellerCost !== null ? money(booking.resellerCost, booking.currency) : 'unknown')}
      ${row('Customer', booking.customerName)}
      ${row('Email', booking.customerEmail)}
      ${row('Phone', booking.customerPhone)}
      ${row('Checkout notes', booking.event?.checkoutNotes)}
      ${row('Supplier status', booking.supplierStatus || 'N/A')}
      ${row('Supplier order', booking.supplierOrderId)}
      ${row('Stripe payment', booking.stripePaymentIntentId)}
      <p>Issue the tickets, then use Admin → Bookings → Mark fulfilled to send them to the customer.</p>`
  })
  return true
}
