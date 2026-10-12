<template>
  <div class="flex min-h-[28rem] flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-sand/50 px-5 py-10 text-center">
    <span class="inline-flex h-14 w-14 items-center justify-center rounded-full bg-sea-50 text-sea">
      <span v-if="kind === 'loading'" class="h-6 w-6 animate-spin rounded-full border-2 border-sea/30 border-t-sea"></span>
      <PlannerIcon v-else :name="kind === 'error' ? 'info' : 'calendar'" class="h-7 w-7" />
    </span>
    <h2 class="mt-4 font-display text-2xl text-ink">{{ title }}</h2>
    <p class="mx-auto mt-2 max-w-md text-sm leading-6 text-ink/70" :role="kind === 'error' ? 'alert' : undefined">{{ message }}</p>

    <div v-if="kind === 'loading'" class="mt-8 w-full max-w-md space-y-3 text-left" aria-hidden="true">
      <div class="flex gap-2">
        <div v-for="n in 4" :key="n" class="h-12 flex-1 animate-pulse rounded-xl bg-white"></div>
      </div>
      <div v-for="n in 3" :key="`row-${n}`" class="flex items-center gap-3">
        <div class="h-10 w-10 animate-pulse rounded-full bg-white"></div>
        <div class="h-16 flex-1 animate-pulse rounded-xl bg-white"></div>
      </div>
    </div>

    <ol v-else-if="kind === 'empty'" class="mt-8 grid w-full max-w-lg gap-3 text-left sm:grid-cols-3">
      <li v-for="(step, index) in steps" :key="step" class="rounded-xl border border-line bg-white p-3 text-sm text-ink">
        <span class="block text-xs font-semibold text-sea">Step {{ index + 1 }}</span>
        {{ step }}
      </li>
    </ol>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import PlannerIcon from '~/components/planner/PlannerIcon.vue'

const props = defineProps<{
  kind: 'empty' | 'loading' | 'error'
  message?: string
}>()

const steps = ['Pick a trip or describe one', 'Check dates and ages', 'Send to plan the days']

const title = computed(() => {
  if (props.kind === 'loading') return 'Planning the days'
  if (props.kind === 'error') return 'Check the request'
  return 'Your itinerary will appear here'
})

const message = computed(() => {
  if (props.message) return props.message
  if (props.kind === 'loading') return 'This can take up to a minute. The days will replace this note when they are ready.'
  return 'Tell me where you are going, when, and who is coming. A suggestion is not a booking, and a price appears only when a partner has checked it.'
})
</script>
