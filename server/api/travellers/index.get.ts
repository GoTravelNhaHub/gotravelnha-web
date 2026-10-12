import { defineEventHandler } from 'h3'
import prisma from '~/server/utils/prisma'
import { requireUser } from '~/server/utils/session'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const travellers = await prisma.traveller.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'asc' }
  })
  return { success: true, data: travellers }
})
