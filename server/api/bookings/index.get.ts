import { defineEventHandler } from 'h3'
import prisma from '~/server/utils/prisma'
import { requireUser } from '~/server/utils/session'
import { toCustomerBooking } from '~/server/utils/booking-view'

// The signed-in customer's bookings. Only bookings linked to the account at checkout
// (or created with it) are returned; matching by email alone is not enough because
// email addresses are not verified at registration.
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const bookings = await prisma.attractionsgBooking.findMany({
    where: { userId: user.id, status: { not: 'PENDING' } },
    orderBy: { createdAt: 'desc' },
    take: 100
  })
  return { success: true, data: bookings.map(toCustomerBooking) }
})
