export default defineNuxtPlugin(() => {
  const route = useRoute()
  const requestURL = useRequestURL()
  const origin = `${requestURL.protocol}//${requestURL.host}`
  const privatePrefixes = ['/admin', '/user', '/login', '/register', '/forgot-password', '/reset-password', '/bookings', '/trips']

  useHead(() => {
    const path = route.path || '/'
    const canonicalPath = path === '/' ? '/deals' : path
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
