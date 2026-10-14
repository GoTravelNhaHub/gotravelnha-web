<template>
  <div class="space-y-5 font-brand">
    <section class="rounded-2xl border border-[#E2E8F0] bg-white p-5 sm:p-6">
      <p class="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#008A9B]">Trip overview</p>
      <h2 class="mt-1 text-[20px] font-bold leading-7 tracking-[-0.02em] text-[#101D3A]">{{ itinerary.title }}</h2>
      <p class="mt-2 text-[15px] leading-6 text-[#475569]">{{ itinerary.summary }}</p>
      <p class="mt-3 flex items-start gap-2 text-[13px] leading-5 text-[#64748B]">
        <svg class="mt-0.5 h-4 w-4 shrink-0 text-[#94A3B8]" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 16v-4m0-4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
        Plan suggested by AI. Prices and availability come from our partners and are checked each time you open this plan.
      </p>
    </section>

    <section
      v-for="(day, dayIndex) in itinerary.days"
      :id="`day-${dayIndex + 1}`"
      :key="day.date"
      class="scroll-mt-24 overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white break-inside-avoid"
    >
      <header class="flex items-center gap-4 border-b border-[#F1F5F9] px-5 py-4 sm:px-6">
        <span class="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-[#101D3A] text-white" aria-hidden="true">
          <span class="text-[10px] font-semibold uppercase leading-3 tracking-wide text-white/60">Day</span>
          <span class="text-[18px] font-bold leading-5">{{ dayIndex + 1 }}</span>
        </span>
        <div class="min-w-0">
          <p class="text-[13px] font-semibold text-[#008A9B]">{{ formatDay(day.date) }}</p>
          <h3 class="text-[17px] font-bold leading-6 text-[#101D3A]">{{ day.theme }}</h3>
        </div>
      </header>
      <ol class="px-5 py-2 sm:px-6">
        <li v-for="(item, index) in day.items" :key="index" class="relative flex gap-4 py-4">
          <!-- Timeline rail -->
          <span v-if="index < day.items.length - 1" class="absolute bottom-0 left-[17px] top-14 w-px bg-[#E2E8F0]" aria-hidden="true"></span>
          <span class="relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full ring-4 ring-white" :class="slotStyles[item.slot]">
            <PlannerIcon :name="slotIcons[item.slot]" class="h-4 w-4" />
          </span>
          <div class="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:gap-5">
            <div class="min-w-0 flex-1">
              <p class="text-[12px] font-semibold uppercase tracking-[0.06em] text-[#64748B]">
                {{ slotLabels[item.slot] }}
                <span class="ml-1 rounded-full px-1.5 py-0.5 text-[10px] tracking-wide" :class="kindStyles[itemKind(item)]">{{ itemKind(item) }}</span>
              </p>
              <h4 class="mt-1 text-[15px] font-semibold leading-[22px] text-[#101D3A]">{{ item.title }}</h4>
              <p class="mt-1 text-[14px] leading-[22px] text-[#475569]">{{ item.description }}</p>
              <p v-if="item.familyTip" class="mt-2 flex items-start gap-2 rounded-xl bg-[#FFFBEB] px-3 py-2 text-[13px] leading-5 text-[#78350F]">
                <PlannerIcon name="bulb" class="mt-0.5 h-4 w-4 shrink-0 text-[#D97706]" />
                <span><span class="font-semibold">For parents: </span>{{ item.familyTip }}</span>
              </p>
            </div>
            <div v-if="item.activityId && activities[item.activityId]" class="shrink-0 sm:w-56 print:hidden">
              <div v-if="activities[item.activityId].verified" class="rounded-xl border border-[#99E3EC] bg-[#F0FBFC] p-3 text-[14px]">
                <div class="font-semibold text-[#101D3A]">{{ priceLabel(activities[item.activityId]) }}</div>
                <div v-if="activities[item.activityId].checkedAt" class="text-[12px] text-[#64748B]">
                  Price checked {{ formatShortDate(activities[item.activityId].checkedAt!) }}
                </div>
                <NuxtLink
                  v-if="activities[item.activityId].href"
                  :to="activities[item.activityId].href!"
                  class="btn-primary mt-2 min-h-10 text-[13px]"
                >
                  See tickets
                </NuxtLink>
                <button
                  v-else-if="activities[item.activityId].offerId"
                  type="button"
                  class="btn-primary mt-2 min-h-10 text-[13px]"
                  @click="openOffer(activities[item.activityId])"
                >
                  Check on partner
                </button>
              </div>
              <div v-else-if="activities[item.activityId].available" class="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-[13px] leading-5 text-[#64748B]">
                Suggestion only. A partner has not confirmed this ticket or its price.
              </div>
              <div v-else class="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-[13px] leading-5 text-[#64748B]">
                No longer available from our partners.
              </div>
            </div>
          </div>
        </li>
      </ol>
    </section>

    <section v-if="itinerary.tips.length" class="rounded-2xl border border-[#E2E8F0] bg-white p-5 sm:p-6 break-inside-avoid">
      <h3 class="text-[17px] font-bold text-[#101D3A]">Tips for the family</h3>
      <ul class="mt-3 space-y-2">
        <li v-for="(tip, index) in itinerary.tips" :key="index" class="flex items-start gap-2.5 text-[14px] leading-[22px] text-[#475569]">
          <span class="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#E8F7FA] text-[#008A9B]" aria-hidden="true">
            <svg class="h-3 w-3" viewBox="0 0 20 20" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.4" d="m5 10.5 3 3 7-7" /></svg>
          </span>
          {{ tip }}
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
import PlannerIcon from '~/components/planner/PlannerIcon.vue'
import type { Itinerary, LiveActivity } from '~/types/trip'

const props = defineProps<{
  itinerary: Itinerary
  activities: Record<string, LiveActivity>
}>()

const { openOffer, priceLabel } = usePartnerOffer('trip_planner')

const slotLabels = { morning: 'Morning', afternoon: 'Afternoon', evening: 'Evening' } as const
const slotIcons = { morning: 'sun', afternoon: 'sunset', evening: 'moon' } as const
const slotStyles = {
  morning: 'bg-[#FEF3C7] text-[#B45309]',
  afternoon: 'bg-[#FFEDD5] text-[#C2410C]',
  evening: 'bg-[#E0E7FF] text-[#4338CA]'
} as const
const kindStyles: Record<string, string> = {
  'Ticket on GoTravelNha': 'bg-[#E8F7FA] text-[#007789]',
  'Partner offer': 'bg-[#E8F7FA] text-[#007789]',
  Suggestion: 'bg-[#F1F5F9] text-[#64748B]'
}

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
