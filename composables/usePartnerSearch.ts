import { useRoute } from 'vue-router'
import { appendKlookAffiliateId, appendTripAffiliateIds, openTrackedOutbound } from '~/utils/affiliate-links'
import { getVisitorSessionId } from '~/utils/visitor-session'

export type PartnerSearchType = 'activity' | 'hotel'

/**
 * Opens a Trip.com or Klook search through /api/affiliate/click, so the click is recorded and the
 * outbound URL carries our affiliate ids. Search links have no price: the partner shows it.
 */
export const usePartnerSearch = (placement: string) => {
  const route = useRoute()
  const config = useRuntimeConfig().public
  const { track } = useFunnel()

  const openSearch = (
    provider: 'klook' | 'trip',
    url: string,
    searchType: PartnerSearchType,
    metadata: Record<string, string | number | null> = {}
  ) => {
    track('travel_search_submitted', { provider, placement, searchType, ...metadata })
    const fallback =
      provider === 'klook'
        ? appendKlookAffiliateId(url, String(config.KLOOK_AD_ID || ''))
        : appendTripAffiliateIds(url, String(config.TRIP_ALLIANCE_ID || ''), String(config.TRIP_SID || ''))
    openTrackedOutbound(async () => {
      const response = await $api<{ outboundUrl?: string }>('/api/affiliate/click', {
        method: 'POST',
        body: {
          provider,
          baseUrl: url,
          placementKey: placement,
          pagePath: route.path,
          sessionId: getVisitorSessionId(),
          metadata: { ...metadata, searchType, funnel: 'affiliate_outbound_clicked' }
        }
      })
      return response?.outboundUrl
    }, fallback)
  }

  return { openSearch }
}
