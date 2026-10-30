// https://nuxt.com/docs/api/configuration/nuxt-config
const ADMIN_URL = (process.env.NUXT_PUBLIC_ADMIN_URL || 'https://admin.gotravelnha.com').replace(/\/$/, '')

export default defineNuxtConfig({
    compatibilityDate: '2024-11-01',
    devtools: { enabled: true },
    modules: ['@nuxtjs/tailwindcss'],
    css: ['@/assets/css/tailwind.css'],
    typescript: {
      tsConfig: {
        exclude: ['../scripts', '../prisma/migrations']
      }
    },
    app: {
        head: {
          title: 'GoTravelNha - Search trips, then book with the partner',
          htmlAttrs: {
            lang: 'en'
          },
          meta: [
            { charset: 'utf-8' },
            { name: 'viewport', content: 'width=device-width, initial-scale=1' },
            { name: 'description', content: 'Search flights and hotels, then continue on Trip.com or Klook. Plan a family trip with the AI Travel Agent.' },
            { name: 'keywords', content: 'family trip planner, AI travel planner, trip.com deals, klook deals, vietnam travel, singapore travel, hotel bookings, flight bookings' },
            { name: 'author', content: 'GoTravelNha' },
            { name: 'robots', content: 'index, follow', key: 'robots' },
            { name: 'language', content: 'English' },
            { name: 'revisit-after', content: '7 days' },
    
            // Social: Open Graph (Facebook, WhatsApp, Zalo, Telegram, LinkedIn — use raster, not SVG)
            { property: 'og:title', content: 'GoTravelNha - Search trips, then book with the partner' },
            { property: 'og:description', content: 'Search flights and hotels, then continue on Trip.com or Klook.' },
            // 1200x630 branded card in public/ (rendered from the logo; under 300 KB so WhatsApp shows it)
            { property: 'og:image', content: 'https://www.gotravelnha.com/og-image.jpg', key: 'og-image' },
            { property: 'og:image:secure_url', content: 'https://www.gotravelnha.com/og-image.jpg', key: 'og-image-secure' },
            { property: 'og:image:type', content: 'image/jpeg', key: 'og-image-type' },
            { property: 'og:image:width', content: '1200', key: 'og-image-width' },
            { property: 'og:image:height', content: '630', key: 'og-image-height' },
            { property: 'og:image:alt', content: 'GoTravelNha: family holidays, planned around your kids', key: 'og-image-alt' },
            { property: 'og:type', content: 'website' },
            { property: 'og:site_name', content: 'GoTravelNha' },
            { property: 'og:locale', content: 'en_US' },
    
            // Social: Twitter / X
            { name: 'twitter:card', content: 'summary_large_image' },
            { name: 'twitter:title', content: 'GoTravelNha - Search trips, then book with the partner' },
            { name: 'twitter:description', content: 'Search flights and hotels, then continue on Trip.com or Klook.' },
            { name: 'twitter:image', content: 'https://www.gotravelnha.com/og-image.jpg', key: 'twitter-image' },
            { name: 'twitter:site', content: '@GoTravelNha' }
          ],
          link: [
            { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
            { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
            { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap' },
            { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
            { rel: 'icon', type: 'image/png', sizes: '180x180', href: '/apple-touch-icon.png' },
            // iOS ignores SVG touch icons, so this one is a PNG
            { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' }
          ],
          script: [
            {
              type: 'application/ld+json',
              children: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'Organization',
                name: 'GoTravelNha',
                url: 'https://www.gotravelnha.com',
                logo: 'https://www.gotravelnha.com/apple-touch-icon.png',
                description: 'Search flights and hotels on Trip.com and Klook, and plan a family trip.',
                sameAs: [],
                contactPoint: {
                  '@type': 'ContactPoint',
                  contactType: 'Customer Service',
                  availableLanguage: ['English']
                },
                areaServed: 'Worldwide'
              })
            }
          ]
        }
    },
    routeRules: {
      '/': { redirect: { to: '/explore', statusCode: 301 } },
      '/deals': { redirect: { to: '/explore', statusCode: 301 } },
      '/deals/**': { redirect: { to: '/explore/**', statusCode: 301 } },
      // Price comparison had no fresh data once the crawlers stopped; the partner guides on /explore replace it
      '/compare': { redirect: { to: '/explore', statusCode: 301 } },
      // Partner shortcuts hub; the deals search on /explore covers it
      '/search': { redirect: { to: '/explore#deals', statusCode: 301 } },
      '/privacy': { prerender: true },
      '/terms': { prerender: true },
      // AttractionsSG ticket sales and self-checkout bookings were retired on 2026-10-27
      '/attractionsg': { redirect: { to: '/explore', statusCode: 301 } },
      '/attractionsg/**': { redirect: { to: '/explore', statusCode: 301 } },
      '/bookings': { redirect: { to: '/user', statusCode: 302 } },
      '/bookings/**': { redirect: { to: '/user', statusCode: 302 } },
      '/refund-policy': { redirect: { to: '/help', statusCode: 301 } },
      '/help': { prerender: true },
      // Admin moved to its own app (../admin); the backend to api.gotravelnha.com (../backend)
      '/admin': { redirect: { to: `${ADMIN_URL}/`, statusCode: 301 } },
      '/admin/**': { redirect: { to: `${ADMIN_URL}/**`, statusCode: 301 } },
      // Password reset happens on the Keycloak sign-in page (auth.gotravelnha.com)
      '/forgot-password': { redirect: { to: '/login', statusCode: 302 } },
      '/reset-password': { redirect: { to: '/login', statusCode: 302 } },
      '/user/**': { headers: { 'x-robots-tag': 'noindex, nofollow' } },
      '/login': { headers: { 'x-robots-tag': 'noindex, nofollow' } },
      '/register': { headers: { 'x-robots-tag': 'noindex, nofollow' } },
      // Saved trips moved from /trips (too close to /trip, the Trip.com page)
      '/trips': { redirect: { to: '/mytrip', statusCode: 301 } },
      '/trips/**': { redirect: { to: '/mytrip/**', statusCode: 301 } },
      '/mytrip': { headers: { 'x-robots-tag': 'noindex, nofollow' } },
      '/mytrip/**': { headers: { 'x-robots-tag': 'noindex, nofollow' } },
      // Shared trip links are for the people they were sent to, not search results
      '/share/**': { headers: { 'x-robots-tag': 'noindex, nofollow' } }
    },
    // Cached HTML only in production builds. In dev it outlives code edits, so a refresh
    // serves old markup that the new client code then hydrates into a broken page.
    $production: {
      routeRules: {
        '/explore': { swr: 3600 },
        '/explore/**': { swr: 3600 },
        '/destinations': { swr: 3600 },
        '/destinations/**': { swr: 3600 },
        '/klook': { swr: 3600 }
      }
    },
    runtimeConfig: {
      public: {
        exchangeApiKey: process.env.EXCHANGE_API_KEY,
        /** Backend origin (api.gotravelnha.com), no trailing slash. All /api calls and the login/logout redirects go here. */
        apiBase: process.env.NUXT_PUBLIC_API_BASE || 'https://api.gotravelnha.com',
        /** Admin app origin */
        adminUrl: ADMIN_URL,
        TRIP_ALLIANCE_ID: process.env.TRIP_ALLIANCE_ID || '3883416',
        TRIP_SID: process.env.TRIP_SID || '22874365',
        TRIP_BASE_URL: process.env.TRIP_BASE_URL || 'https://www.trip.com',
        KLOOK_AD_ID: process.env.KLOOK_AD_ID || '1041352',
        KLOOK_SEARCH_WIDGET_ID: process.env.KLOOK_SEARCH_WIDGET_ID || '89020',
        /** Ad id of the /klook search widget (its `data-adid`). Not the affiliate `aid` in KLOOK_AD_ID */
        KLOOK_SEARCH_WIDGET_AD_ID: process.env.KLOOK_SEARCH_WIDGET_AD_ID || '1041352',
        /** Full Klook affiliate redirect URLs for hub pages (`/explore/flights`, `/explore/hotels`, `/explore/attractions`) */
        KLOOK_AFFILIATE_FLIGHT_REDIRECT_URL: process.env.KLOOK_AFFILIATE_FLIGHT_REDIRECT_URL,
        KLOOK_AFFILIATE_HOTEL_REDIRECT_URL: process.env.KLOOK_AFFILIATE_HOTEL_REDIRECT_URL,
        KLOOK_AFFILIATE_ATTRACTION_REDIRECT_URL: process.env.KLOOK_AFFILIATE_ATTRACTION_REDIRECT_URL,
             siteUrl: process.env.NUXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://www.gotravelnha.com',
             /** Customer support address shown on contact, help and booking pages. Hidden when unset. */
             supportEmail: process.env.NUXT_PUBLIC_SUPPORT_EMAIL || '',
             enableBestDealsNav: process.env.NUXT_PUBLIC_ENABLE_BEST_DEALS_NAV ?? 'true',
             /** Community pages, APIs and nav item. Off until the community launch. */
             enableCommunity: process.env.NUXT_PUBLIC_ENABLE_COMMUNITY ?? 'false',
             /** Labelled sample trips on /community for design review. Never on in production. */
             communityDemo: process.env.NUXT_PUBLIC_COMMUNITY_DEMO ?? 'false'
      }
    }  
})
  