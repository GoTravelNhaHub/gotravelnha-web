import { sendEmail, escapeHtml } from '~/server/utils/email'
import { enforceRateLimit } from '~/server/utils/activity-limits'

const textOf = (value: unknown, max: number) => {
  const raw = typeof value === 'number' && Number.isFinite(value) ? String(value) : typeof value === 'string' ? value : ''
  return raw.replace(/[\r\n]+/g, ' ').trim().slice(0, max)
}

export default defineEventHandler(async (event) => {
  enforceRateLimit(event, 'booking-request', 5, 10 * 60 * 1000)

  const body = await readBody(event)
  const eventTitle = textOf(body?.eventTitle, 200)
  const name = textOf(body?.name, 100)
  const email = textOf(body?.email, 200)
  const phone = textOf(body?.phone, 40)
  const adults = textOf(body?.adults, 10)
  const children = textOf(body?.children, 10) || '0'
  const eventPrice = textOf(body?.eventPrice, 40)
  const notes = typeof body?.notes === 'string' ? body.notes.trim().slice(0, 2000) : ''

  if (!eventTitle || !name || !email.includes('@') || !phone || !adults) {
    throw createError({ statusCode: 400, statusMessage: 'Missing required fields' })
  }

  const text = [
    'New Booking Request from GoTravelNha',
    '',
    `Event: ${eventTitle}`,
    `Price: ${eventPrice || 'Not specified'}`,
    `Name: ${name}`,
    `Email: ${email}`,
    `Phone: ${phone}`,
    `Adults: ${adults}`,
    `Children: ${children}`,
    notes ? `Notes:\n${notes}` : '',
    '',
    'This booking request was submitted from GoTravelNha.com',
    'Please respond to the customer within 24 hours.'
  ].filter((line) => line !== undefined).join('\n')

  try {
    await sendEmail({
      to: 'enjoytravelticket@gmail.com',
      cc: ['chloenguyenvuthanhtruc@gmail.com', 'sales@gotravelnha.com', 'admin@gotravelnha.com'],
      replyTo: email,
      subject: `New Booking Request: ${eventTitle}`,
      text,
      html: `
        <p><strong>Event:</strong> ${escapeHtml(eventTitle)}</p>
        <p><strong>Price:</strong> ${escapeHtml(eventPrice || 'Not specified')}</p>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
        <p><strong>Adults:</strong> ${escapeHtml(adults)}</p>
        <p><strong>Children:</strong> ${escapeHtml(children)}</p>
        ${notes ? `<p style="white-space:pre-wrap"><strong>Notes:</strong><br>${escapeHtml(notes)}</p>` : ''}
      `
    })
  } catch (error) {
    console.error('Booking request email failed:', error)
    throw createError({ statusCode: 500, statusMessage: 'Could not send the booking request.' })
  }

  return { success: true }
})
