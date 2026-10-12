import { defineEventHandler } from 'h3'
import { requireUser } from '~/server/utils/session'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  return { success: true, user, role: user.role }
})
