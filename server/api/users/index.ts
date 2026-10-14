import { defineEventHandler, getQuery } from 'h3'
import prisma from '~/server/utils/prisma'

// Admin user list (admin-gated by server/middleware/auth-guard.ts)
export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  // Get all users or filtered users
  const users = await prisma.user.findMany({
    where: query.role ? { role: query.role as any } : undefined,
    select: {
      id: true,
      username: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      provider: true,
      // What deleting the account would remove or unlink
      _count: { select: { trips: true, travellers: true, attractionBookings: true, loyaltyPoints: true } }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return {
    success: true,
    users
  }
})

