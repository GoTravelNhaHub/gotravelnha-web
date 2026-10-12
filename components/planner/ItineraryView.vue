<template>
  <div class="space-y-6">
    <div class="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6">
      <h2 class="text-xl sm:text-2xl font-bold text-slate-900">{{ itinerary.title }}</h2>
      <p class="mt-2 text-slate-600">{{ itinerary.summary }}</p>
      <p class="mt-3 text-xs text-slate-500">
        Plan suggested by AI. Prices and availability below come from our partners and are checked each time you open this plan.
      </p>
    </div>

    <div v-for="day in itinerary.days" :key="day.date" class="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div class="px-4 py-3 sm:px-6 sm:py-4 bg-slate-50 border-b border-slate-200">
        <div class="text-sm font-semibold text-emerald-700">{{ formatDay(day.date) }}</div>
        <div class="text-base sm:text-lg font-bold text-slate-900">{{ day.theme }}</div>
      </div>
      <ul class="divide-y divide-slate-100">
        <li v-for="(item, index) in day.items" :key="index" class="px-4 py-4 sm:px-6 flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div class="sm:w-28 shrink-0">
            <span class="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
              {{ slotLabels[item.slot] }}
            </span>
          </div>
          <div class="flex-1 min-w-0">
            <div class="font-semibold text-slate-900">{{ item.title }}</div>
            <p class="text-sm text-slate-600 mt-1">{{ item.description }}</p>
            <p v-if="item.familyTip" class="text-sm text-amber-700 mt-2">👪 {{ item.familyTip }}</p>
          </div>
          <div v-if="item.activityId && activities[item.activityId]" class="sm:w-56 shrink-0">
            <div
              v-if="activities[item.activityId].available"
              class="rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-sm"
            >
              <div class="font-semibold text-slate-900">
                {{ priceLabel(activities[item.activityId]) }}
              </div>
              <div v-if="activities[item.activityId].checkedAt" class="text-xs text-slate-500">
                Price checked {{ formatShortDate(activities[item.activityId].checkedAt!) }}
              </div>
              <NuxtLink
                v-if="activities[item.activityId].href"
                :to="activities[item.activityId].href!"
                class="mt-2 inline-flex w-full justify-center px-3 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
              >
                See tickets
              </NuxtLink>
              <button
                v-else-if="activities[item.activityId].offerId"
                @click="openOffer(activities[item.activityId])"
                class="mt-2 inline-flex w-full justify-center px-3 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
              >
                Check live price
              </button>
            </div>
            <div v-else class="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-500">
              No longer available from our partners.
            </div>
          </div>
        </li>
      </ul>
    </div>

    <div v-if="itinerary.tips.length" class="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6">
      <h3 class="text-lg font-bold text-slate-900 mb-3">Tips for the family</h3>
      <ul class="list-disc pl-5 space-y-1 text-slate-700">
        <li v-for="(tip, index) in itinerary.tips" :key="index">{{ tip }}</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Itinerary, LiveActivity } from '~/types/trip'

defineProps<{
  itinerary: Itinerary
  activities: Record<string, LiveActivity>
}>()

const { openOffer, priceLabel } = usePartnerOffer('trip_planner')

const slotLabels = { morning: 'Morning', afternoon: 'Afternoon', evening: 'Evening' } as const

const formatDay = (date: string) =>
  new Intl.DateTimeFormat('en-SG', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' }).format(
    new Date(`${date}T00:00:00Z`)
  )

const formatShortDate = (value: string) =>
  new Intl.DateTimeFormat('en-SG', { dateStyle: 'medium' }).format(new Date(value))
</script>
