<template>
  <div class="pb-16 font-brand sm:pb-20">
    <PageHero
      :eyebrow="t('partners.trip.eyebrow')"
      :title="t('partners.trip.title')"
      :subtitle="t('partners.trip.subtitle')"
      image="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=2400&q=80"
      :trust="tm<string[]>('partners.trip.trust')"
      overlap
    >
      <template #badge>
        <span class="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[13px] font-semibold text-[#101D3A] shadow-sm">
          <TripWordmark />
          {{ t('partners.trip.badge') }}
        </span>
      </template>
    </PageHero>

    <section id="trip-search" class="site-shell relative z-20 -mt-20 scroll-mt-24 sm:-mt-24" :aria-label="t('partners.trip.searchLabel')">
      <TravelSearch ref="searchRef" initial-mode="hotel" placement="trip_page" />
    </section>

    <div class="site-shell mt-12 space-y-14 sm:mt-16 sm:space-y-20">
      <section class="space-y-6">
        <SectionHeading :eyebrow="t('partners.trip.placesEyebrow')" :title="t('partners.trip.placesTitle')" :subtitle="t('partners.trip.placesSubtitle')" />
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 lg:gap-4">
          <CityTile
            v-for="place in places"
            :key="place.hotelCityId"
            :name="placeName(place.name)"
            :image="place.image"
            :cta="t('partners.trip.searchHotels')"
            @select="chooseCity(place.hotelCityId)"
          />
        </div>
      </section>

      <section class="space-y-6">
        <SectionHeading :eyebrow="t('partners.trip.offersEyebrow')" :title="t('partners.trip.offersTitle')" :subtitle="t('partners.trip.offersSubtitle')" />
        <div class="space-y-4 rounded-2xl border border-[#E2E8F0] bg-white p-3 sm:p-4">
          <StaticBanner />
          <DynamicBanner />
        </div>
      </section>

      <PopularDeals />

      <BookingNote>
        {{ t('partners.trip.bookingNote') }}
      </BookingNote>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import PopularDeals from '~/components/PopularDeals.vue'
import StaticBanner from '~/components/StaticBanner.vue'
import DynamicBanner from '~/components/DynamicBanner.vue'
import TripWordmark from '~/components/TripWordmark.vue'
import BookingNote from '~/components/site/BookingNote.vue'
import CityTile from '~/components/site/CityTile.vue'
import PageHero from '~/components/site/PageHero.vue'
import SectionHeading from '~/components/site/SectionHeading.vue'

definePageMeta({ bleed: true })
import { useActivityTracker } from '~/composables/useActivityTracker'
import { SEARCH_CITIES } from '~/utils/trip-search'
import { canonicalSiteOrigin } from '~/utils/site-origin'

const { startTracking, trackPageView } = useActivityTracker()
const { t, tm, placeName } = useI18n()

const searchRef = ref<{ selectHotelCity: (cityId: number) => void } | null>(null)

const placeImages: Record<string, string> = {
  Singapore: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=600&q=80',
  Bangkok: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=600&q=80',
  Tokyo: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=600&q=80',
  Bali: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80',
  'Hong Kong': 'https://images.unsplash.com/photo-1536599018102-9f803c140fc1?auto=format&fit=crop&w=600&q=80',
  Seoul: 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?auto=format&fit=crop&w=600&q=80'
}

const places = SEARCH_CITIES.filter((city) => placeImages[city.name]).map((city) => ({
  ...city,
  image: placeImages[city.name]
}))

const chooseCity = (cityId: number) => {
  searchRef.value?.selectHotelCity(cityId)
  document.getElementById('trip-search')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const baseUrl = canonicalSiteOrigin(useRuntimeConfig().public.siteUrl)
const tripOgImage = computed(() => `${baseUrl}/trip-logo.png`)

useHead(() => {
  const tripTitle = t('partners.trip.metaTitle')
  const tripDescription = t('partners.trip.metaDescription')
  return {
  title: tripTitle,
  meta: [
    { name: 'description', content: tripDescription },
    { property: 'og:title', content: tripTitle },
    { property: 'og:description', content: tripDescription },
    { property: 'og:image', content: tripOgImage.value },
    { property: 'og:url', content: `${baseUrl}/trip` },
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: 'GoTravelNha' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: tripTitle },
    { name: 'twitter:description', content: tripDescription },
    { name: 'twitter:image', content: tripOgImage.value }
  ],
  link: [
    { rel: 'canonical', href: `${baseUrl}/trip`, key: 'canonical' }
  ]
  }
})

onMounted(() => {
  startTracking()
  trackPageView('/trip', { platform: 'trip' })
})
</script>
