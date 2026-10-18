import { createError, defineEventHandler, getRequestHeader, getRequestHost, getRequestURL, type H3Event } from 'h3'
import { communityEnabled } from '~/utils/feature-flags'

const withAndWithoutWww = (host: string) => (host.startsWith('www.') ? [host, host.slice(4)] : [host, `www.${host}`])

/** This request's host and the configured site host. `nuxt dev` proxies with an internal Host, so dev also allows localhost. */
function allowedHosts(event: H3Event) {
  const hosts = new Set(withAndWithoutWww(getRequestHost(event, { xForwardedHost: true }).toLowerCase()))
  try {
    for (const host of withAndWithoutWww(new URL(String(useRuntimeConfig().public.siteUrl)).host.toLowerCase())) hosts.add(host)
  } catch {
    // siteUrl unset or invalid: the request host alone decides
  }
  return {
    has: (host: string) => hosts.has(host) || (import.meta.dev && /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host))
  }
}

// Community API gate: off unless NUXT_PUBLIC_ENABLE_COMMUNITY is on, and writes only from
// this site. The session cookie is SameSite=Lax; checking Origin (or Sec-Fetch-Site) also
// blocks cross-site requests that Lax lets through.
export default defineEventHandler((event) => {
  const path = getRequestURL(event).pathname.toLowerCase()
  if (path !== '/api/community' && !path.startsWith('/api/community/')) return

  if (!communityEnabled(useRuntimeConfig().public)) {
    throw createError({ statusCode: 404, message: 'Not found.' })
  }

  const method = event.method.toUpperCase()
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') return

  const origin = getRequestHeader(event, 'origin')
  if (origin) {
    let originHost = ''
    try {
      originHost = new URL(origin).host.toLowerCase()
    } catch {
      // Unparseable Origin is treated as foreign
    }
    if (!originHost || !allowedHosts(event).has(originHost)) {
      throw createError({ statusCode: 403, message: 'Request blocked.' })
    }
    return
  }

  // Browsers send Origin on these methods; Sec-Fetch-Site covers the rest
  const site = getRequestHeader(event, 'sec-fetch-site')
  if (site && site !== 'same-origin' && site !== 'none') {
    throw createError({ statusCode: 403, message: 'Request blocked.' })
  }
})
