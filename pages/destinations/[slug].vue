<template>
  <div class="min-h-screen bg-slate-50 pb-16">
    <div class="max-w-6xl mx-auto px-4 pt-8 space-y-6">
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <NuxtLink to="/destinations" class="text-sm font-semibold text-slate-600 hover:text-slate-900">← All destinations</NuxtLink>
          <h1 class="mt-2 text-3xl font-bold text-slate-900">Things to do in {{ name }}</h1>
          <p class="mt-1 text-slate-600">Activities you can book with us. Prices come from our partners and can change.</p>
        </div>
        <NuxtLink
          :to="`/planner?destination=${encodeURIComponent(name)}`"
          class="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
        >
          🧭 Plan a trip here
        </NuxtLink>
      </div>

      <form @submit.prevent="load" class="bg-white rounded-2xl border border-slate-200 p-4 flex flex-wrap items-end gap-4">
        <label v-if="isAuthenticated" class="flex items-center gap-2 text-sm text-slate-700 py-2">
          <input v-model="useFamily" type="checkbox" class="h-4 w-4 text-emerald-600 rounded" />
          Suit my saved family
        </label>
        <label v-if="!useFamily || !isAuthenticated" class="block">
          <span class="text-sm font-semibold text-slate-700">Ages</span>
          <input
            v-model.trim="ages"
            placeholder="e.g. 38, 36, 7, 3"
            maxlength="40"
            class="mt-1 w-44 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </label>
        <label class="block flex-1 min-w-[12rem]">
          <span class="text-sm font-semibold text-slate-700">Interests</span>
          <input
            v-model.trim="interests"
            placeholder="e.g. animals, water play, science"
            maxlength="300"
            class="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </label>
        <button
          type="submit"
          :disabled="loading"
          class="px-5 py-2 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-700 disabled:opacity-60"
        >
          {{ loading ? 'Loading…' : 'Show best matches' }}
        </button>
      </form>

      <p v-if="personalised && !loading" class="text-sm text-slate-600">
        Sorted for {{ usedFamily ? 'your saved family' : 'your family' }}. Activities outside the listed age limits are hidden.
      </p>
      <div v-if="error" class="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">{{ error }}</div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <ActivityCard v-for="activity in activities" :key="activity.id" :activity="activity" placement-key="destination_page" />
      </div>
      <div
        v-if="!loading && !error && activities.length === 0"
        class="bg-white border border-dashed border-slate-300 rounded-2xl p-10 text-center text-slate-500"
      >
        No bookable activities for {{ name }} yet.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import ActivityCard from '~/components/planner/ActivityCard.vue'
import { destinationFromSlug } from '~/utils/destination-slug'
import type { RecommendedActivity } from '~/types/trip'

const route = useRoute()
const { isAuthenticated } = useAuthState()

const slug = computed(() => String(route.params.slug || ''))
const name = ref(destinationFromSlug(slug.value))
const activities = ref<RecommendedActivity[]>([])
const ages = ref('')
const interests = ref('')
const useFamily = ref(false)
const personalised = ref(false)
const usedFamily = ref(false)

const { data: initialDestination, error: destinationError } = await useAsyncData(`destination-${slug.value}`, () =>
  $fetch<{
    destination: { name: string }
    personalised: boolean
    usedFamily: boolean
    data: RecommendedActivity[]
  }>(`/api/destinations/${slug.value}`)
)
if ((destinationError.value as { statusCode?: number } | null)?.statusCode === 404) {
  throw createError({ statusCode: 404, statusMessage: 'Destination not found' })
}
if (initialDestination.value) {
  name.value = initialDestination.value.destination.name
  activities.value = initialDestination.value.data
  personalised.value = initialDestination.value.personalised
  usedFamily.value = initialDestination.value.usedFamily
}
const loading = ref(false)
const error = ref<string | null>(null)

const load = async () => {
  try {
    loading.value = true
    error.value = null
    const response = await $fetch<{
      destination: { name: string }
      personalised: boolean
      usedFamily: boolean
      data: RecommendedActivity[]
    }>(`/api/destinations/${slug.value}`, {
      query: {
        ages: useFamily.value && isAuthenticated.value ? undefined : ages.value.replace(/[^\d,]/g, '') || undefined,
        interests: interests.value || undefined,
        family: useFamily.value && isAuthenticated.value ? '1' : undefined
      }
    })
    name.value = response.destination.name
    activities.value = response.data
    personalised.value = response.personalised
    usedFamily.value = response.usedFamily
  } catch (err: any) {
    error.value = err?.data?.message || 'Could not load activities.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  useFamily.value = isAuthenticated.value
  if (useFamily.value) load()
})

useHead(() => ({
  title: `Family Things to Do in ${name.value} | GoTravelNha`,
  meta: [
    {
      name: 'description',
      content: `Family-friendly activities in ${name.value}, matched to your children's ages, with live partner prices.`
    }
  ]
}))
</script>
