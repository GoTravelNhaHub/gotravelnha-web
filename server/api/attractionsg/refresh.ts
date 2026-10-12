import { defineEventHandler, createError } from 'h3'
import { requireAdmin } from '~/server/utils/session'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  try {
    // Import the crawl handler directly to avoid HTTP call overhead
    const { default: crawlHandler } = await import('./crawl')
    
    // Trigger crawl in background without blocking
    crawlHandler(event).catch(err => {
      console.error('Background crawl error:', err)
    })

    return {
      success: true,
      message: 'Data refresh initiated in background',
      status: 'processing'
    }

  } catch (error: any) {
    console.error('Refresh error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to initiate refresh'
    })
  }
})
