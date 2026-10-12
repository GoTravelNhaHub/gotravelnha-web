import { useRoute } from 'vue-router'
import type { LiveActivity } from '~/types/trip'
import { openTrackedOutbound } from '~/utils/affiliate-links'

/** Opens a partner offer through /api/affiliate/click so the click is tracked. */
export const usePartnerOffer = (placementKey: string) => {
  const route = useRoute()

  const openOffer = (activity: LiveActivity) => {
    const sessionId = localStorage.getItem('activity_session_id') || `planner-${Date.now().toString(36)}`
    if (!localStorage.getItem('activity_session_id')) {
      localStorage.setItem('activity_session_id', sessionId)
    }

    openTrackedOutbound(async () => {
      const response: any = await $fetch('/api/affiliate/click', {
        method: 'POST',
        body: {
          offerId: activity.offerId,
          placementKey,
          pagePath: route.path,
          sessionId
        }
      })
      return response?.outboundUrl
    }, '/deals')
  }

  const priceLabel = (activity: LiveActivity) =>
    activity.priceFrom
      ? `From ${activity.currency} ${activity.priceFrom.toFixed(2)} per person`
      : activity.priceText || 'See partner for price'

  return { openOffer, priceLabel }
}
