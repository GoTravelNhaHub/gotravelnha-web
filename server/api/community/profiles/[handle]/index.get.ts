import { createError, defineEventHandler, getRouterParam, setHeader } from 'h3'
import { enforceRateLimit } from '~/server/utils/activity-limits'
import { getTraveler, listTravelerTrips } from '~/server/services/community/travelers'

const HANDLE = /^[a-z0-9_]{3,30}$/

// A public traveler profile with its first page of public trips. No viewer state, so it can be cached briefly.
export default defineEventHandler(async (event) => {
  enforceRateLimit(event, 'community-profile-read', 120, 60 * 1000)
  const handle = (getRouterParam(event, 'handle') || '').toLowerCase()
  if (!HANDLE.test(handle)) throw createError({ statusCode: 404, message: 'This traveler was not found.' })
  const [traveler, trips] = await Promise.all([getTraveler(handle), listTravelerTrips(handle)])
  setHeader(event, 'cache-control', 'public, s-maxage=60, stale-while-revalidate=300')
  return { success: true, data: traveler, trips }
})
