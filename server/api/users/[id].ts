import { defineEventHandler, readBody, getRouterParam, createError } from 'h3'
import * as bcrypt from 'bcrypt'
import * as z from 'zod/v4'
import prisma from '~/server/utils/prisma'
import { requireUser } from '~/server/utils/session'

const USER_SELECT = {
  id: true,
  username: true,
  email: true,
  firstName: true,
  lastName: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true
} as const

const UpdateSchema = z.object({
  // No minimum here so older accounts with short usernames stay editable
  username: z.string().trim().min(1).max(40).optional(),
  email: z.email().max(200).optional(),
  firstName: z.string().trim().max(60).nullable().optional(),
  lastName: z.string().trim().max(60).nullable().optional(),
  role: z.enum(['USER', 'ADMIN']).optional(),
  isActive: z.boolean().optional(),
  // Empty string means "keep the current password"
  password: z.union([z.literal(''), z.string().min(8).max(200)]).optional()
})

/** True when removing this admin's access would leave no active admin. */
const isLastActiveAdmin = async (userId: string) => {
  const others = await prisma.user.count({ where: { role: 'ADMIN', isActive: true, id: { not: userId } } })
  return others === 0
}

// Admins can manage anyone; other users only their own record
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const method = event.node.req.method

  const sessionUser = await requireUser(event)
  const isAdmin = sessionUser.role === 'ADMIN'
  if (!id || (!isAdmin && sessionUser.id !== id)) {
    throw createError({ statusCode: 403, message: 'Not allowed.' })
  }

  if (method === 'GET') {
    const user = await prisma.user.findUnique({ where: { id }, select: USER_SELECT })
    if (!user) {
      throw createError({ statusCode: 404, message: 'User not found' })
    }
    return { success: true, user }
  }

  if (method === 'PUT') {
    const parsed = UpdateSchema.safeParse(await readBody(event))
    if (!parsed.success) {
      throw createError({ statusCode: 400, message: 'Check the details: a username, a valid email, and a password of at least 8 characters if you set one.' })
    }
    const body = parsed.data
    const target = await prisma.user.findUnique({ where: { id }, select: { role: true, isActive: true } })
    if (!target) {
      throw createError({ statusCode: 404, message: 'User not found' })
    }

    // Only admins may change role or active status
    const role = isAdmin ? body.role : undefined
    const isActive = isAdmin ? body.isActive : undefined
    const losesAdmin = target.role === 'ADMIN' && target.isActive && (role === 'USER' || isActive === false)
    if (losesAdmin && id === sessionUser.id) {
      throw createError({ statusCode: 400, message: "You can't remove your own admin access. Ask another admin." })
    }
    if (losesAdmin && (await isLastActiveAdmin(id))) {
      throw createError({ statusCode: 400, message: 'Keep at least one active admin.' })
    }

    try {
      const user = await prisma.user.update({
        where: { id },
        data: {
          username: body.username,
          email: body.email,
          firstName: body.firstName,
          lastName: body.lastName,
          role,
          isActive,
          ...(body.password ? { password: await bcrypt.hash(body.password, 10) } : {})
        },
        select: USER_SELECT
      })
      return { success: true, user }
    } catch (error: any) {
      if (error?.code === 'P2002') {
        throw createError({ statusCode: 409, message: 'That username or email is already used by another account.' })
      }
      throw error
    }
  }

  if (method === 'DELETE') {
    if (!isAdmin) {
      throw createError({ statusCode: 403, message: 'Admin access required.' })
    }
    if (id === sessionUser.id) {
      throw createError({ statusCode: 400, message: "You can't delete your own account here." })
    }
    const target = await prisma.user.findUnique({ where: { id }, select: { role: true, isActive: true } })
    if (!target) {
      throw createError({ statusCode: 404, message: 'User not found' })
    }
    if (target.role === 'ADMIN' && target.isActive && (await isLastActiveAdmin(id))) {
      throw createError({ statusCode: 400, message: 'Keep at least one active admin.' })
    }
    await prisma.user.delete({ where: { id } })
    return { success: true, message: 'User deleted successfully' }
  }

  throw createError({ statusCode: 405, message: 'Method not allowed' })
})
