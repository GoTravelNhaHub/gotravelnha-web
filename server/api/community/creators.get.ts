import { defineEventHandler, setHeader } from 'h3'
import { enforceRateLimit } from '~/server/utils/activity-limits'
import { topCreators } from '~/server/services/community/trips'

// Creators with the most followers and public trips, for the /community sidebar
export default defineEventHandler(async (event) => {
  enforceRateLimit(event, 'community-list', 120, 60 * 1000)
  setHeader(event, 'cache-control', 'public, s-maxage=300, stale-while-revalidate=600')
  return { success: true, data: await topCreators() }
})
