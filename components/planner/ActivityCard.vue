<template>
  <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col">
    <img v-if="activity.image" :src="activity.image" :alt="activity.title" loading="lazy" class="h-40 w-full object-cover" />
    <div v-else class="h-40 w-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center text-4xl">🎟️</div>
    <div class="p-4 flex-1 flex flex-col">
      <div v-if="activity.category" class="text-xs font-semibold uppercase tracking-wide text-emerald-700">{{ activity.category }}</div>
      <div class="mt-1 font-bold text-slate-900">{{ activity.title }}</div>
      <p v-if="activity.summary" class="mt-1 text-sm text-slate-600 line-clamp-3">{{ activity.summary }}</p>
      <div class="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
        <span v-if="activity.duration">⏱ {{ activity.duration }}</span>
        <span v-if="activity.ageRestriction">👶 {{ activity.ageRestriction }}</span>
      </div>
      <div v-if="activity.reasons.length" class="mt-2 flex flex-wrap gap-1.5">
        <span
          v-for="reason in activity.reasons"
          :key="reason"
          class="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-xs font-medium"
        >
          {{ reason }}
        </span>
      </div>
      <div class="mt-auto pt-4">
        <div class="font-semibold text-slate-900 text-sm">{{ priceLabel(activity) }}</div>
        <div v-if="activity.checkedAt" class="text-xs text-slate-500">Price checked {{ formatShortDate(activity.checkedAt) }}</div>
        <NuxtLink
          v-if="activity.href"
          :to="activity.href"
          class="mt-2 inline-flex w-full justify-center px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700"
        >
          See tickets
        </NuxtLink>
        <button
          v-else-if="activity.offerId"
          @click="openOffer(activity)"
          class="mt-2 inline-flex w-full justify-center px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700"
        >
          Check live price
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { RecommendedActivity } from '~/types/trip'

const props = defineProps<{
  activity: RecommendedActivity
  placementKey: string
}>()

const { openOffer, priceLabel } = usePartnerOffer(props.placementKey)

const formatShortDate = (value: string) =>
  new Intl.DateTimeFormat('en-SG', { dateStyle: 'medium' }).format(new Date(value))
</script>
