import prisma from '~/server/utils/prisma'
import type { LiveActivity } from '~/types/trip'
import { isApprovedPartnerUrl } from '~/utils/partner-url'

// Catalogue ids handed to the model are prefixed so one string identifies the table:
//   sg:<AttractionsgEvent.id>   self-checkout attractions (Singapore)
//   offer:<AffiliateOffer.id>   partner offers (Klook, Trip.com, ...)

export interface CatalogueItem {
  id: string
  title: string
  category: string | null
  location: string | null
  duration: string | null
  ageRestriction: string | null
  /** Indicative per-person price so the model can respect the budget. Never shown from model output. */
  indicativePrice: string | null
  summary: string | null
}

const MAX_ATTRACTIONS = 80
const MAX_OFFERS = 60
// A price or booking link older than this is treated as unchecked
const VERIFIED_WITHIN_DAYS = 7

const isSingapore = (destination: string) => /singapore|sentosa|\bsg\b/i.test(destination)

const clip = (value: string | null | undefined, length: number) => {
  if (!value) return null
  const text = value.replace(/\s+/g, ' ').trim()
  return text.length > length ? `${text.slice(0, length)}…` : text
}

const formatPrice = (amount: number | null | undefined, currency: string) =>
  typeof amount === 'number' && amount > 0 ? `${currency} ${amount.toFixed(2)}` : null

const metadataImage = (metadata: unknown) =>
  metadata && typeof metadata === 'object' && typeof (metadata as any).image === 'string'
    ? ((metadata as any).image as string)
    : null

/** Bookable activities for a destination, from supplier tables only. */
export async function loadCatalogue(destination: string): Promise<CatalogueItem[]> {
  const city = destination.split(',')[0].trim()
  const now = new Date()

  const [attractions, offers] = await Promise.all([
    isSingapore(destination)
      ? prisma.attractionsgEvent.findMany({
          where: { isActive: true, isPublished: true },
          orderBy: [{ rating: { sort: 'desc', nulls: 'last' } }, { updatedAt: 'desc' }],
          take: MAX_ATTRACTIONS,
          select: {
            id: true,
            title: true,
            category: true,
            location: true,
            duration: true,
            ageRestriction: true,
            description: true,
            publicPrice: true,
            priceAmount: true
          }
        })
      : Promise.resolve([]),
    city
      ? prisma.affiliateOffer.findMany({
          where: {
            isActive: true,
            availabilityStatus: 'available',
            OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
            entity: { status: 'active', location: { contains: city, mode: 'insensitive' } }
          },
          orderBy: [{ score: 'desc' }, { updatedAt: 'desc' }],
          take: MAX_OFFERS,
          include: { entity: true }
        })
      : Promise.resolve([])
  ])

  return [
    ...attractions.map((event) => ({
      id: `sg:${event.id}`,
      title: event.title,
      category: event.category,
      location: event.location,
      duration: event.duration,
      ageRestriction: event.ageRestriction,
      indicativePrice: formatPrice(event.publicPrice ?? event.priceAmount, 'SGD'),
      summary: clip(event.description, 240)
    })),
    ...offers.map((offer) => ({
      id: `offer:${offer.id}`,
      title: offer.entity.title,
      category: offer.entity.category,
      location: offer.entity.location,
      duration: null,
      ageRestriction: null,
      indicativePrice: formatPrice(offer.priceAmount, offer.currency || 'SGD') ?? offer.priceText,
      summary: clip((offer.metadata as any)?.description, 240)
    }))
  ]
}

/**
 * Current price, availability and booking target for catalogue ids, read fresh from
 * the supplier tables. Ids that no longer exist come back as unavailable.
 */
export async function resolveActivities(ids: string[]): Promise<Record<string, LiveActivity>> {
  const unique = [...new Set(ids)]
  const attractionIds = unique.filter((id) => id.startsWith('sg:')).map((id) => id.slice(3))
  const offerIds = unique.filter((id) => id.startsWith('offer:')).map((id) => id.slice(6))
  const uuid = /^[0-9a-f-]{36}$/i

  const [attractions, offers] = await Promise.all([
    attractionIds.length
      ? prisma.attractionsgEvent.findMany({
          where: { id: { in: attractionIds.filter((id) => uuid.test(id)) } },
          select: {
            id: true,
            title: true,
            slug: true,
            image: true,
            category: true,
            isActive: true,
            isPublished: true,
            publicPrice: true,
            priceAmount: true,
            priceText: true,
            location: true,
            lastSeenAt: true
          }
        })
      : Promise.resolve([]),
    offerIds.length
      ? prisma.affiliateOffer.findMany({
          where: { id: { in: offerIds } },
          include: { entity: true }
        })
      : Promise.resolve([])
  ])

  const result: Record<string, LiveActivity> = {}
  const now = new Date()
  const checkedSince = now.getTime() - VERIFIED_WITHIN_DAYS * 86_400_000

  for (const event of attractions) {
    const price = event.publicPrice ?? event.priceAmount
    const available = event.isActive && event.isPublished
    result[`sg:${event.id}`] = {
      id: `sg:${event.id}`,
      kind: 'attraction',
      title: event.title,
      image: event.image,
      category: event.category,
      available,
      verified: available && event.lastSeenAt.getTime() >= checkedSince,
      priceFrom: typeof price === 'number' && price > 0 ? price : null,
      currency: 'SGD',
      priceText: event.priceText,
      href: `/attractionsg/${event.slug || event.id}`,
      offerId: null,
      provider: 'attractionsg',
      checkedAt: event.lastSeenAt.toISOString(),
      location: event.location
    }
  }

  for (const offer of offers) {
    const available =
      offer.isActive &&
      offer.availabilityStatus === 'available' &&
      offer.entity.status === 'active' &&
      (!offer.expiresAt || offer.expiresAt > now)
    const verified = available && !!offer.lastVerifiedAt && offer.lastVerifiedAt.getTime() >= checkedSince
    result[`offer:${offer.id}`] = {
      id: `offer:${offer.id}`,
      kind: 'offer',
      title: offer.entity.title,
      image: metadataImage(offer.metadata),
      category: offer.entity.category,
      available,
      verified,
      priceFrom: typeof offer.priceAmount === 'number' && offer.priceAmount > 0 ? offer.priceAmount : null,
      currency: offer.currency || 'SGD',
      priceText: offer.priceText,
      href: null,
      offerId: offer.id,
      partnerUrl: verified && isApprovedPartnerUrl(offer.baseUrl) ? offer.baseUrl : null,
      provider: offer.provider,
      checkedAt: (offer.lastVerifiedAt ?? offer.updatedAt).toISOString(),
      location: offer.entity.location
    }
  }

  for (const id of unique) {
    if (!result[id]) {
      result[id] = {
        id,
        kind: id.startsWith('sg:') ? 'attraction' : 'offer',
        title: 'No longer listed',
        image: null,
        category: null,
        available: false,
        verified: false,
        priceFrom: null,
        currency: 'SGD',
        priceText: null,
        href: null,
        offerId: null,
        provider: null,
        checkedAt: null,
        location: null
      }
    }
  }

  return result
}
