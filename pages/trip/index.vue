<template>
  <div class="space-y-8 pb-12 sm:space-y-10 sm:pb-16">
    <section class="overflow-hidden rounded-3xl bg-ink text-white">
      <div class="relative">
        <img
          src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80"
          alt=""
          width="1200"
          height="640"
          class="absolute inset-0 h-full w-full object-cover"
        />
        <div class="absolute inset-0 bg-ink/75"></div>
        <div class="relative px-5 py-8 sm:px-8 sm:py-12">
          <p class="text-sm font-semibold text-white">Hotels and flights</p>
          <h1 class="mt-2 max-w-3xl font-display text-4xl leading-tight sm:text-5xl">Find a stay, then book it on Trip.com</h1>
          <p class="mt-3 max-w-2xl text-base leading-relaxed text-white/90">
            Search hotels and flights here. Trip.com shows the room, the fare, and the total before you pay.
          </p>
          <p class="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5">
            <TripWordmark />
            <span class="text-sm font-semibold text-ink">Booking partner</span>
          </p>
        </div>
      </div>
    </section>

    <section id="trip-search" class="scroll-mt-28">
      <h2 class="font-display text-2xl text-ink sm:text-3xl">Search</h2>
      <p class="mt-1 mb-4 text-sm text-ink/70">Hotels or flights. Checkout stays on Trip.com.</p>
      <TravelSearch ref="searchRef" initial-mode="hotel" placement="trip_page" />
    </section>

    <section class="space-y-4">
      <div>
        <h2 class="font-display text-2xl text-ink sm:text-3xl">Places to stay</h2>
        <p class="mt-1 text-sm text-ink/70">Choose a city, then add your dates in the search above.</p>
      </div>
      <div class="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-4">
        <button
          v-for="place in places"
          :key="place.hotelCityId"
          type="button"
          class="group overflow-hidden rounded-2xl border border-line bg-white text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sea"
          @click="chooseCity(place.hotelCityId)"
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
            <p class="mt-1 text-sm font-semibold text-sea">Search hotels</p>
          </div>
        </button>
      </div>
    </section>

    <section class="space-y-4">
      <div>
        <h2 class="font-display text-2xl text-ink sm:text-3xl">Offers from Trip.com</h2>
        <p class="mt-1 text-sm text-ink/70">These promotions open on Trip.com. The price is confirmed there.</p>
      </div>
      <div class="space-y-4">
        <StaticBanner />
        <DynamicBanner />
      </div>
    </section>

    <PopularDeals />

    <section class="rounded-2xl border border-line bg-white px-5 py-5 sm:px-6">
      <h2 class="font-display text-xl text-ink">Where you book</h2>
      <p class="mt-2 max-w-3xl text-sm leading-relaxed text-ink/75">
        Hotel and flight checkout opens on Trip.com. GoTravelNha does not charge you for these bookings.
      </p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import PopularDeals from '~/components/PopularDeals.vue'
import StaticBanner from '~/components/StaticBanner.vue'
import DynamicBanner from '~/components/DynamicBanner.vue'
import TripWordmark from '~/components/TripWordmark.vue'
import { useActivityTracker } from '~/composables/useActivityTracker'
import { SEARCH_CITIES } from '~/utils/trip-search'

const { startTracking, trackPageView } = useActivityTracker()

const searchRef = ref<{ selectHotelCity: (cityId: number) => void } | null>(null)

const placeImages: Record<string, string> = {
  Singapore: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=900&q=80',
  Bangkok: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=900&q=80',
  Tokyo: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=900&q=80',
  Bali: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=900&q=80',
  'Hong Kong': 'https://images.unsplash.com/photo-1536599018102-9f803c140fc1?auto=format&fit=crop&w=900&q=80',
  Seoul: 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?auto=format&fit=crop&w=900&q=80'
}

const places = SEARCH_CITIES.filter((city) => placeImages[city.name]).map((city) => ({
  ...city,
  image: placeImages[city.name]
}))

const chooseCity = (cityId: number) => {
  searchRef.value?.selectHotelCity(cityId)
  document.getElementById('trip-search')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const requestURL = useRequestURL()
const baseUrl = computed(() => `${requestURL.protocol}//${requestURL.host}`)
const tripTitle = 'Trip.com Hotel Deals & Search | GoTravelNha'
const tripDescription = 'Plan your stay with Trip.com hotel deals, search widgets, and curated travel banners powered by GoTravelNha.'
const tripOgImage = computed(() => `${baseUrl.value}/trip-logo.png`)

useHead(() => ({
  title: tripTitle,
  meta: [
    { name: 'description', content: tripDescription },
    { property: 'og:title', content: tripTitle },
    { property: 'og:description', content: tripDescription },
    { property: 'og:image', content: tripOgImage.value },
    { property: 'og:url', content: `${baseUrl.value}/trip` },
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: 'GoTravelNha' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: tripTitle },
    { name: 'twitter:description', content: tripDescription },
    { name: 'twitter:image', content: tripOgImage.value }
  ],
  link: [
    { rel: 'canonical', href: `${baseUrl.value}/trip`, key: 'canonical' }
  ]
}))

onMounted(() => {
  startTracking()
  trackPageView('/trip', { platform: 'trip' })
})
</script>
