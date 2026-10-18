import { defineEventHandler, getQuery, setHeader } from 'h3'
import { enforceRateLimit } from '~/server/utils/activity-limits'
import { listPublicTrips } from '~/server/services/community/trips'
import { parseCommunityFilters } from '~/utils/community-filters'

// Discovery list for /community and the home page. Public trips only, so it can be cached briefly.
export default defineEventHandler(async (event) => {
  enforceRateLimit(event, 'community-list', 120, 60 * 1000)
  const query = getQuery(event)
  const limit = Number(query.limit)
  const result = await listPublicTrips(parseCommunityFilters(query), {
    cursor: typeof query.cursor === 'string' ? query.cursor : undefined,
    limit: Number.isFinite(limit) ? limit : undefined
  })
  setHeader(event, 'cache-control', 'public, s-maxage=60, stale-while-revalidate=300')
  return { success: true, ...result }
})
