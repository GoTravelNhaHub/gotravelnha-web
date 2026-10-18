# Community visual specification

Status: Phase 0 deliverable, 2026-10-18. Measured from the approved references with pixel sampling, not estimated by eye.

| Brief name | File in the repo | Authority for |
| --- | --- | --- |
| Reference A, `community-homepage.png` | `design-references/GoTravelNha Travel Community Dashboard.png` (1536 × 1024) | `/community` (and later `/`) |
| Reference B, `community-full-experience.png` | `design-references/GoTravelNha Travel Community Mockup.png` (1536 × 1024 collage) | Itinerary detail, AI customization, Trip.com/Klook blocks, mobile |

The brief's file names do not exist; the table maps them. Reference B's small homepage (top left of the collage) is ignored for the homepage.

Reference A is a 1:1 desktop frame, so its numbers are CSS pixels at a 1536px viewport. Reference B is a collage of scaled frames; its numbers are **proportions**, converted to target CSS sizes where stated (see §9 for how they are verified).

Already implemented and verified (see `design-references/renders/`): tokens, header, rail, hero, tabs, feed card, sidebar, responsive shell. This document is the contract for later changes and for Reference B pages.

---

## 1. Design tokens

Defined in `tailwind.config.js` (`cm.*`, `brand.*`, `shadow-cm-*`, `rounded-cm*`) and `assets/css/tailwind.css` (`.cm-btn-primary`, `.cm-btn-outline`, `.cm-card`).

### Colour (sampled dominant values)

| Token | Hex | Where it was measured |
| --- | --- | --- |
| `cm-primary` | `#0066E4` | Filled buttons (View Itinerary, Start Planning, Publish a Trip) |
| `cm-primary-hover` | `#0057C8` | Hover, derived (−8% L) |
| `cm-active` | `#0642D2` | Active nav, active tab, "See all", Follow text |
| `cm-brand` | `#0055D9` | "GoTravelNha" wordmark |
| `cm-ink` | `#0A1024` | Titles, names, card headings |
| `cm-body` | `#2B3245` | Descriptions, nav labels |
| `cm-muted` | `#7E8496` | Meta rows, timestamps |
| `cm-subtle` | `#A2A8B4` | Placeholders, secondary meta |
| `cm-line` | `#E6EBF3` | Card borders, dividers |
| `cm-soft` | `#EAF2FC` | Active rail item, Follow button |
| `cm-panel` | `#E4F0FC` | Promo panels (Start Planning, Publish a Trip) |
| `cm-search` | `#EFF4FB` | Header search field |
| `cm-canvas` | `#F7F9FD` | Page background |
| `cm-heart` | `#E0476A` | Heart icon |
| Reference B: Trip.com accent | `#0068FC` ≈ `cm-primary` | Trip.com panel title, buttons; panel border `#CCE0FC` |
| Reference B: Klook accent | `#FC6008` | Klook panel title, buttons; panel border `#FCE0D0` |
| Reference B: Family-friendly badge | `#0CC0A8` | Badge on the detail gallery |
| Reference B: timeline marker | `#0060FC` | Day dots and line |

### Typography

One family: **Inter** (400, 500, 600, 700, 800), loaded in `nuxt.config.ts`. Sizes measured from cap height × 1.37.

| Role | Size / line | Weight | Colour |
| --- | --- | --- | --- |
| Wordmark | 22.5px | 700, −0.025em | `cm-brand` |
| Tagline "Dream. Plan. Travel" | 14.5px | 500 | `#30425A` |
| Header nav | 16px | 500 (active 600) | `cm-body` / `cm-active` |
| Rail item | 16px / 44px row | 500 (active 600) | `cm-body` / `cm-active` |
| Hero title | 39px / 48px | 700, −0.02em | white, text-shadow |
| Hero subtitle | 23px / 28px | 600 | white |
| Hero chips | 15px | 400 (active 500) | `#1F2638` |
| Feed tabs | 16px | 500 (active 600) | `#3B4560` / `cm-active` |
| Card creator name | 15.5px | 600 | `cm-ink` |
| Card meta | 12.5px | 400 | `cm-muted` |
| Card title | 18.5px / 24px | 700 | `cm-ink` |
| Card description | 14.5px / 19px, 2 lines max | 400 | `cm-body` |
| Card facts and counts | 14–15px | 400 | `cm-body` |
| Card buttons | 14.5px (filled), 13px (outline) | 600 | white / `cm-active` |
| Sidebar heading | 19px | 700 | `cm-ink` |
| Sidebar "See all" | 14.5px | 500 | `cm-active` |
| Promo heading | 17.5–18.5px / 23px | 700 | `#0B2A86` (rail) / `cm-ink` (sidebar) |

### Radius, borders, shadows

| Element | Radius | Border | Shadow |
| --- | --- | --- | --- |
| Feed card, sidebar card (`.cm-card`) | 18px | 1px `cm-line` | `shadow-cm-panel`: `0 1px 3px rgba(16,32,72,.05), 0 10px 28px -12px rgba(16,32,72,.12)` |
| Hero banner | 16px | none | `shadow-cm-card` |
| Card photo | 12px | none | none |
| Destination tile | 10px | none | none |
| Rail active item | 12px | none | none |
| Buttons, chips, search fields | full pill | outline: 1px `#CFE0F7` | filled: `shadow-cm-button` `0 6px 14px -6px rgba(0,102,228,.55)` |
| Header | none | bottom 1px `#EEF2F8` | `0 2px 12px -8px rgba(16,32,72,.18)` |

---

## 2. Desktop grid (Reference A, 1536 × 1024)

```
| 26 | rail 198 | 18 | feed 917 | 18 | sidebar 333 | 26 |
```

- Header: 82px tall. Logo at x 28 (plane 44 × 36); wordmark text from x 80. Search field x 265–800 (535 × 42). Nav items start at x 944, 17px horizontal padding each; active underline 3px, 17px above the header's bottom edge. Bell at x 1413; avatar 42–44px, ending 34px from the right edge.
- Rail: first row centre y 124; 45px row pitch; icon at x 38 (22px), label at x 79. "Start Planning" card y 448–697 (198 × 249).
- Hero: y 83–296 (213px tall), 1px below the header. Title starts x 285 (43px inset), top 45px into the banner. Search pill 233 × 44, 36px from the left and 24px from the bottom. Chips 39px tall, 10px gaps.
- Tabs: text centre y 328; underline y 348–351 under the active tab, width = label + 2 × 21px. 1px divider across the feed.
- Feed: first card at y 370. Card = 14px inner padding, photo 356px wide (38.9%) and 206–218px tall, text column from photo + 21px, button column 147px wide at the right. Filled button 36px tall, outline button 41px, 11px apart. Bookmark icon top right. 8px between cards.
- Sidebar: Popular Destinations card y 98–482: 2 × 2 tiles of 145 × 128–136px, 14px column gap, label 15px under each tile. Top Travel Creators y 502–745: 46px avatars, 65px row pitch, Follow pill 72 × 34. Publish a Trip y 765–986 with plane icon, skyline art and 160 × 38 button.

### Changes the brief makes to Reference A (to confirm)

| Brief item | Reference A has | Proposed treatment |
| --- | --- | --- |
| Hero title "Discover Real Trips. Create Yours with AI." | "GoTravelNha Community" | Same slot and style. At 39px it is about 840px wide, too wide for the 917px banner with 43px insets, so the title drops to 34px/42px at ≥1280px |
| Hero text "Explore journeys shared by travelers…" (112 characters) | "Real trips. Better adventures." (1 line) | 17px/24px, max 2 lines, max-width 640px. Banner grows from 213px to about 236px so the chips row keeps its 24px bottom margin. The only proportion change on the page |
| "Where would you like to go next?" with Plan with AI and Share a Trip | Not present | A 64px `.cm-card` row between tabs and the first card: avatar (or plane icon), prompt as a pill input that opens the planner, two buttons on the right. Feed shifts down 72px; nothing else moves |
| Rail: Home/Feed, Explore, AI Planner, My Trips, Saved, Following, Notifications | Home, Community, AI Planner, My Trips, Saved, Following, Notifications | Home/Feed → the community feed; Explore → `/explore`. Same icons, 7 rows. The "Booking partners" group added in this branch stays below them |

---

## 3. Responsive behaviour (implemented)

| Width | Layout |
| --- | --- |
| ≥ 1280 (`xl`) | Three columns as §2. Rail is sticky under the header |
| 1024–1279 (`lg`) | Rail moves into the menu drawer (menu button in the header). Feed + 300px sidebar. Header search hidden (hero search remains). Vietnam and Budget Travel chips move into "More" |
| 768–1023 (`md`) | One column. Header search visible. Sidebar sections below the feed: destinations in 4 columns, creators and publish side by side |
| < 768 | Reference B mobile frame: header = menu, logo, avatar; no photo hero; search field and scrollable chips; scrollable tabs; stacked cards (creator row, 16:9 photo, text, full-width buttons); fixed bottom tab bar (Home, Community, AI Planner, Saved, Profile), 60px + safe area |

Feed cards switch layouts with **container queries** on the card itself (≥ 800px three-zone desktop, 560–799px photo left with buttons below, < 560px stacked), so the card is correct in any column width.

---

## 4. Itinerary detail page (Reference B, right half)

Frame scale: Reference B's detail frame is 640px wide in the collage. Its header matches Reference A's header at 0.42 scale, so desktop targets ≈ collage px ÷ 0.42.

| Block | Proportion in Reference B | Desktop target |
| --- | --- | --- |
| Breadcrumb (Community › Country › Title) | 13px text, 8px above the gallery | 14px, `cm-muted`, current page `cm-ink` 600 |
| Gallery | Main photo 46% of content width, 4:3; 6 thumbnails below in one row, last one "+N" overlay | Main photo ≈ 560 × 410, 12px radius; thumbnails 72px tall, 6px gaps |
| Badge on photo | "Family Friendly", top left | Teal pill `#0CC0A8`, white 13px 600, star icon. Only when `familyFriendly` is true |
| Title block (right of gallery) | Title 2 lines; summary 2 lines | Title 30px/36px 700 `cm-ink`; summary 16px/24px `cm-body` |
| Creator row | 52px avatar, name + verified, "Country · N published trips · N followers", Follow outline button | Real counts only. No verified tick (no such data) |
| Facts row | pin + country, calendar + days, people + party | Party shown as a band ("Family, kids 6–12") only if the author opted in |
| Tag chips | 6 visible + "+N" | Day themes / places from the published plan; soft grey pills |
| Actions | Save (heart + count), Share, Customize with AI (filled, widest) | Save = bookmark + real save count; Share = existing share menu; Customize opens the §5 modal |
| Section tabs | Overview, Itinerary, Hotels, Activities, Tips, Comments (N) | Underline tabs as on the feed. Scroll-spy anchors, not separate routes |
| Day timeline | Left rail line with blue dots; "Day N – Theme" 18px 700; 3-line description; "View on map" outline pill; day photo 4:5 | Dot `#0060FC` 14px; line 2px `#D6E4FB`. Map opens the existing city-level map (no per-stop pins today) |
| Trip.com block (per day) | Panel, 1px blue border `#CCE0FC`, 14px radius; title "Hotel recommendations (Trip.com)"; "See more hotels on Trip.com →"; 3 cards | See §6 for which fields may be filled |
| Klook block (per day) | Same panel, orange border `#FCE0D0`, title `#FC6008`; 3 cards; orange buttons | See §6 |
| Day photo strip | 3 photos with carousel arrows | Only photos we have rights to (stock destination photos today; uploads later) |

The "Trip.com integration" and "Klook integration" boxes in the collage are annotations. They are not built.

## 5. AI customization modal (Reference B, centre bottom)

- Modal 600px wide on desktop (collage 343px ÷ 0.57 frame scale), 20px radius, `shadow-cm-panel`; bottom sheet under 768px.
- Header: sparkle + "Customize this trip with AI" 20px 700, close button.
- Source card: 140 × 84 cover, title 2 lines 16px 600, "by {creator}" with 24px avatar. Keeps attribution visible.
- "Tell us about your trip": two fields side by side (Travel dates with calendar icon; Travelers with people icon, opening the existing party picker), then Budget (optional), then Interests chips (Kid friendly, Food, Culture, Less walking; multi-select, selected = `cm-soft` with `cm-active` text).
- Primary: full-width filled button "Generate My Custom Itinerary →", 52px.
- Fields map to the existing planner `TripRequest`; children's ages come from the family profile when signed in.

## 6. Partner recommendation cards: honesty rules

Reference B's cards show hotel names, nightly prices, star ratings and review counts. **There is no Trip.com hotel feed**, and Klook data exists only for offers stored in `AffiliateOffer`. So cards keep the same shell and fill fields only from verified sources:

| Field | Shown when |
| --- | --- |
| Partner badge (Trip.com / Klook) | Always |
| Specific hotel or activity name | It comes from a stored, approved offer or the supplier catalogue |
| Price ("From S$…", "S$… per night") | A verified price from `resolveActivities` / `AffiliateOffer` with a checked date. Never from the model |
| Rating and review count | Never, until a partner feed provides them |
| Photo | Offer image or a stock destination photo |
| Otherwise | Search card: "Hotels in Shinjuku" / "Things to do in Tokyo", destination photo, "Search on Trip.com" / "See on Klook". No price |

Every button goes through `/api/affiliate/click` with placement `community_trip_day` and the day index. An affiliate disclosure sits under the first partner block of the page.

## 7. Mobile booking sheet (Reference B, right phone)

Bottom sheet, 24px top radius, drag handle. Title "Book for your trip", close. Segmented tabs "Hotels (Trip.com)" / "Activities (Klook)". List rows: 110 × 110 photo with partner badge, name, meta, price only per §6, full-width button in the partner colour (blue / `#FC6008`). Opened from a sticky "Book this trip" bar on the detail page under 768px.

## 8. Mobile feed (Reference B, left phone)

Matches §3 < 768. Card: creator row (36px avatar, name, "2 days ago · Family Trip", bookmark), photo 16:9 with 12px radius, title 16px 700, description 2 lines, facts, counts, full-width "View Itinerary →". The "Customize with AI" outline button sits under it (Reference B hides it; kept because it is the product's main action. Confirm).

---

## 9. Data honesty in the visual layer

- Counts shown: saves, comments, "customized N times" (all stored). **No heart/like count**: the app has no likes. Reference A's heart is shown only on cards labelled "Demo" (`NUXT_PUBLIC_COMMUNITY_DEMO`, off by default).
- No verified tick, no "Featured" ribbon on real content (no data for either).
- Creator avatars: the user's own avatar or initials. No stock photos of people.
- Editorial sample itineraries, when added, carry an "Editorial sample" label on the card and the page.

## 10. Verification method

1. `NUXT_PUBLIC_COMMUNITY_DEMO=true npm run dev`, Playwright at 1536 × 1024 (and 1024, 768, 390), Nuxt devtools hidden, fonts and images awaited.
2. Side-by-side and 50% blend against the reference crop; measure edges with pixel sampling, not by eye.
3. Reference B frames: render the page at 1536, downscale to the collage frame width (640px for the detail page) and compare against the crop at the same scale.
4. Check `document.documentElement.scrollWidth === viewport` at every width (no horizontal scroll).
5. Record what still differs and why, in the milestone summary.
