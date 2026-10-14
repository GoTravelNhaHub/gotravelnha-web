import { defineEventHandler, readBody, createError } from 'h3'
import { enforceRateLimit } from '~/server/utils/activity-limits'
import { AgentTurnSchema, runAgentTurn } from '~/server/services/planner-agent'

// A chat turn is a short model call. The itinerary itself is still built and
// rate limited by /api/planner/itinerary.
export default defineEventHandler(async (event) => {
  enforceRateLimit(event, 'planner-chat', 30, 10 * 60 * 1000)

  const parsed = AgentTurnSchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({ statusCode: 400, message: 'Please check your message and try again.' })
  }

  return { success: true, ...(await runAgentTurn(parsed.data)) }
})
