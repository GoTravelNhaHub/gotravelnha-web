# Implementation plan

Positioning: **AI trip planner for family holidays.** GoTravelNha helps families decide what to do, when, and how to organise the trip. Trip.com and Klook handle the bookings.

The previous plan (price comparison, promo codes, price alerts) is archived in `docs/ARCHIVED/IMPLEMENTATION_PLAN_price_comparison.md`. Price comparison was retired once the crawlers stopped producing fresh prices.

## Done

- `/explore` leads with the planner prompt ("Plan my trip"); partner deal search is the secondary action.
- `/planner` accepts `?prompt=` from the home page; example trips and one-click changes (cheaper, kid-friendly, less walking, food) were already in place.
- `/compare` and `/search` redirect to `/explore`; copy on the retired compare page no longer claims savings.
- Sitemap lookups run independently, so one failing query no longer drops every dynamic URL.
- Planner error screen has a "Try again" button.
- Shared trip links carry `utm_source=shared_trip&utm_medium=<channel>`, so clicks and bookings from shares show as their own channel; "Plan your own" starts the planner with source `shared_trip`.
- Guide template at `/guides/[slug]` (content in `utils/destination-guides.ts`), with a Tokyo draft.
- Funnel events: `landing_viewed`, `planner_started`, `ai_itinerary_generated`, `ai_itinerary_failed`, `ai_itinerary_retried`, `trip_saved`, `trip_shared`, plus partner clicks.

## Next

### Trust and reliability
- [ ] Check the sitemap in production lists the dynamic URLs; read the Vercel log for the failing lookup.
- [ ] Walk the planner → save → share journey on mobile and desktop.
- [ ] Check planner failure and timeout handling (functions allow up to 120 s); add retry and progress states where missing.
- [ ] Verify Trip.com and Klook deeplinks from planner output.
- [ ] Measure the mobile cost of the partner widgets on `/trip`.

### Acquisition
- [ ] Review the Tokyo draft, add checked costs, remove `draft`. Then write 4 more guides (for example Seoul, Bangkok, Bali, Osaka): original advice, a sample itinerary, rough costs, FAQs, and a "customise with AI" button. Quality over volume.
- [ ] Offer a useful newsletter lead magnet (for example a family packing checklist) instead of "offers".

### Validation
- [ ] Recruit 15–20 families to test.
- [ ] Track: planner completion 60%+, completed plans saved or shared 20%+, planner users clicking a booking link 10%+, zero critical save or booking bugs. These are starting targets, not industry benchmarks.

## Rules for new work

- Keep estimated costs visibly separate from live partner prices.
- Do not claim savings or "lowest price" unless the products, dates, currency and inclusions match.
- Confirm real visitors can discover, understand and use the planner before adding another major feature.
