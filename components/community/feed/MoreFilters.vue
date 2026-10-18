<template>
  <div class="rounded-2xl border border-cm-line bg-white p-4 text-left font-brand shadow-cm-panel" role="menu">
    <p class="text-[12px] font-semibold uppercase tracking-[0.08em] text-cm-subtle">{{ t('community.feed.hero.countries') }}</p>
    <div class="mt-2 flex flex-wrap gap-1.5">
      <NuxtLink v-for="country in COUNTRIES" :key="country" :to="link({ country: filters.country === country ? undefined : country })" :class="pill(filters.country === country)" role="menuitem" @click="emit('pick')">{{ placeName(country) }}</NuxtLink>
    </div>
    <p class="mt-4 text-[12px] font-semibold uppercase tracking-[0.08em] text-cm-subtle">{{ t('community.feed.hero.length') }}</p>
    <div class="mt-2 flex flex-wrap gap-1.5">
      <NuxtLink v-for="bucket in DURATIONS" :key="bucket" :to="link({ duration: filters.duration === bucket ? undefined : bucket })" :class="pill(filters.duration === bucket)" role="menuitem" @click="emit('pick')">{{ t(`community.discover.durations.${bucket}`) }}</NuxtLink>
    </div>
    <p class="mt-4 text-[12px] font-semibold uppercase tracking-[0.08em] text-cm-subtle">{{ t('community.discover.budget') }}</p>
    <div class="mt-2 flex flex-wrap gap-1.5">
      <NuxtLink v-for="level in BUDGET_LEVELS" :key="level" :to="link({ budget: filters.budget === level ? undefined : level })" :class="pill(filters.budget === level)" role="menuitem" @click="emit('pick')">{{ t(`community.budget.${level}`) }}</NuxtLink>
    </div>
    <p class="mt-4 text-[12px] font-semibold uppercase tracking-[0.08em] text-cm-subtle">{{ t('community.feed.hero.pace') }}</p>
    <div class="mt-2 flex flex-wrap gap-1.5">
      <NuxtLink v-for="style in TRAVEL_STYLES" :key="style" :to="link({ style: filters.style === style ? undefined : style })" :class="pill(filters.style === style)" role="menuitem" @click="emit('pick')">{{ t(`planner.pace.${style}`) }}</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { BUDGET_LEVELS, TRAVEL_STYLES } from '~/types/community'
import { DESTINATIONS } from '~/utils/destination-catalog'
import { filtersToQuery, type CommunityFilters, type DurationBucket } from '~/utils/community-filters'

const props = defineProps<{ filters: CommunityFilters }>()
const emit = defineEmits<{ pick: [] }>()
const { t, placeName } = useI18n()
const route = useRoute()

const COUNTRIES = [...new Set(DESTINATIONS.map((item) => item.country))].sort()
const DURATIONS: DurationBucket[] = ['short', 'medium', 'long']

const link = (patch: Partial<CommunityFilters>) => {
  const query = filtersToQuery({ ...props.filters, ...patch })
  if (typeof route.query.sort === 'string') query.sort = route.query.sort
  return { path: '/community', query }
}
const pill = (active: boolean) =>
  ['rounded-full border px-3 py-1.5 text-[13px] font-medium transition', active ? 'border-cm-primary bg-cm-soft text-cm-active' : 'border-cm-line text-cm-body hover:border-[#CFE0F7]']
</script>
