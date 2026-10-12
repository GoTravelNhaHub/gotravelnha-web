import { defineEventHandler } from 'h3'
import prisma from '~/server/utils/prisma'
import { cityOf, destinationSlug } from '~/utils/destination-slug'

// Destinations that have at least one bookable activity, with a count per city
export default defineEventHandler(async () => {
  const now = new Date()
  const [singaporeCount, entities] = await Promise.all([
    prisma.attractionsgEvent.count({ where: { isActive: true, isPublished: true } }),
    prisma.affiliateEntity.findMany({
      where: {
        status: 'active',
        location: { not: null },
        offers: {
          some: {
            isActive: true,
            availabilityStatus: 'available',
            OR: [{ expiresAt: null }, { expiresAt: { gt: now } }]
          }
        }
      },
      select: { location: true }
    })
  ])

  const counts = new Map<string, { slug: string; name: string; activityCount: number }>()
  const add = (name: string, amount: number) => {
    const slug = destinationSlug(name)
    if (!slug) return
    const entry = counts.get(slug) || { slug, name, activityCount: 0 }
    entry.activityCount += amount
    counts.set(slug, entry)
  }

  if (singaporeCount) add('Singapore', singaporeCount)
  for (const entity of entities) {
    if (entity.location) add(cityOf(entity.location), 1)
  }

  return {
    success: true,
    data: [...counts.values()].sort((a, b) => b.activityCount - a.activityCount)
  }
})
