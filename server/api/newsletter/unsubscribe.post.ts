import { createError, defineEventHandler, readBody } from 'h3'
import prisma from '~/server/utils/prisma'
import { enforceRateLimit } from '~/server/utils/activity-limits'
import { isValidNewsletterToken } from '~/server/utils/newsletter-token'

export default defineEventHandler(async (event) => {
  enforceRateLimit(event, 'newsletter-unsubscribe', 10, 10 * 60 * 1000)
  const body = await readBody(event)
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase().slice(0, 200) : ''
  if (!email || !isValidNewsletterToken(email, body?.token)) {
    throw createError({ statusCode: 400, message: 'This unsubscribe link is not valid. Use the link from your latest email.' })
  }
  await prisma.newsletterSubscriber.updateMany({
    where: { email, isActive: true },
    data: { isActive: false, unsubscribedAt: new Date() }
  })
  return { success: true }
})
