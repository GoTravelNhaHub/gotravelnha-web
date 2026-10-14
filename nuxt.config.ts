// https://nuxt.com/docs/api/configuration/nuxt-config
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
    nitro: {
      externals: {
        external: ['playwright']
      },
      vercel: {
        // The trip planner's model call can take up to a minute. Applies to the whole
        // server function; Vercel caps it at the plan's maximum.
        functions: { maxDuration: 120 }
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
            { name: 'description', content: 'Search flights and hotels, then continue on Trip.com or Klook. Plan a family trip with the AI Travel Agent. Singapore attraction tickets are sold here only when a current price is listed.' },
            { name: 'keywords', content: 'travel deals, compare travel prices, trip.com deals, klook deals, vietnam travel, singapore attractions, hotel bookings, flight bookings, travel comparison' },
            { name: 'author', content: 'GoTravelNha' },
            { name: 'robots', content: 'index, follow', key: 'robots' },
            { name: 'language', content: 'English' },
            { name: 'revisit-after', content: '7 days' },
    
            // Social: Open Graph (Facebook, WhatsApp, Zalo, Telegram, LinkedIn — use raster, not SVG)
            { property: 'og:title', content: 'GoTravelNha - Search trips, then book with the partner' },
            { property: 'og:description', content: 'Search flights and hotels, then continue on Trip.com or Klook. Singapore attraction tickets are sold here only when a current price is listed.' },
            { property: 'og:image', content: 'https://storage.googleapis.com/travella_assets_images/app_icon.png', key: 'og-image' },
            { property: 'og:image:secure_url', content: 'https://storage.googleapis.com/travella_assets_images/app_icon.png', key: 'og-image-secure' },
            { property: 'og:image:type', content: 'image/png', key: 'og-image-type' },
            { property: 'og:image:alt', content: 'GoTravelNha travel deals', key: 'og-image-alt' },
            { property: 'og:type', content: 'website' },
            { property: 'og:site_name', content: 'GoTravelNha' },
            { property: 'og:locale', content: 'en_US' },
    
            // Social: Twitter / X
            { name: 'twitter:card', content: 'summary_large_image' },
            { name: 'twitter:title', content: 'GoTravelNha - Search trips, then book with the partner' },
            { name: 'twitter:description', content: 'Search flights and hotels, then continue on Trip.com or Klook.' },
            { name: 'twitter:image', content: 'https://storage.googleapis.com/travella_assets_images/app_icon.png', key: 'twitter-image' },
            { name: 'twitter:site', content: '@GoTravelNha' }
          ],
          link: [
            { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
            { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
            { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Source+Sans+3:wght@400;600;700&family=Source+Serif+4:opsz,wght@8..60,560;8..60,650&display=swap' },
            { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
            { rel: 'icon', type: 'image/png', href: '/favicon.svg' },
            { rel: 'apple-touch-icon', href: '/apple-touch-icon.svg' }
          ],
          script: [
            {
              type: 'application/ld+json',
              children: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'Organization',
                name: 'GoTravelNha',
                url: 'https://www.gotravelnha.com',
                logo: 'https://www.gotravelnha.com/favicon.svg',
                description: 'Search flights and hotels on Trip.com and Klook, and plan a family trip. Singapore attraction tickets are sold here only when a current price is listed.',
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
      '/privacy': { prerender: true },
      '/terms': { prerender: true },
      '/refund-policy': { prerender: true },
      '/help': { prerender: true },
      '/admin/**': { headers: { 'x-robots-tag': 'noindex, nofollow' } },
      '/user/**': { headers: { 'x-robots-tag': 'noindex, nofollow' } },
      '/login': { headers: { 'x-robots-tag': 'noindex, nofollow' } },
      '/register': { headers: { 'x-robots-tag': 'noindex, nofollow' } },
      '/forgot-password': { headers: { 'x-robots-tag': 'noindex, nofollow' } },
      '/reset-password': { headers: { 'x-robots-tag': 'noindex, nofollow' } },
      '/bookings/**': { headers: { 'x-robots-tag': 'noindex, nofollow' } },
      '/trips/**': { headers: { 'x-robots-tag': 'noindex, nofollow' } }
    },
    // Cached HTML only in production builds. In dev it outlives code edits, so a refresh
    // serves old markup that the new client code then hydrates into a broken page.
    $production: {
      routeRules: {
        '/explore': { swr: 3600 },
        '/explore/**': { swr: 3600 },
        '/attractionsg': { swr: 3600 },
        '/attractionsg/**': { swr: 1800 },
        '/destinations': { swr: 3600 },
        '/destinations/**': { swr: 3600 },
        '/klook': { swr: 3600 },
        '/compare': { swr: 600 }
      }
    },
    runtimeConfig: {
      SMTP_HOST: process.env.SMTP_HOST,
      SMTP_PORT: process.env.SMTP_PORT,
      SMTP_USER: process.env.SMTP_USER,
      SMTP_PASS: process.env.SMTP_PASS,
      ATTRACTIONSG_EMAIL: process.env.ATTRACTIONSG_EMAIL,
      ATTRACTIONSG_PASSWORD: process.env.ATTRACTIONSG_PASSWORD,
      ATTRACTIONSG_BACKGROUND_SYNC: process.env.ATTRACTIONSG_BACKGROUND_SYNC,
      ATTRACTIONSG_SYNC_INTERVAL: process.env.ATTRACTIONSG_SYNC_INTERVAL,
      ATTRACTIONSG_CRAWLER_WEBHOOK: process.env.ATTRACTIONSG_CRAWLER_WEBHOOK,
      ATTRACTIONSG_CRAWLER_WEBHOOK_SECRET: process.env.ATTRACTIONSG_CRAWLER_WEBHOOK_SECRET,
      ATTRACTIONSG_CRAWL_ENABLED: process.env.ATTRACTIONSG_CRAWL_ENABLED,
             ATTRACTIONSG_SUPPLIER_WEBHOOK: process.env.ATTRACTIONSG_SUPPLIER_WEBHOOK,
             ATTRACTIONSG_SUPPLIER_WEBHOOK_SECRET: process.env.ATTRACTIONSG_SUPPLIER_WEBHOOK_SECRET,
             ATTRACTIONSG_SUPPLIER_AUTOMATION_ENABLED: process.env.ATTRACTIONSG_SUPPLIER_AUTOMATION_ENABLED,
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
      /** Seals the login session cookie. At least 32 random characters. */
      SESSION_PASSWORD: process.env.SESSION_PASSWORD,
      SELF_BOOKING_NOTIFY_EMAIL: process.env.SELF_BOOKING_NOTIFY_EMAIL || process.env.SMTP_USER,
      /** Shared secret partners put in the conversion postback URL. Postbacks are off when unset. */
      AFFILIATE_POSTBACK_SECRET: process.env.AFFILIATE_POSTBACK_SECRET,
      public: {
        exchangeApiKey: process.env.EXCHANGE_API_KEY,
        apiBase: process.env.NUXT_PUBLIC_API_BASE,
        auth0Domain: process.env.AUTH0_DOMAIN,
        auth0ClientId: process.env.AUTH0_CLIENT_ID,
        auth0RedirectUri: process.env.AUTH0_REDIRECT_URI,
        TRIP_ALLIANCE_ID: process.env.TRIP_ALLIANCE_ID || '3883416',
        TRIP_SID: process.env.TRIP_SID || '22874365',
        TRIP_BASE_URL: process.env.TRIP_BASE_URL || 'https://www.trip.com',
        KLOOK_AD_ID: process.env.KLOOK_AD_ID || '1041352',
        KLOOK_SEARCH_WIDGET_ID: process.env.KLOOK_SEARCH_WIDGET_ID || '89020',
        /** Full Klook affiliate redirect URLs for hub pages (`/explore/flights`, `/explore/hotels`, `/explore/attractions`) */
        KLOOK_AFFILIATE_FLIGHT_REDIRECT_URL: process.env.KLOOK_AFFILIATE_FLIGHT_REDIRECT_URL,
        KLOOK_AFFILIATE_HOTEL_REDIRECT_URL: process.env.KLOOK_AFFILIATE_HOTEL_REDIRECT_URL,
        KLOOK_AFFILIATE_ATTRACTION_REDIRECT_URL: process.env.KLOOK_AFFILIATE_ATTRACTION_REDIRECT_URL,
        STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
             siteUrl: process.env.NUXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://www.gotravelnha.com',
             /** Customer support address shown on contact, help and booking pages. Hidden when unset. */
             supportEmail: process.env.NUXT_PUBLIC_SUPPORT_EMAIL || '',
             enableBestDealsNav: process.env.NUXT_PUBLIC_ENABLE_BEST_DEALS_NAV ?? 'true',
             enableCompareNav: process.env.NUXT_PUBLIC_ENABLE_COMPARE_NAV ?? 'true',
             stripeFeePercent: process.env.NUXT_PUBLIC_STRIPE_FEE_PERCENT || '0.034',
             stripeFeeFixed: process.env.NUXT_PUBLIC_STRIPE_FEE_FIXED || '0.5'
      }
    }  
})
  