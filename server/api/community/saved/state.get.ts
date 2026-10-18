import { defineEventHandler, getQuery, setHeader } from 'h3'
import { getSessionUser } from '~/server/utils/session'
import { enforceRateLimit } from '~/server/utils/activity-limits'
import { savedState } from '~/server/services/community/social'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Which of the given trip ids the visitor has saved. Signed-out visitors get an empty list.
// Fetched by the browser after the page loads, so cached HTML never contains viewer state.
export default defineEventHandler(async (event) => {
  enforceRateLimit(event, 'community-saved', 120, 60 * 1000)
  setHeader(event, 'cache-control', 'private, no-store')
  const user = await getSessionUser(event).catch(() => null)
  const raw = getQuery(event).ids
  const ids = (typeof raw === 'string' ? raw.split(',') : []).filter((id) => UUID.test(id))
  return { success: true, data: user ? await savedState(user.id, ids) : [] }
})
