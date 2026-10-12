import { defineEventHandler, readBody, createError } from 'h3'
import prisma from '~/server/utils/prisma'
import { requireUser } from '~/server/utils/session'
import type { Itinerary, TripRequest } from '~/server/services/itinerary-generator'

// Saves a generated itinerary to the signed-in user's trips. Takes the generation id,
// not itinerary JSON, so the saved plan is exactly what the planner produced.
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const body = await readBody(event)
  const generationId = typeof body?.generationId === 'string' ? body.generationId : null

  const generation = generationId
    ? await prisma.itineraryGeneration.findUnique({ where: { id: generationId } })
    : null

  if (
    !generation ||
    generation.status !== 'SUCCESS' ||
    !generation.itinerary ||
    (generation.userId && generation.userId !== user.id)
  ) {
    throw createError({ statusCode: 404, message: 'Trip plan not found.' })
  }

  const existing = await prisma.trip.findUnique({ where: { generationId: generation.id } })
  if (existing) {
    if (existing.userId !== user.id) {
      throw createError({ statusCode: 409, message: 'This trip plan has already been saved.' })
    }
    return { success: true, data: { id: existing.id } }
  }

  const request = generation.request as unknown as TripRequest
  const itinerary = generation.itinerary as unknown as Itinerary
  const title =
    typeof body?.title === 'string' && body.title.trim() ? body.title.trim().slice(0, 120) : itinerary.title

  const trip = await prisma.trip.create({
    data: {
      userId: user.id,
      generationId: generation.id,
      title,
      destination: request.destination,
      startDate: new Date(`${request.startDate}T00:00:00Z`),
      endDate: new Date(`${request.endDate}T00:00:00Z`),
      budget: request.budget ?? null,
      currency: request.currency,
      party: request.party,
      preferences: { pace: request.pace, interests: request.interests ?? null },
      itinerary: generation.itinerary
    }
  })

  return { success: true, data: { id: trip.id } }
})
