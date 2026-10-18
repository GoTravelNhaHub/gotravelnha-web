import { createError, defineEventHandler, getRouterParam, setHeader } from 'h3'
import { requireUser } from '~/server/utils/session'
import { enforceRateLimit } from '~/server/utils/activity-limits'
import { unsaveTrip } from '~/server/services/community/social'

// Remove a saved trip. Removing one that was not saved is a no-op.
export default defineEventHandler(async (event) => {
  enforceRateLimit(event, 'community-save', 60, 60 * 1000)
  setHeader(event, 'cache-control', 'private, no-store')
  const user = await requireUser(event)
  const slug = getRouterParam(event, 'slug') || ''
  if (!/^[a-z0-9-]{3,80}$/.test(slug)) throw createError({ statusCode: 404, message: 'This trip was not found.' })
  return { success: true, data: await unsaveTrip(user.id, slug) }
})
