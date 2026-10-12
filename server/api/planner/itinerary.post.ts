import { createHash } from 'crypto'
import { defineEventHandler, readBody, createError, getRequestIP } from 'h3'
import type { Prisma } from '@prisma/client'
import prisma from '~/server/utils/prisma'
import { getSessionUser } from '~/server/utils/session'
import { loadCatalogue, resolveActivities } from '~/server/services/trip-catalogue'
import {
  ITINERARY_MODEL,
  MAX_TRIP_DAYS,
  TripRequestSchema,
  generateItinerary,
  itineraryActivityIds,
  tripDates
} from '~/server/services/itinerary-generator'

// Each generation is a paid model call, so cap it per guest IP, per user and site-wide
const GUEST_DAILY_LIMIT = 3
const USER_DAILY_LIMIT = 10
const SITE_DAILY_LIMIT = 300

export default defineEventHandler(async (event) => {
  const parsed = TripRequestSchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({ statusCode: 400, message: 'Please check the destination, dates and travellers.' })
  }
  const request = parsed.data

  const today = new Date().toISOString().slice(0, 10)
  if (request.startDate < today || request.endDate < request.startDate) {
    throw createError({ statusCode: 400, message: 'Choose a start date from today and an end date after it.' })
  }
  if (tripDates(request.startDate, request.endDate).length > MAX_TRIP_DAYS) {
    throw createError({ statusCode: 400, message: `Trips can be up to ${MAX_TRIP_DAYS} days.` })
  }

  const user = await getSessionUser(event)
  const clientKey = user
    ? `user:${user.id}`
    : `ip:${createHash('sha256')
        .update(`${getRequestIP(event, { xForwardedFor: true }) || 'unknown'}:${useRuntimeConfig().SESSION_PASSWORD}`)
        .digest('hex')}`

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const [clientCount, siteCount] = await Promise.all([
    prisma.itineraryGeneration.count({ where: { clientKey, createdAt: { gte: since } } }),
    prisma.itineraryGeneration.count({ where: { createdAt: { gte: since } } })
  ])

  if (clientCount >= (user ? USER_DAILY_LIMIT : GUEST_DAILY_LIMIT)) {
    throw createError({
      statusCode: 429,
      message: user
        ? 'You have reached today’s trip plan limit. Please try again tomorrow.'
        : 'Guests can create 3 trip plans a day. Sign in to create more.'
    })
  }
  if (siteCount >= SITE_DAILY_LIMIT) {
    console.warn('[itinerary] Site-wide daily limit reached')
    throw createError({ statusCode: 503, message: 'The trip planner is busy today. Please try again tomorrow.' })
  }

  const catalogue = await loadCatalogue(request.destination)
  const result = await generateItinerary(request, catalogue)

  const generation = await prisma.itineraryGeneration.create({
    data: {
      userId: user?.id ?? null,
      clientKey,
      destination: request.destination,
      request,
      itinerary: result.itinerary ? (result.itinerary as unknown as Prisma.InputJsonValue) : undefined,
      model: ITINERARY_MODEL,
      status: result.status,
      inputTokens: result.inputTokens,
      outputTokens: result.outputTokens
    }
  })

  if (!result.itinerary) {
    throw createError({
      statusCode: 502,
      message:
        result.status === 'REFUSED'
          ? 'We could not plan this trip. Try different details.'
          : 'The trip planner could not finish. Please try again.'
    })
  }

  return {
    success: true,
    generationId: generation.id,
    request,
    itinerary: result.itinerary,
    activities: await resolveActivities(itineraryActivityIds(result.itinerary)),
    catalogueSize: catalogue.length
  }
})
