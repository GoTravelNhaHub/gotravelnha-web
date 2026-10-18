import { defineEventHandler, getQuery, setHeader } from 'h3'
import { listReportQueue } from '~/server/services/community/moderation'

// Moderation queue. Admin only (server/middleware/auth-guard.ts guards /api/admin/**).
export default defineEventHandler(async (event) => {
  setHeader(event, 'cache-control', 'private, no-store')
  const status = getQuery(event).status
  const value = status === 'ACTIONED' || status === 'DISMISSED' ? status : 'OPEN'
  return { success: true, data: await listReportQueue(value) }
})
