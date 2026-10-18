<template>
  <!-- Itinerary detail, after design-references/GoTravelNha Travel Community Mockup.png (right half).
       Spec: docs/community-visual-spec.md §4–§7 -->
  <div class="pb-24 font-brand md:pb-14">
    <div v-if="!trip" class="cm-card px-6 py-14 text-center">
      <p class="text-[18px] font-bold text-cm-ink">{{ t('community.trip.notFoundTitle') }}</p>
      <p class="mx-auto mt-1 max-w-sm text-[14px] leading-[22px] text-cm-muted">{{ t('community.trip.notFoundText') }}</p>
      <NuxtLink to="/planner" class="cm-btn-primary mx-auto mt-5 h-11 px-6 text-[15px]">{{ t('community.trip.planOwn') }}</NuxtLink>
    </div>

    <template v-else>
      <!-- Only the author sees this -->
      <div v-if="viewerIsAuthor" class="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-5 py-3 print:hidden" :class="ownerNote.classes" role="status">
        <p class="text-[14px]">{{ ownerNote.text }}</p>
        <NuxtLink v-if="manageLink" :to="manageLink" class="text-link text-[14px]">{{ t('community.trip.manage') }}</NuxtLink>
      </div>

      <nav class="text-[14px] text-cm-muted" :aria-label="t('community.detail.breadcrumb')">
        <ol class="flex flex-wrap items-center gap-x-2 gap-y-1">
          <li><NuxtLink to="/community" class="hover:text-cm-active">{{ t('community.feed.nav.community') }}</NuxtLink></li>
          <li aria-hidden="true">›</li>
          <li><NuxtLink :to="{ path: '/community', query: placeQuery }" class="hover:text-cm-active">{{ placeName(trip.country || trip.destination) }}</NuxtLink></li>
          <li aria-hidden="true">›</li>
          <li class="min-w-0 truncate font-semibold text-cm-ink" aria-current="page">{{ trip.title }}</li>
        </ol>
      </nav>

      <!-- Gallery and trip summary -->
      <section class="mt-4 grid gap-6 lg:grid-cols-[minmax(0,46%)_minmax(0,1fr)] lg:gap-8 3xl:grid-cols-[minmax(0,40%)_minmax(0,1fr)]">
        <div class="relative aspect-[4/3] overflow-hidden rounded-[14px] bg-[#DCE7F5] shadow-cm-card">
          <img v-if="cover" :src="cover" :alt="t('community.trip.imageAlt', { destination: placeName(trip.destination) })" width="1200" height="900" fetchpriority="high" class="h-full w-full object-cover" />
          <span v-if="trip.familyFriendly" class="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-[#0CC0A8] px-3 py-1.5 text-[13px] font-semibold text-white shadow-sm">
            <CmIcon name="star" :size="14" />
            {{ trip.childAgeBands.length ? t('community.trip.kidsAges', { bands: trip.childAgeBands.join(', ') }) : t('community.trip.familyFriendly') }}
          </span>
        </div>

        <div class="min-w-0">
          <h1 class="text-[26px] font-bold leading-[33px] tracking-[-0.02em] text-cm-ink sm:text-[30px] sm:leading-9">{{ trip.title }}</h1>
          <p v-if="summary" class="mt-3 max-w-[70ch] text-[16px] leading-6 text-cm-body">{{ summary }}</p>

          <div class="mt-5 flex flex-wrap items-center gap-4">
            <CreatorAvatar :name="trip.author.displayName" :src="trip.author.avatarUrl" :size="52" />
            <div class="min-w-0 flex-1 leading-tight">
              <NuxtLink :to="`/travelers/${trip.author.handle}`" class="text-[16px] font-semibold text-cm-ink hover:text-cm-active">{{ trip.author.displayName }}</NuxtLink>
              <p class="mt-1 text-[13.5px] text-cm-muted">
                @{{ trip.author.handle }}<span aria-hidden="true"> · </span>{{ t('community.feed.trips', { count: trip.authorStats.publicTrips }) }}<span aria-hidden="true"> · </span>{{ followers }}
              </p>
            </div>
            <ClientOnly><FollowButton :handle="trip.author.handle" placement="trip_detail" /></ClientOnly>
          </div>

          <ul class="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-[15px] text-cm-body">
            <li class="flex items-center gap-2"><CmIcon name="pin" :size="18" class="text-[#5B6478]" />{{ placeName(trip.destination) }}<span v-if="trip.country && trip.country !== trip.destination" class="text-cm-muted">, {{ placeName(trip.country) }}</span></li>
            <li class="flex items-center gap-2"><CmIcon name="calendar" :size="18" class="text-[#5B6478]" />{{ t('community.feed.card.days', { count: trip.durationDays }) }}</li>
            <li v-if="trip.travelStyle" class="flex items-center gap-2"><CmIcon name="compass" :size="18" class="text-[#5B6478]" />{{ t(`planner.pace.${trip.travelStyle}`) }}</li>
            <li v-if="trip.familyFriendly" class="flex items-center gap-2"><CmIcon name="users" :size="18" class="text-[#5B6478]" />{{ t('community.feed.card.family') }}</li>
          </ul>

          <ul v-if="themes.length" class="mt-4 flex flex-wrap gap-2" :aria-label="t('community.detail.highlights')">
            <li v-for="theme in themes.slice(0, 5)" :key="theme" class="max-w-[260px] truncate rounded-full bg-[#F1F4F9] px-3.5 py-1.5 text-[13.5px] text-cm-body">{{ theme }}</li>
            <li v-if="themes.length > 5" class="rounded-full bg-[#F1F4F9] px-3.5 py-1.5 text-[13.5px] text-cm-body">+{{ themes.length - 5 }}</li>
          </ul>

          <div class="mt-6 flex flex-wrap gap-3 print:hidden">
            <SaveButton v-if="trip.visibility !== 'PRIVATE'" :trip="trip" placement="community_trip" variant="pill" />
            <div v-if="trip.visibility !== 'PRIVATE'" class="relative" data-share-menu>
              <button type="button" class="inline-flex h-12 items-center gap-2 rounded-full border border-[#CFE0F7] bg-white px-5 text-[15px] font-semibold text-cm-ink hover:border-cm-primary" :aria-expanded="shareOpen" @click="shareOpen = !shareOpen">
                <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M12 15V3m0 0L7.5 7.5M12 3l4.5 4.5M5 13v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5" /></svg>
                {{ t('community.trip.share') }}
              </button>
              <div v-if="shareOpen" class="absolute left-0 top-14 z-30 w-[320px] max-w-[85vw] rounded-2xl border border-cm-line bg-white p-3 shadow-cm-panel">
                <ShareButtons :url="canonicalUrl" :title="trip.title" :destination="trip.destination" :trip-id="trip.id" />
              </div>
            </div>
            <button type="button" class="cm-btn-primary h-12 min-w-[220px] flex-1 px-6 text-[15.5px] sm:flex-none" @click="openCustomize('detail_header')">
              <CmIcon name="sparkles" :size="19" />
              {{ t('community.feed.card.customize') }}
            </button>
          </div>
          <p class="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-cm-muted">
            <span v-if="trip.adaptCount">{{ t('community.card.adapted', { count: trip.adaptCount }) }}</span>
            <button v-if="trip.visibility !== 'PRIVATE' && !viewerIsAuthor" type="button" class="font-medium hover:text-cm-ink" @click="reporting = true">{{ t('community.report.actionTrip') }}</button>
          </p>
        </div>
      </section>

      <!-- Section tabs (anchors) -->
      <nav class="scrollbar-hide sticky top-16 z-20 -mx-4 mt-8 flex overflow-x-auto border-b border-cm-line bg-cm-canvas/95 px-4 backdrop-blur sm:-mx-6 sm:px-6 lg:top-[82px] lg:-mx-8 lg:px-8 xl:mx-0 xl:px-0 print:hidden" :aria-label="t('community.detail.sections')">
        <a
          v-for="section in sections"
          :key="section.id"
          :href="`#${section.id}`"
          class="relative flex h-12 shrink-0 items-center px-[18px] text-[15.5px] transition"
          :class="activeSection === section.id ? 'font-semibold text-cm-active after:absolute after:inset-x-0 after:-bottom-px after:h-[3px] after:rounded-full after:bg-cm-primary' : 'font-medium text-[#3B4560] hover:text-cm-ink'"
          @click="activeSection = section.id"
        >
          {{ section.label }}
        </a>
      </nav>

      <section id="overview" class="scroll-mt-[150px] pt-8" aria-labelledby="overview-title">
        <h2 id="overview-title" class="text-[21px] font-bold tracking-[-0.01em] text-cm-ink">{{ t('community.detail.overview') }}</h2>
        <p v-if="trip.description && trip.description !== summary" class="mt-3 max-w-[80ch] whitespace-pre-line text-[15.5px] leading-[25px] text-cm-body">{{ trip.description }}</p>
        <dl class="mt-5 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-4">
          <div class="rounded-xl bg-white px-4 py-3 ring-1 ring-cm-line">
            <dt class="text-[12.5px] text-cm-muted">{{ t('community.detail.length') }}</dt>
            <dd class="mt-0.5 text-[15px] font-semibold text-cm-ink">{{ t('community.feed.card.days', { count: trip.durationDays }) }}</dd>
          </div>
          <div v-if="trip.travelStyle" class="rounded-xl bg-white px-4 py-3 ring-1 ring-cm-line">
            <dt class="text-[12.5px] text-cm-muted">{{ t('community.detail.pace') }}</dt>
            <dd class="mt-0.5 text-[15px] font-semibold text-cm-ink">{{ t(`planner.pace.${trip.travelStyle}`) }}</dd>
          </div>
          <div v-if="trip.budgetLevel" class="rounded-xl bg-white px-4 py-3 ring-1 ring-cm-line">
            <dt class="text-[12.5px] text-cm-muted">{{ t('community.detail.budget') }}</dt>
            <dd class="mt-0.5 text-[15px] font-semibold text-cm-ink">{{ t(`community.budget.${trip.budgetLevel}`) }}</dd>
          </div>
          <div v-if="trip.travelMonth" class="rounded-xl bg-white px-4 py-3 ring-1 ring-cm-line">
            <dt class="text-[12.5px] text-cm-muted">{{ t('community.detail.when') }}</dt>
            <dd class="mt-0.5 text-[15px] font-semibold text-cm-ink">{{ monthName(trip.travelMonth) }}</dd>
          </div>
        </dl>
      </section>

      <section id="itinerary" class="scroll-mt-[150px] pt-10" aria-labelledby="itinerary-title">
        <h2 id="itinerary-title" class="text-[21px] font-bold tracking-[-0.01em] text-cm-ink">{{ t('community.detail.itinerary') }}</h2>
        <p class="mt-1 text-[13.5px] text-cm-muted">{{ t('planner.itinerary.aiNote') }}</p>
        <div class="mt-6">
          <DayTimeline
            v-for="(day, index) in trip.itinerary.days"
            :key="index"
            :day="day"
            :index="index"
            :last="index === trip.itinerary.days.length - 1"
            :suggestions="suggestions[index]"
            :activities="activities"
            :photo="cardPhoto"
            :map-available="!!map"
            placement="community_trip_day"
            @map="mapOpen = true"
            @hotels="openHotels"
            @activities="openKlook(trip.destination)"
            @search="openKlook"
          />
        </div>
        <p v-if="hasSuggestions" class="text-[12.5px] leading-5 text-cm-muted">{{ t('community.trip.disclosure') }}</p>
      </section>

      <section v-if="bookingOptions.length" id="activities" class="scroll-mt-[150px] pt-10" aria-labelledby="activities-title">
        <h2 id="activities-title" class="text-[21px] font-bold tracking-[-0.01em] text-cm-ink">{{ t('community.trip.bookingTitle', { destination: placeName(trip.destination) }) }}</h2>
        <p class="mt-1 text-[14px] text-cm-muted">{{ t('community.trip.bookingText') }}</p>
        <div class="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-4 4xl:grid-cols-5">
          <ActivityCard v-for="activity in bookingOptions" :key="activity.id" :activity="activity" placement-key="community_trip" />
        </div>
        <p class="mt-3 text-[12.5px] text-cm-muted">{{ t('community.trip.disclosure') }}</p>
      </section>

      <section v-if="trip.itinerary.tips.length" id="tips" class="scroll-mt-[150px] pt-10" aria-labelledby="tips-title">
        <h2 id="tips-title" class="text-[21px] font-bold tracking-[-0.01em] text-cm-ink">{{ t('community.detail.tips') }}</h2>
        <ul class="mt-4 max-w-4xl space-y-2.5">
          <li v-for="(tip, index) in trip.itinerary.tips" :key="index" class="flex items-start gap-3 rounded-xl bg-white px-4 py-3 text-[15px] leading-6 text-cm-body ring-1 ring-cm-line">
            <span class="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cm-soft text-cm-primary" aria-hidden="true"><CmIcon name="star" :size="13" /></span>
            {{ tip }}
          </li>
        </ul>
      </section>

      <CommentsSection v-if="trip.visibility !== 'PRIVATE'" :slug="trip.slug" :trip-id="trip.id" :count="trip.commentCount" @count="commentTotal = $event" />
      <ReportDialog :open="reporting" target-type="TRIP" :target="trip.slug" @close="reporting = false" />

      <section class="relative isolate mt-12 overflow-hidden rounded-cm-lg bg-[linear-gradient(135deg,#0A1024_0%,#0B2A86_100%)] p-6 text-white sm:p-10 print:hidden" aria-labelledby="own-title">
        <div class="relative flex flex-wrap items-center justify-between gap-6">
          <div class="max-w-xl">
            <h2 id="own-title" class="text-[24px] font-bold leading-8 tracking-[-0.02em] sm:text-[28px] sm:leading-9">{{ t('community.trip.footerTitle') }}</h2>
            <p class="mt-2 text-[15px] leading-6 text-white/80">{{ t('community.trip.footerText') }}</p>
          </div>
          <button type="button" class="cm-btn-primary h-12 px-6 text-[15px]" @click="openCustomize('detail_footer')">
            <CmIcon name="sparkles" :size="18" />{{ t('community.feed.card.customize') }}
          </button>
        </div>
      </section>

      <!-- Phones: booking and customizing stay one tap away (above the tab bar) -->
      <div class="fixed inset-x-0 bottom-[60px] z-30 flex gap-2 border-t border-cm-line bg-white/95 px-4 py-2.5 backdrop-blur md:hidden print:hidden">
        <button v-if="hasSuggestions" type="button" class="cm-btn-outline h-11 flex-1 text-[14px]" @click="sheetOpen = true">{{ t('community.booking.bookTrip') }}</button>
        <button type="button" class="cm-btn-primary h-11 flex-1 text-[14px]" @click="openCustomize('detail_mobile_bar')">
          <CmIcon name="sparkles" :size="17" />{{ t('community.feed.card.customize') }}
        </button>
      </div>

      <CustomizeModal :open="customizeOpen" :trip="trip" :cover="cardPhoto" :placement="customizePlacement" @close="customizeOpen = false" />
      <BookingSheet :open="sheetOpen" :suggestions="suggestions" :photo="cardPhoto" placement="community_trip_day" @close="sheetOpen = false" @hotels="openHotels" @activities="openKlook(trip.destination)" @search="openKlook" />

      <!-- City-level map: stops are not pinned (no coordinates are stored) -->
      <Teleport to="body">
        <div v-if="mapOpen && map" class="fixed inset-0 z-[80] flex items-center justify-center bg-[#0A1024]/50 p-4 backdrop-blur-sm" @click.self="mapOpen = false">
          <section class="w-full max-w-3xl overflow-hidden rounded-[20px] bg-white font-brand shadow-cm-panel" role="dialog" aria-modal="true" aria-labelledby="map-title" @keydown.esc="mapOpen = false">
            <header class="flex items-center justify-between px-5 py-4">
              <div>
                <h2 id="map-title" class="text-[17px] font-bold text-cm-ink">{{ t('community.trip.mapTitle') }}</h2>
                <p class="text-[13px] text-cm-muted">{{ t('community.trip.mapCaption', { destination: placeName(map.city) }) }}</p>
              </div>
              <button type="button" class="flex h-10 w-10 items-center justify-center rounded-full text-cm-muted hover:bg-cm-canvas" :aria-label="t('community.customize.close')" @click="mapOpen = false"><CmIcon name="close" :size="20" /></button>
            </header>
            <iframe :src="map.src" :title="t('community.trip.mapCaption', { destination: placeName(map.city) })" loading="lazy" referrerpolicy="no-referrer" class="h-[60vh] max-h-[520px] w-full border-0"></iframe>
          </section>
        </div>
      </Teleport>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ActivityCard from '~/components/planner/ActivityCard.vue'
import CmIcon from '~/components/community/feed/CmIcon.vue'
import CreatorAvatar from '~/components/community/feed/CreatorAvatar.vue'
import SaveButton from '~/components/community/SaveButton.vue'
import FollowButton from '~/components/community/FollowButton.vue'
import CommentsSection from '~/components/community/CommentsSection.vue'
import ReportDialog from '~/components/community/ReportDialog.vue'
import ShareButtons from '~/components/community/ShareButtons.vue'
import BookingSheet from '~/components/community/detail/BookingSheet.vue'
import CustomizeModal from '~/components/community/detail/CustomizeModal.vue'
import DayTimeline from '~/components/community/detail/DayTimeline.vue'
import type { LiveActivity, RecommendedActivity } from '~/types/trip'
import type { PublishedTripView } from '~/types/community'
import { communityEnabled } from '~/utils/feature-flags'
import { daySuggestions, klookSearchUrl } from '~/utils/community-booking'
import { canonicalSiteOrigin } from '~/utils/site-origin'
import { destinationPhoto } from '~/utils/destination-photos'
import { plannerMapFor } from '~/utils/planner-map'
import { resolveAbsoluteOgImage } from '~/utils/socialPreview'

interface TripResponse {
  data: PublishedTripView
  viewerIsAuthor: boolean
  sourceTripId: string | null
  activities: Record<string, LiveActivity>
}

const config = useRuntimeConfig().public
if (!communityEnabled(config)) {
  throw createError({ statusCode: 404, statusMessage: 'Not found', fatal: true })
}

const route = useRoute()
const router = useRouter()
const slug = String(route.params.slug || '')
const siteOrigin = canonicalSiteOrigin(config.siteUrl)
const canonicalUrl = `${siteOrigin}/community/trips/${slug}`
const { t, placeName, localeTag, locale } = useI18n()
const { track } = useFunnel()
const { isAuthenticated } = useAuthState()
const { loadState } = useSavedTrips()
const { loadState: loadFollows, followersOf } = useFollows()
const { load: loadProfile } = useOwnProfile()
const { openSearch } = usePartnerSearch('community_trip_day')

// The server render never reads the visitor's session, so its HTML is the same for everyone
// and can be cached for public trips. An author's own private trip loads in the browser.
// `false` for a missing trip: useAsyncData treats null as "not loaded" and would fetch again in the browser
const { data: loaded } = await useAsyncData(`community-trip-${slug}`, () =>
  $fetch<TripResponse>(`/api/community/trips/${encodeURIComponent(slug)}`).catch(() => false as const)
)
const data = computed(() => loaded.value || null)
const authorView = ref<TripResponse | null>(null)
const response = computed(() => authorView.value ?? data.value)
const trip = computed(() => response.value?.data ?? null)
const activities = computed(() => response.value?.activities ?? {})
const viewerIsAuthor = computed(() => authorView.value?.viewerIsAuthor ?? false)
const bookingOptions = ref<RecommendedActivity[]>([])
const manageLink = ref('')

const isPublic = computed(() => trip.value?.visibility === 'PUBLIC' && trip.value.status === 'ACTIVE')

if (import.meta.server) {
  const event = useRequestEvent()
  if (!data.value && event) setResponseStatus(event, 404)
  // Public trips may sit in the edge cache for a minute after being unpublished; nothing else is cached
  useResponseHeader('cache-control').value = isPublic.value ? 'public, s-maxage=60, stale-while-revalidate=300' : 'private, no-store'
  if (!isPublic.value) useResponseHeader('x-robots-tag').value = 'noindex, nofollow'
}

const cover = computed(() => (trip.value ? destinationPhoto(trip.value.destination, 1400) ?? trip.value.coverImage : null))
const cardPhoto = computed(() => (trip.value ? destinationPhoto(trip.value.destination, 480) ?? trip.value.coverImage : null))
const summary = computed(() => trip.value?.itinerary.summary || trip.value?.description || '')
const themes = computed(() => (trip.value?.itinerary.days ?? []).map((day) => day.theme).filter(Boolean))
const placeQuery = computed(() => (trip.value?.country ? { country: trip.value.country } : { destination: trip.value?.destination ?? '' }))
const map = computed(() => (trip.value ? plannerMapFor(trip.value.destination) : null))
const followers = computed(() => {
  const count = trip.value ? followersOf(trip.value.author.handle, trip.value.authorStats.followers) : 0
  return t('community.feed.followers', { count: count === 1 ? 1 : new Intl.NumberFormat(localeTag.value, { notation: 'compact' }).format(count) })
})

// Booking suggestions per day (honesty rules in utils/community-booking.ts). None on private trips.
const suggestions = computed(() =>
  trip.value && trip.value.visibility !== 'PRIVATE'
    ? daySuggestions(trip.value.itinerary.days, activities.value, trip.value.destination)
    : (trip.value?.itinerary.days ?? []).map((_, index) => ({ day: index + 1, hotels: null, activities: [] }))
)
const hasSuggestions = computed(() => suggestions.value.some((day) => day.hotels || day.activities.length))

const sections = computed(() => {
  const value = trip.value
  if (!value) return []
  return [
    { id: 'overview', label: t('community.detail.overview') },
    { id: 'itinerary', label: t('community.detail.itinerary') },
    ...(suggestions.value[0]?.hotels ? [{ id: 'hotels', label: t('community.detail.hotels') }] : []),
    ...(bookingOptions.value.length ? [{ id: 'activities', label: t('community.detail.activities') }] : []),
    ...(value.itinerary.tips.length ? [{ id: 'tips', label: t('community.detail.tips') }] : []),
    ...(value.visibility !== 'PRIVATE' ? [{ id: 'comments', label: t('community.detail.comments', { count: commentTotal.value ?? value.commentCount }) }] : [])
  ]
})
const activeSection = ref('overview')
const commentTotal = ref<number | null>(null)
const reporting = ref(false)

const monthName = (month: number) =>
  new Intl.DateTimeFormat(localeTag.value, { month: 'long', timeZone: 'UTC' }).format(new Date(Date.UTC(2000, month - 1, 1)))

const ownerNote = computed(() => {
  const value = trip.value
  if (value?.status === 'HIDDEN') return { text: t('community.trip.ownerHidden'), classes: 'border-[#FDE68A] bg-[#FFFBEB] text-[#78350F]' }
  if (value?.visibility === 'PRIVATE') return { text: t('community.trip.ownerPrivate'), classes: 'border-cm-line bg-white text-cm-body' }
  if (value?.visibility === 'UNLISTED') return { text: t('community.trip.ownerUnlisted'), classes: 'border-cm-line bg-white text-cm-body' }
  return { text: t('community.trip.ownerPublic'), classes: 'border-[#CFE0F7] bg-cm-soft text-cm-active' }
})

// Customize with AI
const customizeOpen = ref(false)
const customizePlacement = ref('detail_header')
const openCustomize = (placement: string) => {
  if (!trip.value || trip.value.visibility === 'PRIVATE') return
  customizePlacement.value = placement
  customizeOpen.value = true
  // The feed card already counted its click
  if (placement !== 'feed_card') track('itinerary_customize_start', { tripId: trip.value.id, placement })
}

// Partner searches: tracked through /api/affiliate/click, no prices shown here
const klookPath = computed(() => ({ en: 'en-SG', vi: 'vi', zh: 'zh-CN' } as const)[locale.value])
const openKlook = (query: string) => {
  if (trip.value) openSearch('klook', klookSearchUrl(klookPath.value, query), 'activity', { destination: trip.value.destination, tripId: trip.value.id })
}
const openHotels = () => {
  const hotels = suggestions.value.find((day) => day.hotels)?.hotels
  if (hotels && trip.value) openSearch('trip', hotels.url, 'hotel', { destination: trip.value.destination, tripId: trip.value.id })
}

const sheetOpen = ref(false)
const mapOpen = ref(false)
const shareOpen = ref(false)
const closeShare = (event: MouseEvent) => {
  if (shareOpen.value && !(event.target as HTMLElement).closest('[data-share-menu]')) shareOpen.value = false
}

onMounted(async () => {
  document.addEventListener('click', closeShare)
  if (isAuthenticated.value) {
    // Same request with the session cookie: tells an author it is their trip, and loads it when private
    authorView.value = await $fetch<TripResponse>(`/api/community/trips/${encodeURIComponent(slug)}`).catch(() => null)
    if (authorView.value?.viewerIsAuthor) {
      manageLink.value = authorView.value.sourceTripId ? `/mytrip/${authorView.value.sourceTripId}` : '/mytrip'
    }
  }
  if (!trip.value) return

  track('itinerary_view', { tripId: trip.value.id, destination: trip.value.destination }, true)
  loadState([trip.value.id])
  loadFollows([trip.value.author.handle])
  loadProfile()

  // Feed cards link here with ?customize=1 to open the form straight away
  if (route.query.customize === '1') {
    const { customize: _drop, ...rest } = route.query
    router.replace({ query: rest })
    openCustomize('feed_card')
  }

  if (trip.value.visibility !== 'PRIVATE') {
    try {
      const options = await $fetch<{ data: RecommendedActivity[] }>(`/api/community/trips/${encodeURIComponent(slug)}/booking-options`)
      bookingOptions.value = options.data
    } catch {
      bookingOptions.value = []
    }
  }
})
onBeforeUnmount(() => document.removeEventListener('click', closeShare))

useHead(() => {
  const value = trip.value
  const title = value
    ? t('community.trip.metaTitle', { title: value.title, days: value.durationDays, destination: value.destination })
    : t('community.trip.metaFallbackTitle')
  const description = (value?.description || value?.itinerary.summary || t('community.trip.metaDescription')).slice(0, 300)
  const photo = value ? destinationPhoto(value.destination, 1200) : null
  const image = resolveAbsoluteOgImage(photo ? `${photo}&h=630` : '/og-image.jpg', siteOrigin)

  return {
    title,
    link: [{ rel: 'canonical', href: canonicalUrl, key: 'canonical' }],
    meta: [
      // Unlisted, private and missing trips stay out of search results
      ...(isPublic.value ? [] : [{ name: 'robots', content: 'noindex, nofollow', key: 'robots' }]),
      { name: 'description', content: description, key: 'description' },
      { property: 'og:title', content: title, key: 'og-title' },
      { property: 'og:description', content: description, key: 'og-description' },
      { property: 'og:url', content: canonicalUrl, key: 'og-url' },
      { property: 'og:type', content: 'article', key: 'og-type' },
      { property: 'og:image', content: image, key: 'og-image' },
      { property: 'og:image:secure_url', content: image, key: 'og-image-secure' },
      { property: 'og:image:alt', content: value ? t('community.trip.imageAlt', { destination: value.destination }) : 'GoTravelNha', key: 'og-image-alt' },
      { name: 'twitter:card', content: 'summary_large_image', key: 'twitter-card' },
      { name: 'twitter:title', content: title, key: 'twitter-title' },
      { name: 'twitter:description', content: description, key: 'twitter-description' },
      { name: 'twitter:image', content: image, key: 'twitter-image' }
    ],
    // Structured data only for public trips, and only fields the page actually shows
    script:
      value && isPublic.value
        ? [
            {
              type: 'application/ld+json',
              key: 'trip-jsonld',
              children: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'Trip',
                name: value.title,
                description,
                url: canonicalUrl,
                image,
                author: { '@type': 'Person', name: value.author.displayName },
                itinerary: {
                  '@type': 'ItemList',
                  numberOfItems: value.itinerary.days.length,
                  itemListElement: value.itinerary.days.map((day, index) => ({
                    '@type': 'ListItem',
                    position: index + 1,
                    name: `Day ${index + 1}: ${day.theme}`
                  }))
                }
              })
            }
          ]
        : []
  }
})
</script>
