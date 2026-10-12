import { defineEventHandler, readBody } from 'h3'
import { createError } from 'h3'
import { getEventsCache, getCacheTimestamp } from './crawl'
import prisma from '~/server/utils/prisma'
import type { Prisma } from '@prisma/client'
import { feeConfig, toPublicAttraction } from '~/server/utils/attraction-pricing'

interface EventsRequest {
  search?: string
  category?: string
  page?: number
  limit?: number
  sortBy?: 'title' | 'price' | 'rating' | 'date'
  sortOrder?: 'asc' | 'desc'
}

export default defineEventHandler(async (event) => {
  try {
    const body = (await readBody(event)) as EventsRequest
    const page = Math.max(1, body.page || 1)
    const limit = Math.max(1, Math.min(body.limit || 20, 100))
    const offset = (page - 1) * limit
    const sortOrder = body.sortOrder === 'desc' ? 'desc' : 'asc'

    const where: Prisma.AttractionsgEventWhereInput = {
      isActive: true,
      isPublished: true
    }

    if (body.search) {
      where.OR = [
        { title: { contains: body.search, mode: 'insensitive' } },
        { description: { contains: body.search, mode: 'insensitive' } },
        { category: { contains: body.search, mode: 'insensitive' } },
        { location: { contains: body.search, mode: 'insensitive' } }
      ]
    }

    if (body.category) {
      where.category = { equals: body.category, mode: 'insensitive' }
    }

    const orderBy = buildOrderBy(body, sortOrder)

    const [records, totalCount, maxUpdated] = await Promise.all([
      prisma.attractionsgEvent.findMany({
        where,
        orderBy,
        skip: offset,
        take: limit
      }),
      prisma.attractionsgEvent.count({ where }),
      prisma.attractionsgEvent.aggregate({
        where,
        _max: { updatedAt: true }
      })
    ])

    let total = totalCount
    const fees = feeConfig()
    let data = records.map((record) => toPublicAttraction(record, fees))
    let cached = false
    let timestamp = maxUpdated._max.updatedAt
      ? maxUpdated._max.updatedAt.toISOString()
      : new Date().toISOString()

    if (data.length === 0 && !body.search && !body.category) {
      const cache = getEventsCache().filter((event) => event.isPublished === true)
      if (cache.length > 0) {
        cached = true
        total = cache.length
        data = cache.slice(offset, offset + limit).map((entry) => toPublicAttraction(entry as any, fees))
        timestamp = new Date(getCacheTimestamp()).toISOString()
      }
    }

    return {
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      filters: {
        search: body.search,
        category: body.category
      },
      cached,
      timestamp
    }
  } catch (error: any) {
    console.error('Events API error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to fetch events'
    })
  }
})

function buildOrderBy(params: EventsRequest, sortOrder: 'asc' | 'desc'): Prisma.AttractionsgEventOrderByWithRelationInput[] {
  const order: Prisma.AttractionsgEventOrderByWithRelationInput[] = []

  switch (params.sortBy) {
    case 'price':
      order.push({ priceAmount: sortOrder }, { priceText: sortOrder })
      break
    case 'rating':
      order.push({ rating: sortOrder })
      break
    case 'date':
      order.push({ lastSeenAt: sortOrder === 'asc' ? 'asc' : 'desc' })
      break
    case 'title':
      order.push({ title: sortOrder })
      break
    default:
      order.push({ lastSeenAt: 'desc' })
      break
  }

  // Deterministic fallback ordering
  if (params.sortBy !== 'title') {
    order.push({ title: 'asc' })
  }

  return order
}
