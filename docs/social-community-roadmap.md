# Social travel community: architecture and roadmap

> Planning superseded by [`gotravelnha-social-transformation.md`](./gotravelnha-social-transformation.md) (2026-10-18). Keycloak is out of scope; this file remains the record of Steps 0–4.

Status: **proposal for review**. No code, schema or migration changes have been made yet.
Audited: `web/` at `8bb2772` (2026-10-17), plus `keycloak/` for the IAM plan.

Product loop: **Discover → Save → Customize with AI → Book → Travel → Share.** The published itinerary is the central object. There is no photo feed and no post feed.

---

## 1. Current system architecture

| Layer | What exists today |
| --- | --- |
| Framework | Nuxt 3.17 (SSR), Vue 3.5, Tailwind only (no UI kit, no Pinia), Nitro server routes in `server/api/` |
| Data | Prisma 5.19 on PostgreSQL, singleton `server/utils/prisma.ts`. Migrations run on every Vercel build (`vercel-build` → `prisma migrate deploy`) |
| Hosting | Vercel, region `sin1`, functions `maxDuration: 120` (for the planner model call) |
| Auth | Username/email + bcrypt (`server/api/auth/login.ts`) and Google OAuth (`server/api/auth/google/`). Both set a sealed h3 session cookie `gotravelnha_session` (`server/utils/session.ts`: `getSessionUser`, `requireUser`, `requireAdmin`). The UI mirrors the user into localStorage via `useAuthState` |
| API auth | `requireUser` in handlers; `server/middleware/auth-guard.ts` forces admin on `/api/admin/**` and `/api/users`. Page middleware (`middleware/auth.ts`) is client-only and gates UI only |
| AI planner | `/api/planner/chat` (agent turn, `server/services/planner-agent.ts`) and `/api/planner/itinerary` (structured itinerary, `server/services/itinerary-generator.ts`, model `claude-opus-5-5`). Grounded in a supplier catalogue (`server/services/trip-catalogue.ts`), so activity ids are real and **prices never come from the model**. Already supports **revising** a previous plan (`revise: { generationId, change }`). Every call is logged in `ItineraryGeneration` and capped per guest IP (3/day), per user (10/day) and site-wide (300/day) |
| Trips | `Trip` model (owner, destination, dates, budget, `party` JSON with names + ages, `itinerary` JSON, `shareId`). `/api/trips` CRUD (owner-scoped), `/mytrip`, `/mytrip/[id]` |
| Link sharing | `/api/trips/[id]/share` creates a random `shareId`; `/share/trip/[shareId]` is an SSR, `noindex` read-only view that already strips names and budget |
| Affiliate | `AffiliateEntity` / `AffiliateOffer` / `AffiliatePlacement` / `AffiliateClickEvent` / `AffiliateConversionEvent`, `/api/affiliate/click` (approved-host check in `utils/partner-url.ts`, sub-id builder in `server/services/affiliate-link.service.ts`), Trip.com and Klook deeplinks, conversion postbacks |
| Recommendations | `server/services/trip-recommendations.ts` ranks catalogue activities for a family's ages and interests, with live prices from `resolveActivities` |
| Analytics | `useFunnel().track()` → `/api/track-activity` → `UserActivity` (session id, page, action, bounded JSON) |
| SEO | `plugins/seo-canonical.ts` (canonical + noindex by prefix), `server/routes/sitemap.xml.ts`, `server/routes/robots.txt.ts`, per-page `useHead` OG tags, `swr` route rules in production |
| i18n | Custom `useI18n`, `locales/{en,vi,zh}/*.ts`, server renders English, client switches after hydration |
| Tests | No test runner. One `node:test` file run with `tsx` (`npm run test:affiliate`), which passes. CI (`.github/workflows/ci.yml`) runs typecheck and build on PRs |

**Baseline problem:** `npm run typecheck` currently fails on `main` with 8 errors, all caused by a generic call inside a template (`tm<{…}[]>(…)` at `pages/explore/index.vue:125` and `pages/planner/index.vue:182`). CI is therefore red for every PR. Fixing this is step 0 (a small, separate change) so the new work can be validated against a green check.

## 2. Reusable features

| Need | Reuse |
| --- | --- |
| Session and authorization | `getSessionUser` / `requireUser` / `requireAdmin` |
| Itinerary data shape | `types/trip.ts` (`Itinerary`, `ItineraryItem`, `LiveActivity`) |
| Itinerary rendering | `components/planner/ItineraryView.vue` (already shows live verified prices and tracked partner buttons) |
| Public read-only view pattern | `server/api/share/trips/[shareId].get.ts` + `pages/share/trip/[shareId].vue` (SSR, OG tags, party reduced to ages) |
| AI customization | `generateItinerary(request, catalogue, revision)` and its revision prompt; `TripRequestSchema`; rate limits and cost logging in `ItineraryGeneration` |
| Saving a plan | `POST /api/trips` (takes a `generationId`, so the saved plan is exactly what the planner produced) |
| Contextual booking options | `recommendActivities`, `resolveActivities`, `ItineraryView` partner buttons, `/api/affiliate/click` with a new placement key |
| Destination photos and metadata | `utils/destination-photos.ts`, `utils/destination-catalog.ts` (city, country, region), `utils/planner-map.ts` (city-level OSM embed) |
| Rate limiting, input clipping | `enforceRateLimit`, `clipText`, `boundedJson` in `server/utils/activity-limits.ts`; zod is already a dependency |
| Analytics | `useFunnel().track()` |
| SEO plumbing | `seo-canonical.ts`, sitemap and robots routes, `canonicalSiteOrigin`, `resolveAbsoluteOgImage` |

## 3. Missing components

1. A **public, sanitized snapshot** of an itinerary that is separate from the private `Trip` (today the only public form is an unlisted share link).
2. A **public identity** (handle, display name, bio, avatar) that is separate from the login identity.
3. Saves, follows, comments, reports and moderation.
4. A **lineage link** between a source itinerary and the versions adapted from it.
5. An "adapt from published trip" mode in the planner API (today revision only works on the caller's own generations).
6. Community pages: `/community`, `/community/trips/[slug]`, `/travelers/[handle]`, `/mytrip/saved`, a following feed, a publish flow, an admin moderation queue.
7. **Object storage for photos.** There is none in the repo today. Phase 1 uses the existing stock destination photos; user uploads wait for a storage decision (see §8).
8. Tests for authorization, privacy sanitization and lineage.

## 4. Proposed database changes

Principles: reuse `User` and `Trip`; add tables only for things that have their own lifecycle; everything is additive (new tables and nullable columns), so the migration is non-destructive and safe to run with `migrate deploy`.

### Key decision: publish a snapshot, not a live view

A `PublishedTrip` holds a **sanitized copy** of the itinerary made at publish time. The private `Trip` stays private and editable. Editing the private trip does not change the public page until the owner republishes.

Why: the private trip contains family names, exact dates, budget and AI text that may mention a child by name (the planner sends traveller names to the model). A snapshot lets the publish step review and strip all of that once, and makes "unpublish" a single row update.

### Schema sketch

```prisma
// Public identity in the community. Separate from login identity (User), so the
// move to Keycloak does not touch social data. Created when the user first publishes or edits a profile.
model TravelerProfile {
  userId           String   @id
  handle           String   @unique   // chosen by the user; NOT User.username (see §8)
  displayName      String
  bio              String?
  avatarUrl        String?            // OAuth image or initials until uploads exist
  favoriteDestinations String[]
  homeCountry      String?            // country only, never a city or address
  showSavedTrips   Boolean  @default(false)
  status           String   @default("active") // active, suspended
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  user       User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  trips      PublishedTrip[]
  followers  Follow[]        @relation("FollowTarget")
  following  Follow[]        @relation("FollowSource")
  @@map("traveler_profiles")
}

enum TripVisibility { PRIVATE UNLISTED PUBLIC }

model PublishedTrip {
  id             String   @id @default(uuid())
  slug           String   @unique            // "3-days-bangkok-family-k7x2"
  authorId       String                      // TravelerProfile.userId
  sourceTripId   String?  @unique            // private Trip it was published from
  parentId       String?                     // PublishedTrip it was adapted from (lineage)
  visibility     TripVisibility @default(PRIVATE)
  status         String   @default("active") // active, hidden (moderation), removed
  title          String
  description    String?
  destination    String                      // English city name, as the planner stores it
  country        String?
  durationDays   Int
  travelMonth    Int?                        // optional, 1-12; never exact dates
  travelStyle    String?                     // relaxed, balanced, packed, or a tag
  budgetLevel    String?                     // budget, mid, premium: a level, not an amount
  familyFriendly Boolean  @default(false)
  childAgeBands  String[]                    // "0-2", "3-5", "6-12", "13-17", opt-in
  itinerary      Json                        // sanitized Itinerary, days as Day 1..N
  tips           String[]
  coverImage     String?
  saveCount      Int      @default(0)        // denormalized, updated in the same transaction
  commentCount   Int      @default(0)
  adaptCount     Int      @default(0)
  publishedAt    DateTime?                   // first time it became PUBLIC
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  author   TravelerProfile @relation(fields: [authorId], references: [userId], onDelete: Cascade)
  parent   PublishedTrip?  @relation("Lineage", fields: [parentId], references: [id], onDelete: SetNull)
  children PublishedTrip[] @relation("Lineage")
  saves    SavedTrip[]
  comments TripComment[]

  @@index([visibility, status, publishedAt])
  @@index([visibility, status, saveCount])
  @@index([destination, visibility, status])
  @@index([authorId, visibility])
  @@map("published_trips")
}

model SavedTrip {
  userId    String
  tripId    String
  createdAt DateTime @default(now())
  trip PublishedTrip @relation(fields: [tripId], references: [id], onDelete: Cascade)
  user User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@id([userId, tripId])                       // no duplicate saves
  @@index([userId, createdAt])
  @@map("saved_trips")
}

model Follow {
  followerId String
  followeeId String
  createdAt  DateTime @default(now())
  follower TravelerProfile @relation("FollowSource", fields: [followerId], references: [userId], onDelete: Cascade)
  followee TravelerProfile @relation("FollowTarget", fields: [followeeId], references: [userId], onDelete: Cascade)
  @@id([followerId, followeeId])
  @@index([followeeId])
  @@map("follows")
}

model TripComment {
  id        String   @id @default(uuid())
  tripId    String
  authorId  String                          // User.id; a profile is created on first comment
  body      String                          // plain text, max 2000, rendered escaped
  kind      String   @default("tip")        // tip, question
  status    String   @default("visible")    // visible, hidden, deleted
  editedAt  DateTime?
  createdAt DateTime @default(now())
  trip PublishedTrip @relation(fields: [tripId], references: [id], onDelete: Cascade)
  @@index([tripId, status, createdAt])
  @@index([authorId, createdAt])
  @@map("trip_comments")
}

model ContentReport {
  id          String   @id @default(uuid())
  reporterId  String?
  targetType  String                        // trip, comment, profile
  targetId    String
  reason      String                        // spam, unsafe, personal_info, offensive, other
  note        String?
  status      String   @default("open")     // open, actioned, dismissed
  resolvedBy  String?
  resolvedAt  DateTime?
  createdAt   DateTime @default(now())
  @@unique([reporterId, targetType, targetId])
  @@index([status, createdAt])
  @@map("content_reports")
}
```

Changes to existing models (all nullable or additive):

- `User`: relations to `TravelerProfile` and `SavedTrip`; `keycloakId String? @unique` (prepared now, populated in the Keycloak migration).
- `Trip`: `adaptedFromId String?` (the `PublishedTrip` a private trip was customized from) for attribution in `/mytrip/[id]`.
- `ItineraryGeneration`: `sourceTripId String?` (the `PublishedTrip` used as the base), so "customize started → completed → saved" is measurable in SQL.

Not new tables (reused): `AffiliateClickEvent` is already the click-attribution table; a new placement key `community_trip` and `metadata.publishedTripId` are enough. Analytics go to `UserActivity`.

Deferred to Phase 2: `TripCollaborator`, `TripSuggestion`/votes, `TripNote`, `TripChange`. Deferred until storage exists: `TripMedia`.

### Migration plan

1. One additive migration (`20261020…_social_community`): new tables, enums, nullable columns, indexes. No data rewrite. Created with `prisma migrate dev --create-only`, reviewed by hand, tested on a local database and a copy of production.
2. No backfill is needed: profiles are created lazily on first publish/comment/follow.
3. Vercel runs `migrate deploy` on build, so **merging the PR applies the migration to production**. That is the approval gate: the migration ships in its own PR that is merged only with explicit sign-off, before any UI that depends on it.
4. Rollback: the feature is behind `NUXT_PUBLIC_ENABLE_COMMUNITY`; turning it off hides every route and API. The tables can stay; a down-migration is only written if asked.

## 5. API architecture

All new handlers live under `server/api/community/` with thin handlers over `server/services/community/*.ts`. Response shape follows the existing convention (`{ success: true, data }`, `createError` for failures). Every write validates with zod and checks ownership in the `where` clause (`updateMany({ where: { id, authorId: user.id } })`), as the existing trips API does, which closes IDOR by construction.

| Method + path | Auth | Purpose |
| --- | --- | --- |
| `GET /api/community/trips` | public | Discovery list. Filters: `q`, `destination`, `country`, `minDays`/`maxDays`, `budget`, `style`, `family`, `sort=recent|saved|trending`, `cursor`. Only `PUBLIC` + `active` |
| `GET /api/community/trips/[slug]` | public* | One trip with live activity prices. `UNLISTED` by link only; `PRIVATE`/`HIDDEN` only to the author (`sourceTripId` too). `Cache-Control: private, no-store` |
| `GET /api/community/trips/[slug]/booking-options` | public | Catalogue activities for the destination (`recommendActivities`), public/unlisted trips only |
| `POST /api/community/publications/preview` | user | Sanitized draft of an owned `Trip` and what was removed. Saves nothing |
| `POST /api/community/publications` | user | Publish an owned `Trip`, or republish it (one row per trip) |
| `PATCH /api/community/publications/[id]` | author | Change visibility |
| `DELETE /api/community/publications/[id]` | author | Remove the published version (hard delete; the private trip stays) |
| `PUT/DELETE /api/community/trips/[id]/save` | user | Idempotent save / unsave (`upsert` on the composite key, count in the same transaction) |
| `GET /api/community/saved` | user | Own saved trips, cursor-paginated |
| `GET/POST /api/community/trips/[id]/comments` | public / user | List (cursor) / add |
| `PATCH/DELETE /api/community/comments/[id]` | author (delete also admin) | Edit / delete own |
| `POST /api/community/reports` | user | Report a trip, comment or profile |
| `GET /api/community/profiles/[handle]` | public | Profile, published trips, counts |
| `GET/PUT /api/community/profile` | user | Own profile (create on first PUT; handle uniqueness checked) |
| `PUT/DELETE /api/community/profiles/[handle]/follow` | user | Follow / unfollow (no self-follow) |
| `GET /api/community/feed` | user | Following feed: recent `PUBLIC` trips by followees, cursor on `publishedAt,id` |
| `POST /api/planner/itinerary` (extended) | guest or user | New optional `adaptFrom: { tripId }`; see §6 |
| `GET/POST /api/admin/community/reports` | admin (existing guard) | Moderation queue, hide/restore |

Author writes live under `/api/community/publications` and public reads under `/api/community/trips/[slug]`, so one URL is never both, and two different dynamic parameters never share a path level.

The name `/api/community/profiles` is deliberate: `/api/travellers` already exists and means **family members**, a different concept.

## 6. Customize with AI (highest priority)

The existing engine already does almost everything; the new part is a read-only base plan that belongs to someone else.

Flow:
1. "Customize this trip with AI" on `/community/trips/[slug]` links to `/planner?adapt=<slug>` (a link, not an AI call, so crawlers never trigger a paid call; this matches how `?prompt=` already works).
2. The planner page loads the public trip, pre-fills destination, pace and duration, shows a "Based on *Title* by @creator" banner, and asks only for what it can't know: dates, travellers and children's ages (pre-filled from the family profile when signed in), budget, and what to change.
3. On generate, the client sends the normal `TripRequest` plus `adaptFrom: { tripId }`. The server loads the published snapshot (must be `PUBLIC` or `UNLISTED` and `active`), and calls `generateItinerary` with a new `adaptation` block: *"Here is a plan another family used. Keep what fits this family; adjust to N days, these ages and this budget; apply the requested changes."* It reuses the same catalogue grounding, schema, rate limits and logging; `ItineraryGeneration.sourceTripId` records the base.
4. The result is the planner's normal result: it can be revised with the existing chat, and saved with the existing `POST /api/trips`, which copies `sourceTripId` into `Trip.adaptedFromId`.
5. Attribution: `/mytrip/[id]` shows "Adapted from *Title* by @creator". If the user later publishes their version, `PublishedTrip.parentId` is set and the original shows "N families adapted this trip".
6. The original is never written to; `adaptCount` increments when an adapted trip is saved.

Why a separate `adaptation` block rather than the existing `revise`: revision assumes the same day count and the caller's own plan; adaptation changes duration, party and budget and must treat the source text as reference material, not instructions (prompt-injection boundary, same as the existing rule for `interests`).

## 7. Authentication and Keycloak readiness

Today: local accounts + Google, sealed session cookie, `requireUser`. Target: Keycloak at `https://auth.gotravelnha.com`, realm `gotravelnha`, client `gotravelnha-web` (already defined in `keycloak/realm/gotravelnha-realm.json`; the integration plan in `keycloak/docs/integration.md` uses `nuxt-auth-utils`).

Design so the community does not care which one is active:
- All social tables key on **`User.id`**, never on email, username or the IdP subject. Swapping the login mechanism changes only how a session resolves to a `User` row.
- Community handlers call only `getSessionUser` / `requireUser`. When Keycloak lands, those functions change internally (session from the OIDC callback; `Authorization: Bearer` verified with `jose` against the realm JWKS for mobile). No community code changes.
- Add `User.keycloakId` (nullable, unique) in the community migration so the IAM migration needs no schema change. Users are matched by `sub` once linked, by verified email only during the one-time import.
- Public profile data (handle, bio, follows) stays in the GoTravelNha database. Keycloak holds credentials and core claims only.
- Product permissions (`ADMIN`, trip collaborator roles in Phase 2) stay in the GoTravelNha database; the realm `admin` role maps to `User.role = ADMIN` at login, as the integration doc describes.

The Keycloak cutover itself is a separate project (account import, password strategy, redirect of `register`/`forgot-password`). It is not on the critical path for the community MVP.

## 8. Risks, privacy decisions and dependencies

| # | Risk | Mitigation |
| --- | --- | --- |
| R1 | **`User.username` leaks email.** Google sign-up sets `username` to the email local part (`server/api/auth/google/callback.ts`). Using it in `/travelers/[username]` would publish part of users' email addresses | Separate `TravelerProfile.handle`, chosen by the user, with a suggested handle that is *not* derived from email |
| R2 | **Children's names in AI text.** Traveller names go to the model, so item text can say "Mia will love…" | Publish step scrubs party names (case-insensitive, word boundary) from every text field, then shows an editable preview the user must confirm |
| R3 | **Live location / dates.** Exact dates on a public page tell strangers when a family is away | Snapshot stores Day 1..N, optional month only; publishing a trip whose dates include today or the future shows a warning; no "currently travelling" status anywhere |
| R4 | **Cached private content.** Production uses `swr` route rules; a cached public page could survive unpublish | No `swr` on `/community/trips/**` at first; short `Cache-Control: s-maxage=60` only for `PUBLIC`, `private, no-store` for anything else. Viewer-specific state (saved, following) is fetched client-side so cached HTML is identical for everyone |
| R5 | **Rate limits are per serverless instance** (`enforceRateLimit` is in-memory) | Acceptable for MVP; add DB-backed per-user caps for comments (e.g. 20/hour) and reports. Upgrade path: Vercel KV / Upstash only if abuse appears |
| R6 | **CSRF.** Cookie is `SameSite=Lax`, which blocks cross-site POSTs from forms on modern browsers but not everything | Add an `Origin`/`Sec-Fetch-Site` check for non-GET `/api/community/**` (small server middleware); JSON-only bodies |
| R7 | **XSS in comments/bios** | Plain text only, rendered with Vue interpolation (escaped); no `v-html`; URLs in comments not auto-linked in MVP |
| R8 | **Paid AI cost from adaptation** | Same caps as the planner; customize is a link, not an auto-run |
| R9 | **Cold start: an empty community looks broken** | Seed with 10–20 itineraries written or reviewed by the team, published from a real team profile and labelled as such. No fabricated travelers or reviews |
| R10 | **Typecheck is red on main** | Fix first (step 0) |
| R11 | **Migration runs on deploy** | Migration in its own PR, merged only with explicit approval |
| R12 | **Route naming.** The brief says `/my-trips/saved`; the site already uses `/mytrip` and 301s `/trips` to it | Use `/mytrip/saved` to avoid a third name (open question Q2) |

Dependencies (documented, not blocking):
- **Photo uploads** need object storage (Vercel Blob is the lowest-friction fit for this stack; S3/R2 also work). Needs an account decision and a token. Until then, cover images come from `utils/destination-photos.ts`.
- **Keycloak** in production (`auth.gotravelnha.com`) for the IAM migration.
- **Email provider** capacity (SMTP via nodemailer exists) for Phase 4 notifications and digests.
- **Agoda, Booking.com, Traveloka**: only after partner approval; no APIs are assumed. `pages/agoda/` and `pages/bookingcom.vue` exist but no integration was verified.

## 9. Pages and navigation

| Route | Rendering | Index |
| --- | --- | --- |
| `/community` | SSR, `swr` 600 in prod (no viewer-specific data in HTML) | yes, in sitemap |
| `/community/trips/[slug]` | SSR | `PUBLIC`: index, in sitemap, `TravelAction`/`Trip` JSON-LD only for accurate fields. `UNLISTED`: `noindex`, not in sitemap |
| `/travelers/[handle]` | SSR | index if the profile has ≥1 public trip, else `noindex` |
| `/community/following` | client | noindex |
| `/mytrip/saved` | client, `middleware: 'auth'` | noindex (covered by `/mytrip/**`) |
| `/mytrip/[id]` | existing; add "Publish to community" + attribution | noindex |
| `/user/profile` (or a section of `/user`) | edit public profile | noindex |
| `/admin/community` | admin layout | noindex |

Navigation: add **Community** to `navItems` in `layouts/default.vue` between Explore and the planner, behind the feature flag. Footer gets the same item.

UI: built from the existing patterns (`font-brand`, `btn-primary`/`btn-secondary`, `#101D3A` / `#008A9B` palette, rounded-2xl cards, `ItineraryView`). New components in `components/community/`: `TripCard`, `TripFilters`, `CreatorChip`, `SaveButton`, `FollowButton`, `ShareMenu`, `CommentList`, `PublishSheet`, `AdaptBanner`. Every string in `locales/{en,vi,zh}/community.ts`.

On a trip page the primary action is **Customize with AI**; secondary actions are Save, Share, Follow and View booking options (the existing verified-price partner buttons plus 3–6 `recommendActivities` results, under a short affiliate disclosure).

## 10. Analytics and measurement plan

All events go through `useFunnel().track()` into `UserActivity`. Payloads carry ids and coarse labels only (trip id, destination city, placement), never party details, names, comments or dates.

| Event | When | Data |
| --- | --- | --- |
| `community_page_view` | `/community` mounted (once) | filter keys in use |
| `itinerary_view` | trip page mounted (once) | tripId, destination, source (`community`, `profile`, `feed`, `external`) |
| `itinerary_save` | save succeeds | tripId, placement |
| `itinerary_share` | share menu action | tripId, channel |
| `itinerary_customize_start` | Customize clicked | tripId, placement |
| `itinerary_customize_complete` | adapted plan generated | tripId (source), generation id |
| `itinerary_publish` | publish succeeds | tripId, visibility |
| `creator_follow` | follow succeeds | followee handle |
| `affiliate_click` | already recorded as `AffiliateClickEvent` with placement `community_trip` and `metadata.publishedTripId`; not duplicated in `UserActivity` (existing rule in `useFunnel`) | |

Funnel (weekly, admin analytics page + SQL):
1. Discovery → view: sessions with `community_page_view` that also have `itinerary_view`.
2. View → customize: `itinerary_customize_start` / `itinerary_view` sessions; completion from `ItineraryGeneration.sourceTripId`.
3. Customize → saved: `Trip.adaptedFromId` not null / generations with `sourceTripId`.
4. Saved → return: users with a `SavedTrip` who have a session ≥ 7 days later.
5. Engagement → affiliate: `AffiliateClickEvent` with placement `community_trip` / `itinerary_view` sessions.

## 11. Security and privacy checklist

- [ ] New trips and `PublishedTrip` default to `PRIVATE`; `PUBLIC` requires an explicit choice plus a confirmation checkbox in the publish sheet.
- [ ] Publish snapshot strips names, exact dates, budget amount and notes; preview is mandatory.
- [ ] Child information is limited to opt-in age bands; never names, photos of children (no uploads in Phase 1), schools or locations.
- [ ] Profiles show country at most; no city, address or "travelling now".
- [ ] Every write handler: `requireUser` + ownership in the `where` clause; admin actions behind the existing `/api/admin` guard.
- [ ] `PRIVATE` trips return 404 (not 403) to non-owners.
- [ ] zod validation and length limits on every input; plain-text rendering; no `v-html`.
- [ ] `Origin` check on mutating `/api/community/**`.
- [ ] Rate limits: per-IP in-memory plus per-user DB caps on comments, reports, follows.
- [ ] Reports queue, admin hide/restore, profile suspension; hidden content returns 404 and leaves the sitemap.
- [ ] Caching: viewer state never rendered into cached HTML; non-public responses `Cache-Control: private, no-store`.
- [ ] noindex on unlisted, private, empty-profile and account pages; robots and sitemap updated.
- [ ] Affiliate links only via `/api/affiliate/click` and `isApprovedPartnerUrl`; no prices except verified supplier prices; disclosure next to booking options.
- [ ] Account deletion cascades to profile, trips, saves, follows; comments become "deleted user".
- [ ] No secrets in `runtimeConfig.public`.

## 12. Prioritized implementation plan

Each step is a vertical slice that ends with typecheck, build and tests passing, and a short summary.

**Step 0 — Groundwork (done 2026-10-17)**
- Fixed the 8 template parse errors, plus 5 type errors they had been hiding (`pages/attractionsg/[slug].vue`, `pages/explore/index.vue`, `pages/guides/index.vue`). `npm run typecheck` and `npm run build` pass.
- `npm test` runs every `scripts/*.test.ts` with `node:test` + `tsx` (no new dependency).
- `NUXT_PUBLIC_ENABLE_COMMUNITY` (default off), read with `communityEnabled()` from `utils/feature-flags.ts`.

**Step 1 — Schema (built 2026-10-17 on `feat/community-schema`; needs approval before merge)**
- Migration `prisma/migrations/20261017120000_social_community`: additive only (5 enums, 6 tables, 3 nullable columns, indexes, foreign keys) plus hand-written CHECK constraints (handle format, duration 1–30, month 1–12, non-negative counters, no self-parent, no self-follow, comment length 1–2000).
- Differences from the §4 sketch: visibility and moderation states are enums (`TripVisibility`, `ContentStatus`, `CommentKind`, `ReportTarget`, `ReportStatus`); `Follow.followerId` is a `User`, so following does not require a public profile; `TripComment.authorId` is nullable and set to null when the account is deleted; `ItineraryGeneration.sourceTripId` and `Trip.adaptedFromId` are real foreign keys (`SET NULL`).
- Verified on disposable databases: full history applies to an empty database with no schema drift, and the migration applies on a copy of the dev data without changing existing rows. `scripts/community-schema.test.ts` covers the constraints and delete behaviour; it runs only when `COMMUNITY_TEST_DATABASE_URL` points to a disposable migrated database and is skipped otherwise.

**Step 2 — Publish + public trip page (built 2026-10-17, behind the flag)**
- `server/services/community/sanitize.ts`: replaces traveller and owner names in every text field with neutral words in the plan's language ("the kids", "các bé", "孩子们"), drops dates (Day 1..N), emails and phone numbers. Names under 3 letters (2 for Chinese) are flagged for the author instead of replaced.
- Services `community/trips.ts`, `community/profile.ts`, `community/slug.ts`; `server/middleware/community-guard.ts` (flag gate + Origin check).
- Publish sheet on `/mytrip/[id]` (`components/community/PublishSheet.vue`): profile on first use, preview, flagged names, visibility with confirmation for Public.
- `/community/trips/[slug]`: SSR without the visitor's session (cacheable for public trips: `s-maxage=60`), author view loaded in the browser, noindex + `x-robots-tag` + `private, no-store` for anything not public, canonical, OG, `Trip` JSON-LD for public trips only, sitemap, city map, booking options with disclosure. "Customize with AI" links to `/planner?adapt=<slug>` (wired in Step 3).
- Tests: `scripts/community-sanitize.test.ts` (13), `scripts/community-publish.test.ts` (10, test database). Checked end to end over HTTP against a disposable database.

**Step 4 — Discovery + community-first home (built 2026-10-17, ahead of Step 3, behind the flag)**
- `/community`: search and filters (country, length, budget, pace, family-friendly, sort) in the URL; curated rows (trending, family-friendly, recent, popular destinations) with a single-grid fallback under 8 trips and an empty state with "Share one of my trips" / "Plan a trip with AI"; filtered views are `noindex, follow` with `/community` canonical; keyset cursor pagination (`GET /api/community/trips`, `GET /api/community/destinations`).
- Home (`/explore`) with the flag on: community-first hero ("Real family itineraries. Make them yours with AI.") with Browse trips / Plan with AI tabs, Trending family trips (or the empty state), Discover → Customize → Book steps, destination tiles linking to community trips, a share-your-trip band, new meta title and description. With the flag off the page is unchanged.
- Nav: Community item after Explore. Sitemap: `/community`.
- Tests: `scripts/community-discovery.test.ts` (8).
- Launch order: Step 3 must ship before the flag goes on in production, because the hero's main promise is customizing with AI.

**Step 3 — Customize with AI**
- `adaptFrom` in `/api/planner/itinerary` and `generateItinerary`; planner page `?adapt=` flow; `Trip.adaptedFromId`; attribution on `/mytrip/[id]` and the source page.

**Step 4 — Discovery**
- `/community` (featured, popular destinations, family-friendly, recent, most saved, search + filters), `TripCard`, cursor pagination.

**Step 5 — Save + profiles**
- Save/unsave, `/mytrip/saved`, `/travelers/[handle]`, profile editing.

**Step 6 — Comments, reports, moderation**
- Comments with pagination and spam limits; reports; `/admin/community`.

**Step 7 — Follow + following feed**

**Phase 2 — Collaboration** (after MVP shows usage): `TripCollaborator` (owner/editor/viewer) on `Trip`, invite by email link, optimistic-concurrency edits with `updatedAt` checks, activity suggestions and votes, shared notes, change history table. Plain HTTP + polling; no WebSockets.

**Phase 3 — Affiliate provider architecture**: extract the Trip.com/Klook logic in `affiliate-link.service.ts` into provider adapters (`buildLink`, `approvedHosts`, `config`) behind the same `buildAffiliateLink` signature, so existing callers and tests do not change. New providers are config + adapter, added only after approval.

**Phase 4 — Engagement**: notifications for comments and new trips from followed creators, opt-in weekly digest (reusing newsletter unsubscribe tokens), related itineraries (same destination + similar duration), creator stats, generated OG images.

### Testing approach

No new test framework. `node:test` + `tsx`, matching `scripts/affiliate-handoff.test.ts`:
- Pure unit tests: sanitizer, slug generation, filter parsing, cursor encoding, adaptation prompt assembly.
- Authorization tests for service functions against a disposable local Postgres (`DATABASE_URL` pointing to a test database, never production): non-owner edit/delete, private trip read, duplicate save, self-follow, hidden content.
- Manual verification script for the journey publish → discover → customize → save, run with `npm run dev`.

## 13. Open questions for review

1. **Publish model**: snapshot (recommended) vs. live view of the private trip?
2. **Saved trips URL**: `/mytrip/saved` (recommended, consistent with the existing route) or `/my-trips/saved` as in the brief?
3. **Children in public trips**: opt-in age bands (recommended), only a "family-friendly" flag, or exact ages?
4. **Photo uploads**: approve Vercel Blob (or another store) now, or defer and use destination photos for the MVP (recommended)?
5. **Comment moderation**: post immediately with report + admin hide (recommended), or hold first comments from new accounts for review?
6. **Seed content**: will the team write the first 10–20 itineraries under a clearly labelled GoTravelNha profile?
