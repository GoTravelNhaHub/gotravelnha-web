import { defineEventHandler } from 'h3'
import prisma from '~/server/utils/prisma'
import { requireUser } from '~/server/utils/session'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const trips = await prisma.trip.findMany({
    where: { userId: user.id },
    orderBy: { startDate: 'asc' },
    select: {
      id: true,
      title: true,
      destination: true,
      startDate: true,
      endDate: true,
      party: true,
      createdAt: true
    }
  })
  return { success: true, data: trips }
})
