<template>
  <section class="overflow-hidden rounded-3xl border border-[#E2E8F0] bg-white" aria-labelledby="sample-title">
    <div class="grid gap-8 p-6 sm:p-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:p-10">
      <div>
        <p class="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#008A9B]">What you get</p>
        <h2 id="sample-title" class="mt-1 text-[26px] font-bold leading-8 tracking-[-0.025em] text-[#101D3A] sm:text-[32px] sm:leading-10">
          A plan you can actually follow
        </h2>
        <p class="mt-3 text-[15px] leading-6 text-[#475569]">
          Here is the shape of a plan for <span class="font-semibold text-[#101D3A]">{{ brief }}</span>. One area per day, short hops between stops, and rest built in for younger kids.
        </p>
        <ul class="mt-5 space-y-2 text-[14px] leading-5 text-[#334155]">
          <li v-for="point in points" :key="point" class="flex items-start gap-2">
            <svg class="mt-0.5 h-4 w-4 shrink-0 text-[#008A9B]" viewBox="0 0 20 20" fill="none" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m5 10.5 3 3 7-7" /></svg>
            {{ point }}
          </li>
        </ul>
        <NuxtLink
          :to="{ path: '/planner', query: { prompt } }"
          class="mt-7 inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#008A9B] px-6 text-[15px] font-semibold text-white hover:bg-[#007789] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#008A9B] focus-visible:ring-offset-2"
          @click="track('sample_itinerary_customise_clicked', { placement })"
        >
          Customize this trip
          <svg class="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 10h12m0 0-5-5m5 5-5 5" /></svg>
        </NuxtLink>
      </div>

      <div>
        <div class="flex gap-1.5" role="tablist" aria-label="Sample days">
          <button
            v-for="(day, index) in days"
            :id="`sample-tab-${index}`"
            :key="day.title"
            type="button"
            role="tab"
            :aria-selected="active === index"
            :aria-controls="`sample-panel-${index}`"
            class="min-h-10 rounded-full px-4 text-[13px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#008A9B]"
            :class="active === index ? 'bg-[#101D3A] text-white' : 'bg-[#F1F5F9] text-[#334155] hover:bg-[#E2E8F0]'"
            @click="active = index"
          >
            Day {{ index + 1 }}
          </button>
        </div>

        <div
          v-for="(day, index) in days"
          v-show="active === index"
          :id="`sample-panel-${index}`"
          :key="day.title"
          role="tabpanel"
          :aria-labelledby="`sample-tab-${index}`"
          class="mt-4"
        >
          <p class="text-[17px] font-bold text-[#101D3A]">{{ day.title }}</p>
          <ol class="mt-3">
            <li v-for="(stop, stopIndex) in day.stops" :key="stop.name">
              <div class="flex gap-3 rounded-xl border border-[#E2E8F0] p-3.5">
                <span class="w-12 shrink-0 text-[13px] font-semibold leading-5 text-[#008A9B]">{{ stop.time }}</span>
                <div class="min-w-0">
                  <p class="text-[15px] font-semibold leading-5 text-[#101D3A]">{{ stop.name }}</p>
                  <p class="mt-0.5 text-[13px] leading-5 text-[#64748B]">{{ stop.note }}</p>
                </div>
              </div>
              <p v-if="stop.next && stopIndex < day.stops.length - 1" class="flex items-center gap-1.5 py-1.5 pl-[3.75rem] text-[12px] text-[#64748B]">
                <svg class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 4v12m0 0-4-4m4 4 4-4" /></svg>
                {{ stop.next }}
              </p>
            </li>
          </ol>
        </div>
        <p class="mt-4 text-[12px] leading-[18px] text-[#94A3B8]">Sample plan. Times and travel are approximate; check opening days before you go.</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'

withDefaults(defineProps<{ placement?: string }>(), { placement: 'explore_home' })

interface Stop {
  time: string
  name: string
  note: string
  /** Travel to the next stop */
  next?: string
}

const brief = '3 days in Tokyo with kids aged 4 and 9'
const prompt = '3 days in Tokyo with 2 adults and 2 kids aged 4 and 9, relaxed pace'
const points = ['Sights matched to each child’s age', 'Travel time between stops', 'Booking links for flights, hotels and tickets']

const days: { title: string; stops: Stop[] }[] = [
  {
    title: 'Asakusa and Skytree',
    stops: [
      { time: '9:00', name: 'Senso-ji temple', note: 'Go early, before the crowds. Snacks on Nakamise street.', next: 'About 20 min walk or one train stop' },
      { time: '11:30', name: 'Sumida Aquarium', note: 'Indoor and calm, good for the 4-year-old.', next: 'Same building' },
      { time: '13:00', name: 'Lunch and Skytree deck', note: 'Book a time slot for the deck in busy seasons.' },
      { time: '15:00', name: 'Rest at the hotel', note: 'Nap time for the younger one.' }
    ]
  },
  {
    title: 'Ueno park',
    stops: [
      { time: '9:30', name: 'Ueno Zoo', note: 'Pandas first, queues grow fast. Usually closed on Mondays.', next: 'About 10 min walk through the park' },
      { time: '12:30', name: 'Picnic lunch in the park', note: 'Convenience-store lunch works well here.', next: 'About 5 min walk' },
      { time: '13:30', name: 'Nature and Science Museum', note: 'Dinosaurs and hands-on rooms for the 9-year-old.' }
    ]
  },
  {
    title: 'Odaiba and Toyosu',
    stops: [
      { time: '9:30', name: 'teamLab Planets', note: 'Book a time slot. Water rooms: wear shorts.', next: 'About 15 min on the Yurikamome line' },
      { time: '12:30', name: 'Lunch in an Odaiba mall', note: 'Family restaurants and indoor play areas.' },
      { time: '14:00', name: 'Miraikan science museum', note: 'Robots and space. Usually closed on Tuesdays.' }
    ]
  }
]

const active = ref(0)
const { track } = useFunnel()
</script>
