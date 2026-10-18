import { createError, defineEventHandler, readBody, setHeader } from 'h3'
import { requireUser } from '~/server/utils/session'
import { enforceRateLimit } from '~/server/utils/activity-limits'
import { ReportInputSchema, reportContent } from '~/server/services/community/moderation'

// Report a trip, comment or profile to the moderators
export default defineEventHandler(async (event) => {
  enforceRateLimit(event, 'community-report', 10, 60 * 1000)
  setHeader(event, 'cache-control', 'private, no-store')
  const user = await requireUser(event)
  const parsed = ReportInputSchema.safeParse(await readBody(event))
  if (!parsed.success) throw createError({ statusCode: 400, message: 'Choose a reason.' })
  await reportContent(user.id, parsed.data)
  return { success: true }
})
