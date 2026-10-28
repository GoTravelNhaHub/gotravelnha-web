<template>
  <!-- Layout measured from design-references/GoTravelNha Travel Community Dashboard.png (1536px wide):
       the default layout draws the 198px rail and 26px gutters; this page adds the feed and the 333px sidebar -->
  <div class="w-full px-4 pb-14 pt-4 sm:px-5 sm:pt-5 lg:grid lg:grid-cols-cm-2 lg:gap-[18px] lg:pt-0 xl:grid-cols-[minmax(0,1fr)_333px] xl:px-0 3xl:grid-cols-[minmax(0,1fr)_380px] 3xl:gap-6">

    <!-- Feed -->
    <div class="min-w-0">
      <CommunityHero :filters="filters" />

      <nav class="scrollbar-hide relative mt-[11px] flex overflow-x-auto border-b border-cm-line sm:mt-[9px]" :aria-label="t('community.feed.tabs.label')">
        <NuxtLink
          v-for="tab in tabs"
          :key="tab.key"
          :to="tab.to"
          class="relative flex h-[44px] shrink-0 items-center px-[21px] text-[16px] transition"
          :class="tab.key === activeTab ? 'font-semibold text-cm-active after:absolute after:inset-x-0 after:-bottom-px after:h-[3px] after:rounded-full after:bg-cm-primary' : 'font-medium text-[#3B4560] hover:text-cm-ink'"
          :aria-current="tab.key === activeTab ? 'page' : undefined"
        >
          {{ tab.label }}
        </NuxtLink>
      </nav>

      <div class="mt-[18px] space-y-[8px] lg:mt-[17px]">
        <p v-if="loadFailed" class="alert-error" role="alert">{{ t('community.discover.loadFailed') }}</p>

        <template v-else>
          <div v-if="filtered" class="flex flex-wrap items-center justify-between gap-2 px-1 pb-2">
            <h2 class="text-[17px] font-bold text-cm-ink">{{ resultsTitle }}</h2>
            <NuxtLink :to="clearLink" class="text-[14px] font-semibold text-cm-active hover:underline">{{ t('community.feed.clearFilters') }}</NuxtLink>
          </div>

          <CommunityEmpty
            v-if="!cards.length"
            :title="filtered ? t('community.discover.noResultsTitle') : undefined"
            :text="filtered ? t('community.discover.noResultsText') : undefined"
            :destination="filters.destination || filters.country || filters.q"
          />
          <!-- Large monitors: as many ~560px cards per row as fit (2 at 1920, 3 at 2560, 4 at 3440).
               Each card picks its layout from its own width (container queries). -->
          <div class="grid gap-[8px] 3xl:grid-cols-[repeat(auto-fill,minmax(560px,1fr))] 3xl:gap-3">
            <FeedCard
              v-for="(trip, index) in cards"
              :key="trip.id"
              :trip="trip"
              :eager="index < 4"
              :placement="`community_${activeTab}`"
              @open="openTrip"
            />
          </div>

          <div v-if="nextCursor" class="pt-4 text-center">
            <button type="button" class="cm-btn-outline h-11 px-6 text-[14px]" :disabled="loadingMore" @click="loadMore">
              {{ loadingMore ? t('community.discover.loading') : t('community.discover.loadMore') }}
            </button>
          </div>

          <p v-if="showDemo" class="mt-4 rounded-xl border border-[#F5D58A] bg-[#FFF9EA] px-4 py-3 text-[13px] leading-5 text-[#6B4A00]" role="note">
            {{ t('community.feed.demoNotice') }}
          </p>
        </template>
      </div>
    </div>

    <!-- Sidebar: right column on desktop, below the feed on tablet and phone -->
    <aside class="mt-10 grid gap-[18px] sm:grid-cols-2 lg:mt-0 lg:block lg:space-y-[20px] lg:pt-[15px]">
      <PopularDestinations class="sm:col-span-2 lg:col-span-1" :destinations="destinations" />
      <TopCreators :creators="creators" />
      <PublishPromo class="lg:ml-[10px] lg:mr-[-2px]" />
    </aside>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import CommunityEmpty from '~/components/community/CommunityEmpty.vue'
import CommunityHero from '~/components/community/feed/CommunityHero.vue'
import FeedCard from '~/components/community/feed/FeedCard.vue'
import PopularDestinations from '~/components/community/feed/PopularDestinations.vue'
import PublishPromo from '~/components/community/feed/PublishPromo.vue'
import TopCreators from '~/components/community/feed/TopCreators.vue'
import type { CommunityCreator, CommunityDestination, CommunityTripCard } from '~/types/community'
import { communityDemoEnabled, communityEnabled } from '~/utils/feature-flags'
import { filtersToQuery, hasActiveFilters, parseCommunityFilters, type CommunityFilters } from '~/utils/community-filters'
import { DEMO_CREATORS, DEMO_TRIPS, padWithDemo } from '~/utils/community-demo'
import { communityHeroPhoto } from '~/utils/community-photos'
import { canonicalSiteOrigin } from '~/utils/site-origin'
import { resolveAbsoluteOgImage } from '~/utils/socialPreview'

interface TripPage {
  data: CommunityTripCard[]
  nextCursor: string | null
}

const config = useRuntimeConfig().public
if (!communityEnabled(config)) {
  throw createError({ statusCode: 404, statusMessage: 'Not found', fatal: true })
}

definePageMeta({ bleed: true })

const PAGE_SIZE = 10
// Demo cards fill the default feed up to this many, so the layout can be reviewed with few real trips
const DEMO_FEED_SIZE = 3

const route = useRoute()
const { t, placeName } = useI18n()
const { track } = useFunnel()
const siteOrigin = canonicalSiteOrigin(config.siteUrl)
const demoOn = communityDemoEnabled(config)

const filters = computed<CommunityFilters>(() => parseCommunityFilters(route.query))
const filtered = computed(() => hasActiveFilters(filters.value))

// "For You" has no ranking of its own yet: it lists newest first, like "Newly Published"
type TabKey = 'foryou' | 'trending' | 'saved' | 'recent'
const activeTab = computed<TabKey>(() => {
  const sort = route.query.sort
  return sort === 'trending' || sort === 'saved' || sort === 'recent' ? sort : 'foryou'
})
const tabLink = (key: TabKey) => {
  const query = filtersToQuery({ ...filters.value, sort: 'recent' })
  if (key !== 'foryou') query.sort = key
  return { path: '/community', query }
}
const tabs = computed(() => [
  { key: 'foryou' as const, label: t('community.feed.tabs.forYou'), to: tabLink('foryou') },
  { key: 'trending' as const, label: t('community.feed.tabs.trending'), to: tabLink('trending') },
  { key: 'saved' as const, label: t('community.feed.tabs.saved'), to: tabLink('saved') },
  { key: 'recent' as const, label: t('community.feed.tabs.recent'), to: tabLink('recent') }
])

const listQuery = computed(() => {
  const query = filtersToQuery(filters.value)
  if (activeTab.value === 'trending' || activeTab.value === 'saved') query.sort = activeTab.value
  return query
})
const fetchPage = (query: Record<string, string>) => $api<TripPage>(`/api/community/trips?${new URLSearchParams(query).toString()}`)

const { data: feed, error: feedError } = await useAsyncData(
  'community-feed',
  () => fetchPage({ ...listQuery.value, limit: String(PAGE_SIZE) }),
  { watch: [() => JSON.stringify(listQuery.value)] }
)

// The sidebar is not essential: a failure leaves it with its fallbacks
const { data: sidebar } = await useAsyncData('community-sidebar', async () => {
  const [places, people] = await Promise.all([
    $api<{ data: CommunityDestination[] }>('/api/community/destinations').catch(() => ({ data: [] })),
    $api<{ data: CommunityCreator[] }>('/api/community/creators').catch(() => ({ data: [] }))
  ])
  return { destinations: places.data, creators: people.data }
})

const extra = ref<CommunityTripCard[]>([])
const nextCursor = ref<string | null>(null)
const loadingMore = ref(false)
watch(feed, (value) => {
  extra.value = []
  nextCursor.value = value?.nextCursor ?? null
}, { immediate: true })

const realCards = computed(() => [...(feed.value?.data ?? []), ...extra.value])
// Demo content only on the unfiltered first page, always after real trips
const showDemo = computed(() => demoOn && !filtered.value && realCards.value.length < DEMO_FEED_SIZE)
const cards = computed(() => (showDemo.value ? padWithDemo(realCards.value, DEMO_TRIPS, DEMO_FEED_SIZE) : realCards.value))
const destinations = computed(() => sidebar.value?.destinations ?? [])
const creators = computed(() => {
  const real = sidebar.value?.creators ?? []
  return demoOn && real.length < 3 ? padWithDemo(real, DEMO_CREATORS, 3) : real
})

const loadFailed = computed(() => !!feedError.value)
const resultsTitle = computed(() => {
  const value = filters.value
  const place = value.destination || value.country || value.q
  return place ? placeName(place) : t('community.discover.results', { count: realCards.value.length })
})
const clearLink = computed(() => tabLink(activeTab.value))

const loadMore = async () => {
  if (!nextCursor.value || loadingMore.value) return
  try {
    loadingMore.value = true
    const page = await fetchPage({ ...listQuery.value, limit: String(PAGE_SIZE), cursor: nextCursor.value })
    extra.value = [...extra.value, ...page.data]
    nextCursor.value = page.nextCursor
  } finally {
    loadingMore.value = false
  }
}

const openTrip = (trip: CommunityTripCard) => {
  if (!trip.demo) track('itinerary_open', { tripId: trip.id, placement: `community_${activeTab.value}` })
}

if (import.meta.server) {
  // Same HTML for every visitor (no session is read), so it can sit in the edge cache briefly
  useResponseHeader('cache-control').value = 'public, s-maxage=60, stale-while-revalidate=300'
}

const { loadState } = useSavedTrips()
const { loadState: loadFollows } = useFollows()
const { load: loadProfile } = useOwnProfile()
watch(realCards, (list) => loadState(list.map((trip) => trip.id)))

onMounted(() => {
  loadState(realCards.value.map((trip) => trip.id))
  loadFollows(creators.value.filter((creator) => !creator.demo).map((creator) => creator.handle))
  loadProfile()
  const active = Object.keys(filtersToQuery(filters.value)).sort().join(',')
  track('community_page_view', { filters: active || null, tab: activeTab.value }, true)
})

useHead(() => {
  const title = t('community.discover.metaTitle')
  const description = t('community.discover.metaDescription')
  const canonical = `${siteOrigin}/community`
  const image = resolveAbsoluteOgImage(`${communityHeroPhoto(1200)}&h=630`, siteOrigin)
  return {
    title,
    link: [{ rel: 'canonical', href: canonical, key: 'canonical' }],
    meta: [
      // Filtered and re-sorted views are thin copies of the main page
      ...(filtered.value || activeTab.value !== 'foryou' ? [{ name: 'robots', content: 'noindex, follow', key: 'robots' }] : []),
      { name: 'description', content: description, key: 'description' },
      { property: 'og:title', content: title, key: 'og-title' },
      { property: 'og:description', content: description, key: 'og-description' },
      { property: 'og:url', content: canonical, key: 'og-url' },
      { property: 'og:image', content: image, key: 'og-image' },
      { property: 'og:image:secure_url', content: image, key: 'og-image-secure' },
      { name: 'twitter:title', content: title, key: 'twitter-title' },
      { name: 'twitter:description', content: description, key: 'twitter-description' },
      { name: 'twitter:image', content: image, key: 'twitter-image' }
    ]
  }
})
</script>
