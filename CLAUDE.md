# web/ — GoTravelNha site

Nuxt `^3.17`, Vue `^3.5`, Tailwind (`@nuxtjs/tailwindcss` only). No Pinia. No component library. Custom `useI18n` (`en` / `vi` / `zh`, localStorage key `gotravelnha_lang`); see "Languages" below.

Work from this directory.

Since 2026-10-27 this is only the public site (www.gotravelnha.com). The backend (every `/api` route, Prisma, crawlers, scripts) is `../backend` (api.gotravelnha.com). The admin pages are `../admin` (admin.gotravelnha.com). Sign-in is Keycloak at auth.gotravelnha.com (`../keycloak`). `/admin/**` here 301s to the admin app.

```bash
npm run dev          # NODE_NO_WARNINGS=1 nuxt dev (run ../backend on :3002 too)
npm run build        # nuxt build
npm run preview
```

There is no test runner. Playwright and Puppeteer are scrapers, not a test suite. `postinstall` runs `nuxt prepare`.

Vercel build (`vercel.json`): `npm run vercel-build` → `nuxt build`. Region `sin1`. Local dev: `NUXT_PUBLIC_API_BASE=http://localhost:3002`.

## Where code goes

| Change | Put it in |
| --- | --- |
| Route | `pages/`. `pages/foo/bar.vue` → `/foo/bar`. Dynamic segments are `[slug].vue`. |
| Page chrome | `layouts/default.vue`, `layouts/auth.vue`. Set with `definePageMeta`. |
| Reusable UI | `components/`. Nuxt auto-imports. Deal landing UI lives in `components/deals/`. |
| Client state / browser logic | `composables/use*.ts`. Auto-imported. Module-level `ref` is the pattern (`useAuthState`). |
| HTTP handler | `../backend/src/<domain>/` (NestJS; see its CLAUDE.md). Call it with `$api('/api/...')` (`composables/useApi.ts`), never `$fetch('/api/...')`. |
| Site-only server routes | `server/routes/` (`robots.txt`, the `sitemap.xml` proxy). |
| Shared client+server helpers | `utils/`. |
| Shared types | `types/`. |
| DB shape | `../backend/prisma/schema.prisma`, then a migration. |

Auth screens: `layout: 'auth'`. The `utils/` and `types/` files the backend imports are copied into `../backend`. Change both copies.

## Data

Prisma singleton: `import prisma from '~/server/utils/prisma'`. Use that import in server code. `libs/prisma.ts` is a duplicate; do not add new callers.

Datasource: `DATABASE_URL` and `directUrl` `DIRECT_URL`.

Models: `User`, `Booking`, `LoyaltyPoint`, `Referral`, `NewsletterSubscriber`, `BlogPost`, `AttractionsgEvent`, `AttractionsgBooking`, `UserActivity`, `AffiliateEntity`, `AffiliateOffer`, `AffiliatePlacement`, `AffiliateClickEvent`, `AffiliateConversionEvent`, `PriceAlert`, `ScraperSource` (pk `url`), `ScraperJob`, `TripScrapedData`, `KlookPromoCode`, `KlookHotelDeal`, `KlookWidget`, `DataComparison`, `DealTemplate`.

`User.role` is `ADMIN` | `USER`. `BlogPost.authorId` is a string, not a relation. Deal landing pages are `DealTemplate` rows plus fallbacks in `server/utils/builtinDealTemplates.ts`. `data/deal-page-templates.ts` is an empty deprecated stub.

## API shape

Success: `{ success: true, ... }`. Validation and auth failures: `throw createError({ statusCode, message })`. Login returns `{ success: true, user, role }` with the password stripped.

```ts
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  // ...
  return { success: true, data }
})
```

## Domain map

- **Deals:** `pages/deals/`, `components/deals/HighConvertingDealTemplate.vue`, `types/deal-template.ts`, `server/api/deal-templates/`, `server/api/admin/deal-templates/`. Read DB first, then `getBuiltinDealTemplate`.
- **Affiliate:** `server/services/affiliate-link.service.ts`, `server/services/affiliate-offer.service.ts`, `server/utils/affiliate-tracking.ts`, `server/api/affiliate/` (`offers`, `click`, `events`, `shortcuts`, `deals`). Client: `utils/affiliate-links.ts`, `AffiliateCard.vue`, `SmartAffiliateLink.vue`, `TripAffiliateLink.vue`. Clicks persist `AffiliateClickEvent` and return a tracked outbound URL.
- **Klook:** `pages/klook/`, `plugins/klook-widget.js`, `composables/useKlookWidgets.ts`, `server/api/klook/`, `server/api/admin/klook-widgets/`.
- **Trip.com:** `pages/trip/`, `useTripDeeplink`, `useTripPromotions`, `useTripAnalytics`, `server/api/trip/`. `pages/admin/scrapers/trip.vue` is a placeholder.
- **AttractionsSG + checkout:** `pages/attractionsg/`, `server/api/attractionsg/`, `server/api/checkout/create.post.ts`, `server/api/stripe/webhook.post.ts`, `server/services/checkout-onboarding.ts`, `server/services/attractionsg-supplier.ts`.
- **Crawlers:** `server/api/attractionsg/crawl.ts` (`runAttractionsgCrawl`), `scripts/run-attractionsg-crawl.ts`, `server/plugins/attractionsg-sync.ts`, `server/api/scraper.ts`, `server/api/scrape-simple.ts`, `pages/admin/scrapers/`. Background sync turns itself off when `VERCEL` or `NETLIFY` is set.
- **Auth:** Keycloak (auth.gotravelnha.com) through the API. `pages/login.vue` and `register.vue` forward to `loginUrl()` → `api.gotravelnha.com/auth/login`. Logout is `clearUser()` → `/auth/logout`. The session is an HttpOnly cookie on `.gotravelnha.com`. `useAuthState` caches the user in localStorage `gotravelnha_user`, and `plugins/auth-sync.client.ts` re-checks `/api/auth/me` on load. Password reset happens on the Keycloak page.
- **Blog:** API only (`server/api/blog/`, `server/api/admin/blog/`). No public blog pages.
- **Search / compare:** `pages/search.vue` and `pages/compare.vue` (both redirected to `/explore`), `server/api/search/global.post.ts`, `server/api/activities/compare.ts`.
- **Analytics:** `useActivityTracker` → `server/api/track-activity.ts` → `UserActivity`.

Feature flag for nav: `NUXT_PUBLIC_ENABLE_BEST_DEALS_NAV` (`runtimeConfig.public`). `/compare` and `/search` 301 to `/explore`; their page files are unreachable.

## Languages

- Strings live in `locales/{en,vi,zh}/<area>.ts`. English is the source; `vi` and `zh` are typed against it, so a missing key fails type checking. Add every new UI string to all three.
- Use `const { t, tm, placeName, localeTag } = useI18n()`. `t('area.key', { name })` for text (`key_one` is used when `count` is 1), `tm<T>()` for lists, `placeName()` for city and country names, `localeTag` for `Intl` dates and numbers.
- One URL per page. The server always renders English (search engines and the `swr` cache see English); `plugins/i18n.client.ts` switches to the saved or browser language after hydration. So text created in `onMounted` must be a key rendered in the template, not a translated string.
- The planner sends `language` to `/api/planner/chat` and `/api/planner/itinerary`; the AI writes replies and plans in that language and keeps `destination` as the English city name.
- Database content (deal templates edited in admin, AttractionsSG events, guide bodies) and server error messages stay English.

## Auth boundary

`middleware/auth.ts` is client-only and only gates pages. The API (`../backend`) enforces auth with `requireUser` / `requireAdmin`, and `/api/admin/**` is admin-only. Do not add a second auth scheme.

## Do not

- Edit `.nuxt/`, `.output/`, `node_modules/`, `backups/`.
- Add server code or database access here. It belongs in `../backend`.
- Add Pinia or a UI kit.
- Invent blog pages or activity routes (`pages/activities/` is empty).
- Treat `docs/` as source of truth when it disagrees with `server/` or `prisma/schema.prisma`.
