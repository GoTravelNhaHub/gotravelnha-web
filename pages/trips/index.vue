<template>
  <div class="min-h-screen bg-slate-50 pb-16">
    <div class="max-w-4xl mx-auto px-4 pt-8 space-y-6">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 class="text-3xl font-bold text-slate-900">🧳 My trips</h1>
          <p class="mt-1 text-slate-600">Trips you saved from the planner.</p>
        </div>
        <NuxtLink to="/planner" class="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700">
          Plan a new trip
        </NuxtLink>
      </div>

      <div v-if="error" class="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">{{ error }}</div>

      <div class="grid gap-4">
        <NuxtLink
          v-for="trip in trips"
          :key="trip.id"
          :to="`/trips/${trip.id}`"
          class="block bg-white rounded-2xl border border-slate-200 p-5 hover:border-emerald-300 transition"
        >
          <div class="text-lg font-bold text-slate-900">{{ trip.title }}</div>
          <div class="text-sm text-slate-600 mt-1">
            {{ trip.destination }} · {{ formatRange(trip.startDate, trip.endDate) }} · {{ trip.party.length }} traveller{{ trip.party.length === 1 ? '' : 's' }}
          </div>
        </NuxtLink>
        <div v-if="!loading && trips.length === 0" class="bg-white border border-dashed border-slate-300 rounded-2xl p-10 text-center text-slate-500">
          No saved trips yet.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { TripPartyMember } from '~/types/trip'

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

const trips = ref<TripSummary[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const formatRange = (start: string, end: string) => {
  const format = new Intl.DateTimeFormat('en-SG', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
  return `${format.format(new Date(start))} – ${format.format(new Date(end))}`
}

onMounted(async () => {
  try {
    loading.value = true
    const response = await $fetch<{ data: TripSummary[] }>('/api/trips')
    trips.value = response.data
  } catch (err: any) {
    error.value = err?.data?.message || 'Could not load your trips. Please sign in again.'
  } finally {
    loading.value = false
  }
})

useHead({ title: 'My Trips | GoTravelNha' })
</script>
