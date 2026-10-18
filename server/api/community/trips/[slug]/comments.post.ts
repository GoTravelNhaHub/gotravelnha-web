import { createError, defineEventHandler, getRouterParam, readBody, setHeader } from 'h3'
import { requireUser } from '~/server/utils/session'
import { enforceRateLimit } from '~/server/utils/activity-limits'
import { CommentInputSchema, addComment } from '~/server/services/community/comments'

// Post a comment (needs a traveler profile). Limited per IP here and per user in the service.
export default defineEventHandler(async (event) => {
  enforceRateLimit(event, 'community-comment', 10, 60 * 1000)
  setHeader(event, 'cache-control', 'private, no-store')
  const user = await requireUser(event)
  const slug = getRouterParam(event, 'slug') || ''
  if (!/^[a-z0-9-]{3,80}$/.test(slug)) throw createError({ statusCode: 404, message: 'This trip was not found.' })
  const parsed = CommentInputSchema.safeParse(await readBody(event))
  if (!parsed.success) throw createError({ statusCode: 400, message: 'Write a comment first.' })
  return { success: true, data: await addComment(user.id, slug, parsed.data) }
})
