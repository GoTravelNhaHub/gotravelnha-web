import { defineEventHandler, createError } from 'h3'
import prisma from '~/server/utils/prisma'
import { feeConfig, toPublicAttraction } from '~/server/utils/attraction-pricing'

export default defineEventHandler(async (event) => {
  const slug = event.context.params?.slug

  if (!slug || typeof slug !== 'string') {
    throw createError({ statusCode: 400, message: 'Invalid attraction identifier' })
  }

  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug)
    const record = await prisma.attractionsgEvent.findFirst({
      where: {
        isPublished: true,
        OR: [
          { slug: { equals: slug, mode: 'insensitive' } },
          ...(isUuid ? [{ id: slug }] : [])
        ]
      }
    })

    if (!record) {
      throw createError({ statusCode: 404, message: 'Attraction not found' })
    }

    return {
      success: true,
      // Sell prices only; supplier cost, raw crawl data and admin notes stay server-side
      event: toPublicAttraction(record, feeConfig())
    }
  } catch (error: any) {
    console.error('Failed to load attractionsg event:', error)
    if (error?.statusCode && error.statusCode < 500) throw error
    throw createError({ statusCode: 500, message: 'Failed to load attraction' })
  }
})
