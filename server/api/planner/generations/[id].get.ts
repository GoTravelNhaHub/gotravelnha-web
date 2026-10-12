import { defineEventHandler, getRouterParam, createError } from 'h3'
import prisma from '~/server/utils/prisma'
import { getSessionUser } from '~/server/utils/session'
import { resolveActivities } from '~/server/services/trip-catalogue'
import { itineraryActivityIds, type Itinerary } from '~/server/services/itinerary-generator'

// Reloads a generated itinerary (e.g. after a guest signs in) with live prices
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const generation = id ? await prisma.itineraryGeneration.findUnique({ where: { id } }) : null

  if (!generation || generation.status !== 'SUCCESS' || !generation.itinerary) {
    throw createError({ statusCode: 404, message: 'Trip plan not found.' })
  }

  // A plan made while signed in stays private to that user; guest plans are reachable by id
  if (generation.userId) {
    const user = await getSessionUser(event)
    if (user?.id !== generation.userId) {
      throw createError({ statusCode: 404, message: 'Trip plan not found.' })
    }
  }

  const itinerary = generation.itinerary as unknown as Itinerary
  return {
    success: true,
    generationId: generation.id,
    request: generation.request,
    itinerary,
    activities: await resolveActivities(itineraryActivityIds(itinerary))
  }
})
