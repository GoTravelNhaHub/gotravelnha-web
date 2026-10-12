import { defineEventHandler, getRouterParam, createError } from 'h3'
import prisma from '~/server/utils/prisma'
import { requireUser } from '~/server/utils/session'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const id = getRouterParam(event, 'id')
  const result = await prisma.trip.deleteMany({ where: { id, userId: user.id } })
  if (result.count === 0) {
    throw createError({ statusCode: 404, message: 'Trip not found.' })
  }
  return { success: true }
})
