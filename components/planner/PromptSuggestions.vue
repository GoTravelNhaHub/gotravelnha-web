<template>
  <div class="grid gap-2.5" :class="layout === 'gallery' ? 'grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4' : 'grid-cols-2'">
    <button
      v-for="prompt in prompts"
      :key="prompt.id"
      type="button"
      class="group relative overflow-hidden text-left shadow-[0_1px_2px_rgba(16,29,58,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#008A9B] focus-visible:ring-offset-2"
      :class="layout === 'gallery' ? 'aspect-[4/3] rounded-2xl xl:aspect-[3/4]' : 'aspect-[2/1] rounded-[10px]'"
      @click="$emit('select', prompt)"
    >
      <img
        :src="prompt.image"
        alt=""
        width="640"
        height="480"
        loading="lazy"
        decoding="async"
        class="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
      />
      <span class="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/25 to-transparent"></span>
      <span class="absolute inset-x-0 bottom-0" :class="layout === 'gallery' ? 'p-4' : 'p-2.5'">
        <span
          class="block font-semibold tracking-[-0.025em] text-white"
          :class="layout === 'gallery' ? 'text-[16px] leading-6' : 'text-[13px] leading-4'"
        >{{ prompt.label }}</span>
        <span class="mt-0.5 block text-white/90" :class="layout === 'gallery' ? 'text-[13px] leading-5' : 'text-[11px] leading-4'">{{ prompt.caption }}</span>
        <span
          v-if="layout === 'gallery'"
          class="mt-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[12px] font-semibold leading-4 text-[#101D3A] opacity-90 transition group-hover:opacity-100"
        >
          Use this trip
          <PlannerIcon name="arrow" class="h-3 w-3" />
        </span>
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
import PlannerIcon from '~/components/planner/PlannerIcon.vue'
import type { TripPace } from '~/types/trip'

withDefaults(defineProps<{ layout?: 'compact' | 'gallery' }>(), { layout: 'compact' })

export interface PlannerPrompt {
  id: string
  label: string
  caption: string
  image: string
  destination: string
  startDate: string
  endDate: string
  pace: TripPace
  interests: string
  budget?: number | null
  note: string
}

const iso = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const shift = (days: number) => {
  const date = new Date()
  date.setHours(12, 0, 0, 0)
  date.setDate(date.getDate() + days)
  return date
}

const nextWeekday = (weekday: number) => {
  const date = shift(0)
  const delta = (weekday - date.getDay() + 7) % 7 || 7
  return shift(delta)
}

const weekend = nextWeekday(6)
const weekendEnd = new Date(weekend)
weekendEnd.setDate(weekend.getDate() + 1)

const baliStart = nextWeekday(1)
const baliEnd = new Date(baliStart)
baliEnd.setDate(baliStart.getDate() + 3)

const prompts: PlannerPrompt[] = [
  {
    id: 'tokyo-family',
    label: 'Family trip to Japan',
    caption: 'Theme parks, food & culture',
    image: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?auto=format&fit=crop&w=640&q=80',
    destination: 'Tokyo',
    startDate: iso(shift(1)),
    endDate: iso(shift(5)),
    pace: 'balanced',
    interests: 'theme parks, food, sightseeing',
    budget: 4000,
    note: 'I set Tokyo, five days, and an activity budget of SGD 4,000. Check the ages, then start planning.'
  },
  {
    id: 'singapore-weekend',
    label: 'City break in Singapore',
    caption: 'Attractions & family fun',
    image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=640&q=80',
    destination: 'Singapore',
    startDate: iso(weekend),
    endDate: iso(weekendEnd),
    pace: 'relaxed',
    interests: 'animals, playgrounds, short queues',
    note: 'I set a relaxed Singapore weekend. Check the ages, then start planning.'
  },
  {
    id: 'bali-beach',
    label: 'Beach holiday in Bali',
    caption: 'Relaxation & adventure',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=640&q=80',
    destination: 'Bali',
    startDate: iso(baliStart),
    endDate: iso(baliEnd),
    pace: 'relaxed',
    interests: 'beach, easy days, family food',
    note: 'I set four relaxed days in Bali. Check the ages, then start planning.'
  },
  {
    id: 'theme-parks',
    label: 'Theme parks with kids',
    caption: 'Rides, shows & short queues',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=640&q=80',
    destination: 'Tokyo',
    startDate: iso(shift(1)),
    endDate: iso(shift(3)),
    pace: 'balanced',
    interests: 'theme parks, short queues, kid-friendly food',
    note: 'I set three days in Tokyo around theme parks. Check the ages, then start planning.'
  }
]

defineEmits<{
  select: [prompt: PlannerPrompt]
}>()
</script>
