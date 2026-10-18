import { createError, defineEventHandler, getRouterParam, setHeader } from 'h3'
import { requireUser } from '~/server/utils/session'
import { enforceRateLimit } from '~/server/utils/activity-limits'
import { followTraveler } from '~/server/services/community/social'

// Follow a traveler. Idempotent; you cannot follow yourself.
export default defineEventHandler(async (event) => {
  enforceRateLimit(event, 'community-follow', 60, 60 * 1000)
  setHeader(event, 'cache-control', 'private, no-store')
  const user = await requireUser(event)
  const handle = (getRouterParam(event, 'handle') || '').toLowerCase()
  if (!/^[a-z0-9_]{3,30}$/.test(handle)) throw createError({ statusCode: 404, message: 'This traveler was not found.' })
  return { success: true, data: await followTraveler(user.id, handle) }
})
