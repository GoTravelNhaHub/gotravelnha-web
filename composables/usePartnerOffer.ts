import { useRoute } from 'vue-router'
import type { LiveActivity } from '~/types/trip'
import { appendKlookAffiliateId, appendTripAffiliateIds, openTrackedOutbound } from '~/utils/affiliate-links'
import { isApprovedPartnerUrl } from '~/utils/partner-url'
import { getVisitorSessionId } from '~/utils/visitor-session'

/** Opens a partner offer through /api/affiliate/click so the click is tracked. */
export const usePartnerOffer = (placementKey: string) => {
  const route = useRoute()
  const config = useRuntimeConfig().public
  const { t } = useI18n()

  const fallbackFor = (activity: LiveActivity) => {
    const url = activity.partnerUrl
    if (!url || !isApprovedPartnerUrl(url)) return '/explore'
    const provider = (activity.provider || '').toLowerCase()
    if (provider === 'klook') return appendKlookAffiliateId(url, String(config.KLOOK_AD_ID || ''))
    if (provider === 'trip' || provider === 'trip.com') {
      return appendTripAffiliateIds(url, String(config.TRIP_ALLIANCE_ID || ''), String(config.TRIP_SID || ''))
    }
    return url
  }

  const openOffer = (activity: LiveActivity) => {
    if (!activity.verified || !activity.offerId) return
    const sessionId = getVisitorSessionId()

    openTrackedOutbound(async () => {
      const response: any = await $api('/api/affiliate/click', {
        method: 'POST',
        body: {
          offerId: activity.offerId,
          placementKey,
          pagePath: route.path,
          sessionId,
          metadata: {
            funnel: placementKey === 'trip_planner' ? 'ai_offer_clicked' : 'affiliate_outbound_clicked',
            provider: activity.provider
          }
        }
      })
      return response?.outboundUrl
    }, fallbackFor(activity))
  }

  const priceLabel = (activity: LiveActivity) =>
    activity.priceFrom
      ? t('planner.offer.from', { currency: activity.currency || '', price: activity.priceFrom.toFixed(2) })
      : activity.priceText || t('planner.offer.seePartner')

  return { openOffer, priceLabel }
}
