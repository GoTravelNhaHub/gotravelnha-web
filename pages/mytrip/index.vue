<template>
  <div class="mx-auto max-w-[1200px] space-y-6 pb-12 font-brand">
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 class="text-[26px] font-bold leading-9 tracking-[-0.025em] text-[#0A1024]">{{ t('trips.list.title') }}</h1>
        <p class="text-[15px] text-[#64748B]">{{ t('trips.list.subtitle') }}</p>
      </div>
      <NuxtLink to="/planner" class="btn-primary w-auto px-5">
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v14M5 12h14" /></svg>
        {{ t('trips.list.planNew') }}
      </NuxtLink>
    </div>

    <p v-if="error" class="alert-error" role="alert">{{ error }}</p>

    <div v-if="trips.length" class="inline-grid grid-cols-2 gap-1 rounded-xl bg-[#E2E8F0]/70 p-1" role="tablist" :aria-label="t('trips.list.tabsLabel')">
      <button
        v-for="option in tabs"
        :key="option.id"
        type="button"
        role="tab"
        :aria-selected="tab === option.id"
        class="min-h-9 rounded-lg px-4 text-[13px] font-semibold"
        :class="tab === option.id ? 'bg-white text-[#0A1024] shadow-[0_1px_3px_rgba(10,16,36,0.12)]' : 'text-[#64748B] hover:text-[#0A1024]'"
        @click="tab = option.id"
      >
        {{ option.label }} <span class="ml-0.5 text-[#94A3B8]">{{ option.count }}</span>
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-4 4xl:grid-cols-5" aria-hidden="true">
      <div v-for="n in 3" :key="n" class="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white">
        <div class="aspect-[16/9] animate-pulse bg-[#F1F5F9]"></div>
        <div class="space-y-2 p-4">
          <div class="h-5 w-3/4 animate-pulse rounded bg-[#F1F5F9]"></div>
          <div class="h-4 w-1/2 animate-pulse rounded bg-[#F1F5F9]"></div>
        </div>
      </div>
    </div>

    <!-- Trips -->
    <ul v-else-if="shownTrips.length" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-4 4xl:grid-cols-5">
      <li v-for="trip in shownTrips" :key="trip.id">
        <NuxtLink
          :to="`/mytrip/${trip.id}`"
          class="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white transition hover:-translate-y-0.5 hover:shadow-[0_20px_40px_-24px_rgba(10,16,36,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066E4]"
        >
          <div class="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-[#0066E4] to-[#0A1024]">
            <img
              v-if="destinationPhoto(trip.destination, 720)"
              :src="destinationPhoto(trip.destination, 720)!"
              alt=""
              width="720"
              height="405"
              loading="lazy"
              decoding="async"
              class="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
            <span v-else class="absolute inset-0 flex items-center justify-center text-white/70" aria-hidden="true">
              <svg class="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 21s-7-5.6-7-11a7 7 0 1 1 14 0c0 5.4-7 11-7 11ZM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" /></svg>
            </span>
            <span class="absolute inset-0 bg-gradient-to-t from-[#0A1024]/60 to-transparent"></span>
            <span class="absolute left-3 top-3 rounded-full px-2.5 py-1 text-[12px] font-semibold" :class="status(trip).classes">{{ status(trip).label }}</span>
            <span class="absolute bottom-3 left-4 text-[13px] font-semibold text-white">{{ placeName(trip.destination) }}</span>
          </div>
          <div class="flex flex-1 flex-col p-4">
            <h2 class="text-[17px] font-bold leading-6 tracking-[-0.01em] text-[#0A1024] group-hover:text-[#0057C8]">{{ trip.title }}</h2>
            <p class="mt-1 text-[14px] text-[#475569]">{{ dateRange(trip.startDate, trip.endDate) }} · {{ dayCount(trip) }}</p>
            <p class="mt-auto pt-3 text-[13px] text-[#64748B]">{{ partyLabel(trip.party) }}</p>
          </div>
        </NuxtLink>
      </li>
    </ul>

    <!-- Empty -->
    <div v-else-if="!error" class="rounded-2xl border border-dashed border-[#CBD5E1] bg-white px-6 py-14 text-center">
      <span class="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF2FC] text-[#0066E4]" aria-hidden="true">
        <svg class="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2m-9 0h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z" /></svg>
      </span>
      <template v-if="trips.length">
        <p class="mt-4 text-[17px] font-semibold text-[#0A1024]">{{ t(tab === 'upcoming' ? 'trips.list.noUpcoming' : 'trips.list.noPast') }}</p>
        <button type="button" class="text-link mt-1 text-[14px]" @click="tab = tab === 'upcoming' ? 'past' : 'upcoming'">
          {{ t(tab === 'upcoming' ? 'trips.list.showPast' : 'trips.list.showUpcoming') }}
        </button>
      </template>
      <template v-else>
        <p class="mt-4 text-[17px] font-semibold text-[#0A1024]">{{ t('trips.list.emptyTitle') }}</p>
        <p class="mx-auto mt-1 max-w-sm text-[14px] leading-[22px] text-[#64748B]">
          {{ t('trips.list.emptyText') }}
        </p>
        <NuxtLink to="/planner" class="btn-primary mx-auto mt-5 w-auto px-6">{{ t('trips.list.planWithAgent') }}</NuxtLink>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { TripPartyMember } from '~/types/trip'
import { destinationPhoto } from '~/utils/destination-photos'

definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

interface TripSummary {
  id: string
  title: string
  destination: string
  startDate: string
  endDate: string
  party: TripPartyMember[]
}

const { t, placeName } = useI18n()
const { tripDateRange, tripDayCount, tripPartyLabel, tripStatus } = useTripDisplay()
const trips = ref<TripSummary[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const tab = ref<'upcoming' | 'past'>('upcoming')

const today = new Date().toISOString().slice(0, 10)
const isPast = (trip: TripSummary) => trip.endDate.slice(0, 10) < today
const upcoming = computed(() => trips.value.filter((trip) => !isPast(trip)))
// Most recent past trip first
const past = computed(() => trips.value.filter(isPast).reverse())
const shownTrips = computed(() => (tab.value === 'upcoming' ? upcoming.value : past.value))

const tabs = computed(() => [
  { id: 'upcoming' as const, label: t('trips.list.upcoming'), count: upcoming.value.length },
  { id: 'past' as const, label: t('trips.list.past'), count: past.value.length }
])

const dateRange = tripDateRange
const dayCount = (trip: TripSummary) => tripDayCount(trip.startDate, trip.endDate)
const partyLabel = tripPartyLabel
const status = (trip: TripSummary) => tripStatus(trip.startDate, trip.endDate)

onMounted(async () => {
  try {
    const response = await $fetch<{ data: TripSummary[] }>('/api/trips')
    trips.value = response.data
    // Open on past trips when there is nothing coming up
    if (!upcoming.value.length && past.value.length) tab.value = 'past'
  } catch (err: any) {
    error.value = t('trips.list.loadFailed')
  } finally {
    loading.value = false
  }
})

useHead(() => ({ title: t('trips.list.metaTitle') }))
</script>
