<template>
  <div class="space-y-6 sm:space-y-8 pb-12 sm:pb-16 bg-gradient-to-b from-white to-slate-50 min-h-screen">
    <!-- Mobile Native Header (Mobile Only) -->
    <section class="lg:hidden max-w-7xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6">
      <div class="mb-6">
        <h1 class="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">
          Trip.com
        </h1>
        <p class="text-lg sm:text-xl font-semibold text-slate-700">
          Discover Amazing Hotels
        </p>
      </div>
    </section>

    <!-- Desktop Hero Section (Hidden on Mobile) -->
    <section class="hidden lg:block max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-0 lg:pt-1">
      <div class="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white p-10 md:p-16 rounded-[40px] shadow-2xl overflow-hidden relative">
        <!-- Decorative background elements -->
        <div class="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl"></div>
        <div class="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full -ml-48 -mb-48 blur-3xl"></div>
        
        <div class="relative z-10">
          <div class="text-center mb-6">
            <h2 class="text-5xl md:text-6xl font-black text-white mb-4 drop-shadow-2xl">
              Trip.com
            </h2>
          </div>
          
          <h1 class="text-4xl md:text-5xl lg:text-6xl font-black mb-4 text-center drop-shadow-2xl">
            Discover Amazing Hotels
          </h1>
          <p class="text-lg md:text-xl text-center text-blue-100 max-w-2xl mx-auto mb-8 font-medium">
            Search hotels and flights on Trip.com with your dates and travellers filled in
          </p>
          
        </div>
      </div>
    </section>
  
    <!-- Search Box -->
    <section class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <TravelSearch initial-mode="hotel" placement="trip_page" />
      <div class="mt-6">
        <ResponsiveTripSearchBox />
      </div>
    </section>
  
    <!-- Banners -->
    <section class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 sm:space-y-6">
      <StaticBanner />
      <DynamicBanner />
    </section>

    <!-- Popular Deals -->
    <section class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <PopularDeals />
    </section>
  </div>
</template>
  
<script setup lang="ts">
import PopularDeals from '~/components/PopularDeals.vue'
import StaticBanner from '~/components/StaticBanner.vue'
import DynamicBanner from '~/components/DynamicBanner.vue'
import ResponsiveTripSearchBox from '~/components/ResponsiveTripSearchBox.vue'
import { useActivityTracker } from '~/composables/useActivityTracker'
import { onMounted, computed } from 'vue'

const { startTracking, trackPageView } = useActivityTracker()

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