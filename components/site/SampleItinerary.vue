<template>
  <section class="overflow-hidden rounded-3xl border border-[#E2E8F0] bg-white" aria-labelledby="sample-title">
    <div class="grid gap-8 p-6 sm:p-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:p-10">
      <div>
        <p class="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#0066E4]">{{ t('explore.sample.eyebrow') }}</p>
        <h2 id="sample-title" class="mt-1 text-[26px] font-bold leading-8 tracking-[-0.025em] text-[#0A1024] sm:text-[32px] sm:leading-10">
          {{ t('explore.sample.title') }}
        </h2>
        <p class="mt-3 text-[15px] leading-6 text-[#475569]">
          {{ t('explore.sample.introBefore') }} <span class="font-semibold text-[#0A1024]">{{ t('explore.sample.brief') }}</span>{{ t('explore.sample.introAfter') }}
        </p>
        <ul class="mt-5 space-y-2 text-[14px] leading-5 text-[#334155]">
          <li v-for="point in tm<string[]>('explore.sample.points')" :key="point" class="flex items-start gap-2">
            <svg class="mt-0.5 h-4 w-4 shrink-0 text-[#0066E4]" viewBox="0 0 20 20" fill="none" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m5 10.5 3 3 7-7" /></svg>
            {{ point }}
          </li>
        </ul>
        <NuxtLink
          :to="{ path: '/planner', query: { prompt: t('explore.sample.prompt') } }"
          class="mt-7 inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#0066E4] px-6 text-[15px] font-semibold text-white hover:bg-[#0057C8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066E4] focus-visible:ring-offset-2"
          @click="track('sample_itinerary_customise_clicked', { placement })"
        >
          {{ t('explore.sample.cta') }}
          <svg class="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 10h12m0 0-5-5m5 5-5 5" /></svg>
        </NuxtLink>
      </div>

      <div>
        <div class="flex gap-1.5" role="tablist" :aria-label="t('explore.sample.tabsLabel')">
          <button
            v-for="(day, index) in days"
            :id="`sample-tab-${index}`"
            :key="index"
            type="button"
            role="tab"
            :aria-selected="active === index"
            :aria-controls="`sample-panel-${index}`"
            class="min-h-10 rounded-full px-4 text-[13px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066E4]"
            :class="active === index ? 'bg-[#0A1024] text-white' : 'bg-[#F1F5F9] text-[#334155] hover:bg-[#E2E8F0]'"
            @click="active = index"
          >
            {{ t('explore.sample.day', { n: index + 1 }) }}
          </button>
        </div>

        <div
          v-for="(day, index) in days"
          v-show="active === index"
          :id="`sample-panel-${index}`"
          :key="index"
          role="tabpanel"
          :aria-labelledby="`sample-tab-${index}`"
          class="mt-4"
        >
          <p class="text-[17px] font-bold text-[#0A1024]">{{ day.title }}</p>
          <ol class="mt-3">
            <li v-for="(stop, stopIndex) in day.stops" :key="stopIndex">
              <div class="flex gap-3 rounded-xl border border-[#E2E8F0] p-3.5">
                <span class="w-12 shrink-0 text-[13px] font-semibold leading-5 text-[#0066E4]">{{ stop.time }}</span>
                <div class="min-w-0">
                  <p class="text-[15px] font-semibold leading-5 text-[#0A1024]">{{ stop.name }}</p>
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
        <p class="mt-4 text-[12px] leading-[18px] text-[#94A3B8]">{{ t('explore.sample.note') }}</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

withDefaults(defineProps<{ placement?: string }>(), { placement: 'explore_home' })

interface Stop {
  time: string
  name: string
  note: string
  /** Travel to the next stop; empty when there is none */
  next: string
}

const { t, tm } = useI18n()
const days = computed(() => tm<{ title: string; stops: Stop[] }[]>('explore.sample.days'))

const active = ref(0)
const { track } = useFunnel()
</script>
