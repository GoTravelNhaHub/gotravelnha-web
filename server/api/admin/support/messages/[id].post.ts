import { defineEventHandler, getRouterParam, readBody, createError } from 'h3'
import prisma from '~/server/utils/prisma'

// Mark a contact message handled, or reopen it
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const action = (await readBody(event))?.action
  if (!id || (action !== 'handled' && action !== 'reopen')) {
    throw createError({ statusCode: 400, message: 'Unknown action.' })
  }
  const result = await prisma.contactMessage.updateMany({
    where: { id },
    data: { handledAt: action === 'handled' ? new Date() : null }
  })
  if (result.count === 0) {
    throw createError({ statusCode: 404, message: 'Message not found.' })
  }
  return { success: true }
})
