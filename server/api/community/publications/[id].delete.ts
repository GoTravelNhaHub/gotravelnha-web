import { defineEventHandler, getRouterParam } from 'h3'
import { requireUser } from '~/server/utils/session'
import { deletePublication } from '~/server/services/community/trips'

// Take your trip off the community. Your private trip stays in My trips.
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  await deletePublication(user, getRouterParam(event, 'id') || '')
  return { success: true }
})
