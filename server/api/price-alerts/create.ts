import { defineEventHandler, readBody } from 'h3'
import prisma from '~/server/utils/prisma'
import { requireUser } from '~/server/utils/session'

const MAX_ACTIVE_ALERTS = 50

/**
 * POST /api/price-alerts/create
 * Create a price drop alert for the signed-in user.
 * Nothing checks alerts yet, so the response must not promise a notification.
 */
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const userId = user.id
  try {
    const body = await readBody(event)
    const { platform, productType, productId, productName, currentPrice, targetPrice, originalUrl } = body

    if (!platform || !productType || !productId || !productName || !originalUrl) {
      return {
        success: false,
        error: 'Missing required fields'
      }
    }

    // Check if alert already exists
    const existing = await prisma.priceAlert.findFirst({
      where: {
        userId,
        platform,
        productId,
        isActive: true
      }
    })

    if ((await prisma.priceAlert.count({ where: { userId, isActive: true } })) >= MAX_ACTIVE_ALERTS) {
      return {
        success: false,
        error: `You can have up to ${MAX_ACTIVE_ALERTS} active alerts`
      }
    }

    if (existing) {
      return {
        success: false,
        error: 'You already have an active alert for this product'
      }
    }

    const alert = await prisma.priceAlert.create({
      data: {
        userId,
        platform,
        productType,
        productId,
        productName,
        currentPrice: currentPrice || null,
        targetPrice: targetPrice || null,
        originalUrl,
        isActive: true
      }
    })

    return {
      success: true,
      data: alert,
      message: 'Price alert saved.'
    }
  } catch (error: any) {
    console.error('Error creating price alert:', error)
    return {
      success: false,
      error: error.message || 'Failed to create price alert'
    }
  }
})

