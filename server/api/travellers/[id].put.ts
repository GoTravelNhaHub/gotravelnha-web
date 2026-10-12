import { defineEventHandler, readBody, getRouterParam, createError } from 'h3'
import prisma from '~/server/utils/prisma'
import { requireUser } from '~/server/utils/session'
import { TravellerInputSchema, toTravellerData } from '~/server/utils/traveller-input'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const id = getRouterParam(event, 'id')
  const parsed = TravellerInputSchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({ statusCode: 400, message: 'Please enter a name and a valid birth date.' })
  }

  const result = await prisma.traveller.updateMany({
    where: { id, userId: user.id },
    data: toTravellerData(parsed.data)
  })
  if (result.count === 0) {
    throw createError({ statusCode: 404, message: 'Traveller not found.' })
  }
  return { success: true }
})
