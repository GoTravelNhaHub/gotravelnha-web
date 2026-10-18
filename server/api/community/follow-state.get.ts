import { defineEventHandler, getQuery, setHeader } from 'h3'
import { getSessionUser } from '~/server/utils/session'
import { enforceRateLimit } from '~/server/utils/activity-limits'
import { followState } from '~/server/services/community/social'

// Which of the given handles the visitor follows. Signed-out visitors get an empty list.
export default defineEventHandler(async (event) => {
  enforceRateLimit(event, 'community-follow-state', 120, 60 * 1000)
  setHeader(event, 'cache-control', 'private, no-store')
  const user = await getSessionUser(event).catch(() => null)
  const raw = getQuery(event).handles
  const handles = (typeof raw === 'string' ? raw.split(',') : []).map((handle) => handle.toLowerCase()).filter((handle) => /^[a-z0-9_]{3,30}$/.test(handle))
  return { success: true, data: user ? await followState(user.id, handles) : [] }
})
