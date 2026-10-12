<template>
  <div class="space-y-4">
    <div class="rounded-2xl border border-line bg-white p-4 sm:p-6">
      <h2 class="font-display text-2xl text-ink">{{ itinerary.title }}</h2>
      <p class="mt-2 text-ink/70">{{ itinerary.summary }}</p>
      <p class="mt-3 text-sm text-ink/70">
        Plan suggested by AI. Prices and availability below come from our partners and are checked each time you open this plan.
      </p>
    </div>

    <div v-for="day in itinerary.days" :key="day.date" class="overflow-hidden rounded-2xl border border-line bg-white">
      <div class="border-b border-line bg-sand px-4 py-3 sm:px-6 sm:py-4">
        <div class="text-sm font-semibold text-sea">{{ formatDay(day.date) }}</div>
        <div class="font-display text-xl text-ink">{{ day.theme }}</div>
      </div>
      <ul class="divide-y divide-line">
        <li v-for="(item, index) in day.items" :key="index" class="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:gap-4 sm:px-6">
          <div class="sm:w-28 shrink-0">
            <span class="inline-flex rounded-full bg-sand px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-ink/70">
              {{ slotLabels[item.slot] }}
            </span>
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-xs font-semibold uppercase tracking-wide text-ink/70">{{ itemKind(item) }}</p>
            <div class="font-semibold text-ink">{{ item.title }}</div>
            <p class="mt-1 text-sm text-ink/70">{{ item.description }}</p>
            <p v-if="item.familyTip" class="mt-2 text-sm text-ink">
              <span class="font-semibold">For parents. </span>{{ item.familyTip }}
            </p>
          </div>
          <div v-if="item.activityId && activities[item.activityId]" class="shrink-0 sm:w-56">
            <div
              v-if="activities[item.activityId].verified"
              class="rounded-xl border border-line bg-sea-50 p-3 text-sm"
            >
              <div class="font-semibold text-ink">
                {{ priceLabel(activities[item.activityId]) }}
              </div>
              <div v-if="activities[item.activityId].checkedAt" class="text-xs text-ink/70">
                Price checked {{ formatShortDate(activities[item.activityId].checkedAt!) }}
              </div>
              <NuxtLink
                v-if="activities[item.activityId].href"
                :to="activities[item.activityId].href!"
                class="mt-2 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-ink px-3 py-2 font-semibold text-white hover:bg-ink/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sea"
              >
                See tickets
              </NuxtLink>
              <button
                v-else-if="activities[item.activityId].offerId"
                type="button"
                class="mt-2 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-ink px-3 py-2 font-semibold text-white hover:bg-ink/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sea"
                @click="openOffer(activities[item.activityId])"
              >
                Check on partner
              </button>
            </div>
            <div v-else-if="activities[item.activityId].available" class="rounded-xl border border-line bg-sand p-3 text-sm text-ink/70">
              Suggestion only. A partner has not confirmed this ticket or its price.
            </div>
            <div v-else class="rounded-xl border border-line bg-sand p-3 text-sm text-ink/70">
              No longer available from our partners.
            </div>
          </div>
        </li>
      </ul>
    </div>

    <div v-if="itinerary.tips.length" class="rounded-2xl border border-line bg-white p-4 sm:p-6">
      <h3 class="font-display text-xl text-ink">Tips for the family</h3>
      <ul class="mt-3 list-disc space-y-1 pl-5 text-ink/70">
        <li v-for="(tip, index) in itinerary.tips" :key="index">{{ tip }}</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Itinerary, LiveActivity } from '~/types/trip'

const props = defineProps<{
  itinerary: Itinerary
  activities: Record<string, LiveActivity>
}>()

const { openOffer, priceLabel } = usePartnerOffer('trip_planner')

const slotLabels = { morning: 'Morning', afternoon: 'Afternoon', evening: 'Evening' } as const

const itemKind = (item: Itinerary['days'][number]['items'][number]) => {
  const activity = item.activityId ? props.activities[item.activityId] : null
  if (activity?.verified && activity.href) return 'Ticket on GoTravelNha'
  if (activity?.verified && activity.offerId) return 'Partner offer'
  return 'Suggestion'
}

const formatDay = (date: string) =>
  new Intl.DateTimeFormat('en-SG', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' }).format(
    new Date(`${date}T00:00:00Z`)
  )

const formatShortDate = (value: string) =>
  new Intl.DateTimeFormat('en-SG', { dateStyle: 'medium' }).format(new Date(value))
</script>
