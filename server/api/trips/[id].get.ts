import { defineEventHandler, getRouterParam, createError } from 'h3'
import prisma from '~/server/utils/prisma'
import { requireUser } from '~/server/utils/session'
import { resolveActivities } from '~/server/services/trip-catalogue'
import { itineraryActivityIds, type Itinerary } from '~/server/services/itinerary-generator'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const id = getRouterParam(event, 'id')
  const trip = id ? await prisma.trip.findFirst({ where: { id, userId: user.id } }) : null

  if (!trip) {
    throw createError({ statusCode: 404, message: 'Trip not found.' })
  }

  const itinerary = trip.itinerary as unknown as Itinerary
  return {
    success: true,
    data: trip,
    // Prices and availability as of now, not as of when the trip was planned
    activities: await resolveActivities(itineraryActivityIds(itinerary))
  }
})
