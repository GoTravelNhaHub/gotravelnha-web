import { createError, defineEventHandler, getRouterParam, readBody, setHeader } from 'h3'
import { requireUser } from '~/server/utils/session'
import { enforceRateLimit } from '~/server/utils/activity-limits'
import { editComment } from '~/server/services/community/comments'

// Edit your own comment
export default defineEventHandler(async (event) => {
  enforceRateLimit(event, 'community-comment', 10, 60 * 1000)
  setHeader(event, 'cache-control', 'private, no-store')
  const user = await requireUser(event)
  const id = getRouterParam(event, 'id') || ''
  const body = (await readBody(event))?.body
  if (!/^[0-9a-f-]{36}$/i.test(id) || typeof body !== 'string') throw createError({ statusCode: 400, message: 'Write a comment first.' })
  await editComment(user.id, id, body)
  return { success: true }
})
