import { createError, useSession, type H3Event, type SessionConfig } from 'h3'
import prisma from '~/server/utils/prisma'

interface AuthSessionData {
  userId?: string
}

const getSessionConfig = (): SessionConfig => {
  const password = useRuntimeConfig().SESSION_PASSWORD
  if (!password || password.length < 32) {
    console.error('SESSION_PASSWORD is missing or shorter than 32 characters.')
    throw createError({ statusCode: 500, message: 'Session is not configured.' })
  }

  return {
    name: 'gotravelnha_session',
    password,
    maxAge: 60 * 60 * 24 * 7, // 7 days
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    }
  }
}

export async function setAuthSession(event: H3Event, userId: string) {
  const session = await useSession<AuthSessionData>(event, getSessionConfig())
  await session.update({ userId })
}

export async function clearAuthSession(event: H3Event) {
  const session = await useSession<AuthSessionData>(event, getSessionConfig())
  await session.clear()
}

/** Signed-in user from the session cookie, re-read from the DB so role and isActive are current. */
export async function getSessionUser(event: H3Event) {
  const session = await useSession<AuthSessionData>(event, getSessionConfig())
  const userId = session.data.userId
  if (!userId) return null

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true
    }
  })

  return user?.isActive ? user : null
}

export async function requireUser(event: H3Event) {
  const user = await getSessionUser(event)
  if (!user) {
    throw createError({ statusCode: 401, message: 'Please sign in.' })
  }
  return user
}

export async function requireAdmin(event: H3Event) {
  const user = await requireUser(event)
  if (user.role !== 'ADMIN') {
    throw createError({ statusCode: 403, message: 'Admin access required.' })
  }
  return user
}
