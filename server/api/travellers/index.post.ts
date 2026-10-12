import { defineEventHandler, readBody, createError } from 'h3'
import prisma from '~/server/utils/prisma'
import { requireUser } from '~/server/utils/session'
import { TravellerInputSchema, toTravellerData } from '~/server/utils/traveller-input'

const MAX_TRAVELLERS = 12

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const parsed = TravellerInputSchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({ statusCode: 400, message: 'Please enter a name and a valid birth date.' })
  }

  if ((await prisma.traveller.count({ where: { userId: user.id } })) >= MAX_TRAVELLERS) {
    throw createError({ statusCode: 400, message: `You can save up to ${MAX_TRAVELLERS} travellers.` })
  }

  const traveller = await prisma.traveller.create({
    data: { userId: user.id, ...toTravellerData(parsed.data) }
  })
  return { success: true, data: traveller }
})
