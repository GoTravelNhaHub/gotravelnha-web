import prisma from '~/server/utils/prisma'
import { destinationSlug } from '~/utils/destination-slug'
import { canonicalSiteOrigin } from '~/utils/site-origin'

const staticPaths = [
  '/explore',
  '/explore/flights',
  '/explore/hotels',
  '/explore/attractions',
  '/attractionsg',
  '/destinations',
  '/klook',
  '/trip',
  '/compare',
  '/planner',
  '/contact',
  '/help',
  '/privacy',
  '/terms',
  '/refund-policy',
  '/exchange'
]

const escapeXml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

export default defineEventHandler(async (event) => {
  const site = canonicalSiteOrigin(useRuntimeConfig().public.siteUrl)
  const urls = new Map<string, string>()
  for (const path of staticPaths) urls.set(path, '')

  try {
    const [events, templates, destinations] = await Promise.all([
      prisma.attractionsgEvent.findMany({
        where: { isActive: true, isPublished: true },
        select: { slug: true, id: true, updatedAt: true }
      }),
      prisma.dealTemplate.findMany({
        where: { isActive: true },
        select: { slug: true, updatedAt: true }
      }),
      prisma.affiliateEntity.findMany({
        where: { status: 'active', location: { not: null } },
        select: { location: true }
      })
    ])

    for (const item of events) {
      const slug = item.slug || item.id
      if (slug) urls.set(`/attractionsg/${encodeURIComponent(slug)}`, item.updatedAt.toISOString())
    }
    for (const item of templates) {
      if (item.slug) urls.set(`/explore/${encodeURIComponent(item.slug)}`, item.updatedAt.toISOString())
    }
    for (const item of destinations) {
      if (!item.location) continue
      const slug = destinationSlug(item.location)
      if (slug) urls.set(`/destinations/${encodeURIComponent(slug)}`, '')
    }
    urls.set('/destinations/singapore', '')
  } catch (error) {
    console.error('Sitemap database lookup failed:', error)
  }

  const body = [...urls.entries()]
    .map(([path, lastmod]) => {
      const loc = escapeXml(`${site}${path}`)
      return lastmod
        ? `<url><loc>${loc}</loc><lastmod>${lastmod}</lastmod></url>`
        : `<url><loc>${loc}</loc></url>`
    })
    .join('')

  setHeader(event, 'content-type', 'application/xml; charset=utf-8')
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</urlset>`
})
