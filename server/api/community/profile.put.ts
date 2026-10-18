import { createError, defineEventHandler, readBody } from 'h3'
import { requireUser } from '~/server/utils/session'
import { enforceRateLimit } from '~/server/utils/activity-limits'
import { ProfileInputSchema, saveOwnProfile } from '~/server/services/community/profile'

export default defineEventHandler(async (event) => {
  enforceRateLimit(event, 'community-profile', 20, 60 * 60 * 1000)
  const user = await requireUser(event)
  const parsed = ProfileInputSchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({ statusCode: 400, message: 'Check your handle and display name.' })
  }
  return { success: true, data: await saveOwnProfile(user.id, parsed.data) }
})
