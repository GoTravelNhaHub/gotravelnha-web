<template>
  <div class="flex flex-col overflow-hidden rounded-2xl border border-line bg-white">
    <div class="relative aspect-[3/2] overflow-hidden bg-sand">
      <img v-if="activity.image" :src="activity.image" :alt="activity.title" width="640" height="360" loading="lazy" decoding="async" class="absolute inset-0 h-full w-full object-cover" />
      <div v-else class="flex h-full items-center justify-center text-sm font-semibold text-ink/70">No photo yet</div>
    </div>
    <div class="flex flex-1 flex-col p-4">
      <div v-if="activity.category" class="text-xs font-semibold uppercase tracking-wide text-ink/70">{{ activity.category }}</div>
      <div class="mt-1 font-display text-xl text-ink">{{ activity.title }}</div>
      <p v-if="activity.summary" class="mt-1 line-clamp-3 text-sm text-ink/70">{{ activity.summary }}</p>
      <div class="mt-2 flex flex-wrap gap-2 text-xs text-ink/70">
        <span v-if="activity.duration">{{ activity.duration }}</span>
        <span v-if="activity.ageRestriction">{{ activity.ageRestriction }}</span>
      </div>
      <div v-if="activity.reasons.length" class="mt-2 flex flex-wrap gap-1.5">
        <span
          v-for="reason in activity.reasons"
          :key="reason"
          class="rounded-full bg-sand px-2 py-0.5 text-xs font-medium text-ink"
        >
          {{ reason }}
        </span>
      </div>
      <div class="mt-auto pt-4">
        <div class="text-sm font-semibold text-ink">{{ priceLabel(activity) }}</div>
        <div v-if="activity.checkedAt" class="text-xs text-ink/70">Price checked {{ formatShortDate(activity.checkedAt) }}</div>
        <NuxtLink
          v-if="activity.href"
          :to="activity.href"
          class="mt-2 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-ink px-3 py-2 text-sm font-semibold text-white hover:bg-ink/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sea"
        >
          See tickets
        </NuxtLink>
        <button
          v-else-if="activity.offerId"
          type="button"
          class="mt-2 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-ink px-3 py-2 text-sm font-semibold text-white hover:bg-ink/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sea"
          @click="openOffer(activity)"
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
