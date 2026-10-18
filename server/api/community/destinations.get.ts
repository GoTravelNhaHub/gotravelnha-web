import { defineEventHandler, setHeader } from 'h3'
import { enforceRateLimit } from '~/server/utils/activity-limits'
import { popularDestinations } from '~/server/services/community/trips'

// Destinations with the most public community trips
export default defineEventHandler(async (event) => {
  enforceRateLimit(event, 'community-list', 120, 60 * 1000)
  setHeader(event, 'cache-control', 'public, s-maxage=300, stale-while-revalidate=600')
  return { success: true, data: await popularDestinations() }
})
