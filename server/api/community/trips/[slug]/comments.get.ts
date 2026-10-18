import { createError, defineEventHandler, getQuery, getRouterParam, setHeader } from 'h3'
import { getSessionUser } from '~/server/utils/session'
import { enforceRateLimit } from '~/server/utils/activity-limits'
import { listComments } from '~/server/services/community/comments'

// Comments on a public or unlisted trip, newest first. Marks the viewer's own comments, so never cached.
export default defineEventHandler(async (event) => {
  enforceRateLimit(event, 'community-comments-read', 120, 60 * 1000)
  setHeader(event, 'cache-control', 'private, no-store')
  const slug = getRouterParam(event, 'slug') || ''
  if (!/^[a-z0-9-]{3,80}$/.test(slug)) throw createError({ statusCode: 404, message: 'This trip was not found.' })
  const viewer = await getSessionUser(event).catch(() => null)
  const cursor = getQuery(event).cursor
  return { success: true, ...(await listComments(slug, viewer?.id ?? null, typeof cursor === 'string' ? cursor : undefined)) }
})
