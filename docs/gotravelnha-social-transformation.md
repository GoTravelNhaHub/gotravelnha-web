# GoTravelNha 2.0: social travel community, architecture and plan

Status: **Phase 0 audit, awaiting approval.** 2026-10-18, branch `feat/community-schema` (100 uncommitted files on top of `8bb2772`).
Companion: [`community-visual-spec.md`](./community-visual-spec.md). Supersedes the planning parts of [`social-community-roadmap.md`](./social-community-roadmap.md); that file stays as the record of Steps 0–4.

Product loop: **Discover → Connect → Plan with AI → Book → Share.** The published itinerary is the social object. No photo feed, messaging or reels.

---

## 1. Existing architecture (verified in code)

| Layer | What exists |
| --- | --- |
| App | Nuxt 3.17 SSR, Vue 3.5, Tailwind only (no UI kit, no Pinia), Nitro routes in `server/api/`, Prisma 5.19 on PostgreSQL (`server/utils/prisma.ts` singleton) |
| Hosting | Vercel `sin1`. Build runs `prisma generate && prisma migrate deploy && nuxt build`, so **merging a migration applies it to production** |
| CI | `.github/workflows/ci.yml`: `npm ci`, `prisma generate`, `npm run typecheck`, `npm run build`. **There is no linter** in the repo or CI. Tests: `npm test` (`node:test` + `tsx`), 24 pass, 25 skip without a disposable test database |
| Caching | Production `swr` route rules on `/explore`, `/destinations`, `/klook`, `/attractionsg`. Community pages set their own `Cache-Control` |
| i18n | Custom `useI18n`, `locales/{en,vi,zh}`. Server renders English, client switches after hydration |
| Analytics | `useFunnel().track()` → `/api/track-activity` → `UserActivity`. Partner clicks → `AffiliateClickEvent` |
| SEO | `plugins/seo-canonical.ts`, `server/routes/sitemap.xml.ts` (already lists public community trips when the flag is on), `robots.txt`, per-page OG and JSON-LD |

### Authentication (reused as is, no new provider)

| Piece | Where | Notes |
| --- | --- | --- |
| Accounts | `User` (`id`, `username`, `email`, bcrypt `password`, `role` ADMIN/USER, `isActive`) | Existing users and sessions stay untouched |
| Sign-in | `server/api/auth/login.ts` (username/email + password), `register.ts`, `forgot-password.ts`, `reset-password.ts`, and the **existing** Google sign-in (`server/api/auth/google/`) | Google sign-in is part of today's system; nothing new is added |
| Session | `server/utils/session.ts`: sealed h3 cookie `gotravelnha_session` (httpOnly, `SameSite=Lax`, secure in production, 7 days) holding `userId` | |
| Server checks | `getSessionUser(event)` re-reads the user (role, `isActive`) on every call; `requireUser`, `requireAdmin` | Every community write handler uses these |
| Admin API gate | `server/middleware/auth-guard.ts` forces `requireAdmin` on `/api/admin/**` and `/api/users` | |
| Community API gate | `server/middleware/community-guard.ts`: 404 when the feature flag is off; `Origin` / `Sec-Fetch-Site` check on writes (CSRF) | Added in this branch |
| Client state | `useAuthState()` mirrors the user into `localStorage` (`gotravelnha_user`); `middleware/auth.ts` gates pages client-side only | UI only; never trusted by APIs |

**Keycloak:** out of scope per the brief. Nothing in the app uses it, but the unmerged community migration adds a nullable `users.keycloakId` column (from the earlier roadmap). Proposal: remove it before merge (§5, decision D1).

### AI planner (reused, not rebuilt)

`/api/planner/chat` (agent turn) and `/api/planner/itinerary` (structured plan, `server/services/itinerary-generator.ts`), grounded in a supplier catalogue so activity ids are real and **prices never come from the model**. It already supports revising a previous plan, logs each call in `ItineraryGeneration`, and caps use per guest IP, per user and site-wide. Saving a plan: `POST /api/trips` with the `generationId`.

**Gap:** feed cards link to `/planner?adapt=<slug>`, but the planner **ignores `adapt`** today, so "Customize with AI" only pre-fills the destination. Building this is Phase 2.

### Affiliate layer (reused)

- `/api/affiliate/click` → `AffiliateClickEvent`, tracked outbound URL, approved hosts in `utils/partner-url.ts` (`trip.com`, `klook.com`, `agoda.com`, `booking.com`), sub-ids from `server/services/affiliate-link.service.ts`.
- Trip.com: `useTripDeeplink` builds hotel and flight **search** links. There is no hotel or price feed.
- Klook: `AffiliateOffer` rows, widgets (`useKlookWidgets`), promo data.
- Verified prices: `resolveActivities` / `recommendActivities` (supplier catalogue + approved offers).
- Conclusion: per-day recommendations can always show contextual search links, and show names and prices only where a verified offer exists (visual spec §6).

## 2. Already built on this branch (uncommitted)

| Area | State |
| --- | --- |
| Schema | Migration `20261017120000_social_community`: `TravelerProfile`, `PublishedTrip` (visibility PRIVATE/UNLISTED/PUBLIC, status, `parentId` lineage, counters), `SavedTrip`, `Follow`, `TripComment`, `ContentReport`; nullable `Trip.adaptedFromId`, `ItineraryGeneration.sourceTripId`; CHECK constraints. **Applied to the local database only** |
| Publish | Sanitizer (names, dates, contacts removed), publish sheet on `/mytrip/[id]`, preview, visibility with explicit confirmation for Public. APIs under `/api/community/publications` |
| Public trip page | `/community/trips/[slug]`: SSR, canonical, OG, JSON-LD for public trips, noindex + `private, no-store` for unlisted/private, sitemap, booking options with disclosure. Old visual design (not Reference B yet) |
| Discovery | `/community` built to Reference A (verified at 1536 × 1024), filters in the URL, keyset pagination, trending/most-saved sorts, creators and destinations APIs |
| Site shell | Community header, side rail, avatar menu, tab bar, palette, logo and fonts now used site-wide |
| Flags | `NUXT_PUBLIC_ENABLE_COMMUNITY` (off by default, off in production), `NUXT_PUBLIC_COMMUNITY_DEMO` (labelled samples, off by default) |

**Not built:** save, follow, comments, reports and moderation, traveler profile pages, `/saved`, customize-with-AI flow, Reference B detail layout, homepage switch.

Data today: 1 public trip, 1 profile, 0 follows, 0 comments (local database).

## 3. Reusable functionality

| Need | Reuse |
| --- | --- |
| Identity, authorization | `getSessionUser`, `requireUser`, `requireAdmin`; ownership in every `where` clause |
| Itinerary shape and rendering | `types/trip.ts`, `components/planner/ItineraryView.vue` |
| Customize | `generateItinerary` + `TripRequestSchema` + rate limits + `ItineraryGeneration` logging; `POST /api/trips` to save |
| Booking options | `recommendActivities`, `resolveActivities`, `useTripDeeplink`, `/api/affiliate/click` |
| Read-only public view | `/share/trip/[shareId]` pattern (party reduced to ages) |
| Limits and validation | `enforceRateLimit`, `clipText`, `boundedJson`, zod |
| Photos | `utils/destination-photos.ts`, `utils/community-photos.ts` (checked stock photos). No object storage yet |
| Analytics | `useFunnel().track()`; `community_page_view`, `itinerary_view`, `itinerary_open`, `itinerary_customize_start`, `itinerary_share`, `itinerary_publish` already fire |

## 4. Target architecture

```
pages/                         server/api/community/            server/services/community/
  /  (flag: explore|community)   trips/ (list, [slug], booking)   trips.ts   (read rules, discovery)
  /community                     publications/ (author writes)    sanitize.ts (privacy scrub)
  /community/trips/[slug]        trips/[id]/save   (PUT/DELETE)   social.ts  (save, follow)
  /travelers/[handle]            profiles/[handle] (+ /follow)    comments.ts, moderation.ts
  /saved                         trips/[id]/comments, comments/[id]
  /mytrip, /mytrip/[id]          reports, saved, feed (later)
  /planner?adapt=<slug>        server/api/planner/itinerary (+ adaptFrom)
                               server/api/admin/community/ (moderation queue)
```

- **Thin handlers, services hold the rules.** Public reads never read the session, so cached HTML is identical for everyone. Viewer state (saved, following) is fetched client-side.
- **Snapshots, not live views.** A `PublishedTrip` is a sanitized copy. The private `Trip` is never exposed; unpublish is one row update.
- **Lineage.** Customizing creates a new private `Trip` (`adaptedFromId`); if published, its `PublishedTrip.parentId` points at the source. The original is never written to (only `adaptCount` increments).
- **Affiliate providers.** Phase 5: move Trip.com/Klook link building behind a provider adapter (`buildLink`, `approvedHosts`, `placements`) with the same `buildAffiliateLink` signature, so Agoda, Booking.com and Traveloka are config + adapter after approval. The approved-host list already includes Agoda and Booking.com.

### Routes: brief versus existing

| Brief | Existing / proposed | Why |
| --- | --- | --- |
| `/` social homepage | `/` is a **301** to `/explore` today | See §6 |
| `/my-trips` | Keep `/mytrip` (in use; `/trips` already 301s to it). Add `/my-trips` → `/mytrip` 301 | A third name for the same page splits links and SEO |
| `/saved` | New `/saved` (client-rendered, sign-in required, noindex) | As briefed |
| `/travelers/[username]` | `/travelers/[handle]` | `User.username` leaks the email's local part for Google sign-ups (`google/callback.ts` sets it from the email). The public handle is chosen by the user in `TravelerProfile.handle` |
| `/community/trips/[slug]` | Exists | |

## 5. Prisma changes

The existing migration already covers every MVP entity in the brief. Mapping:

| Brief entity | Table |
| --- | --- |
| TravelerProfile | `traveler_profiles` (exists in migration) |
| PublishedTrip | `published_trips` |
| TripFork | `published_trips.parentId` + `trips.adaptedFromId` + `itinerary_generations.sourceTripId` (no separate table) |
| SavedTrip, Follow, TripComment, ContentReport | `saved_trips`, `follows`, `trip_comments`, `content_reports` |
| AffiliateClick | Existing `affiliate_click_events` (placement + metadata) |
| TripMedia | **Deferred**: needs object storage (decision D6) |
| TripCollaborator | **Deferred** to the collaboration phase |

Required change before merge:

- **D1 (done 2026-10-18):** `users.keycloakId` is no longer in the migration. When the Keycloak server is stable, linking accounts gets its own additive migration (nullable `keycloakId`, unique).

No other schema change is needed for Phases 1–3. Likes are not added: saves, comments and "customized N times" are the engagement metrics (decision D4).

Safety: the migration is additive (new tables, nullable columns). It ships in **its own PR, merged only with explicit approval**, because merging runs `migrate deploy` on production.

## 6. Homepage migration strategy

Problem: `nuxt.config.ts` has `'/': { redirect: { to: '/explore', statusCode: 301 } }`. Browsers and crawlers cache 301s, so visitors who already followed it would keep landing on `/explore` after any switch.

1. **Now (Phase 1, safe):** change that rule to **302**. Behaviour is identical today; it stops new permanent caching.
2. **Phase 4 (prepare):** add `NUXT_PUBLIC_HOME_VARIANT=explore|community` (default `explore`). Add `pages/index.vue`, which renders the community feed when the variant is `community` and keeps the 302 to `/explore` otherwise.
   - Canonical for the unfiltered feed becomes `/`, and `/community` canonicalises to `/`.
   - `/explore` stays live with its own content and canonical. The planner stays in the header, rail, tab bar and hero.
3. **Switch:** set the variant to `community` on a preview deployment, check SEO, analytics and cache headers, then production **only with your approval**.
4. **Rollback:** flip the variable back and redeploy (or use Vercel instant rollback). No URLs are removed, so no redirects need undoing.
5. **Measure:** compare a week before and after on `community_page_view → itinerary_view → itinerary_customize_start → saved plan`, planner starts, affiliate clicks per session, and 7-day return rate.

## 7. Privacy, trust, moderation

Implemented: private by default; explicit confirmation for Public; publish sanitizer (names → "the kids", exact dates → Day 1..N, emails and phones removed); age bands opt-in; no live location anywhere; noindex + `no-store` for non-public trips; the sitemap lists public trips only; CSRF origin check; zod validation; per-IP rate limits.

Phase 3 adds:
- Comments: plain text only, max 2000 characters, escaped rendering, per-user DB caps (e.g. 20 per hour) in addition to the in-memory per-IP limits.
- Reports (trip, comment, profile).
- An admin queue at `/admin/community` with hide and restore, and profile suspension. Hidden content returns 404 and leaves the sitemap.
- Account deletion cascades, and the author's comments become "deleted user".

Media uploads stay off until storage is chosen (D6). When added: type and size checks, EXIF/GPS stripping, no images of children by default.

## 8. SEO

Public trip pages already have SSR, canonical, OG, `Trip` JSON-LD and the sitemap. To add:
- Profile pages: index only with ≥ 1 public trip.
- `/saved` and following views: noindex.
- Destination ↔ itinerary links: `/destinations/[slug]` and `/guides/[slug]` list public trips for that city; trip pages link back.
- Phase 4: the canonical switch above.

## 9. Analytics plan

Already firing: `community_page_view`, `itinerary_open`, `itinerary_view`, `itinerary_customize_start`, `itinerary_share`, `itinerary_publish`; partner clicks in `AffiliateClickEvent`.

To add: `itinerary_customize_complete` (with the source trip id), `itinerary_save`, `creator_follow`, `comment_posted`, `home_variant` on page views (for the Phase 4 comparison).

Repeat visits come from `UserActivity` session ids, so no new identifier is needed. Payloads carry ids and coarse labels only: no names, party details, comments or dates.

## 10. Implementation sequence

| Phase | Scope | Exit check |
| --- | --- | --- |
| **1. Community homepage (finish)** | Brief deltas on the built page (visual spec §2):<br>• hero copy<br>• "Where would you like to go next?" row<br>• rail labels (Home/Feed, Explore)<br>• `/` 301 → 302<br>• `/my-trips` alias<br>• editorial-sample label support<br>Save and Follow stay "Soon" until Phase 3 | Playwright at 1536/1024/768/390 against Reference A; typecheck; build; tests |
| **2. Itinerary detail + Customize with AI** | Reference B detail layout and timeline; per-day Trip.com/Klook blocks under the §6 honesty rules; customization modal → `adaptFrom` in `/api/planner/itinerary` → save as a new private `Trip` with attribution; mobile booking sheet | Tests for adaptation (source must be public/unlisted and active; original untouched); visual comparison against Reference B |
| **3. Social** | Save / `/saved`; follow; `/travelers/[handle]`; profile editing; comments; reports; admin moderation queue. Turns every "Soon" control on | Authorization tests (non-owner edits, private reads, duplicate saves, self-follow, hidden content) on a disposable database |
| **4. Homepage migration** | `HOME_VARIANT` flag, canonical changes, preview validation | Your approval before production |
| **5. Growth** | Following feed, notifications, provider adapters, recommendations, collaboration | — |

## 10a. Progress

**Large screens (2026-10-18).** Content uses the full width: no 1440/1600px caps. New breakpoints `3xl` (1920) and `4xl` (2560) add columns to card grids. The community feed fits as many ~880px cards per row as the screen allows (1 at 1920, 2 at 2560, 3 at 3440). Long text keeps its own reading width; the attraction detail page is capped at 1600px (1920px at `4xl`).

**Phase 2 (2026-10-18, built behind the community flag, not deployed):**
- Trip page `/community/trips/[slug]` rebuilt to Reference B:
  - breadcrumb, photo with Family-friendly badge, creator row with real counts
  - facts, theme chips, Save / Share / Customize
  - section tabs; day timeline with per-day Trip.com and Klook panels
  - tips, map dialog (city level), and phone booking sheet and action bar
- Partner suggestions: `utils/community-booking.ts`.
  - Day 1 gets a Trip.com hotel search for the city (no dates are invented).
  - Each day gets up to 3 Klook items: verified catalogue offers (with their checked price), otherwise search links with no price. Meals, rest and transfers are skipped.
  - All clicks go through `/api/affiliate/click` with placement `community_trip_day`.
- Customize with AI:
  - The modal (dates, travellers with children's ages, budget, interests) hands over to `/planner?adapt=<slug>` via `sessionStorage`. A bare link never starts a paid call.
  - The planner shows "Based on … by …" and sends `adaptFrom`. The server loads the snapshot (public or unlisted, active only) and passes it as a `<reference_plan>` the model must treat as data.
  - The generation records `sourceTripId`, which revisions keep. Saving sets `Trip.adaptedFromId` and increments `adaptCount` once. The original is never edited.
- Save: `PUT`/`DELETE /api/community/trips/[slug]/save` (idempotent, count in the same transaction), `GET /api/community/saved`, `GET /api/community/saved/state`, the `/saved` page (sign-in, noindex), and bookmarks on feed cards. "Saved" in the navigation is now live.
- Analytics added: `itinerary_customize_submit`, `itinerary_customize_complete`, `itinerary_save`.
- Fixed in passing: `/mytrip` was not noindexed (the prefix list still said `/trips`).
- Tests: `community-booking`, `community-adapt` (pure), `community-social` (database). 61/61 pass against `gtn_community_fresh`.
- Still pending (Phase 3): follow, comments and the Comments tab, traveler profiles, reports and moderation. The Follow button shows "Soon".

**Logo (2026-10-18).** The original map-pin-with-house mark is back, recoloured to the community palette: primary `#0066E4`, yellow sun `#FBBF24`, brighter `#2A7FEA` on dark backgrounds. Favicon and Apple touch icon updated.

**Phase 3 (2026-10-18, behind the community flag, not deployed; no schema change):**
- Traveler profiles:
  - `/travelers/[handle]` (SSR, cacheable, noindex until the first public trip, in the sitemap after it): name, handle, bio, joined date, and real counts of public trips, followers and following, plus the traveler's public trips.
  - The owner edits in place. The page updates from the save response, because the public response is cached for 60s.
  - `/travelers/me` sends you to your profile or the form to create one ("Traveler profile" in the avatar menu).
- Follow:
  - `PUT`/`DELETE /api/community/profiles/[handle]/follow` (idempotent, no self-follow, active profiles only) and `GET /api/community/follow-state`.
  - Follow buttons on trip pages, sidebar creators and profiles. Creator names link to profiles.
- Comments:
  - `GET`/`POST /api/community/trips/[slug]/comments`, `PATCH`/`DELETE /api/community/comments/[id]`.
  - Tip or question, plain text up to 2000 characters, escaped rendering, 20 per user per hour (stored, so it holds across instances).
  - A traveler profile is needed, so comments never show account names or emails. It is set up inline the first time.
  - Author edits; author or admin deletes. `commentCount` is kept in the same transaction. Comments tab with the count.
- Reports and moderation:
  - `POST /api/community/reports`: trip, comment or profile, five reasons, one per user per target, 10 per hour. Private content cannot be reported.
  - `/admin/community` with `/api/admin/community/*` (admin guard): Open, Hidden and Dismissed queues. Hide and restore are reversible and keep comment counts right; dismiss works on deleted targets too.
- Analytics: `creator_follow`, `comment_posted`.
- Tests: `scripts/community-phase3.test.ts`. 67/67 pass against `gtn_community_fresh`.
- Browser checks: 18 signed-in flows, run on a dev server pointed at the test database (follow, inline profile, comment and edit, save, report, owner edit, admin hide and restore, visitor redirects).
- Fixed during testing: a stale bio after editing (public cache), and profile counts read as "1trip" by screen readers.
- Still pending: following feed and notifications (Phase 5), photo uploads (D6), the "See all" creators page.

## 11. Risks

| Risk | Mitigation |
| --- | --- |
| Migration runs on deploy | Own PR, explicit approval, additive only |
| 100 uncommitted files on one branch | Split before more work: (a) site-wide redesign shell, (b) schema migration, (c) community features. Each passes CI on its own |
| Empty community looks broken | Editorial sample itineraries written by the team, labelled "Editorial sample", published from a real team profile. No invented travelers, counts or reviews |
| Brief hero copy is longer than Reference A's slot | Visual spec §2 sizes; banner grows 23px |
| Reference B shows prices and ratings we do not have | Visual spec §6: same card shells, search links when unverified |
| Affiliate links moved out of the top bar when the community is on | They are in the rail, drawer and per-day blocks; one-line change to restore (`useAppNav`) |
| In-memory rate limits are per serverless instance | DB caps for comments, reports and follows |
| Cached HTML leaking viewer state | Public pages never read the session; viewer state is fetched client-side |
| No linter | CI gate stays typecheck + build + tests. Adding ESLint is a separate decision (new dependency) |

## 12. Decisions needed

| # | Question | Recommendation |
| --- | --- | --- |
| D1 | ~~Remove `users.keycloakId` from the unmerged migration~~ | **Done 2026-10-18** (approved): removed from the schema and migration, and the empty column dropped on the local and test databases (migration checksum updated, no drift). Keycloak linking is revisited once the Keycloak server is stable, as its own migration |
| D2 | Hero copy from the brief replaces Reference A's text, with the banner 23px taller | Yes |
| D3 | Routes: keep `/mytrip` with a `/my-trips` alias; `/travelers/[handle]` instead of `[username]` | Yes (email-leak risk) |
| D4 | No likes table; saves, comments and customizations are the metrics; no heart on real cards | Yes |
| D5 | Trip.com and Klook in the top bar or only in the rail when the community is on | Rail + per-day blocks (as built) |
| D6 | Photo uploads: storage provider (Vercel Blob, S3 or R2) or stock photos only for now | Stock only until Phases 1–3 ship |
| D7 | Commit plan: split the branch into three PRs before Phase 1 continues | Yes |
| D8 | Mobile feed: keep "Customize with AI" on cards (Reference B hides it) | Keep |

## 13. First milestone proposal

**Phase 1 completion**, 1–2 days of work, no schema change:
1. D7 split and commit (no behaviour change).
2. Hero copy and size changes; "Where would you like to go next?" row; rail labels.
3. `/` redirect 301 → 302; `/my-trips` alias.
4. "Editorial sample" label support for team-written trips (content added only with your sign-off).
5. Visual verification at four widths against Reference A, with a written list of remaining differences.

Then Phase 2 (detail page + Customize with AI), which is the core of the product loop.
