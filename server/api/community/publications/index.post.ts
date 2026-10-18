import { createError, defineEventHandler, readBody } from 'h3'
import { requireUser } from '~/server/utils/session'
import { enforceRateLimit } from '~/server/utils/activity-limits'
import { PublishInputSchema, publishTrip } from '~/server/services/community/trips'

// Publish one of your trips, or republish it after editing the private trip
export default defineEventHandler(async (event) => {
  enforceRateLimit(event, 'community-publish', 20, 60 * 60 * 1000)
  const user = await requireUser(event)
  const parsed = PublishInputSchema.safeParse(await readBody(event))
  if (!parsed.success) {
    const publicNotConfirmed = parsed.error.issues.some((issue) => issue.path[0] === 'confirmPublic')
    throw createError({
      statusCode: 400,
      message: publicNotConfirmed ? 'Confirm that the trip can be public.' : 'Check the title, description and tips.'
    })
  }
  return { success: true, data: await publishTrip(user, parsed.data) }
})
