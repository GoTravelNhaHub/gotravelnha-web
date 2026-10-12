<template>
  <div class="min-h-screen bg-slate-50 pb-16">
    <div class="max-w-5xl mx-auto px-4 pt-8 space-y-6">
      <div>
        <h1 class="text-3xl font-bold text-slate-900">🗺️ Destinations</h1>
        <p class="mt-2 text-slate-600">Places where you can book family activities with us.</p>
      </div>

      <div v-if="error" class="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">{{ error }}</div>

      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <NuxtLink
          v-for="destination in destinations"
          :key="destination.slug"
          :to="`/destinations/${destination.slug}`"
          class="block bg-white rounded-2xl border border-slate-200 p-5 hover:border-emerald-300 transition"
        >
          <div class="text-lg font-bold text-slate-900">{{ destination.name }}</div>
          <div class="text-sm text-slate-600 mt-1">
            {{ destination.activityCount }} activit{{ destination.activityCount === 1 ? 'y' : 'ies' }}
          </div>
        </NuxtLink>
      </div>
      <div v-if="!loading && !error && destinations.length === 0" class="bg-white border border-dashed border-slate-300 rounded-2xl p-10 text-center text-slate-500">
        No destinations listed yet.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

interface Destination {
  slug: string
  name: string
  activityCount: number
}

const destinations = ref<Destination[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    loading.value = true
    const response = await $fetch<{ data: Destination[] }>('/api/destinations')
    destinations.value = response.data
  } catch (err: any) {
    error.value = err?.data?.message || 'Could not load destinations.'
  } finally {
    loading.value = false
  }
})

useHead({
  title: 'Family Travel Destinations | GoTravelNha',
  meta: [{ name: 'description', content: 'Browse family-friendly activities by destination and book with live partner prices.' }]
})
</script>
