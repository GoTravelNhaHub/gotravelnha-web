/**
 * Partner attraction links a person has opened and confirmed.
 * Leave this list empty until each URL is checked. Do not add a price,
 * rating, or discount here. Those stay off the page until Phase 2 stores
 * a verified offer.
 */
export interface CuratedPartnerAttraction {
  /** Public slug. Use the GoTravelNha ticket slug when this is the same place. */
  slug: string
  title: string
  destination: string
  category: string
  image?: string
  /**
   * Set when this link is the same attraction as a published ticket.
   * The listing then shows one card, and the ticket page offers this partner.
   */
  directSlug?: string
  provider: 'klook' | 'trip'
  /** https URL on klook.com or trip.com. */
  url: string
}

export const CURATED_PARTNER_ATTRACTIONS: CuratedPartnerAttraction[] = []

export function partnersForDirectSlug(slug: string | null | undefined): CuratedPartnerAttraction[] {
  if (!slug) return []
  const key = slug.trim().toLowerCase()
  return CURATED_PARTNER_ATTRACTIONS.filter((item) => {
    const bound = (item.directSlug || item.slug).trim().toLowerCase()
    return bound === key
  })
}
