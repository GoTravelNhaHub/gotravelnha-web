import { createError, defineEventHandler, getRouterParam, setHeader } from 'h3'
import { requireUser } from '~/server/utils/session'
import { enforceRateLimit } from '~/server/utils/activity-limits'
import { unfollowTraveler } from '~/server/services/community/social'

// Stop following a traveler. Idempotent.
export default defineEventHandler(async (event) => {
  enforceRateLimit(event, 'community-follow', 60, 60 * 1000)
  setHeader(event, 'cache-control', 'private, no-store')
  const user = await requireUser(event)
  const handle = (getRouterParam(event, 'handle') || '').toLowerCase()
  if (!/^[a-z0-9_]{3,30}$/.test(handle)) throw createError({ statusCode: 404, message: 'This traveler was not found.' })
  return { success: true, data: await unfollowTraveler(user.id, handle) }
})
