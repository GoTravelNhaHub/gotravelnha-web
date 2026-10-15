# GoTravelNha web

AI trip planner for family holidays. Visitors describe a trip, get a day-by-day itinerary, save and share it, then book flights, hotels and activities on Trip.com or Klook through tracked affiliate links. Singapore attraction tickets (AttractionsSG) are the only thing sold and paid for on the site, through Stripe.

Live site: https://www.gotravelnha.com (`/` redirects to `/explore`).

## Stack

- Nuxt 3, Vue 3, Tailwind (`@nuxtjs/tailwindcss`)
- Nitro server routes in `server/api/`
- Prisma 5 on PostgreSQL
- Anthropic API for the planner (`server/services/itinerary-generator.ts`, `server/services/planner-agent.ts`)
- Stripe for AttractionsSG checkout
- Deployed on Vercel, region `sin1`

## Getting started

```bash
npm install            # also runs nuxt prepare
cp .env.example .env   # then fill in the values below
npx prisma generate
npm run dev
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` / `npm run preview` | Production build and local preview |
| `npm run typecheck` | `nuxt typecheck` |
| `npm run test:affiliate` | Affiliate handoff tests (`scripts/affiliate-handoff.test.ts`) |
| `npm run vercel-build` | `prisma generate` → `prisma migrate deploy` → `nuxt build` (used by Vercel) |
| `npm run crawl:attractionsg` | One-off AttractionsSG catalogue crawl. Run only when needed. |

There is no general test suite. Playwright and Puppeteer are used by the crawlers, not for tests.

## Environment

Grouped by feature. `.env.example` has a starting set.

| Area | Variables |
| --- | --- |
| Database | `DATABASE_URL`, `DIRECT_URL` |
| Site | `NUXT_PUBLIC_SITE_URL`, `SITE_URL`, `NUXT_PUBLIC_SUPPORT_EMAIL`, `SESSION_PASSWORD` |
| AI planner | `ANTHROPIC_API_KEY` |
| Trip.com | `TRIP_ALLIANCE_ID`, `TRIP_SID`, `TRIP_BASE_URL` |
| Klook | `KLOOK_AD_ID`, `KLOOK_AFFILIATE_ID`, `KLOOK_SEARCH_WIDGET_ID`, `KLOOK_AFFILIATE_{FLIGHT,HOTEL,ATTRACTION}_REDIRECT_URL` |
| Affiliate postbacks | `AFFILIATE_POSTBACK_SECRET` |
| Email | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_SECURE`, `SELF_BOOKING_NOTIFY_EMAIL` |
| Google sign-in | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` |
| Payments | `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `NUXT_PUBLIC_STRIPE_FEE_PERCENT`, `NUXT_PUBLIC_STRIPE_FEE_FIXED` |
| AttractionsSG | `ATTRACTIONSG_EMAIL`, `ATTRACTIONSG_PASSWORD`, `ATTRACTIONSG_SUPPLIER_*`, `ATTRACTIONSG_CRAWLER_WEBHOOK*`, `ATTRACTIONSG_BACKGROUND_SYNC` |
| Currency converter | `EXCHANGE_API_KEY` |
| Nav flag | `NUXT_PUBLIC_ENABLE_BEST_DEALS_NAV` |

The AttractionsSG background sync turns itself off on Vercel and Netlify.

## Main routes

| Route | Purpose |
| --- | --- |
| `/explore` | Home page: AI planner prompt, partner deal search, Trip.com vs Klook guides |
| `/explore/[slug]` | Comparison guides (`flights`, `hotels`, `attractions`) and deal landing pages |
| `/planner` | AI travel agent. `?destination=` sets the brief; `?prompt=` fills the message box (not sent until the visitor presses send) |
| `/mytrip`, `/mytrip/[id]` | Saved trips (signed in) |
| `/share/trip/[shareId]` | Public read-only shared trip |
| `/destinations`, `/destinations/[slug]` | Destination catalogue |
| `/guides`, `/guides/[slug]` | Family destination guides. Content lives in `utils/destination-guides.ts`; `draft: true` guides are noindex and left out of the sitemap |
| `/trip`, `/klook` | Partner booking hubs |
| `/attractionsg`, `/attractionsg/[slug]` | Singapore attraction tickets with Stripe checkout |
| `/bookings`, `/user`, `/user/family` | Account pages |
| `/admin/**` | Admin portal (gated client-side only) |

`/`, `/deals/**`, `/compare` and `/search` redirect to `/explore`. `/trips/**` redirects to `/mytrip/**`.

## Code layout

| Path | Contents |
| --- | --- |
| `pages/`, `layouts/`, `components/` | UI. Planner UI is in `components/planner/`, shared site pieces in `components/site/` |
| `composables/` | Client state and helpers (`useAuthState`, `useFunnel`, `useTripDeeplink`, ...) |
| `server/api/` | HTTP handlers. Keep them thin |
| `server/services/`, `server/utils/` | Server logic. Prisma client: `server/utils/prisma.ts` |
| `utils/`, `types/` | Code and types shared by client and server |
| `prisma/` | Schema and migrations |
| `scripts/` | One-off CLIs, run with `tsx` |
| `docs/` | Historical notes. Where they disagree with the code, the code is right |

## Analytics

Funnel events go through `useFunnel().track()` to `/api/track-activity` and land in the `UserActivity` table:

`landing_viewed` → `planner_started` → `ai_itinerary_generated` (or `ai_itinerary_failed`, then `ai_itinerary_retried`) → `trip_saved` / `trip_shared` → partner click (`AffiliateClickEvent`, `travel_search_submitted`).

## Auth note

`middleware/auth.ts` and `middleware/admin.ts` run on the client only. They hide pages; they do not protect API routes.
