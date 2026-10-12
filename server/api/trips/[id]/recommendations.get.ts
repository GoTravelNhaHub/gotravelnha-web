import { defineEventHandler, getRouterParam, createError } from 'h3'
import prisma from '~/server/utils/prisma'
import { requireUser } from '~/server/utils/session'
import { recommendActivities } from '~/server/services/trip-recommendations'
import { itineraryActivityIds, type Itinerary } from '~/server/services/itinerary-generator'
import type { TripPartyMember } from '~/types/trip'

// Activities that fit a saved trip's family and are not already in the itinerary
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const id = getRouterParam(event, 'id')
  const trip = id ? await prisma.trip.findFirst({ where: { id, userId: user.id } }) : null

  if (!trip) {
    throw createError({ statusCode: 404, message: 'Trip not found.' })
  }

  const party = (trip.party as unknown as TripPartyMember[]) || []
  const preferences = (trip.preferences as { interests?: string | null } | null) || null

  const data = await recommendActivities({
    destination: trip.destination,
    ages: party.map((person) => person.age),
    interests: preferences?.interests,
    excludeIds: itineraryActivityIds(trip.itinerary as unknown as Itinerary),
    limit: 6
  })

  return { success: true, data }
})
