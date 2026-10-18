import { createError, defineEventHandler, getRouterParam, setHeader } from 'h3'
import { getSessionUser } from '~/server/utils/session'
import { enforceRateLimit } from '~/server/utils/activity-limits'
import { getTripForViewer } from '~/server/services/community/trips'
import { resolveActivities } from '~/server/services/trip-catalogue'
import type { PublishedItinerary } from '~/types/community'

const SLUG = /^[a-z0-9-]{3,80}$/

const activityIds = (itinerary: PublishedItinerary) =>
  itinerary.days.flatMap((day) => day.items.map((item) => item.activityId)).filter((id): id is string => !!id)

// A published trip with live prices for its activities. Answers depend on who asks
// (authors see their private trips), so responses are never cached.
export default defineEventHandler(async (event) => {
  enforceRateLimit(event, 'community-trip', 120, 60 * 1000)
  setHeader(event, 'cache-control', 'private, no-store')

  const slug = getRouterParam(event, 'slug') || ''
  if (!SLUG.test(slug)) throw createError({ statusCode: 404, message: 'This trip was not found.' })

  const viewer = await getSessionUser(event).catch(() => null)
  const { view, viewerIsAuthor, sourceTripId } = await getTripForViewer(slug, viewer?.id ?? null)
  return {
    success: true,
    data: view,
    viewerIsAuthor,
    sourceTripId,
    activities: await resolveActivities(activityIds(view.itinerary))
  }
})
