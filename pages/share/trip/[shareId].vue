<template>
  <div class="mx-auto max-w-[1200px] space-y-6 pb-12 font-brand">
    <div v-if="!trip" class="rounded-2xl border border-[#E2E8F0] bg-white px-6 py-14 text-center">
      <p class="text-[18px] font-bold text-[#101D3A]">{{ t('trips.shared.goneTitle') }}</p>
      <p class="mx-auto mt-1 max-w-sm text-[14px] leading-[22px] text-[#64748B]">{{ t('trips.shared.goneText') }}</p>
      <NuxtLink :to="planOwnLink" class="btn-primary mx-auto mt-5 w-auto px-6">{{ t('trips.shared.planFamily') }}</NuxtLink>
    </div>

    <template v-else>
      <!-- Invite: the reason someone opened this link -->
      <div class="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#99E3EC] bg-[#E8F7FA] px-5 py-3 print:hidden">
        <p class="flex items-center gap-2 text-[14px] text-[#005F6B]">
          <svg class="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 3l1.9 4.8L19 9.5l-4.4 2.9L15.6 18 12 15l-3.6 3 1-5.6L5 9.5l5.1-1.7L12 3Z" /></svg>
          {{ t('trips.shared.banner') }}
        </p>
        <NuxtLink :to="planOwnLink" class="text-link text-[14px]" @click="trackCta('banner')">{{ t('trips.shared.planOwn') }}</NuxtLink>
      </div>

      <section class="relative isolate overflow-hidden rounded-2xl bg-[#101D3A] text-white">
        <img v-if="cover" :src="cover" alt="" width="1600" height="700" class="absolute inset-0 h-full w-full object-cover print:hidden" />
        <div class="absolute inset-0 bg-gradient-to-t from-[#101D3A] via-[#101D3A]/70 to-[#101D3A]/20 print:hidden"></div>
        <div class="relative px-5 pb-6 pt-24 sm:px-8 sm:pt-32">
          <p class="text-[12px] font-semibold uppercase tracking-[0.1em] text-[#5EEAD4]">{{ t('trips.shared.eyebrow') }}</p>
          <h1 class="mt-2 text-[28px] font-extrabold leading-9 tracking-[-0.025em] sm:text-[36px] sm:leading-[44px]">{{ trip.title }}</h1>
          <ul class="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-[14px] text-white/85">
            <li>{{ placeName(trip.destination) }}</li>
            <li>{{ tripDateRange(trip.startDate, trip.endDate) }} · {{ tripDayCount(trip.startDate, trip.endDate) }}</li>
            <li>{{ tripPartyLabel(trip.party) }}<span v-if="ages"> ({{ ages }})</span></li>
          </ul>
        </div>
      </section>

      <ItineraryView :itinerary="trip.itinerary" :activities="activities" />

      <section class="relative isolate overflow-hidden rounded-3xl bg-[#101D3A] p-6 text-white sm:p-10 print:hidden" aria-labelledby="own-title">
        <div class="absolute inset-0 bg-gradient-to-br from-[#008A9B]/40 to-transparent" aria-hidden="true"></div>
        <div class="relative flex flex-wrap items-center justify-between gap-6">
          <div class="max-w-xl">
            <h2 id="own-title" class="text-[24px] font-bold leading-8 tracking-[-0.02em] sm:text-[28px] sm:leading-9">{{ t('trips.shared.ownTitle') }}</h2>
            <p class="mt-2 text-[15px] leading-6 text-white/80">{{ t('trips.shared.ownText') }}</p>
          </div>
          <NuxtLink :to="planOwnLink" class="btn-primary w-auto px-6" @click="trackCta('footer')">
            {{ t('trips.shared.ownButton', { destination: placeName(trip.destination) }) }}
          </NuxtLink>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import ItineraryView from '~/components/planner/ItineraryView.vue'
import type { Itinerary, LiveActivity } from '~/types/trip'
import { destinationPhoto } from '~/utils/destination-photos'
import { canonicalSiteOrigin } from '~/utils/site-origin'
import { resolveAbsoluteOgImage } from '~/utils/socialPreview'

interface SharedTrip {
  title: string
  destination: string
  startDate: string
  endDate: string
  party: Array<{ age: number }>
  itinerary: Itinerary
}

const route = useRoute()
const shareId = String(route.params.shareId || '')
const siteOrigin = canonicalSiteOrigin(useRuntimeConfig().public.siteUrl)
const { track } = useFunnel()
const { t, placeName } = useI18n()
const { tripDateRange, tripDayCount, tripPartyLabel } = useTripDisplay()

// Loaded on the server so link previews (WhatsApp, Facebook, Zalo) see the title and photo
const { data } = await useAsyncData(`shared-trip-${shareId}`, () =>
  $fetch<{ data: SharedTrip; activities: Record<string, LiveActivity> }>(`/api/share/trips/${shareId}`).catch(() => null)
)
const trip = computed(() => data.value?.data ?? null)
const activities = computed(() => data.value?.activities ?? {})

const cover = computed(() => (trip.value ? destinationPhoto(trip.value.destination, 1600) : null))
const ages = computed(() => {
  const children = (trip.value?.party ?? []).filter((person) => person.age < 18).map((person) => person.age)
  return children.length ? t('trips.display.kids', { ages: children.join(t('trips.display.and')) }) : ''
})
const planOwnLink = computed(() =>
  trip.value ? `/planner?destination=${encodeURIComponent(trip.value.destination)}&from=shared_trip` : '/planner?from=shared_trip'
)

const trackCta = (placement: string) =>
  track('shared_trip_plan_own_clicked', { placement, destination: trip.value?.destination ?? null })

onMounted(() => {
  if (trip.value) track('shared_trip_viewed', { destination: trip.value.destination }, true)
})

useHead(() => {
  const value = trip.value
  const title = value
    ? t('trips.shared.metaTitle', { title: value.title, days: tripDayCount(value.startDate, value.endDate) })
    : t('trips.shared.metaFallbackTitle')
  const description = value?.itinerary.summary || t('trips.shared.metaDescription')
  // Cropped to the 1200x630 shape link previews use; falls back to the branded card
  const photo = value ? destinationPhoto(value.destination, 1200) : null
  const image = resolveAbsoluteOgImage(photo ? `${photo}&h=630` : '/og-image.jpg', siteOrigin)
  const url = `${siteOrigin}/share/trip/${shareId}`
  return {
    title,
    meta: [
      // Shared by link only; a family's travel dates should not show up in search
      { name: 'robots', content: 'noindex, nofollow' },
      { name: 'description', content: description, key: 'description' },
      { property: 'og:title', content: title, key: 'og-title' },
      { property: 'og:description', content: description, key: 'og-description' },
      { property: 'og:url', content: url, key: 'og-url' },
      { property: 'og:type', content: 'article', key: 'og-type' },
      { property: 'og:image', content: image, key: 'og-image' },
      { property: 'og:image:secure_url', content: image, key: 'og-image-secure' },
      { property: 'og:image:alt', content: value ? t('trips.shared.imageAlt', { destination: value.destination }) : 'GoTravelNha', key: 'og-image-alt' },
      { name: 'twitter:card', content: 'summary_large_image', key: 'twitter-card' },
      { name: 'twitter:title', content: title, key: 'twitter-title' },
      { name: 'twitter:description', content: description, key: 'twitter-description' },
      { name: 'twitter:image', content: image, key: 'twitter-image' }
    ]
  }
})
</script>
