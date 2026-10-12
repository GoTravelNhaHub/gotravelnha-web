import { defineEventHandler } from 'h3'
import prisma from '~/server/utils/prisma'
import { requireUser } from '~/server/utils/session'

/**
 * GET /api/price-alerts/my-alerts
 * Price alerts for the signed-in user
 */
export default defineEventHandler(async (event) => {
  const { id: userId } = await requireUser(event)
  try {
    const alerts = await prisma.priceAlert.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })

    return {
      success: true,
      data: alerts
    }
  } catch (error: any) {
    return {
      success: false,
      error: 'Something went wrong'
    }
  }
})

