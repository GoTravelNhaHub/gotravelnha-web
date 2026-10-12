import { defineEventHandler, readBody, createError, getRequestIP } from 'h3'
import prisma from '~/server/utils/prisma'
import { normalizeReference } from '~/server/utils/booking-reference'
import { toCustomerBooking } from '~/server/utils/booking-view'

// Guest booking lookup by reference + the email used at checkout. Both must match,
// and the same error is returned either way so references can't be probed.
// The limit is per server instance; it slows guessing rather than capping it globally.
const WINDOW_MS = 15 * 60 * 1000
const MAX_ATTEMPTS = 10
const attempts = new Map<string, number[]>()

export default defineEventHandler(async (event) => {
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  const now = Date.now()
  const recent = (attempts.get(ip) || []).filter((time) => now - time < WINDOW_MS)
  if (recent.length >= MAX_ATTEMPTS) {
    throw createError({ statusCode: 429, message: 'Too many attempts. Please try again in 15 minutes.' })
  }
  recent.push(now)
  attempts.set(ip, recent)

  const body = await readBody(event)
  const reference = normalizeReference(body?.reference)
  const email = typeof body?.email === 'string' ? body.email.trim() : ''

  if (!/^GTN-[A-Z0-9]{8}$/.test(reference) || !email) {
    throw createError({ statusCode: 400, message: 'Enter your booking reference (GTN-XXXXXXXX) and email.' })
  }

  const booking = await prisma.attractionsgBooking.findFirst({
    where: { reference, customerEmail: { equals: email, mode: 'insensitive' } }
  })
  if (!booking) {
    throw createError({ statusCode: 404, message: 'We could not find a booking with that reference and email.' })
  }

  return { success: true, data: toCustomerBooking(booking) }
})
