import { createError, defineEventHandler, readBody } from 'h3'
import prisma from '~/server/utils/prisma'
import { enforceActivityRateLimit, clipText, boundedJson, cleanSessionId } from '~/server/utils/activity-limits'

interface AffiliateEventBody {
  eventName: 'affiliate_offer_impression' | 'affiliate_offer_fallback_used' | 'affiliate_offer_unavailable'
  sessionId?: string
  provider?: string
  entityId?: string
  offerId?: string
  placementKey?: string
  pagePath?: string
  metadata?: Record<string, any>
}

export default defineEventHandler(async (event) => {
  enforceActivityRateLimit(event)
  try {
    const body = (await readBody(event)) as AffiliateEventBody
    if (!body?.eventName) {
      throw createError({ statusCode: 400, message: 'eventName is required' })
    }

    const allowedEvents = new Set([
      'affiliate_offer_impression',
      'affiliate_offer_fallback_used',
      'affiliate_offer_unavailable'
    ])

    if (!allowedEvents.has(body.eventName)) {
      throw createError({ statusCode: 400, message: 'Unsupported eventName' })
    }

    await prisma.userActivity.create({
      data: {
        sessionId: cleanSessionId(body.sessionId) || 'anonymous',
        timestamp: new Date(),
        page: clipText(body.pagePath, 300) || 'unknown',
        action: body.eventName,
        // Caller metadata is nested and size-capped so it can't overwrite these fields
        data: {
          provider: clipText(body.provider, 40),
          entityId: clipText(body.entityId, 80),
          offerId: clipText(body.offerId, 80),
          placementKey: clipText(body.placementKey, 80),
          metadata: (boundedJson(body.metadata, 2000) as any) ?? null
        }
      }
    })

    return {
      success: true
    }
  } catch (error: any) {
    console.error('Affiliate event tracking error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: 'Failed to track affiliate event'
    })
  }
})

