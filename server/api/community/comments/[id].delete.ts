import { createError, defineEventHandler, getRouterParam, setHeader } from 'h3'
import { requireUser } from '~/server/utils/session'
import { enforceRateLimit } from '~/server/utils/activity-limits'
import { deleteComment } from '~/server/services/community/comments'

// Delete your own comment (admins can delete any)
export default defineEventHandler(async (event) => {
  enforceRateLimit(event, 'community-comment', 20, 60 * 1000)
  setHeader(event, 'cache-control', 'private, no-store')
  const user = await requireUser(event)
  const id = getRouterParam(event, 'id') || ''
  if (!/^[0-9a-f-]{36}$/i.test(id)) throw createError({ statusCode: 404, message: 'This comment was not found.' })
  await deleteComment(user, id)
  return { success: true }
})
