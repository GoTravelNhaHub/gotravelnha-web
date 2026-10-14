<template>
  <div class="mx-auto max-w-[1200px] space-y-6 pb-12 font-brand">
    <div class="flex items-center justify-between gap-3 print:hidden">
      <NuxtLink to="/mytrip" class="inline-flex min-h-11 items-center gap-1.5 text-[14px] font-semibold text-[#475569] hover:text-[#101D3A]">
        <svg class="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 10H4m0 0 5-5m-5 5 5 5" /></svg>
        My trips
      </NuxtLink>
      <div v-if="trip" class="flex gap-2">
        <button type="button" class="btn-secondary min-h-10 w-auto px-3.5 text-[13px]" @click="printTrip">
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M7 9V4h10v5M7 17H5a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-2M7 14h10v6H7v-6Z" /></svg>
          <span class="sr-only sm:not-sr-only">Print</span>
        </button>
        <button
          type="button"
          class="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-[#FECACA] px-3.5 text-[13px] font-semibold text-[#B91C1C] hover:bg-[#FEF2F2] disabled:opacity-60"
          :disabled="deleting"
          @click="removeTrip"
        >
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M4 7h16M10 11v6M14 11v6M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-12M9 7V4h6v3" /></svg>
          <span class="sr-only sm:not-sr-only">{{ deleting ? 'Deleting…' : 'Delete' }}</span>
        </button>
      </div>
    </div>

    <p v-if="error" class="alert-error" role="alert">{{ error }}</p>

    <div v-if="loading" class="space-y-4" aria-hidden="true">
      <div class="h-56 animate-pulse rounded-2xl bg-[#E2E8F0]/60"></div>
      <div class="h-40 animate-pulse rounded-2xl bg-[#E2E8F0]/60"></div>
    </div>

    <template v-else-if="trip">
      <!-- Trip header -->
      <section class="relative isolate overflow-hidden rounded-2xl bg-[#101D3A] text-white">
        <img v-if="cover" :src="cover" alt="" width="1600" height="700" class="absolute inset-0 h-full w-full object-cover print:hidden" />
        <div class="absolute inset-0 bg-gradient-to-t from-[#101D3A] via-[#101D3A]/70 to-[#101D3A]/20 print:hidden"></div>
        <div class="relative px-5 pb-6 pt-24 sm:px-8 sm:pt-32">
          <span class="inline-flex rounded-full px-2.5 py-1 text-[12px] font-semibold" :class="status.classes">{{ status.label }}</span>
          <h1 class="mt-3 text-[28px] font-extrabold leading-9 tracking-[-0.025em] sm:text-[36px] sm:leading-[44px]">{{ trip.title }}</h1>
          <ul class="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-[14px] text-white/85">
            <li class="inline-flex items-center gap-1.5">
              <svg class="h-4 w-4 text-[#5EEAD4]" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 21s-7-5.6-7-11a7 7 0 1 1 14 0c0 5.4-7 11-7 11ZM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" /></svg>
              {{ trip.destination }}
            </li>
            <li class="inline-flex items-center gap-1.5">
              <svg class="h-4 w-4 text-[#5EEAD4]" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M7 3v3m10-3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" /></svg>
              {{ tripDateRange(trip.startDate, trip.endDate) }} · {{ tripDayCount(trip.startDate, trip.endDate) }}
            </li>
            <li class="inline-flex items-center gap-1.5">
              <svg class="h-4 w-4 text-[#5EEAD4]" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M16 19v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1M9 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm13 9v-1a4 4 0 0 0-3-3.9M16 4.1a3 3 0 0 1 0 5.8" /></svg>
              {{ tripPartyLabel(trip.party) }}
            </li>
          </ul>
          <ul v-if="trip.party.length" class="mt-4 flex flex-wrap gap-2" aria-label="Travellers">
            <li v-for="(person, index) in trip.party" :key="index" class="rounded-full bg-white/10 px-3 py-1 text-[13px] ring-1 ring-white/20">
              {{ person.name || (person.age < 18 ? 'Child' : 'Adult') }} · {{ person.age }}
            </li>
          </ul>
        </div>
      </section>

      <!-- Jump to a day -->
      <nav v-if="trip.itinerary.days.length > 1" class="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] print:hidden" aria-label="Days">
        <a
          v-for="(day, index) in trip.itinerary.days"
          :key="day.date"
          :href="`#day-${index + 1}`"
          class="shrink-0 rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2 text-left hover:border-[#008A9B]/40"
        >
          <span class="block text-[12px] font-semibold text-[#008A9B]">Day {{ index + 1 }}</span>
          <span class="block whitespace-nowrap text-[13px] text-[#334155]">{{ shortDay(day.date) }}</span>
        </a>
      </nav>

      <ItineraryView :itinerary="trip.itinerary" :activities="activities" />

      <section v-if="recommendations.length" class="space-y-4 print:hidden" aria-labelledby="more-title">
        <div>
          <p class="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#008A9B]">More for your family</p>
          <h2 id="more-title" class="mt-1 text-[22px] font-bold tracking-[-0.02em] text-[#101D3A]">Other things to do in {{ trip.destination }}</h2>
          <p class="mt-1 text-[14px] text-[#64748B]">Picked for your travellers' ages and interests.</p>
        </div>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ActivityCard v-for="activity in recommendations" :key="activity.id" :activity="activity" placement-key="trip_recommendations" />
        </div>
      </section>

      <section class="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#E2E8F0] bg-gradient-to-br from-white to-[#E8F7FA] p-5 print:hidden">
        <div>
          <h2 class="text-[16px] font-bold text-[#101D3A]">Planning another trip?</h2>
          <p class="text-[14px] text-[#64748B]">The AI Travel Agent remembers your family's ages.</p>
        </div>
        <NuxtLink :to="`/planner?destination=${encodeURIComponent(trip.destination)}`" class="btn-primary w-auto px-5">Plan with the AI agent</NuxtLink>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ItineraryView from '~/components/planner/ItineraryView.vue'
import ActivityCard from '~/components/planner/ActivityCard.vue'
import type { Itinerary, LiveActivity, RecommendedActivity, TripPartyMember } from '~/types/trip'
import { destinationPhoto } from '~/utils/destination-photos'
import { tripDateRange, tripDayCount, tripPartyLabel, tripStatus } from '~/utils/trip-display'

definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

interface SavedTrip {
  id: string
  title: string
  destination: string
  startDate: string
  endDate: string
  party: TripPartyMember[]
  itinerary: Itinerary
}

const route = useRoute()
const router = useRouter()
const trip = ref<SavedTrip | null>(null)
const activities = ref<Record<string, LiveActivity>>({})
const recommendations = ref<RecommendedActivity[]>([])
const error = ref<string | null>(null)
const loading = ref(true)
const deleting = ref(false)

const cover = computed(() => (trip.value ? destinationPhoto(trip.value.destination, 1600) : null))
const status = computed(() => (trip.value ? tripStatus(trip.value.startDate, trip.value.endDate) : { label: '', classes: '' }))
const shortDay = (date: string) =>
  new Intl.DateTimeFormat('en-SG', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' }).format(new Date(`${date}T00:00:00Z`))

const printTrip = () => window.print()

const removeTrip = async () => {
  if (!trip.value || !window.confirm(`Delete "${trip.value.title}"? This can't be undone.`)) return
  try {
    deleting.value = true
    await $fetch(`/api/trips/${trip.value.id}`, { method: 'DELETE' })
    router.push('/mytrip')
  } catch (err: any) {
    error.value = err?.data?.message || 'Could not delete this trip.'
  } finally {
    deleting.value = false
  }
}

onMounted(async () => {
  try {
    const response = await $fetch<{ data: SavedTrip; activities: Record<string, LiveActivity> }>(`/api/trips/${route.params.id}`)
    trip.value = response.data
    activities.value = response.activities
  } catch (err: any) {
    error.value = err?.data?.message || 'Could not load this trip.'
    return
  } finally {
    loading.value = false
  }

  // Extra suggestions are optional; the trip still shows if this fails
  try {
    const response = await $fetch<{ data: RecommendedActivity[] }>(`/api/trips/${route.params.id}/recommendations`)
    recommendations.value = response.data
  } catch {
    recommendations.value = []
  }
})

useHead(() => ({ title: trip.value ? `${trip.value.title} | GoTravelNha` : 'Trip | GoTravelNha' }))
</script>
