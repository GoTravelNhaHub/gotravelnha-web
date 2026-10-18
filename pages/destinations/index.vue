<template>
  <div class="pb-16 font-brand sm:pb-20">
    <PageHero
      :eyebrow="t('places.index.eyebrow')"
      :title="t('places.index.title')"
      :subtitle="t('places.index.subtitle')"
      image="https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=2400&q=80"
      image-position="center 60%"
      :trust="tm<string[]>('places.index.trust').map((line) => line.replace('{count}', String(DESTINATIONS.length)))"
    />

    <div class="site-shell mt-10 space-y-10 sm:mt-12">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="-mx-1 flex gap-1 overflow-x-auto px-1 [scrollbar-width:none]" role="tablist" :aria-label="t('places.index.regionLabel')">
          <button
            v-for="option in regionTabs"
            :key="option.id"
            type="button"
            role="tab"
            :aria-selected="region === option.id"
            class="min-h-10 shrink-0 rounded-full border px-4 text-[14px] font-semibold transition"
            :class="region === option.id ? 'border-[#0A1024] bg-[#0A1024] text-white' : 'border-[#E2E8F0] bg-white text-[#334155] hover:border-[#0066E4]/40'"
            @click="region = option.id"
          >
            {{ option.label }} <span class="ml-0.5 opacity-60">{{ option.count }}</span>
          </button>
        </div>
        <p class="text-[13px] text-[#64748B]">{{ t('places.index.hint') }}</p>
      </div>

      <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 3xl:grid-cols-5 4xl:grid-cols-6 lg:gap-4">
        <CityTile
          v-for="city in shownCities"
          :key="city.name"
          :name="placeName(city.name)"
          :caption="caption(city)"
          :image="city.image"
          :to="city.to"
          :cta="city.cta"
        />
      </div>

      <section v-if="otherCities.length" class="rounded-2xl border border-[#E2E8F0] bg-white p-5 sm:p-6" aria-labelledby="more-cities">
        <h2 id="more-cities" class="text-[16px] font-bold text-[#0A1024]">{{ t('places.index.moreCities') }}</h2>
        <ul class="mt-3 flex flex-wrap gap-2">
          <li v-for="item in otherCities" :key="item.slug">
            <NuxtLink :to="`/destinations/${item.slug}`" class="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#E2E8F0] px-4 text-[14px] font-medium text-[#0A1024] hover:border-[#0066E4] hover:bg-[#EAF2FC]">
              {{ item.name }}
              <span class="text-[12px] text-[#64748B]">{{ t('places.index.activities', { count: item.activityCount }) }}</span>
            </NuxtLink>
          </li>
        </ul>
      </section>

      <section class="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#E2E8F0] bg-gradient-to-br from-white to-[#EAF2FC] p-5 sm:p-6">
        <div>
          <h2 class="text-[17px] font-bold text-[#0A1024]">{{ t('places.index.elsewhereTitle') }}</h2>
          <p class="text-[14px] text-[#64748B]">{{ t('places.index.elsewhereText') }}</p>
        </div>
        <NuxtLink to="/planner" class="btn-primary w-auto px-6">{{ t('places.index.planWithAgent') }}</NuxtLink>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import CityTile from '~/components/site/CityTile.vue'
import PageHero from '~/components/site/PageHero.vue'
import { DESTINATIONS, DESTINATION_REGIONS, catalogSlug, type CatalogDestination, type DestinationRegion } from '~/utils/destination-catalog'
import { destinationPhoto } from '~/utils/destination-photos'
import { canonicalSiteOrigin } from '~/utils/site-origin'

definePageMeta({ bleed: true })

const { t, tm, placeName } = useI18n()

/** "Japan · Theme parks and culture", or just the caption when the country is the city itself */
const caption = (city: CatalogDestination) => {
  const text = t(`common.placeCaptions.${city.name}`)
  return city.country && city.country !== city.name ? `${placeName(city.country)} · ${text}` : text
}

interface ActivityCity {
  slug: string
  name: string
  activityCount: number
}

// Cities with bookable activities; the page still works if this is empty or fails
const { data } = await useAsyncData('destinations', () =>
  $fetch<{ data: ActivityCity[] }>('/api/destinations').catch(() => ({ data: [] as ActivityCity[] }))
)
const activityBySlug = computed(() => new Map((data.value?.data || []).map((item) => [item.slug, item])))


const cities = computed(() =>
  DESTINATIONS.map((city) => {
    const activities = activityBySlug.value.get(catalogSlug(city))
    return {
      ...city,
      image: destinationPhoto(city.name, 600) as string,
      to: activities ? `/destinations/${activities.slug}` : `/planner?destination=${encodeURIComponent(city.name)}`,
      cta: activities ? t('places.index.seeActivities', { count: activities.activityCount }) : t('places.index.planTrip')
    }
  })
)

const region = ref<'all' | DestinationRegion>('all')
const regionTabs = computed(() => [
  { id: 'all' as const, label: t('places.index.all'), count: DESTINATIONS.length },
  ...DESTINATION_REGIONS.map((name) => ({ id: name, label: t(`common.regions.${name}`), count: DESTINATIONS.filter((city) => city.region === name).length }))
])
const shownCities = computed(() => (region.value === 'all' ? cities.value : cities.value.filter((city) => city.region === region.value)))

// Cities that have activities but are not in the curated list
const otherCities = computed(() => {
  const known = new Set(DESTINATIONS.map(catalogSlug))
  return (data.value?.data || []).filter((item) => !known.has(item.slug))
})

const siteOrigin = canonicalSiteOrigin(useRuntimeConfig().public.siteUrl)
useHead(() => ({
  title: t('places.index.metaTitle'),
  meta: [
    { name: 'description', content: t('places.index.metaDescription', { count: DESTINATIONS.length }), key: 'description' },
    { property: 'og:title', content: t('places.index.metaTitle'), key: 'og-title' },
    { property: 'og:url', content: `${siteOrigin}/destinations`, key: 'og-url' }
  ],
  link: [{ rel: 'canonical', href: `${siteOrigin}/destinations`, key: 'canonical' }]
}))
</script>
