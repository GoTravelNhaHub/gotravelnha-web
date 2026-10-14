import { randomBytes } from 'crypto'
import { createError, defineEventHandler, getRouterParam, readBody } from 'h3'
import prisma from '~/server/utils/prisma'
import { requireUser } from '~/server/utils/session'

// Turn a trip's public link on or off. Turning it off clears the code, so old links stop working.
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const id = getRouterParam(event, 'id')
  const enabled = (await readBody(event))?.enabled === true

  const trip = id ? await prisma.trip.findFirst({ where: { id, userId: user.id }, select: { id: true, shareId: true } }) : null
  if (!trip) {
    throw createError({ statusCode: 404, message: 'Trip not found.' })
  }

  // Keep an existing code so a link that was already sent keeps working
  const shareId = enabled ? trip.shareId || randomBytes(9).toString('base64url') : null
  await prisma.trip.update({ where: { id: trip.id }, data: { shareId } })

  return { success: true, shareId }
})
