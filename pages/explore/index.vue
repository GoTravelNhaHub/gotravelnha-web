<template>
  <div class="space-y-8 pb-12 sm:space-y-10 sm:pb-16">
    <section class="overflow-hidden rounded-3xl bg-ink text-white">
      <div class="relative">
        <img
          v-if="heroPhoto"
          :src="heroPhoto"
          alt=""
          width="1200"
          height="640"
          class="absolute inset-0 h-full w-full object-cover"
        />
        <div class="absolute inset-0 bg-ink/80"></div>
        <div class="relative px-5 py-8 sm:px-8 sm:py-12">
          <p class="text-sm font-semibold text-white/80">Flights, hotels, and things to do</p>
          <h1 class="mt-2 max-w-3xl font-display text-4xl leading-tight sm:text-5xl">Find the trip, then compare where to book</h1>
          <p class="mt-3 max-w-2xl text-base leading-relaxed text-white/90">
            Search flights and hotels here. Open a comparison when you want Trip.com and Klook side by side. Prices are shown by the partner before you pay.
          </p>
        </div>
      </div>
    </section>

    <TravelSearch placement="deals_hub" />

    <nav aria-label="Ways to start" class="grid grid-cols-2 gap-3 lg:grid-cols-3">
      <NuxtLink
        v-for="entry in entries"
        :key="entry.to"
        :to="entry.to"
        class="rounded-2xl border border-line bg-white px-4 py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sea"
      >
        <span class="block text-base font-semibold text-ink">{{ entry.label }}</span>
        <span class="mt-1 block text-sm leading-snug text-ink/65">{{ entry.detail }}</span>
      </NuxtLink>
    </nav>

    <section class="space-y-4">
      <div class="flex items-end justify-between gap-3">
        <h2 class="font-display text-2xl text-ink sm:text-3xl">Compare and book</h2>
        <p v-if="!loadingTemplates" class="text-sm text-ink/70">{{ dealTemplates.length }} pages</p>
      </div>

      <div v-if="loadingTemplates" class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div v-for="n in 3" :key="n" class="overflow-hidden rounded-2xl border border-line bg-white">
          <div class="aspect-[3/2] animate-pulse bg-sand"></div>
          <div class="space-y-2 p-5">
            <div class="h-3 w-24 animate-pulse rounded bg-sand"></div>
            <div class="h-5 w-4/5 animate-pulse rounded bg-sand"></div>
          </div>
        </div>
      </div>

      <div v-else-if="dealTemplates.length === 0" class="rounded-2xl border border-dashed border-line bg-white px-6 py-10 text-center">
        <p class="font-semibold text-ink">No comparison pages yet</p>
        <p class="mt-1 text-sm text-ink/65">Flight, hotel, and attraction comparisons will show up here when they are published.</p>
      </div>

      <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <DealHubCard
          v-for="item in dealTemplates"
          :key="item.slug"
          :template="item"
          :outcome="hubOutcomeLine(item)"
        />
      </div>
    </section>

    <section class="rounded-2xl border border-line bg-white px-5 py-5 sm:px-6">
      <h2 class="font-display text-xl text-ink">Where you book</h2>
      <p class="mt-2 max-w-3xl text-sm leading-relaxed text-ink/75">
        Flight and hotel checkout opens on Trip.com or Klook. Singapore attraction tickets that we sell are paid for on GoTravelNha.
        Questions go through Help or Contact.
      </p>
      <div class="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm font-semibold">
        <NuxtLink to="/help" class="text-sea underline-offset-2 hover:underline">Help</NuxtLink>
        <NuxtLink to="/contact" class="text-sea underline-offset-2 hover:underline">Contact</NuxtLink>
        <NuxtLink to="/planner" class="text-sea underline-offset-2 hover:underline">AI Travel Agent</NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import DealHubCard from '~/components/deals/DealHubCard.vue'
import type { DealPageTemplate } from '~/types/deal-template'
import { inferOgImageMime, resolveAbsoluteOgImage } from '~/utils/socialPreview'
import { canonicalSiteOrigin } from '~/utils/site-origin'

definePageMeta({
  layout: 'default'
})

const siteOrigin = canonicalSiteOrigin(useRuntimeConfig().public.siteUrl)

const allowedBuiltinSlugs = new Set(['flights', 'hotels', 'attractions'])

const entries = [
  { to: '/explore/flights', label: 'Flights', detail: 'Compare flight search on Trip.com and Klook' },
  { to: '/explore/hotels', label: 'Hotels', detail: 'Compare hotel search before you book' },
  { to: '/attractionsg', label: 'Attractions', detail: 'Singapore tickets, when a current price is listed' },
  { to: '/destinations', label: 'Destinations', detail: 'Places to visit' },
  { to: '/planner', label: 'AI Travel Agent', detail: 'A day-by-day plan for your family' }
] as const

const { data: templateList, pending: loadingTemplates } = await useAsyncData('deal-hub-templates', async () => {
  try {
    const response = await $fetch<{ success?: boolean; data?: DealPageTemplate[] }>('/api/deal-templates')
    const list = response?.success ? (response.data || []) : []
    return list.filter((item) => allowedBuiltinSlugs.has(item.slug))
  } catch (error) {
    console.error('Failed to load deal templates:', error)
    return []
  }
})
const dealTemplates = computed(() => templateList.value || [])

const hubOutcomeFallback: Record<string, string> = {
  flights: 'Side-by-side flight search — fewer tabs, clearer fares.',
  hotels: 'Stack up room rates and perks before you pay.',
  attractions: 'Ticket options for Singapore highlights in one glance.'
}

const hubOutcomeLine = (item: DealPageTemplate) =>
  item.hubOutcome?.trim() ||
  hubOutcomeFallback[item.slug] ||
  item.summaryBullets?.[0] ||
  'Compare trusted partners in one place.'

const heroPhoto = computed(() => dealTemplates.value.find((item) => item.heroImage)?.heroImage || '')

const hubOgImage = computed(() => {
  const first = dealTemplates.value.find((t) => t.heroImage)
  return resolveAbsoluteOgImage(first?.heroImage || null, siteOrigin)
})

const hubImageMime = computed(() => inferOgImageMime(hubOgImage.value))

useHead(() => {
  const title = 'Compare flights, hotels & attractions | GoTravelNha Deals'
  const description =
    'Search flights and hotels, then continue on Trip.com or Klook. Singapore attraction tickets are sold here only when a current price is listed.'
  const canonical = `${siteOrigin}/explore`
  const img = hubOgImage.value
  const secure = img.startsWith('https://') ? img : img.replace(/^http:\/\//i, 'https://')

  return {
    title,
    meta: [
      { name: 'description', content: description, key: 'description' },
      { property: 'og:title', content: title, key: 'og-title' },
      { property: 'og:description', content: description, key: 'og-description' },
      { property: 'og:url', content: canonical, key: 'og-url' },
      { property: 'og:type', content: 'website', key: 'og-type' },
      { property: 'og:site_name', content: 'GoTravelNha', key: 'og-site-name' },
      { property: 'og:locale', content: 'en_US', key: 'og-locale' },
      { property: 'og:image', content: img, key: 'og-image' },
      { property: 'og:image:secure_url', content: secure, key: 'og-image-secure' },
      { property: 'og:image:type', content: hubImageMime.value, key: 'og-image-type' },
      { property: 'og:image:alt', content: 'GoTravelNha travel comparison hub', key: 'og-image-alt' },
      { name: 'twitter:card', content: 'summary_large_image', key: 'twitter-card' },
      { name: 'twitter:title', content: title, key: 'twitter-title' },
      { name: 'twitter:description', content: description, key: 'twitter-description' },
      { name: 'twitter:image', content: img, key: 'twitter-image' }
    ],
    link: [{ rel: 'canonical', href: canonical, key: 'canonical' }]
  }
})
</script>

