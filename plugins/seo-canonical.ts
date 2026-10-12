import { canonicalSiteOrigin } from '~/utils/site-origin'

export default defineNuxtPlugin(() => {
  const route = useRoute()
  const origin = canonicalSiteOrigin(useRuntimeConfig().public.siteUrl)
  const privatePrefixes = ['/admin', '/user', '/login', '/register', '/forgot-password', '/reset-password', '/bookings', '/trips']

  useHead(() => {
    const path = route.path || '/'
    const canonicalPath = path === '/' ? '/explore' : path.replace(/^\/deals(?=\/|$)/, '/explore')
    const canonical = `${origin}${canonicalPath}`
    const noindex = privatePrefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))

    return {
      link: [{ rel: 'canonical', href: canonical, key: 'canonical' }],
      meta: [
        { property: 'og:url', content: canonical, key: 'og-url' },
        ...(noindex ? [{ name: 'robots', content: 'noindex, nofollow', key: 'robots' }] : [])
      ]
    }
  })
})
