import { defineEventHandler, getQuery } from 'h3'
import prisma from '~/server/utils/prisma'
import { createError } from 'h3'

const MAX_PRICE_AGE_DAYS = 7

/**
 * GET /api/deals/compare
 * Compare deals across platforms by location, category, or keywords
 */
export default defineEventHandler(async (event) => {
  if (event.node.req.method !== 'GET') {
    throw createError({
      statusCode: 405,
      message: 'Method not allowed'
    })
  }

  try {
    const query = getQuery(event)
    const location = query.location as string | undefined
    const category = query.category as string | undefined
    const keyword = query.keyword as string | undefined
    const limit = Math.min(Math.max(Number.parseInt(String(query.limit ?? ''), 10) || 20, 1), 50)

    // Only prices scraped recently; older rows are not shown as current prices
    const where: any = {
      isValid: true,
      updatedAt: { gte: new Date(Date.now() - MAX_PRICE_AGE_DAYS * 24 * 60 * 60 * 1000) }
    }

    if (category) {
      where.category = category
    }

    if (location) {
      where.location = {
        contains: location,
        mode: 'insensitive'
      }
    }

    if (keyword) {
      where.OR = [
        { title: { contains: keyword, mode: 'insensitive' } },
        { description: { contains: keyword, mode: 'insensitive' } }
      ]
    }

    // Get deals from all platforms
    const deals = await prisma.tripScrapedData.findMany({
      where,
      take: limit * 3, // Get more to allow for grouping
      orderBy: {
        updatedAt: 'desc'
      },
      include: {
        job: {
          select: {
            platform: true
          }
        }
      }
    })

    // Group deals by similarity and platform
    const groupedDeals = groupSimilarDeals(deals.map(toComparable).filter((deal) => deal.price !== null))

    // Calculate savings for each group
    const comparisons = groupedDeals.map(group => ({
      id: group.id,
      title: group.title,
      category: group.category,
      location: group.location,
      platformCount: new Set(group.deals.map((deal: ComparableDeal) => deal.platform)).size,
      lowestPrice: group.lowestPrice,
      highestPrice: group.highestPrice,
      savings: group.savings,
      currency: group.currency,
      deals: group.deals.map((deal: ComparableDeal) => ({
        platform: deal.platform,
        price: deal.price,
        originalPrice: deal.originalPrice,
        discount: deal.discount,
        image: deal.image,
        affiliateLink: deal.affiliateLink,
        checkedAt: deal.checkedAt
      }))
    }))

    return {
      success: true,
      data: comparisons,
      total: comparisons.length
    }
  } catch (error: any) {
    console.error('Error comparing deals:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to compare deals'
    })
  }
})

interface ComparableDeal {
  id: string
  title: string
  category: string | null
  location: string | null
  platform: string
  price: number | null
  originalPrice: number | null
  currency: string
  discount: string | null
  image: string | null
  affiliateLink: string | null
  checkedAt: string
}

const toNumber = (value: unknown) => {
  if (value === null || value === undefined) return null
  const num = Number(value)
  return Number.isFinite(num) && num > 0 ? num : null
}

function toComparable(row: any): ComparableDeal {
  const price = toNumber(row.discountedPrice) ?? toNumber(row.originalPrice)
  const original = toNumber(row.originalPrice)
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    location: row.location,
    platform: row.job?.platform || 'partner',
    price,
    originalPrice: original && price !== null && original > price ? original : null,
    currency: (row.currency || 'SGD').toUpperCase(),
    discount: row.discount,
    image: row.image,
    affiliateLink: row.affiliateLink,
    checkedAt: row.updatedAt.toISOString()
  }
}

/**
 * Group similar deals together for comparison. Savings are only claimed when two or
 * more platforms list the item in the same currency.
 */
function groupSimilarDeals(deals: ComparableDeal[]): any[] {
  const groups: any[] = []
  const processed = new Set<string>()

  for (const deal of deals) {
    if (processed.has(deal.id)) continue

    const similar = deals.filter(
      (other) => !processed.has(other.id) && other.currency === deal.currency && isSimilarDeal(deal, other)
    )

    for (const similarDeal of similar) {
      processed.add(similarDeal.id)
    }

    const prices = similar.map((d) => d.price as number)
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)
    const platforms = new Set(similar.map((d) => d.platform))
    const savings = platforms.size > 1 && maxPrice > minPrice ? Number(((maxPrice - minPrice) / maxPrice * 100).toFixed(1)) : 0

    groups.push({
      id: `group-${deal.id}`,
      title: deal.title,
      category: deal.category,
      location: deal.location,
      lowestPrice: minPrice,
      highestPrice: maxPrice,
      savings,
      currency: deal.currency,
      deals: similar.sort((a, b) => (a.price as number) - (b.price as number))
    })
  }

  return groups
}

/**
 * Determine if two deals are similar enough to compare
 */
function isSimilarDeal(deal1: ComparableDeal, deal2: ComparableDeal): boolean {
  // Must be same category
  if (deal1.category !== deal2.category) return false

  // Check title similarity
  const similarity = calculateStringSimilarity(
    deal1.title.toLowerCase(),
    deal2.title.toLowerCase()
  )

  // Consider similar if >60% match
  return similarity > 0.6
}

/**
 * Calculate string similarity using Levenshtein-like algorithm
 */
function calculateStringSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2
  const shorter = str1.length > str2.length ? str2 : str1

  if (longer.length === 0) return 1.0

  const editDistance = levenshteinDistance(longer, shorter)
  return (longer.length - editDistance) / longer.length
}

/**
 * Calculate Levenshtein distance
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = []

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i]
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }

  return matrix[str2.length][str1.length]
}

