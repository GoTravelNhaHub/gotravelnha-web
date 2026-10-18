import prisma from '~/server/utils/prisma'
import { destinationSlug } from '~/utils/destination-slug'
import { canonicalSiteOrigin } from '~/utils/site-origin'
import { publishedGuides } from '~/utils/destination-guides'
import { DESTINATIONS, catalogSlug } from '~/utils/destination-catalog'
import { communityEnabled } from '~/utils/feature-flags'
import { listIndexableTrips } from '~/server/services/community/trips'
import { listIndexableTravelers } from '~/server/services/community/travelers'

const staticPaths = [
  '/explore',
  '/explore/flights',
  '/explore/hotels',
  '/explore/attractions',
  '/attractionsg',
  '/destinations',
  '/klook',
  '/trip',
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
  const config = useRuntimeConfig().public
  const site = canonicalSiteOrigin(config.siteUrl)
  const urls = new Map<string, string>()
  for (const path of staticPaths) urls.set(path, '')

  const guides = publishedGuides()
  if (guides.length) urls.set('/guides', '')
  for (const guide of guides) urls.set(`/guides/${guide.slug}`, guide.updated)

  // Each lookup is independent so one failing table cannot drop every dynamic URL.
  const [events, templates, destinations, communityTrips, travelers] = await Promise.allSettled([
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
    }),
    // Public community trips only; unlisted and private ones never appear here
    communityEnabled(config) ? listIndexableTrips() : Promise.resolve([]),
    // Traveler profiles with at least one public trip (the others are noindex)
    communityEnabled(config) ? listIndexableTravelers() : Promise.resolve([])
  ])

  if (events.status === 'fulfilled') {
    for (const item of events.value) {
      const slug = item.slug || item.id
      if (slug) urls.set(`/attractionsg/${encodeURIComponent(slug)}`, item.updatedAt.toISOString())
    }
  } else {
    console.error('Sitemap attractionsgEvent lookup failed:', events.reason)
  }
  if (templates.status === 'fulfilled') {
    for (const item of templates.value) {
      if (item.slug) urls.set(`/explore/${encodeURIComponent(item.slug)}`, item.updatedAt.toISOString())
    }
  } else {
    console.error('Sitemap dealTemplate lookup failed:', templates.reason)
  }
  if (destinations.status === 'fulfilled') {
    for (const item of destinations.value) {
      if (!item.location) continue
      const slug = destinationSlug(item.location)
      if (slug) urls.set(`/destinations/${encodeURIComponent(slug)}`, '')
    }
  } else {
    console.error('Sitemap affiliateEntity lookup failed:', destinations.reason)
  }
  if (communityEnabled(config)) urls.set('/community', '')
  if (communityTrips.status === 'fulfilled') {
    for (const item of communityTrips.value) urls.set(`/community/trips/${encodeURIComponent(item.slug)}`, item.updatedAt.toISOString())
  } else {
    console.error('Sitemap publishedTrip lookup failed:', communityTrips.reason)
  }
  if (travelers.status === 'fulfilled') {
    for (const item of travelers.value) urls.set(`/travelers/${encodeURIComponent(item.handle)}`, item.updatedAt.toISOString())
  } else {
    console.error('Sitemap travelerProfile lookup failed:', travelers.reason)
  }
  // Every catalogue city has a page, whether or not an affiliate entity lists it yet
  for (const destination of DESTINATIONS) urls.set(`/destinations/${encodeURIComponent(catalogSlug(destination))}`, '')

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
