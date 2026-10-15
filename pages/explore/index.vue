<template>
  <div class="pb-16 font-brand sm:pb-20">
    <PageHero
      :eyebrow="t('explore.hero.eyebrow')"
      :title="t('explore.hero.title')"
      :subtitle="t('explore.hero.subtitle')"
      :image="heroImage"
      image-position="center 45%"
      :trust="tm<string[]>('explore.hero.trust')"
      overlap
    />

    <div class="site-shell relative z-20 -mt-20 sm:-mt-24">
      <PlannerPrompt placement="explore_hero" class="mx-auto max-w-3xl" />
    </div>

    <div class="site-shell mt-12 space-y-14 sm:mt-16 sm:space-y-20">
      <SampleItinerary />

      <section class="space-y-6">
        <SectionHeading :eyebrow="t('explore.destinations.eyebrow')" :title="t('explore.destinations.title')" :subtitle="t('explore.destinations.subtitle')">
          <template #action>
            <NuxtLink to="/destinations" class="text-link text-[14px]">{{ t('explore.destinations.all', { count: DESTINATIONS.length }) }}</NuxtLink>
          </template>
        </SectionHeading>
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 lg:gap-4">
          <CityTile
            v-for="city in cities"
            :key="city.name"
            :name="placeName(city.name)"
            :caption="t(`common.placeCaptions.${city.name}`)"
            :image="city.image"
            :to="`/planner?destination=${encodeURIComponent(city.name)}`"
            :cta="t('explore.destinations.cta')"
          />
        </div>
      </section>

      <!-- Booking is a supporting step: search on a partner, or open a booking guide -->
      <section id="deals" class="scroll-mt-24 space-y-4" aria-labelledby="deals-title">
        <h2 id="deals-title" class="text-[22px] font-bold leading-7 tracking-[-0.02em] text-[#101D3A] sm:text-[26px] sm:leading-8">
          {{ t('explore.deals.title') }}
        </h2>
        <TravelSearch placement="deals_hub" />
      </section>

      <section class="overflow-hidden rounded-3xl border border-[#E2E8F0] bg-white" aria-labelledby="compare-title">
        <div class="grid gap-8 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-center lg:p-10">
          <div>
            <p class="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#008A9B]">{{ t('explore.compare.eyebrow') }}</p>
            <h2 id="compare-title" class="mt-1 text-[26px] font-bold leading-8 tracking-[-0.025em] text-[#101D3A] sm:text-[32px] sm:leading-10">{{ t('explore.compare.title') }}</h2>
            <p class="mt-3 max-w-xl text-[15px] leading-6 text-[#475569]">
              {{ t('explore.compare.text') }}
            </p>
            <div class="mt-6 grid gap-2 sm:grid-cols-3">
              <NuxtLink
                v-for="item in comparisons"
                :key="item.to"
                :to="item.to"
                class="group flex min-h-12 items-center justify-between gap-2 rounded-xl border border-[#E2E8F0] px-4 text-[14px] font-semibold text-[#101D3A] transition hover:border-[#008A9B] hover:bg-[#E8F7FA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#008A9B]"
              >
                <span class="inline-flex items-center gap-2">
                  <svg class="h-[18px] w-[18px] text-[#008A9B]" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" :d="item.icon" /></svg>
                  {{ t(item.label) }}
                </span>
                <svg class="h-4 w-4 text-[#94A3B8] transition group-hover:translate-x-0.5 group-hover:text-[#008A9B]" viewBox="0 0 20 20" fill="none" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 10h12m0 0-5-5m5 5-5 5" /></svg>
              </NuxtLink>
            </div>
          </div>

          <div class="relative grid gap-3 sm:grid-cols-2">
            <div v-for="partner in partners" :key="partner.name" class="rounded-2xl border p-5" :class="partner.surface">
              <span class="inline-flex h-11 min-w-11 items-center justify-center rounded-xl bg-white px-2.5 shadow-sm ring-1 ring-black/5" aria-hidden="true">
                <TripWordmark v-if="partner.name === 'Trip.com'" />
                <KlookIcon v-else :size="24" />
              </span>
              <h3 class="mt-3 text-[17px] font-bold text-[#101D3A]">{{ partner.name }}</h3>
              <ul class="mt-2 space-y-1.5">
                <li v-for="point in tm<string[]>(partner.points)" :key="point" class="flex items-start gap-2 text-[14px] leading-5 text-[#475569]">
                  <svg class="mt-0.5 h-4 w-4 shrink-0 text-[#008A9B]" viewBox="0 0 20 20" fill="none" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m5 10.5 3 3 7-7" /></svg>
                  {{ point }}
                </li>
              </ul>
            </div>
            <span class="absolute left-1/2 top-1/2 hidden h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#101D3A] text-[12px] font-bold text-white ring-4 ring-white sm:inline-flex" aria-hidden="true">VS</span>
          </div>
        </div>
      </section>

      <section class="space-y-6">
        <SectionHeading :eyebrow="t('explore.guides.eyebrow')" :title="t('explore.guides.title')" :subtitle="t('explore.guides.subtitle')">
          <template #action>
            <p v-if="!loadingTemplates && dealTemplates.length" class="text-[13px] text-[#64748B]">{{ t('explore.guides.count', { count: dealTemplates.length }) }}</p>
          </template>
        </SectionHeading>

        <div v-if="loadingTemplates" class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div v-for="n in 3" :key="n" class="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white">
            <div class="aspect-[16/10] animate-pulse bg-[#F1F5F9]"></div>
            <div class="space-y-2 p-5">
              <div class="h-3 w-24 animate-pulse rounded bg-[#F1F5F9]"></div>
              <div class="h-5 w-4/5 animate-pulse rounded bg-[#F1F5F9]"></div>
            </div>
          </div>
        </div>

        <div v-else-if="dealTemplates.length === 0" class="rounded-2xl border border-dashed border-[#CBD5E1] bg-white px-6 py-10 text-center">
          <p class="font-semibold text-[#101D3A]">{{ t('explore.guides.emptyTitle') }}</p>
          <p class="mt-1 text-sm text-[#64748B]">{{ t('explore.guides.emptyText') }}</p>
        </div>

        <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 xl:gap-5">
          <DealHubCard
            v-for="item in dealTemplates"
            :key="item.slug"
            :template="item"
            :outcome="hubOutcomeLine(item)"
          />
        </div>
      </section>

      <section class="space-y-6" aria-labelledby="how-title">
        <SectionHeading :eyebrow="t('explore.how.eyebrow')" :title="t('explore.how.title')" />
        <ol class="grid gap-4 sm:grid-cols-3">
          <li v-for="(step, index) in tm<{ title: string; text: string }[]>('explore.how.steps')" :key="step.title" class="rounded-2xl border border-[#E2E8F0] bg-white p-5">
            <span class="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#E8F7FA] text-[13px] font-bold text-[#008A9B]">{{ index + 1 }}</span>
            <h3 class="mt-3 text-[16px] font-bold leading-6 text-[#101D3A]">{{ step.title }}</h3>
            <p class="mt-1 text-[14px] leading-[22px] text-[#64748B]">{{ step.text }}</p>
          </li>
        </ol>
      </section>

      <NewsletterSignup
        variant="band"
        source="explore_home"
        :title="t('explore.newsletter.title')"
        :text="t('explore.newsletter.text')"
        :button-label="t('explore.newsletter.button')"
      />


        <BookingNote>
          {{ t('explore.bookingNote.text') }}
          <template #links>
            <div class="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[14px] font-semibold">
              <NuxtLink to="/help" class="text-[#008A9B] underline-offset-2 hover:underline">{{ t('explore.bookingNote.help') }}</NuxtLink>
              <NuxtLink to="/contact" class="text-[#008A9B] underline-offset-2 hover:underline">{{ t('explore.bookingNote.contact') }}</NuxtLink>
            </div>
          </template>
        </BookingNote>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import DealHubCard from '~/components/deals/DealHubCard.vue'
import KlookIcon from '~/components/KlookIcon.vue'
import NewsletterSignup from '~/components/NewsletterSignup.vue'
import TripWordmark from '~/components/TripWordmark.vue'
import BookingNote from '~/components/site/BookingNote.vue'
import CityTile from '~/components/site/CityTile.vue'
import PageHero from '~/components/site/PageHero.vue'
import PlannerPrompt from '~/components/site/PlannerPrompt.vue'
import SampleItinerary from '~/components/site/SampleItinerary.vue'
import SectionHeading from '~/components/site/SectionHeading.vue'
import { destinationPhoto } from '~/utils/destination-photos'
import { DESTINATIONS } from '~/utils/destination-catalog'
import type { DealPageTemplate } from '~/types/deal-template'
import { inferOgImageMime, resolveAbsoluteOgImage } from '~/utils/socialPreview'
import { canonicalSiteOrigin } from '~/utils/site-origin'
import en from '~/locales/en'

definePageMeta({
  layout: 'default',
  bleed: true
})

const siteOrigin = canonicalSiteOrigin(useRuntimeConfig().public.siteUrl)
const { t, tm, locale, placeName } = useI18n()

const allowedBuiltinSlugs = new Set(['flights', 'hotels', 'attractions'])

const comparisons = [
  {
    to: '/explore/flights',
    label: 'explore.compare.flights',
    icon: 'M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2Z'
  },
  {
    to: '/explore/hotels',
    label: 'explore.compare.hotels',
    icon: 'M3 20V6a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v14M14 10h6a1 1 0 0 1 1 1v9M2 20h20M7 9h3M7 13h3M7 17h3'
  },
  {
    to: '/explore/attractions',
    label: 'explore.compare.attractions',
    icon: 'M3 9V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a3 3 0 0 0 0 6v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a3 3 0 0 0 0-6ZM13 5v2M13 17v2M13 11v2'
  }
] as const

// Matches the highlights on the comparison pages
const partners = [
  { name: 'Trip.com', surface: 'border-[#1B5FD1]/15 bg-[#F5F9FF]', points: 'explore.compare.tripPoints' },
  { name: 'Klook', surface: 'border-[#C2410C]/15 bg-[#FFF8F3]', points: 'explore.compare.klookPoints' }
] as const


// Six featured cities; /destinations lists them all
const cities = DESTINATIONS.filter((city) => city.featured).map((city) => ({
  ...city,
  image: destinationPhoto(city.name, 600) as string
}))

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
const dealTemplates = computed(() =>
  (templateList.value || []).map((item) => {
    // Only unedited built-in guides; an admin-edited card keeps its own wording
    const builtin = en.explore.guides.items[item.slug as keyof typeof en.explore.guides.items]
    if (locale.value === 'en' || !builtin || item.title !== builtin.title) return item
    const copy = tm<{ title: string; outcome: string; destination: string; category: string }>(`explore.guides.items.${item.slug}`)
    return { ...item, title: copy.title, hubOutcome: copy.outcome, destination: copy.destination, category: copy.category }
  })
)

const hubOutcomeFallback: Record<string, string> = {
  flights: 'Open flight search on Trip.com and Klook from one page.',
  hotels: 'Check room types and totals on both partners before you pay.',
  attractions: 'See what Singapore tickets include on each partner.'
}

const hubOutcomeLine = (item: DealPageTemplate) =>
  item.hubOutcome?.trim() ||
  hubOutcomeFallback[item.slug] ||
  item.summaryBullets?.[0] ||
  t('explore.guides.fallbackOutcome')

const heroImage = 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=2400&q=80'

// The home page is the most shared link, so it uses the branded card rather than a deal photo
const hubOgImage = computed(() => resolveAbsoluteOgImage('/og-image.jpg', siteOrigin))

const hubImageMime = computed(() => inferOgImageMime(hubOgImage.value))

useHead(() => {
  const title = t('explore.meta.title')
  const description = t('explore.meta.description')
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

