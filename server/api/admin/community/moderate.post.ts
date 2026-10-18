import { createError, defineEventHandler, readBody, setHeader } from 'h3'
import { requireAdmin } from '~/server/utils/session'
import { ModerationActionSchema, moderate } from '~/server/services/community/moderation'

// Hide, restore or dismiss reports on a trip, comment or profile. Admin only.
export default defineEventHandler(async (event) => {
  setHeader(event, 'cache-control', 'private, no-store')
  // Also guarded by server/middleware/auth-guard.ts; the id is needed for the audit fields
  const admin = await requireAdmin(event)
  const parsed = ModerationActionSchema.safeParse(await readBody(event))
  if (!parsed.success) throw createError({ statusCode: 400, message: 'Unknown moderation action.' })
  return { success: true, data: await moderate(admin.id, parsed.data) }
})
