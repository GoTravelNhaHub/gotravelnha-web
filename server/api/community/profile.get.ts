import { defineEventHandler } from 'h3'
import { requireUser } from '~/server/utils/session'
import { getOwnProfile, suggestFreeHandle } from '~/server/services/community/profile'

// The signed-in user's public profile, or a suggested handle and name to start one
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const profile = await getOwnProfile(user.id)
  return {
    success: true,
    data: profile,
    suggestion: profile ? null : { handle: await suggestFreeHandle(user.firstName), displayName: user.firstName?.trim() || '' }
  }
})
