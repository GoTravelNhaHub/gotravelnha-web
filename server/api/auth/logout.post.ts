import { defineEventHandler } from 'h3'
import { clearAuthSession } from '~/server/utils/session'

export default defineEventHandler(async (event) => {
  await clearAuthSession(event)
  return { success: true }
})
