import { defineEventHandler, getQuery, setHeader } from 'h3'
import { requireUser } from '~/server/utils/session'
import { enforceRateLimit } from '~/server/utils/activity-limits'
import { listSaved } from '~/server/services/community/social'

// The signed-in user's saved trips, newest first. Cursor: the last save's timestamp.
export default defineEventHandler(async (event) => {
  enforceRateLimit(event, 'community-saved', 60, 60 * 1000)
  setHeader(event, 'cache-control', 'private, no-store')
  const user = await requireUser(event)
  const cursor = getQuery(event).cursor
  return { success: true, ...(await listSaved(user.id, typeof cursor === 'string' ? cursor : undefined)) }
})
