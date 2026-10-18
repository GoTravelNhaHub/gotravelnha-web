import { createError, defineEventHandler, readBody } from 'h3'
import * as z from 'zod/v4'
import { requireUser } from '~/server/utils/session'
import { enforceRateLimit } from '~/server/utils/activity-limits'
import { previewPublication } from '~/server/services/community/trips'

const PreviewSchema = z.object({
  tripId: z.string().uuid(),
  alsoReplace: z.array(z.string().trim().max(40)).max(10).default([])
})

// What publishing one of your trips would make public. Saves nothing.
export default defineEventHandler(async (event) => {
  enforceRateLimit(event, 'community-preview', 60, 10 * 60 * 1000)
  const user = await requireUser(event)
  const parsed = PreviewSchema.safeParse(await readBody(event))
  if (!parsed.success) throw createError({ statusCode: 400, message: 'Trip not found.' })
  return { success: true, ...(await previewPublication(user, parsed.data.tripId, parsed.data.alsoReplace)) }
})
