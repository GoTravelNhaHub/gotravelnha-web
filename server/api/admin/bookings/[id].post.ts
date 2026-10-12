import { defineEventHandler, readBody, getRouterParam, createError } from 'h3'
import prisma from '~/server/utils/prisma'
import { fulfillBookingWithSupplier } from '~/server/services/attractionsg-fulfillment'

// Admin actions on a paid booking:
// - retry-supplier: resubmit a QUEUED/FAILED booking to the supplier webhook
// - mark-fulfilled: record that the ticket was issued (e.g. ordered by hand in the reseller portal)
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const action = body?.action

  if (!id) {
    throw createError({ statusCode: 400, message: 'Booking id is required.' })
  }

  if (action === 'retry-supplier') {
    const booking = await fulfillBookingWithSupplier(id, useRuntimeConfig())
    if (!booking) {
      throw createError({
        statusCode: 409,
        message: 'Booking must be PAID with supplier status QUEUED, FAILED or empty to retry.'
      })
    }
    return { success: true, data: booking }
  }

  if (action === 'mark-fulfilled') {
    const supplierOrderId =
      typeof body?.supplierOrderId === 'string' && body.supplierOrderId.trim()
        ? body.supplierOrderId.trim()
        : undefined

    const result = await prisma.attractionsgBooking.updateMany({
      where: { id, status: 'PAID' },
      data: { supplierStatus: 'CONFIRMED', ...(supplierOrderId ? { supplierOrderId } : {}) }
    })
    if (result.count === 0) {
      throw createError({ statusCode: 409, message: 'Only PAID bookings can be marked fulfilled.' })
    }
    return { success: true }
  }

  throw createError({ statusCode: 400, message: 'Unknown action.' })
})
