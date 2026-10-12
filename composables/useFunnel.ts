import { getVisitorSessionId } from '~/utils/visitor-session'

const onceKeys = new Set<string>()

export type FunnelData = Record<string, string | number | boolean | null>

/**
 * One row in the existing activity log. A click that already writes
 * AffiliateClickEvent should not also call this.
 */
export const useFunnel = () => {
  const track = (action: string, data: FunnelData = {}, once = false) => {
    if (typeof window === 'undefined') return
    const key = `${action}:${JSON.stringify(data)}`
    if (once && onceKeys.has(key)) return
    if (once) onceKeys.add(key)
    const width = window.innerWidth
    const device = width < 768 ? 'mobile' : width < 1024 ? 'tablet' : 'desktop'
    void $fetch('/api/track-activity', {
      method: 'POST',
      body: {
        sessionId: getVisitorSessionId(),
        timestamp: new Date().toISOString(),
        page: window.location.pathname,
        action,
        data: { ...data, device }
      }
    }).catch(() => {})
  }

  return { track }
}
