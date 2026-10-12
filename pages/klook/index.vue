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
          <p class="text-sm font-semibold text-white">Activities and experiences</p>
          <h1 class="mt-2 max-w-3xl font-display text-4xl leading-tight sm:text-5xl">Find something to do, then book it on Klook</h1>
          <p class="mt-3 max-w-2xl text-base leading-relaxed text-white/90">
            Search activities here. Klook shows the ticket, the time, and the price before you pay.
          </p>
          <p class="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-ink">
            <KlookIcon :size="18" />
            Klook booking partner
          </p>
        </div>
      </div>
    </section>

    <section id="klook-search" class="scroll-mt-28">
      <h2 class="font-display text-2xl text-ink sm:text-3xl">Search Klook</h2>
      <p class="mt-1 mb-4 text-sm text-ink/70">Results and checkout open on Klook.</p>
      <ClientOnly>
        <div class="overflow-hidden rounded-2xl border border-line bg-white">
          <div class="klook-search-widget-container">
            <ins
              class="klk-aff-widget"
              :data-wid="searchWidgetId"
              data-height="340px"
              :data-adid="klookAdId"
              data-lang=""
              data-prod="search_vertical"
              data-currency=""
            >
              <a :href="`//www.klook.com/?aid=${klookAdId}`">Klook.com</a>
            </ins>
          </div>
        </div>
        <template #fallback>
          <div class="rounded-2xl border border-line bg-white px-6 py-10" aria-hidden="true">
            <div class="mx-auto h-12 max-w-md animate-pulse rounded-xl bg-sand"></div>
            <div class="mx-auto mt-3 h-10 max-w-xs animate-pulse rounded-xl bg-sand"></div>
          </div>
        </template>
      </ClientOnly>
    </section>

    <section class="space-y-4">
      <div>
        <h2 class="font-display text-2xl text-ink sm:text-3xl">Places to explore</h2>
        <p class="mt-1 text-sm text-ink/70">Opens a Klook search for that city.</p>
      </div>
      <div class="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-4">
        <button
          v-for="place in places"
          :key="place.name"
          type="button"
          class="overflow-hidden rounded-2xl border border-line bg-white text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sea"
          @click="openKlookCity(place.name)"
        >
          <div class="relative aspect-[3/2] overflow-hidden bg-sand">
            <img
              :src="place.image"
              alt=""
              width="640"
              height="427"
              loading="lazy"
              decoding="async"
              class="absolute inset-0 h-full w-full object-cover"
            />
          </div>
          <div class="p-3 sm:p-4">
            <h3 class="font-display text-lg leading-snug text-ink sm:text-xl">{{ place.name }}</h3>
            <p class="mt-1 text-sm font-semibold text-sea">Search on Klook</p>
          </div>
        </button>
      </div>
    </section>

    <section id="klook-widget" class="scroll-mt-28 space-y-6">
      <div>
        <h2 class="font-display text-2xl text-ink sm:text-3xl">Collections</h2>
        <p class="mt-1 text-sm text-ink/70">Browse what Klook is showing through GoTravelNha.</p>
      </div>

      <div class="flex gap-2 overflow-x-auto border-b border-line" role="tablist" aria-label="Klook collections">
        <button
          type="button"
          role="tab"
          :aria-selected="selectedTab === 'things_to_do'"
          class="min-h-12 whitespace-nowrap border-b-2 px-4 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sea"
          :class="selectedTab === 'things_to_do' ? 'border-ink text-ink' : 'border-transparent text-ink/70'"
          @click="selectedTab = 'things_to_do'"
        >
          Things to do
        </button>
        <button
          type="button"
          role="tab"
          :aria-selected="selectedTab === 'hotels'"
          class="min-h-12 whitespace-nowrap border-b-2 px-4 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sea"
          :class="selectedTab === 'hotels' ? 'border-ink text-ink' : 'border-transparent text-ink/70'"
          @click="selectedTab = 'hotels'"
        >
          Hotels
        </button>
      </div>

      <div v-if="selectedTab === 'things_to_do'" class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <button
          v-for="category in categories"
          :key="category.slug"
          type="button"
          class="rounded-2xl border border-line bg-white px-4 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sea"
          @click="scrollToWidget(category)"
        >
          <span class="block text-base font-semibold text-ink">{{ category.name }}</span>
          <span class="mt-1 block text-sm leading-snug text-ink/70">{{ category.description }}</span>
        </button>
      </div>

      <div v-if="loadingWidgets" class="space-y-4" aria-hidden="true">
        <div v-for="n in 2" :key="n" class="overflow-hidden rounded-2xl border border-line bg-white">
          <div class="space-y-2 p-5">
            <div class="h-6 w-40 animate-pulse rounded bg-sand"></div>
            <div class="h-40 animate-pulse rounded-xl bg-sand"></div>
          </div>
        </div>
      </div>

      <ClientOnly v-else>
        <div class="space-y-4">
          <article
            v-for="widget in filteredWidgets"
            :key="widget.id"
            :id="`widget-${widget.id}`"
            class="scroll-mt-28 overflow-hidden rounded-2xl border border-line bg-white"
          >
            <div class="px-4 pt-5 sm:px-6">
              <h3 class="font-display text-2xl text-ink">{{ widget.name }}</h3>
              <p v-if="widget.description" class="mt-1 text-sm text-ink/70">{{ widget.description }}</p>
            </div>
            <div class="klook-widget-container px-3 py-4 sm:px-5 sm:pb-6">
              <ins
                class="klk-aff-widget"
                :data-adid="String(widget.adId)"
                :data-prod="widget.widgetType === 'hotels' ? 'hotel_dynamic_widget' : 'dynamic_widget'"
              >
                <a href="//www.klook.com/">Klook.com</a>
              </ins>
            </div>
          </article>
        </div>
        <template #fallback>
          <div class="rounded-2xl border border-line bg-white px-6 py-8 text-sm text-ink/70">Loading Klook collections…</div>
        </template>
      </ClientOnly>

      <div v-if="!loadingWidgets && widgetsFailed" class="rounded-2xl border border-line bg-white px-6 py-10 text-center">
        <p class="font-semibold text-ink">Klook's collections didn't load</p>
        <p class="mt-1 text-sm text-ink/70">Refresh the page to try again. You can still search above.</p>
      </div>
      <div v-else-if="!loadingWidgets && !filteredWidgets.length" class="rounded-2xl border border-dashed border-line bg-white px-6 py-10 text-center">
        <p class="font-semibold text-ink">No {{ selectedTab === 'hotels' ? 'hotel' : 'activity' }} collections yet</p>
        <p class="mt-1 text-sm text-ink/70">Use the search above. Collections show up here when they are published.</p>
      </div>
    </section>

    <section class="rounded-2xl border border-line bg-white px-5 py-5 sm:px-6">
      <h2 class="font-display text-xl text-ink">Where you book</h2>
      <p class="mt-2 max-w-3xl text-sm leading-relaxed text-ink/75">
        Activity checkout opens on Klook. GoTravelNha does not charge you for these bookings.
      </p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useActivityTracker } from '~/composables/useActivityTracker'
import { getActiveKlookWidgets, KLOOK_CATEGORIES } from '~/composables/useKlookWidgets'
import { appendKlookAffiliateId, openTrackedOutbound } from '~/utils/affiliate-links'
import { canonicalSiteOrigin } from '~/utils/site-origin'
import { ref, computed, onMounted, nextTick, watch } from 'vue'

const { startTracking, trackPageView, trackClick } = useActivityTracker()
const baseUrl = canonicalSiteOrigin(useRuntimeConfig().public.siteUrl)

const categories = KLOOK_CATEGORIES

const { data: loadedWidgets, pending: loadingWidgets } = await useAsyncData('klook-widgets', async () => {
  try {
    const response = await $fetch<{ success?: boolean; data?: any[] }>('/api/klook/widgets')
    if (response.success) return { widgets: response.data || [], failed: false }
  } catch (error) {
    console.error('Failed to load widgets:', error)
    return { widgets: getActiveKlookWidgets(), failed: true }
  }
  return { widgets: getActiveKlookWidgets(), failed: false }
})
const activeWidgets = ref<any[]>(loadedWidgets.value?.widgets || [])
const widgetsFailed = computed(() => Boolean(loadedWidgets.value?.failed))
const selectedTab = ref<'things_to_do' | 'hotels'>('things_to_do')
const runtimeConfig = useRuntimeConfig()
const klookAdId = computed(() => String(runtimeConfig.public?.KLOOK_AD_ID || '1041352'))
const searchWidgetId = computed(() => String(runtimeConfig.public?.KLOOK_SEARCH_WIDGET_ID || '89020'))

const places = [
  { name: 'Singapore', image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=900&q=80' },
  { name: 'Bangkok', image: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=900&q=80' },
  { name: 'Tokyo', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=900&q=80' },
  { name: 'Bali', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=900&q=80' },
  { name: 'Hong Kong', image: 'https://images.unsplash.com/photo-1536599018102-9f803c140fc1?auto=format&fit=crop&w=900&q=80' },
  { name: 'Seoul', image: 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?auto=format&fit=crop&w=900&q=80' }
]

const openKlookCity = (name: string) => {
  const url = appendKlookAffiliateId(
    `https://www.klook.com/en-SG/search/result/?query=${encodeURIComponent(name)}`,
    klookAdId.value
  )
  trackClick('klook_destination', { name, destination: url })
  const sessionId = localStorage.getItem('activity_session_id') || `klook-${Date.now().toString(36)}`
  if (!localStorage.getItem('activity_session_id')) localStorage.setItem('activity_session_id', sessionId)
  openTrackedOutbound(async () => {
    const response = await $fetch<{ outboundUrl?: string }>('/api/affiliate/click', {
      method: 'POST',
      body: {
        provider: 'klook',
        baseUrl: url,
        placementKey: 'klook_destination',
        pagePath: '/klook',
        sessionId,
        metadata: { name }
      }
    })
    return response?.outboundUrl
  }, url)
}

const klookTitle = 'Klook Activities, Tours & Deals | GoTravelNha'
const klookDescription = 'Search activities here, then open them on Klook. The ticket, time, and price are confirmed there.'
const klookOgImage = computed(() => `${baseUrl}/klook-logo.png`)

useHead(() => ({
  title: klookTitle,
  meta: [
    { name: 'description', content: klookDescription },
    { property: 'og:title', content: klookTitle },
    { property: 'og:description', content: klookDescription },
    { property: 'og:image', content: klookOgImage.value },
    { property: 'og:url', content: `${baseUrl}/klook` },
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: 'GoTravelNha' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: klookTitle },
    { name: 'twitter:description', content: klookDescription },
    { name: 'twitter:image', content: klookOgImage.value }
  ],
  link: [
    { rel: 'canonical', href: `${baseUrl}/klook`, key: 'canonical' }
  ]
}))

const filteredWidgets = computed(() => {
  return activeWidgets.value.filter(widget => widget.widgetType === selectedTab.value)
})

const loadKlookWidgetScripts = () => {
  if (typeof window === 'undefined') return

  nextTick(() => {
    setTimeout(() => {
      const widgets = document.querySelectorAll('.klk-aff-widget')
      if (widgets.length === 0) return

      widgets.forEach((widget) => {
        if (widget.getAttribute('data-klook-bound') === '1') return

        const widgetContainer = widget.closest('.klook-widget-container') ||
          widget.closest('.klook-search-widget-container') ||
          widget.parentElement
        if (!widgetContainer) return

        const existingScript = widgetContainer.querySelector('script[src*="fetch-iframe-init.js"]')
        if (existingScript) {
          widget.setAttribute('data-klook-bound', '1')
          return
        }

        widget.setAttribute('data-klook-bound', '1')
        const script = document.createElement('script')
        script.type = 'text/javascript'
        script.async = true
        script.src = 'https://affiliate.klook.com/widget/fetch-iframe-init.js'
        if (widget.nextSibling) {
          widget.parentNode?.insertBefore(script, widget.nextSibling)
        } else {
          widget.parentNode?.appendChild(script)
        }
      })
    }, 200)
  })
}

watch(selectedTab, () => {
  nextTick(() => {
    setTimeout(() => {
      loadKlookWidgetScripts()
    }, 300)
  })
})

const scrollToWidget = (category: any) => {
  trackClick('category', { name: category.name })

  const matchingWidget = activeWidgets.value.find((widget: any) => {
    if (!widget || widget.widgetType !== 'things_to_do') return false

    if (widget.category && category.slug) {
      return widget.category.toLowerCase().includes(category.slug.toLowerCase()) ||
        category.slug.toLowerCase().includes(widget.category.toLowerCase())
    }

    const categoryNameLower = category.name.toLowerCase()
    const widgetNameLower = widget.name.toLowerCase()

    if (categoryNameLower.includes('attractions') || categoryNameLower.includes('shows')) {
      return widgetNameLower.includes('attraction') || widgetNameLower.includes('show')
    }
    if (categoryNameLower.includes('tour') || categoryNameLower.includes('sightseeing')) {
      return widgetNameLower.includes('tour') || widgetNameLower.includes('sightseeing')
    }
    if (categoryNameLower.includes('food') || categoryNameLower.includes('dining')) {
      return widgetNameLower.includes('food') || widgetNameLower.includes('dining')
    }
    if (categoryNameLower.includes('transport') || categoryNameLower.includes('wifi')) {
      return widgetNameLower.includes('transport') || widgetNameLower.includes('wifi')
    }
    if (categoryNameLower.includes('activit') || categoryNameLower.includes('experience')) {
      return widgetNameLower.includes('activit') || widgetNameLower.includes('experience')
    }
    if (categoryNameLower.includes('pass')) {
      return widgetNameLower.includes('pass') || widgetNameLower.includes('package')
    }

    return false
  })

  if (matchingWidget) {
    const widgetElement = document.getElementById(`widget-${matchingWidget.id}`)
    if (widgetElement) {
      widgetElement.classList.add('ring-2', 'ring-sea')
      setTimeout(() => {
        widgetElement.classList.remove('ring-2', 'ring-sea')
      }, 2000)
      widgetElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
  }

  const widgetSection = document.getElementById('klook-widget')
  if (widgetSection) {
    widgetSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

onMounted(async () => {
  startTracking()
  trackPageView('/klook', { platform: 'klook' })

  await nextTick()
  await nextTick()
  await nextTick()

  loadKlookWidgetScripts()
})
</script>
