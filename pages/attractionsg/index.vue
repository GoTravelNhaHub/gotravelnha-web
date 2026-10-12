<template>
  <div class="space-y-8 pb-12 sm:space-y-10 sm:pb-16">
    <section class="overflow-hidden rounded-3xl bg-ink text-white">
      <div class="relative">
        <img
          src="https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1600&q=80"
          alt=""
          width="1200"
          height="640"
          class="absolute inset-0 h-full w-full object-cover"
        />
        <div class="absolute inset-0 bg-ink/75"></div>
        <div class="relative px-5 py-8 sm:px-8 sm:py-12">
          <p class="text-sm font-semibold text-white">Attractions and experiences</p>
          <h1 class="mt-2 max-w-3xl font-display text-4xl leading-tight sm:text-5xl">Find a ticket, then choose where to book</h1>
          <p class="mt-3 max-w-2xl text-base leading-relaxed text-white/90">
            Singapore tickets sold here are paid on GoTravelNha. A partner link appears only after someone has checked it, and that price is shown on the partner site.
          </p>
        </div>
      </div>
    </section>

    <section id="categories" class="space-y-4">
      <div>
        <h2 class="font-display text-2xl text-ink sm:text-3xl">Browse</h2>
        <p class="mt-1 text-sm text-ink/70">Filter by place or type. One card per attraction.</p>
      </div>
      
      <!-- Loading State -->
      <div v-if="loading" class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div v-for="n in 6" :key="n" class="overflow-hidden rounded-2xl border border-line bg-white">
          <div class="aspect-[3/2] animate-pulse bg-sand"></div>
          <div class="space-y-2 p-5">
            <div class="h-3 w-24 animate-pulse rounded bg-sand"></div>
            <div class="h-5 w-4/5 animate-pulse rounded bg-sand"></div>
          </div>
        </div>
      </div>

      <div v-else-if="error" class="rounded-2xl border border-line bg-white px-6 py-10 text-center">
        <h3 class="font-semibold text-ink">Tickets didn't load</h3>
        <p class="mt-1 text-sm text-ink/70">{{ error }}</p>
        <button
          type="button"
          class="mt-4 inline-flex min-h-11 items-center rounded-xl bg-ink px-5 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sea"
          @click="loadTickets"
        >
          Try again
        </button>
      </div>

      <div v-if="!loading && !error && hasCatalogue" class="space-y-4">
        <label class="sr-only" for="search">Search attractions</label>
        <input
          id="search"
          v-model="searchTerm"
          type="search"
          placeholder="Search by name or place"
          class="w-full rounded-xl border border-line bg-white px-4 py-3 text-base text-ink focus:border-sea focus:outline-none focus:ring-2 focus:ring-sea"
        />
        <div v-if="destinations.length > 1" class="flex flex-wrap gap-2" role="group" aria-label="Destination">
          <button
            v-for="place in destinationChoices"
            :key="place"
            type="button"
            class="min-h-10 rounded-full border px-3 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sea"
            :class="destinationFilter === place ? 'border-ink bg-ink text-white' : 'border-line bg-white text-ink'"
            @click="destinationFilter = place"
          >
            {{ place === 'all' ? 'All places' : place }}
          </button>
        </div>
        <div v-if="categories.length > 1" class="flex flex-wrap gap-2" role="group" aria-label="Category">
          <button
            v-for="kind in categoryChoices"
            :key="kind"
            type="button"
            class="min-h-10 rounded-full border px-3 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sea"
            :class="categoryFilter === kind ? 'border-ink bg-ink text-white' : 'border-line bg-white text-ink'"
            @click="categoryFilter = kind"
          >
            {{ kind === 'all' ? 'All types' : kind }}
          </button>
        </div>
        <label class="block max-w-xs text-sm font-semibold text-ink" for="sort">
          Sort
          <select id="sort" v-model="sortOption" class="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2.5 text-base font-normal text-ink" @change="loadTickets">
            <option value="alpha">Name: A to Z</option>
            <option value="latest">Latest updates</option>
            <option value="priceAsc">Price: low to high</option>
            <option value="priceDesc">Price: high to low</option>
          </select>
        </label>
      </div>

      <div v-if="listingItems.length > 0" class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <template v-for="item in displayedItems" :key="item.key">
          <AttractionCard
            v-if="item.kind === 'direct'"
            kind="direct"
            :href="`/attractionsg/${item.ticket.slug || item.ticket.id}`"
            :title="item.ticket.title"
            :image="item.ticket.image"
            :destination="item.ticket.location || undefined"
            :category="item.ticket.category || undefined"
            :price="item.ticket.price || undefined"
            :original-price="item.ticket.originalPrice || undefined"
            :bookable="!!item.ticket.forSale"
            action="View ticket"
            @navigate="rememberScrollPosition"
          />
          <AttractionCard
            v-else
            kind="partner"
            :title="item.partner.title"
            :image="item.partner.image"
            :destination="item.partner.destination"
            :category="item.partner.category"
            :provider-label="item.partner.provider === 'klook' ? 'Book on Klook. The price is shown there.' : 'Book on Trip.com. The price is shown there.'"
            action="Open partner"
            @open="openPartner(item.partner)"
          />
        </template>
      </div>

      <div
        v-if="hasMoreItems"
        ref="loadMoreTrigger"
        class="flex items-center justify-center py-6 sm:py-8 text-sm text-slate-500"
      >
        <div class="flex items-center gap-2">
          <svg class="w-4 h-4 animate-spin text-emerald-600" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Loading more attractions…</span>
        </div>
      </div>

      <div v-if="!loading && !error && hasCatalogue && listingItems.length === 0" class="rounded-2xl border border-line bg-white px-6 py-10 text-center">
        <h3 class="font-semibold text-ink">Nothing matches</h3>
        <p class="mt-1 text-sm text-ink/70">Try another place, type, or search.</p>
        <button
          type="button"
          class="mt-4 inline-flex min-h-11 items-center rounded-xl bg-ink px-5 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sea"
          @click="resetFilters"
        >
          Clear filters
        </button>
      </div>

      <div v-if="!loading && !error && !hasCatalogue" class="rounded-2xl border border-dashed border-line bg-white px-6 py-10 text-center">
        <h3 class="font-semibold text-ink">No attractions published yet</h3>
        <p class="mt-1 text-sm text-ink/70">Singapore tickets show up here when they are published. Partner links are added only after a URL is checked.</p>
      </div>
    </section>
  </div>
</template>
  
<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, onUnmounted, nextTick, computed, watch, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { useActivityTracker } from '~/composables/useActivityTracker'
import AttractionCard from '~/components/attractions/AttractionCard.vue'
import { CURATED_PARTNER_ATTRACTIONS, type CuratedPartnerAttraction } from '~/utils/curated-partner-attractions'
import { openTrackedOutbound } from '~/utils/affiliate-links'
import { canonicalSiteOrigin } from '~/utils/site-origin'

const { startTracking, trackPageView } = useActivityTracker()

interface AttractionEvent {
  id?: string
  slug?: string
  title: string
  description?: string
  location?: string
  price?: string
  priceAmount?: number | null
  resellerPriceAmount?: number | null
  originalPrice?: string
  image?: string
  lastUpdated?: string
  originalPriceAmount?: number | null
  isPublished?: boolean
  [key: string]: any
}

type NormalizedAttraction = AttractionEvent & {
  priceAmount: number | null
  lastUpdatedDate: Date | null
}

const tickets = ref<AttractionEvent[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

interface ScrollState {
  position: number
  shouldRestore: boolean
  visibleCount: number
}

const scrollState = useState<ScrollState>('attractionsg-scroll', () => ({
  position: 0,
  shouldRestore: false,
  visibleCount: 0
}))

const pendingScrollRestore = ref(false)
const targetScrollPosition = ref(0)
const observer = ref<IntersectionObserver | null>(null)
const loadMoreTrigger = ref<HTMLElement | null>(null)

const ITEMS_PER_BATCH = 24
const visibleCount = ref(ITEMS_PER_BATCH)

const sortOption = ref('alpha')
const searchTerm = ref('')
const destinationFilter = ref('all')
const categoryFilter = ref('all')
const route = useRoute()

const baseUrl = canonicalSiteOrigin(useRuntimeConfig().public.siteUrl)
const listingTitle = 'Singapore Attractions & Tickets | GoTravelNha'
const listingDescription = 'Singapore attraction tickets on GoTravelNha. A ticket is sold here only when a current price is listed.'
const listingImage = computed(() => `${baseUrl}/sg-attractions-logo.svg`)

useHead(() => ({
  title: listingTitle,
  meta: [
    { name: 'description', content: listingDescription },
    { property: 'og:title', content: listingTitle },
    { property: 'og:description', content: listingDescription },
    { property: 'og:image', content: listingImage.value },
    { property: 'og:url', content: `${baseUrl}/attractionsg`, key: 'og-url' },
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: 'GoTravelNha' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: listingTitle },
    { name: 'twitter:description', content: listingDescription },
    { name: 'twitter:image', content: listingImage.value }
  ],
  link: [
    { rel: 'canonical', href: `${baseUrl}/attractionsg`, key: 'canonical' }
  ]
}))

const API_PAGE_LIMIT = 100

const loadTickets = async () => {
  try {
    loading.value = true
    error.value = null

    const aggregated: AttractionEvent[] = []
    let page = 1
    let totalPages = 1

    do {
      const res = await $fetch<{
        data?: AttractionEvent[]
        pagination?: { page: number; limit: number; totalPages: number; total: number }
      }>('/api/attractionsg/events', {
        method: 'POST',
        body: {
          page,
          limit: API_PAGE_LIMIT,
          sortBy:
            sortOption.value === 'priceAsc' || sortOption.value === 'priceDesc'
              ? 'price'
              : sortOption.value === 'alpha'
                ? 'title'
                : 'date',
          sortOrder: sortOption.value === 'priceAsc' || sortOption.value === 'alpha' ? 'asc' : 'desc'
        }
      })

      const batch = filterPublished(res.data || [])
      aggregated.push(...batch)

      totalPages = res.pagination?.totalPages ?? totalPages
      page += 1
    } while (page <= totalPages)

    tickets.value = aggregated
  } catch (err) {
    console.error('❌ loadTickets: API error:', err)
    error.value = 'Unable to fetch tickets. Please try again later.'
    
  } finally {
    loading.value = false
  }
}

const filterPublished = (items: AttractionEvent[]) => {
  return (items || []).filter((item) => item && item.isPublished === true)
}

const normalizedTickets = computed<NormalizedAttraction[]>(() => {
  return tickets.value.map((ticket) => {
    const priceAmount =
      typeof ticket.priceAmount === 'number'
        ? ticket.priceAmount
        : parseFloat(String(ticket.price ?? '').replace(/[^0-9.]/g, '')) || null
    const lastUpdatedDate = ticket.lastUpdated ? new Date(ticket.lastUpdated) : null
    return {
      ...ticket,
      priceAmount,
      lastUpdatedDate
    }
  })
})

const sortedTickets = computed<NormalizedAttraction[]>(() => {
  const items = [...normalizedTickets.value]
  switch (sortOption.value) {
    case 'priceAsc':
      return items.sort((a, b) => (a.priceAmount ?? Infinity) - (b.priceAmount ?? Infinity))
    case 'priceDesc':
      return items.sort((a, b) => (b.priceAmount ?? -Infinity) - (a.priceAmount ?? -Infinity))
    case 'latest':
      return items.sort((a, b) => {
        const aTime = a.lastUpdatedDate ? a.lastUpdatedDate.getTime() : 0
        const bTime = b.lastUpdatedDate ? b.lastUpdatedDate.getTime() : 0
        return bTime - aTime
      })
    case 'alpha':
    default:
      return items.sort((a, b) => a.title.localeCompare(b.title))
  }
})

const matchesQuery = (title: string, place?: string | null) => {
  if (!searchTerm.value) return true
  const query = searchTerm.value.toLowerCase()
  return title.toLowerCase().includes(query) || (place || '').toLowerCase().includes(query)
}

const filteredTickets = computed<NormalizedAttraction[]>(() => {
  return sortedTickets.value.filter((ticket) => {
    if (!matchesQuery(ticket.title, ticket.location)) return false
    if (destinationFilter.value !== 'all' && (ticket.location || '') !== destinationFilter.value) return false
    if (categoryFilter.value !== 'all' && (ticket.category || '') !== categoryFilter.value) return false
    return true
  })
})

const directKeys = computed(() => {
  const keys = new Set<string>()
  for (const ticket of tickets.value) {
    if (ticket.slug) keys.add(ticket.slug.toLowerCase())
    if (ticket.id) keys.add(String(ticket.id).toLowerCase())
  }
  return keys
})

const standalonePartners = computed(() => {
  return CURATED_PARTNER_ATTRACTIONS.filter((item) => {
    const keys = [item.slug, item.directSlug].filter(Boolean).map((value) => String(value).toLowerCase())
    return !keys.some((key) => directKeys.value.has(key))
  })
})

const filteredPartners = computed(() => {
  return standalonePartners.value.filter((item) => {
    if (!matchesQuery(item.title, item.destination)) return false
    if (destinationFilter.value !== 'all' && item.destination !== destinationFilter.value) return false
    if (categoryFilter.value !== 'all' && item.category !== categoryFilter.value) return false
    return true
  })
})

const destinations = computed(() => {
  const names = new Set<string>()
  for (const ticket of tickets.value) if (ticket.location) names.add(ticket.location)
  for (const item of standalonePartners.value) names.add(item.destination)
  return [...names].sort((a, b) => a.localeCompare(b))
})

const categories = computed(() => {
  const names = new Set<string>()
  for (const ticket of tickets.value) if (ticket.category) names.add(ticket.category)
  for (const item of standalonePartners.value) names.add(item.category)
  return [...names].sort((a, b) => a.localeCompare(b))
})

const destinationChoices = computed(() => ['all', ...destinations.value])
const categoryChoices = computed(() => ['all', ...categories.value])
const hasCatalogue = computed(() => tickets.value.length > 0 || standalonePartners.value.length > 0)

type ListingItem =
  | { kind: 'direct'; key: string; ticket: NormalizedAttraction }
  | { kind: 'partner'; key: string; partner: CuratedPartnerAttraction }

const listingItems = computed<ListingItem[]>(() => {
  const directs: ListingItem[] = filteredTickets.value.map((ticket) => ({
    kind: 'direct',
    key: `direct-${ticket.id || ticket.slug || ticket.title}`,
    ticket
  }))
  const partners: ListingItem[] = filteredPartners.value
    .slice()
    .sort((a, b) => a.title.localeCompare(b.title))
    .map((partner) => ({ kind: 'partner', key: `partner-${partner.slug}`, partner }))
  if (sortOption.value === 'alpha') {
    return [...directs, ...partners].sort((a, b) => {
      const left = a.kind === 'direct' ? a.ticket.title : a.partner.title
      const right = b.kind === 'direct' ? b.ticket.title : b.partner.title
      return left.localeCompare(right)
    })
  }
  return [...directs, ...partners]
})

const displayedItems = computed(() => listingItems.value.slice(0, visibleCount.value))
const hasMoreItems = computed(() => visibleCount.value < listingItems.value.length)

const resetFilters = () => {
  searchTerm.value = ''
  destinationFilter.value = 'all'
  categoryFilter.value = 'all'
  sortOption.value = 'alpha'
  loadTickets()
}

const openPartner = (partner: CuratedPartnerAttraction) => {
  const sessionId = localStorage.getItem('activity_session_id') || `attr-${Date.now().toString(36)}`
  if (!localStorage.getItem('activity_session_id')) localStorage.setItem('activity_session_id', sessionId)
  openTrackedOutbound(async () => {
    const response = await $fetch<{ outboundUrl?: string }>('/api/affiliate/click', {
      method: 'POST',
      body: {
        provider: partner.provider,
        baseUrl: partner.url,
        placementKey: 'attraction_card',
        pagePath: route.path,
        sessionId
      }
    })
    return response?.outboundUrl
  }, partner.url)
}

const rememberScrollPosition = () => {
  if (typeof window === 'undefined') return
  scrollState.value.position = window.scrollY
  scrollState.value.shouldRestore = true
  scrollState.value.visibleCount = visibleCount.value
}

const loadMoreTickets = () => {
  if (!hasMoreItems.value) return
  visibleCount.value = Math.min(visibleCount.value + ITEMS_PER_BATCH, listingItems.value.length)
}

await loadTickets()

onMounted(() => {
  startTracking()
  trackPageView('/attractionsg', { platform: 'attractionsg' })

  if (scrollState.value.shouldRestore && scrollState.value.position > 0) {
    pendingScrollRestore.value = true
    targetScrollPosition.value = scrollState.value.position
    visibleCount.value = Math.max(
      Math.min(scrollState.value.visibleCount || ITEMS_PER_BATCH, listingItems.value.length || ITEMS_PER_BATCH),
      ITEMS_PER_BATCH
    )
  } else {
    visibleCount.value = ITEMS_PER_BATCH
  }

  if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
    observer.value = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            loadMoreTickets()
          }
        }
      },
      {
        rootMargin: '0px 0px 320px 0px',
        threshold: 0
      }
    )
  }
})

onBeforeUnmount(() => {
  rememberScrollPosition()
})

onUnmounted(() => {
  observer.value?.disconnect()
  observer.value = null
})

watch(
  listingItems,
  (items) => {
    if (!items) return
    if (!pendingScrollRestore.value) {
      visibleCount.value = Math.min(ITEMS_PER_BATCH, items.length)
    } else if (scrollState.value.visibleCount) {
      visibleCount.value = Math.min(
        Math.max(scrollState.value.visibleCount, visibleCount.value, ITEMS_PER_BATCH),
        items.length
      )
    }
    if (!pendingScrollRestore.value) return
    if (items.length === 0) return

    nextTick(() => {
      window.scrollTo({
        top: Math.max(0, targetScrollPosition.value),
        behavior: 'auto'
      })
      pendingScrollRestore.value = false
      targetScrollPosition.value = 0
      scrollState.value.position = 0
      scrollState.value.shouldRestore = false
      scrollState.value.visibleCount = 0
    })
  },
  { immediate: true }
)

watchEffect(() => {
  if (!observer.value) return
  observer.value.disconnect()
  if (loadMoreTrigger.value && hasMoreItems.value) {
    observer.value.observe(loadMoreTrigger.value)
  }
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

