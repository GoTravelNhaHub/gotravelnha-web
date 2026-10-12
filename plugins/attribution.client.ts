// Records where a visitor came from (UTM tags, ad click ids, referrer) in the
// gtn_attr cookie: the first touch is kept for 30 days, the last non-direct touch
// is updated. The server copies it onto clicks and bookings for per-channel reports.

const COOKIE = 'gtn_attr'
const MAX_AGE = 30 * 86400

const readCookie = () => {
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE}=([^;]*)`))
  if (!match) return null
  try {
    return JSON.parse(decodeURIComponent(match[1]))
  } catch {
    return null
  }
}

export default defineNuxtPlugin(() => {
  const params = new URLSearchParams(window.location.search)
  const clip = (value: string | null) => (value ? value.slice(0, 100) : undefined)

  let referrer: string | undefined
  try {
    const ref = document.referrer ? new URL(document.referrer) : null
    // Our own pages and payment redirects are not acquisition sources
    if (ref && ref.hostname !== window.location.hostname && !ref.hostname.endsWith('stripe.com')) {
      referrer = `${ref.protocol}//${ref.hostname}`
    }
  } catch {
    referrer = undefined
  }

  const touch = Object.fromEntries(
    Object.entries({
      source: clip(params.get('utm_source')),
      medium: clip(params.get('utm_medium')),
      campaign: clip(params.get('utm_campaign')),
      term: clip(params.get('utm_term')),
      content: clip(params.get('utm_content')),
      gclid: clip(params.get('gclid')),
      fbclid: clip(params.get('fbclid')),
      referrer
    }).filter(([, value]) => value)
  )

  const existing = readCookie()
  const hasSignal = Object.keys(touch).length > 0
  if (existing && !hasSignal) {
    getVisitorSessionId()
    return
  }

  const stamped = { ...touch, landingPage: window.location.pathname.slice(0, 100), at: new Date().toISOString() }
  const value = { first: existing?.first ?? stamped, last: hasSignal ? stamped : existing?.last }
  document.cookie = `${COOKIE}=${encodeURIComponent(JSON.stringify(value))}; Max-Age=${MAX_AGE}; Path=/; SameSite=Lax${
    window.location.protocol === 'https:' ? '; Secure' : ''
  }`
  getVisitorSessionId()
})
