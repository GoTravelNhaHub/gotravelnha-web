import { getRequestIP, createError, type H3Event } from 'h3'

// Guards for the anonymous analytics endpoints (track-activity, affiliate events).
// The rate limit is per server instance, which stops a single noisy client but is
// not a global cap.

const WINDOW_MS = 60 * 1000
const MAX_PER_WINDOW = 120
const hits = new Map<string, number[]>()

export function enforceActivityRateLimit(event: H3Event) {
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  const now = Date.now()
  const recent = (hits.get(ip) || []).filter((time) => now - time < WINDOW_MS)
  if (recent.length >= MAX_PER_WINDOW) {
    throw createError({ statusCode: 429, message: 'Too many events' })
  }
  recent.push(now)
  hits.set(ip, recent)
  // Keep the map from growing without bound on long-lived instances
  if (hits.size > 10000) hits.clear()
}

export const clipText = (value: unknown, max: number) =>
  typeof value === 'string' && value.trim() ? value.trim().slice(0, max) : null

/** JSON payloads larger than `max` characters are dropped rather than stored. */
export const boundedJson = (value: unknown, max = 4000) => {
  if (value === null || value === undefined || typeof value !== 'object') return null
  try {
    return JSON.stringify(value).length <= max ? value : null
  } catch {
    return null
  }
}

export const cleanSessionId = (value: unknown) =>
  typeof value === 'string' && /^[A-Za-z0-9_.:-]{4,80}$/.test(value.trim()) ? value.trim() : null
