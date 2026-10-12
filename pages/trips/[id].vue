<template>
  <div class="min-h-screen bg-slate-50 pb-16">
    <div class="max-w-5xl mx-auto px-4 pt-8 space-y-6">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <NuxtLink to="/trips" class="text-sm font-semibold text-slate-600 hover:text-slate-900">← My trips</NuxtLink>
        <button v-if="trip" @click="removeTrip" class="text-sm text-red-600 hover:underline">Delete trip</button>
      </div>

      <div v-if="error" class="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">{{ error }}</div>

      <template v-if="trip">
        <div class="text-sm text-slate-600">
          {{ trip.destination }} ·
          {{ trip.party.map((person) => (person.name ? `${person.name} (${person.age})` : `Age ${person.age}`)).join(', ') }}
        </div>
        <ItineraryView :itinerary="trip.itinerary" :activities="activities" />

        <section v-if="recommendations.length" class="space-y-4">
          <div>
            <h2 class="text-xl font-bold text-slate-900">More for your family</h2>
            <p class="text-sm text-slate-600">Other activities in {{ trip.destination }} that suit your travellers' ages and interests.</p>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <ActivityCard
              v-for="activity in recommendations"
              :key="activity.id"
              :activity="activity"
              placement-key="trip_recommendations"
            />
          </div>
        </section>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ItineraryView from '~/components/planner/ItineraryView.vue'
import ActivityCard from '~/components/planner/ActivityCard.vue'
import type { Itinerary, LiveActivity, RecommendedActivity, TripPartyMember } from '~/types/trip'

definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

interface SavedTrip {
  id: string
  title: string
  destination: string
  party: TripPartyMember[]
  itinerary: Itinerary
}

const route = useRoute()
const router = useRouter()
const trip = ref<SavedTrip | null>(null)
const activities = ref<Record<string, LiveActivity>>({})
const recommendations = ref<RecommendedActivity[]>([])
const error = ref<string | null>(null)

const removeTrip = async () => {
  if (!trip.value || !window.confirm('Delete this trip?')) return
  try {
    await $fetch(`/api/trips/${trip.value.id}`, { method: 'DELETE' })
    router.push('/trips')
  } catch (err: any) {
    error.value = err?.data?.message || 'Could not delete this trip.'
  }
}

onMounted(async () => {
  try {
    const response = await $fetch<{ data: SavedTrip; activities: Record<string, LiveActivity> }>(
      `/api/trips/${route.params.id}`
    )
    trip.value = response.data
    activities.value = response.activities
  } catch (err: any) {
    error.value = err?.data?.message || 'Could not load this trip.'
    return
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
