import { defineEventHandler, createError } from 'h3'
import prisma from '~/server/utils/prisma'
import { feeConfig, toPublicAttraction } from '~/server/utils/attraction-pricing'

export default defineEventHandler(async (event) => {
  const slug = event.context.params?.slug

  if (!slug || typeof slug !== 'string') {
    throw createError({ statusCode: 400, message: 'Invalid attraction identifier' })
  }

  try {
    const record = await prisma.attractionsgEvent.findFirst({
      where: {
        isPublished: true,
        OR: [
          { slug: { equals: slug, mode: 'insensitive' } },
          { id: slug }
        ]
      }
    })

    if (!record) {
      return {
        success: false,
        event: null
      }
    }

    return {
      success: true,
      // Sell prices only; supplier cost, raw crawl data and admin notes stay server-side
      event: toPublicAttraction(record, feeConfig())
    }
  } catch (error) {
    console.error('Failed to load attractionsg event:', error)
    throw createError({ statusCode: 500, message: 'Failed to load attraction' })
  }
})
