import { createError, defineEventHandler, getRouterParam, readBody } from 'h3'
import { requireUser } from '~/server/utils/session'
import { enforceRateLimit } from '~/server/utils/activity-limits'
import { VisibilityInputSchema, setVisibility } from '~/server/services/community/trips'

// Change who can see your published trip
export default defineEventHandler(async (event) => {
  enforceRateLimit(event, 'community-publish', 20, 60 * 60 * 1000)
  const user = await requireUser(event)
  const parsed = VisibilityInputSchema.safeParse(await readBody(event))
  if (!parsed.success) throw createError({ statusCode: 400, message: 'Confirm that the trip can be public.' })
  return { success: true, data: await setVisibility(user, getRouterParam(event, 'id') || '', parsed.data) }
})
