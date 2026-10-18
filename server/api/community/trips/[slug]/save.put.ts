import { createError, defineEventHandler, getRouterParam, setHeader } from 'h3'
import { requireUser } from '~/server/utils/session'
import { enforceRateLimit } from '~/server/utils/activity-limits'
import { saveTrip } from '~/server/services/community/social'

// Save a community trip. Idempotent: saving twice keeps one save.
export default defineEventHandler(async (event) => {
  enforceRateLimit(event, 'community-save', 60, 60 * 1000)
  setHeader(event, 'cache-control', 'private, no-store')
  const user = await requireUser(event)
  const slug = getRouterParam(event, 'slug') || ''
  if (!/^[a-z0-9-]{3,80}$/.test(slug)) throw createError({ statusCode: 404, message: 'This trip was not found.' })
  return { success: true, data: await saveTrip(user.id, slug) }
})
