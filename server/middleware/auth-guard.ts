import { defineEventHandler, getRequestURL } from 'h3'
import { requireAdmin } from '~/server/utils/session'

// Server-side gate for admin APIs. Page middleware (middleware/admin.ts) only hides UI.
// /api/users/[id] does its own admin-or-self check in the handler.
export default defineEventHandler(async (event) => {
  const path = decodeURIComponent(getRequestURL(event).pathname)
    .toLowerCase()
    .replace(/\/{2,}/g, '/')
    .replace(/\/+$/, '')

  if (path === '/api/admin' || path.startsWith('/api/admin/') || path === '/api/users') {
    await requireAdmin(event)
  }
})
