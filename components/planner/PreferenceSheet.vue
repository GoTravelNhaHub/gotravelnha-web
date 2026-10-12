<template>
  <div class="rounded-2xl border border-line bg-white">
    <button
      type="button"
      class="flex min-h-12 w-full items-center justify-between gap-3 px-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sea"
      :aria-expanded="open"
      @click="$emit('update:open', !open)"
    >
      <span>
        <span class="block text-sm font-semibold text-ink">Dates, budget, and pace</span>
        <span class="mt-0.5 block text-sm text-ink/70">{{ summary }}</span>
      </span>
      <span class="text-sm font-semibold text-sea">{{ open ? 'Hide' : 'Edit' }}</span>
    </button>
    <div v-if="open" class="space-y-4 border-t border-line px-4 py-4">
      <label class="block min-w-0">
        <span class="text-sm font-semibold text-ink">Destination</span>
        <input
          v-model.trim="form.destination"
          list="planner-destinations"
          required
          maxlength="80"
          placeholder="Singapore"
          class="mt-1 w-full min-w-0 rounded-xl border border-line bg-white px-3 text-base text-ink min-h-12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sea"
        />
        <datalist id="planner-destinations">
          <option value="Singapore" />
          <option value="Bangkok" />
          <option value="Bali" />
          <option value="Tokyo" />
        </datalist>
      </label>
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label class="block min-w-0">
          <span class="text-sm font-semibold text-ink">From</span>
          <input
            v-model="form.startDate"
            type="date"
            required
            :min="today"
            class="mt-1 w-full min-w-0 rounded-xl border border-line bg-white px-3 text-base text-ink min-h-12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sea"
          />
        </label>
        <label class="block min-w-0">
          <span class="text-sm font-semibold text-ink">To</span>
          <input
            v-model="form.endDate"
            type="date"
            required
            :min="form.startDate || today"
            class="mt-1 w-full min-w-0 rounded-xl border border-line bg-white px-3 text-base text-ink min-h-12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sea"
          />
        </label>
      </div>
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label class="block min-w-0">
          <span class="text-sm font-semibold text-ink">Activity budget (SGD, optional)</span>
          <input
            v-model.number="form.budget"
            type="number"
            min="0"
            step="10"
            class="mt-1 w-full min-w-0 rounded-xl border border-line bg-white px-3 text-base text-ink min-h-12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sea"
          />
        </label>
        <label class="block min-w-0">
          <span class="text-sm font-semibold text-ink">Pace</span>
          <select
            v-model="form.pace"
            class="mt-1 w-full min-w-0 rounded-xl border border-line bg-white px-3 text-base text-ink min-h-12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sea"
          >
            <option value="relaxed">Relaxed, one main activity a day</option>
            <option value="balanced">Balanced, two a day</option>
            <option value="packed">Packed, three a day</option>
          </select>
        </label>
      </div>
      <label class="block">
        <span class="text-sm font-semibold text-ink">What the family enjoys</span>
        <textarea
          v-model="form.interests"
          rows="3"
          maxlength="500"
          placeholder="Animals, water play, no long queues"
          class="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2 text-base text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sea"
        ></textarea>
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TripPace } from '~/types/trip'

const props = defineProps<{
  open: boolean
  today: string
  form: {
    destination: string
    startDate: string
    endDate: string
    budget: number | null
    pace: TripPace
    interests: string
  }
}>()

defineEmits<{
  'update:open': [open: boolean]
}>()

const paceLabel = { relaxed: 'Relaxed', balanced: 'Balanced', packed: 'Packed' } as const

const summary = computed(() => {
  const place = props.form.destination || 'Add a destination'
  const dates = props.form.startDate && props.form.endDate ? `${props.form.startDate} to ${props.form.endDate}` : 'Add dates'
  return `${place} · ${dates} · ${paceLabel[props.form.pace]}`
})
</script>
