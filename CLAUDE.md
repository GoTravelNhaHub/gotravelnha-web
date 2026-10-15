# web/ — GoTravelNha site

Nuxt `^3.17`, Vue `^3.5`, Tailwind (`@nuxtjs/tailwindcss` only), Nitro server routes, Prisma `^5.19` on PostgreSQL. No Pinia. No component library. Custom `useI18n` (`en` / `vi` / `zh`, localStorage key `gotravelnha_lang`); see "Languages" below.

Work from this directory.

```bash
npm run dev          # NODE_NO_WARNINGS=1 nuxt dev
npm run build        # nuxt build
npm run preview
npx prisma generate  # after schema.prisma changes
npm run crawl:attractionsg   # only when the user asks
```

There is no test runner. Playwright and Puppeteer are scrapers, not a test suite. `postinstall` runs `nuxt prepare`.

Vercel build (`vercel.json`): `npm run vercel-build` → `prisma generate` && `prisma migrate deploy` && `nuxt build`. Region `sin1`.

## Where code goes

| Change | Put it in |
| --- | --- |
| Route | `pages/`. `pages/foo/bar.vue` → `/foo/bar`. Dynamic segments are `[slug].vue`. |
| Page chrome | `layouts/default.vue`, `layouts/admin.vue`, `layouts/auth.vue`. Set with `definePageMeta`. |
| Reusable UI | `components/`. Nuxt auto-imports. Deal landing UI lives in `components/deals/`. |
| Client state / browser logic | `composables/use*.ts`. Auto-imported. Module-level `ref` is the pattern (`useAuthState`). |
| HTTP handler | `server/api/`. Method suffix: `foo.get.ts`, `foo.post.ts`. |
| Shared server logic | `server/services/` or `server/utils/`. Keep handlers thin. |
| Shared client+server helpers | `utils/`. |
| Shared types | `types/`. |
| DB shape | `prisma/schema.prisma`, then a migration. |
| One-off CLI | `scripts/`. Run with `tsx`. |

Admin pages: `layout: 'admin'` and `middleware: 'admin'`. Auth screens: `layout: 'auth'`.

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
- **Auth:** `pages/login.vue`, `register.vue`, `forgot-password.vue`, `reset-password.vue`, `pages/user/`. API: `server/api/auth/`. Session for the UI is `useAuthState` → localStorage `gotravelnha_user`. `composables/useAuth.ts` (Auth0) is barely used; do not route new login through it.
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

`middleware/auth.ts` and `middleware/admin.ts` are client-only (`if (process.server) return`). They gate pages, not APIs. Admin and user API routes are not consistently authenticated. Do not describe them as protected, and do not add a new auth scheme unless the task is to add one.

## Do not

- Edit `.nuxt/`, `.output/`, `node_modules/`, `backups/`.
- Refactor crawlers, Playwright flows, or `server/plugins/attractionsg-sync.ts` as a drive-by. They use credentials, rate limits, and webhook handoff to long-running workers.
- Run `scripts/remove-deprecated-tables.ts` or other destructive scripts unless the user asks.
- Add a second Prisma client, Pinia, or a UI kit.
- Invent blog pages, activity routes (`pages/activities/` is empty), or wire Auth0 into the login flow.
- Treat `docs/` as source of truth when it disagrees with `server/` or `prisma/schema.prisma`.
