<template>
  <div class="min-h-screen bg-slate-50 pb-16">
    <div class="max-w-5xl mx-auto pt-2 sm:pt-8 space-y-6 sm:space-y-8">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-slate-900">🧭 Family trip planner</h1>
        <p class="mt-2 text-slate-600">
          Tell us who's coming and what they enjoy. We'll suggest a day-by-day plan built from activities you can book with us.
          <NuxtLink to="/destinations" class="text-emerald-700 font-semibold hover:underline">Or browse activities by destination.</NuxtLink>
        </p>
      </div>

      <form v-if="!result" @submit.prevent="generate" class="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label class="block min-w-0 md:col-span-1">
            <span class="text-sm font-semibold text-slate-700">Destination</span>
            <input
              v-model.trim="form.destination"
              list="planner-destinations"
              required
              maxlength="80"
              placeholder="e.g. Singapore"
              class="field-control"
            />
            <datalist id="planner-destinations">
              <option value="Singapore" />
            </datalist>
          </label>
          <label class="block min-w-0">
            <span class="text-sm font-semibold text-slate-700">From</span>
            <input
              v-model="form.startDate"
              type="date"
              required
              :min="today"
              class="field-control"
            />
          </label>
          <label class="block min-w-0">
            <span class="text-sm font-semibold text-slate-700">To</span>
            <input
              v-model="form.endDate"
              type="date"
              required
              :min="form.startDate || today"
              class="field-control"
            />
          </label>
        </div>

        <div>
          <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <span class="text-sm font-semibold text-slate-700">Who's travelling</span>
            <NuxtLink v-if="isAuthenticated" to="/user/family" class="text-sm text-emerald-700 hover:underline">
              Manage family
            </NuxtLink>
          </div>
          <div class="mt-2 space-y-3">
            <div v-for="(person, index) in party" :key="index" class="rounded-xl border border-slate-200 p-3 space-y-3">
              <label v-if="person.fromProfile" class="flex items-center gap-2 text-sm text-slate-700">
                <input
                  v-model="person.include"
                  type="checkbox"
                  class="h-5 w-5 text-emerald-600 rounded"
                />
                Include on this trip
              </label>
              <label class="block min-w-0">
                <span class="text-xs font-semibold text-slate-600">Name</span>
                <input
                  v-model.trim="person.name"
                  :disabled="person.fromProfile"
                  maxlength="40"
                  placeholder="Name (optional)"
                  class="field-control disabled:bg-slate-50"
                />
              </label>
              <div class="flex items-end gap-3">
                <label class="block w-28 min-w-0">
                  <span class="text-xs font-semibold text-slate-600">Age</span>
                  <input
                    v-model.number="person.age"
                    type="number"
                    min="0"
                    max="110"
                    required
                    class="field-control"
                  />
                </label>
                <button
                  v-if="!person.fromProfile && party.length > 1"
                  type="button"
                  @click="party.splice(index, 1)"
                  class="ml-auto mb-1 min-h-[44px] px-2 text-sm font-semibold text-slate-500 hover:text-red-600"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
          <button
            type="button"
            @click="party.push({ name: '', age: 8, include: true, fromProfile: false })"
            :disabled="party.length >= 10"
            class="mt-2 text-sm font-semibold text-emerald-700 hover:underline disabled:opacity-50"
          >
            + Add traveller
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label class="block min-w-0">
            <span class="text-sm font-semibold text-slate-700">Activity budget for the family (SGD, optional)</span>
            <input
              v-model.number="form.budget"
              type="number"
              min="0"
              step="10"
              class="field-control"
            />
          </label>
          <label class="block min-w-0">
            <span class="text-sm font-semibold text-slate-700">Pace</span>
            <select
              v-model="form.pace"
              class="field-control"
            >
              <option value="relaxed">Relaxed – one main activity a day</option>
              <option value="balanced">Balanced – two a day</option>
              <option value="packed">Packed – three a day</option>
            </select>
          </label>
        </div>

        <label class="block">
          <span class="text-sm font-semibold text-slate-700">What does your family enjoy? (optional)</span>
          <textarea
            v-model="form.interests"
            rows="3"
            maxlength="500"
            placeholder="e.g. animals, water play, no long queues, vegetarian food"
            class="field-control"
          ></textarea>
        </label>

        <div v-if="error" class="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">{{ error }}</div>

        <div class="space-y-2">
          <button
            type="submit"
            :disabled="loading"
            class="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-6 py-3 min-h-[48px] rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold hover:from-emerald-700 hover:to-teal-700 disabled:opacity-60"
          >
            <span v-if="loading" class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
            {{ loading ? 'Planning your trip…' : 'Plan my trip' }}
          </button>
          <p v-if="loading" class="text-sm text-slate-500">This can take up to a minute.</p>
          <p v-else-if="!isAuthenticated" class="text-sm text-slate-500">Guests can create 3 plans a day.</p>
        </div>
      </form>

      <template v-if="result">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button @click="startOver" class="self-start min-h-[44px] text-sm font-semibold text-slate-600 hover:text-slate-900">← Plan another trip</button>
          <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <span v-if="error" class="text-sm text-red-600">{{ error }}</span>
            <button
              v-if="isAuthenticated"
              @click="saveTrip"
              :disabled="saving"
              class="w-full sm:w-auto px-5 py-2.5 min-h-[48px] rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-60"
            >
              {{ saving ? 'Saving…' : 'Save trip' }}
            </button>
            <NuxtLink
              v-else
              to="/login?redirect=/planner"
              class="inline-flex w-full sm:w-auto items-center justify-center px-5 py-2.5 min-h-[48px] rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
            >
              Sign in to save this trip
            </NuxtLink>
          </div>
        </div>
        <p v-if="result.catalogueSize === 0" class="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-sm">
          We don't have bookable activities for {{ result.request.destination }} yet, so this plan has ideas only.
        </p>
        <ItineraryView :itinerary="result.itinerary" :activities="result.activities" />
        <NuxtLink
          v-if="result.catalogueSize !== 0"
          :to="`/destinations/${destinationSlug(result.request.destination)}`"
          class="inline-flex text-emerald-700 font-semibold hover:underline"
        >
          See all family activities in {{ cityOf(result.request.destination) }} →
        </NuxtLink>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ItineraryView from '~/components/planner/ItineraryView.vue'
import { cityOf, destinationSlug } from '~/utils/destination-slug'
import type { Itinerary, LiveActivity, TripPace } from '~/types/trip'

interface PlannerResult {
  generationId: string
  request: { destination: string }
  itinerary: Itinerary
  activities: Record<string, LiveActivity>
  catalogueSize?: number
}

interface PartyRow {
  name: string
  age: number | null
  include: boolean
  fromProfile: boolean
  birthDate?: string | null
  notes?: string | null
}

// A guest's latest plan, kept so it can be saved after signing in
const PENDING_KEY = 'gotravelnha_pending_trip'

const route = useRoute()
const router = useRouter()
const { isAuthenticated } = useAuthState()

const today = new Date().toISOString().slice(0, 10)
const form = reactive({
  destination: 'Singapore',
  startDate: '',
  endDate: '',
  budget: null as number | null,
  pace: 'balanced' as TripPace,
  interests: ''
})
const party = ref<PartyRow[]>([
  { name: '', age: 35, include: true, fromProfile: false },
  { name: '', age: 6, include: true, fromProfile: false }
])
const result = ref<PlannerResult | null>(null)
const loading = ref(false)
const saving = ref(false)
const error = ref<string | null>(null)

const ageOn = (birthDate: string, onDate: string) => {
  const birth = new Date(birthDate)
  const on = new Date(onDate || today)
  let age = on.getUTCFullYear() - birth.getUTCFullYear()
  const beforeBirthday =
    on.getUTCMonth() < birth.getUTCMonth() ||
    (on.getUTCMonth() === birth.getUTCMonth() && on.getUTCDate() < birth.getUTCDate())
  if (beforeBirthday) age -= 1
  return Math.max(age, 0)
}

const loadFamily = async () => {
  try {
    const response = await $fetch<{ data: Array<{ name: string; birthDate: string | null; notes: string | null }> }>(
      '/api/travellers'
    )
    if (response.data.length) {
      party.value = response.data.map((traveller) => ({
        name: traveller.name,
        age: traveller.birthDate ? ageOn(traveller.birthDate, form.startDate) : null,
        include: true,
        fromProfile: true,
        birthDate: traveller.birthDate,
        notes: traveller.notes
      }))
    }
  } catch {
    // Not signed in on the server, or no profiles yet: keep the manual rows
  }
}

// Recalculate profile ages for the trip's start date
watch(
  () => form.startDate,
  (startDate) => {
    for (const person of party.value) {
      if (person.birthDate) person.age = ageOn(person.birthDate, startDate)
    }
  }
)

const generate = async () => {
  const travellers = party.value.filter((person) => person.include)
  if (!travellers.length || travellers.some((person) => person.age === null || person.age === undefined)) {
    error.value = 'Add at least one traveller and fill in every age.'
    return
  }

  try {
    loading.value = true
    error.value = null
    const response = await $fetch<PlannerResult & { success: boolean }>('/api/planner/itinerary', {
      method: 'POST',
      body: {
        destination: form.destination,
        startDate: form.startDate,
        endDate: form.endDate,
        party: travellers.map((person) => ({
          name: person.name || undefined,
          age: Number(person.age),
          notes: person.notes || undefined
        })),
        budget: form.budget || null,
        currency: 'SGD',
        pace: form.pace,
        interests: form.interests || undefined
      }
    })
    result.value = response
    localStorage.setItem(PENDING_KEY, response.generationId)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch (err: any) {
    error.value = err?.data?.message || 'The trip planner could not finish. Please try again.'
  } finally {
    loading.value = false
  }
}

const saveTrip = async () => {
  if (!result.value) return
  try {
    saving.value = true
    error.value = null
    const response = await $fetch<{ data: { id: string } }>('/api/trips', {
      method: 'POST',
      body: { generationId: result.value.generationId }
    })
    localStorage.removeItem(PENDING_KEY)
    router.push(`/trips/${response.data.id}`)
  } catch (err: any) {
    error.value = err?.data?.message || 'Could not save this trip.'
  } finally {
    saving.value = false
  }
}

const startOver = () => {
  result.value = null
  error.value = null
  localStorage.removeItem(PENDING_KEY)
}

onMounted(async () => {
  // From a destination page's "Plan a trip here"
  if (typeof route.query.destination === 'string' && route.query.destination.trim()) {
    form.destination = route.query.destination.trim().slice(0, 80)
  }

  if (isAuthenticated.value) {
    await loadFamily()
  }

  const pendingId = localStorage.getItem(PENDING_KEY)
  if (pendingId) {
    try {
      result.value = await $fetch<PlannerResult>(`/api/planner/generations/${pendingId}`)
    } catch {
      localStorage.removeItem(PENDING_KEY)
    }
  }
})

useHead({
  title: 'Family Trip Planner | GoTravelNha',
  meta: [
    {
      name: 'description',
      content: 'Plan a family trip day by day, built around your children’s ages, with activities you can book on GoTravelNha.'
    }
  ]
})
</script>

<style scoped>
.field-control {
  margin-top: 0.25rem;
  width: 100%;
  min-width: 0;
  max-width: 100%;
  padding: 0.625rem 0.75rem;
  border: 1px solid rgb(203 213 225);
  border-radius: 0.5rem;
  font-size: 1rem;
  line-height: 1.5rem;
  background: white;
}

.field-control:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgb(16 185 129);
  border-color: transparent;
}

input[type='date'].field-control {
  min-width: 0;
}
</style>
