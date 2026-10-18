<template>
  <div class="pb-16 font-brand sm:pb-20">
    <PageHero
      :eyebrow="t('partners.klook.eyebrow')"
      :title="t('partners.klook.title')"
      :subtitle="t('partners.klook.subtitle')"
      image="https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=2400&q=80"
      image-position="center 60%"
      :trust="tm<string[]>('partners.klook.trust')"
      overlap
    >
      <template #badge>
        <span class="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[13px] font-semibold text-[#0A1024] shadow-sm">
          <KlookIcon :size="18" />
          {{ t('partners.klook.badge') }}
        </span>
      </template>
    </PageHero>

    <section id="klook-search" class="site-shell relative z-20 -mt-20 scroll-mt-24 sm:-mt-24" aria-labelledby="klook-search-title">
      <div class="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-[0_24px_60px_-28px_rgba(10,16,36,0.45)] sm:p-6">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <h2 id="klook-search-title" class="text-[16px] font-bold leading-6 text-[#0A1024]">{{ t('partners.klook.searchTitle') }}</h2>
          <p class="text-[13px] leading-5 text-[#64748B]">{{ t('partners.klook.searchNote') }}</p>
        </div>
        <ClientOnly>
          <div class="klook-search-widget-container mt-4 overflow-hidden rounded-xl">
            <ins
              class="klk-aff-widget"
              :data-wid="searchWidgetId"
              data-height="340px"
              :data-adid="klookAdId"
              :data-lang="klookLang"
              data-prod="search_vertical"
              data-currency=""
            >
              <a :href="`//www.klook.com/?aid=${klookAdId}`">Klook.com</a>
            </ins>
          </div>
          <template #fallback>
            <div class="mt-4 space-y-3 py-6" aria-hidden="true">
              <div class="mx-auto h-12 max-w-md animate-pulse rounded-xl bg-[#F1F5F9]"></div>
              <div class="mx-auto h-10 max-w-xs animate-pulse rounded-xl bg-[#F1F5F9]"></div>
            </div>
          </template>
        </ClientOnly>
      </div>
    </section>

    <div class="site-shell mt-12 space-y-14 sm:mt-16 sm:space-y-20">
      <section class="space-y-6">
        <SectionHeading :eyebrow="t('partners.klook.placesEyebrow')" :title="t('partners.klook.placesTitle')" :subtitle="t('partners.klook.placesSubtitle')" />
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 3xl:grid-cols-8 lg:gap-4">
          <CityTile
            v-for="place in places"
            :key="place.name"
            :name="placeName(place.name)"
            :image="place.image"
            :cta="t('partners.klook.searchOnKlook')"
            @select="openKlookCity(place.name)"
          />
        </div>
      </section>

      <section id="klook-widget" class="scroll-mt-24 space-y-6">
        <SectionHeading :eyebrow="t('partners.klook.collectionsEyebrow')" :title="t('partners.klook.collectionsTitle')" :subtitle="t('partners.klook.collectionsSubtitle')">
          <template #action>
            <div class="inline-grid grid-cols-2 gap-1 rounded-xl bg-[#E2E8F0]/70 p-1" role="tablist" :aria-label="t('partners.klook.collectionsLabel')">
              <button
                v-for="tab in collectionTabs"
                :key="tab.id"
                type="button"
                role="tab"
                :aria-selected="selectedTab === tab.id"
                class="min-h-11 whitespace-nowrap rounded-lg px-4 text-[14px] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066E4] sm:min-h-10"
                :class="selectedTab === tab.id ? 'bg-white text-[#0A1024] shadow-[0_1px_3px_rgba(10,16,36,0.12)]' : 'text-[#64748B] hover:text-[#0A1024]'"
                @click="selectedTab = tab.id"
              >
                {{ t(tab.label) }}
              </button>
            </div>
          </template>
        </SectionHeading>

        <div v-if="selectedTab === 'things_to_do'" class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-4 4xl:grid-cols-5">
          <button
            v-for="category in categories"
            :key="category.slug"
            type="button"
            class="group flex items-start gap-3 rounded-2xl border border-[#E2E8F0] bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-[#0066E4]/40 hover:shadow-[0_16px_32px_-20px_rgba(10,16,36,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066E4]"
            @click="scrollToWidget(category)"
          >
            <span class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EAF2FC] text-[#0066E4]" aria-hidden="true">
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" :d="categoryIcon(category.slug)" />
              </svg>
            </span>
            <span class="min-w-0">
              <span class="block text-[15px] font-semibold leading-6 text-[#0A1024]">{{ t(`partners.klook.categories.${category.slug}.name`) }}</span>
              <span class="mt-0.5 block text-[13px] leading-5 text-[#64748B]">{{ t(`partners.klook.categories.${category.slug}.description`) }}</span>
            </span>
          </button>
        </div>

        <div v-if="loadingWidgets" class="space-y-4" aria-hidden="true">
          <div v-for="n in 2" :key="n" class="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white">
            <div class="space-y-2 p-5">
              <div class="h-6 w-40 animate-pulse rounded bg-[#F1F5F9]"></div>
              <div class="h-40 animate-pulse rounded-xl bg-[#F1F5F9]"></div>
            </div>
          </div>
        </div>

        <ClientOnly v-else>
          <div class="space-y-4">
            <article
              v-for="widget in filteredWidgets"
              :key="widget.id"
              :id="`widget-${widget.id}`"
              class="scroll-mt-28 overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white"
            >
              <div class="flex items-center gap-3 border-b border-[#F1F5F9] px-4 py-4 sm:px-6">
                <KlookIcon :size="20" class="shrink-0" />
                <div class="min-w-0">
                  <h3 class="text-[17px] font-bold leading-6 text-[#0A1024]">{{ widget.name }}</h3>
                  <p v-if="widget.description" class="text-[13px] leading-5 text-[#64748B]">{{ widget.description }}</p>
                </div>
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
            <div class="rounded-2xl border border-[#E2E8F0] bg-white px-6 py-8 text-sm text-[#64748B]">{{ t('partners.klook.loadingCollections') }}</div>
          </template>
        </ClientOnly>

        <div v-if="!loadingWidgets && widgetsFailed" class="rounded-2xl border border-[#E2E8F0] bg-white px-6 py-10 text-center">
          <p class="font-semibold text-[#0A1024]">{{ t('partners.klook.failedTitle') }}</p>
          <p class="mt-1 text-sm text-[#64748B]">{{ t('partners.klook.failedText') }}</p>
        </div>
        <div v-else-if="!loadingWidgets && !filteredWidgets.length" class="rounded-2xl border border-dashed border-[#CBD5E1] bg-white px-6 py-10 text-center">
          <p class="font-semibold text-[#0A1024]">{{ t(selectedTab === 'hotels' ? 'partners.klook.emptyHotels' : 'partners.klook.emptyActivities') }}</p>
          <p class="mt-1 text-sm text-[#64748B]">{{ t('partners.klook.emptyText') }}</p>
        </div>
      </section>

      <BookingNote>
        {{ t('partners.klook.bookingNote') }}
      </BookingNote>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useActivityTracker } from '~/composables/useActivityTracker'
import { getActiveKlookWidgets, KLOOK_CATEGORIES } from '~/composables/useKlookWidgets'
import { appendKlookAffiliateId, openTrackedOutbound } from '~/utils/affiliate-links'
import { canonicalSiteOrigin } from '~/utils/site-origin'
import { getVisitorSessionId } from '~/utils/visitor-session'
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import BookingNote from '~/components/site/BookingNote.vue'
import CityTile from '~/components/site/CityTile.vue'
import PageHero from '~/components/site/PageHero.vue'
import SectionHeading from '~/components/site/SectionHeading.vue'

definePageMeta({ bleed: true })

const { startTracking, trackPageView, trackClick } = useActivityTracker()
const { track } = useFunnel()
const { t, tm, locale, placeName } = useI18n()
// Klook's own language codes; empty lets the widget choose
const klookLang = computed(() => ({ en: '', vi: 'vi', zh: 'zh-CN' })[locale.value])
const klookPath = computed(() => ({ en: 'en-SG', vi: 'vi', zh: 'zh-CN' })[locale.value])
const baseUrl = canonicalSiteOrigin(useRuntimeConfig().public.siteUrl)

const categories = KLOOK_CATEGORIES

const collectionTabs = [
  { id: 'things_to_do' as const, label: 'partners.klook.thingsToDo' },
  { id: 'hotels' as const, label: 'partners.klook.hotels' }
]

const CATEGORY_ICONS: Record<string, string> = {
  attractions: 'M3 9V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a3 3 0 0 0 0 6v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a3 3 0 0 0 0-6ZM13 5v2M13 17v2M13 11v2',
  tours: 'M3 11 21 3l-8 18-2-8-8-2Z',
  food: 'M7 3v8m-3-8v5a3 3 0 0 0 6 0V3M7 11v10M17 3c-1.7 0-3 2.2-3 5s1.3 4 3 4m0-9v18',
  transport: 'M6 17h12M5 17V7a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v10M5 12h14M8 20l-1 1m9-1 1 1M8.5 14.5h.01M15.5 14.5h.01',
  activities: 'm3 20 6-11 4 6 2-3 6 8H3ZM15 6.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z',
  passes: 'M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7Zm4 4h8M8 15h5'
}
const categoryIcon = (slug: string) => CATEGORY_ICONS[slug] || CATEGORY_ICONS.attractions

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
  { name: 'Singapore', image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=600&q=80' },
  { name: 'Bangkok', image: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=600&q=80' },
  { name: 'Tokyo', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=600&q=80' },
  { name: 'Bali', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80' },
  { name: 'Hong Kong', image: 'https://images.unsplash.com/photo-1536599018102-9f803c140fc1?auto=format&fit=crop&w=600&q=80' },
  { name: 'Seoul', image: 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?auto=format&fit=crop&w=600&q=80' }
]

const openKlookCity = (name: string) => {
  const url = `https://www.klook.com/${klookPath.value}/search/result/?query=${encodeURIComponent(name)}`
  const sessionId = getVisitorSessionId()
  track('travel_search_submitted', {
    provider: 'klook',
    placement: 'klook_destination',
    destination: name,
    searchType: 'activity'
  })
  openTrackedOutbound(async () => {
    const response = await $fetch<{ outboundUrl?: string }>('/api/affiliate/click', {
      method: 'POST',
      body: {
        provider: 'klook',
        baseUrl: url,
        placementKey: 'klook_destination',
        pagePath: '/klook',
        sessionId,
        metadata: { destination: name, searchType: 'activity', funnel: 'affiliate_outbound_clicked' }
      }
    })
    return response?.outboundUrl
  }, appendKlookAffiliateId(url, klookAdId.value))
}

const klookOgImage = computed(() => `${baseUrl}/klook-logo.png`)

useHead(() => {
  const klookTitle = t('partners.klook.metaTitle')
  const klookDescription = t('partners.klook.metaDescription')
  return {
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
  }
})

const filteredWidgets = computed(() => {
  return activeWidgets.value.filter(widget => widget.widgetType === selectedTab.value)
})

const loadKlookWidgetScripts = () => {
  if (typeof window === 'undefined') return

  nextTick(() => {
    setTimeout(() => {
      const pending = [...document.querySelectorAll('.klk-aff-widget')].filter(
        (widget) => widget.getAttribute('data-klook-bound') !== '1'
      )
      if (!pending.length) return
      pending.forEach((widget) => widget.setAttribute('data-klook-bound', '1'))
      const script = document.createElement('script')
      script.async = true
      script.src = 'https://affiliate.klook.com/widget/fetch-iframe-init.js'
      document.body.appendChild(script)
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
