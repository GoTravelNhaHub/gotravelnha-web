<template>
  <div class="space-y-5">
    <header class="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
      <div class="flex min-w-0 items-start gap-3">
        <div class="h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-sea-50">
          <img v-if="cityPhoto" :src="cityPhoto" alt="" width="112" height="112" class="h-full w-full object-cover" />
          <PlannerIcon v-else name="globe" class="m-4 h-6 w-6 text-sea" />
        </div>
        <div class="min-w-0">
          <h2 class="text-[22px] font-bold leading-[30px] tracking-[-0.025em] text-[#101D3A]">{{ itinerary.title }}</h2>
          <ul class="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[12px] font-medium leading-[18px] text-[#64748B]">
            <li class="inline-flex items-center gap-1.5"><PlannerIcon name="pin" class="h-3.5 w-3.5 text-[#008A9B]" />{{ placeName(request.destination) }}</li>
            <li class="inline-flex items-center gap-1.5"><PlannerIcon name="calendar" class="h-3.5 w-3.5 text-[#008A9B]" />{{ stayLabel }}</li>
            <li class="inline-flex items-center gap-1.5"><PlannerIcon name="users" class="h-3.5 w-3.5 text-[#008A9B]" />{{ partyLabel }}</li>
            <li v-if="budgetLabel" class="inline-flex items-center gap-1.5"><PlannerIcon name="wallet" class="h-3.5 w-3.5 text-[#008A9B]" />{{ budgetLabel }}</li>
          </ul>
        </div>
      </div>
      <div class="flex shrink-0 flex-wrap gap-2">
        <button
          v-if="authenticated"
          type="button"
          class="inline-flex h-10 min-h-11 items-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-white px-3 text-[13px] font-semibold leading-5 text-[#101D3A] hover:bg-[#F1F5F9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#008A9B] disabled:opacity-60 sm:min-h-9"
          :disabled="saving"
          @click="$emit('save')"
        >
          <PlannerIcon name="bookmark" class="h-4 w-4" />
          {{ saving ? t('planner.board.saving') : t('planner.board.save') }}
        </button>
        <NuxtLink
          v-else
          to="/login?redirect=/planner"
          class="inline-flex h-10 min-h-11 items-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-white px-3 text-[13px] font-semibold leading-5 text-[#101D3A] hover:bg-[#F1F5F9] sm:min-h-9"
        >
          <PlannerIcon name="bookmark" class="h-4 w-4" />
          {{ t('planner.board.signInToSave') }}
        </NuxtLink>
        <button
          type="button"
          class="inline-flex h-10 min-h-11 items-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-white px-3 text-[13px] font-semibold leading-5 text-[#101D3A] hover:bg-[#F1F5F9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#008A9B] sm:min-h-9"
          @click="copy(tripSummary(), 'trip')"
        >
          <PlannerIcon :name="copied === 'trip' ? 'check' : 'copy'" class="h-4 w-4" />
          {{ copied === 'trip' ? t('planner.board.copied') : t('planner.board.copyTrip') }}
        </button>
        <button
          type="button"
          class="inline-flex h-10 min-h-11 items-center gap-1.5 rounded-xl bg-[#008A9B] px-3 text-[13px] font-semibold leading-5 text-white hover:bg-[#007789] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#101D3A] sm:min-h-9"
          @click="$emit('refine')"
        >
          <PlannerIcon name="spark" class="h-4 w-4" />
          {{ t('planner.board.refine') }}
        </button>
      </div>
    </header>
    <p v-if="copyError" class="text-sm text-coral" role="status">{{ copyError }}</p>

    <nav class="-mx-1 flex gap-1 overflow-x-auto border-b border-[#E2E8F0] px-1" role="tablist" :aria-label="t('planner.board.viewsLabel')">
      <button
        v-for="item in views"
        :key="item.id"
        type="button"
        role="tab"
        :aria-selected="view === item.id"
        class="-mb-px inline-flex min-h-11 shrink-0 items-center gap-1.5 border-b-2 px-3 text-[13px] font-semibold leading-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#008A9B]"
        :class="view === item.id ? 'border-[#008A9B] text-[#008A9B]' : 'border-transparent text-[#64748B] hover:text-[#101D3A]'"
        @click="view = item.id"
      >
        <PlannerIcon :name="item.icon" class="h-4 w-4" />
        {{ t(`planner.board.views.${item.id}`) }}
      </button>
    </nav>

    <template v-if="view === 'itinerary'">
      <div class="-mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-1" role="tablist" :aria-label="t('planner.board.daysLabel')">
        <button
          v-for="(entry, index) in itinerary.days"
          :key="entry.date"
          type="button"
          role="tab"
          :aria-selected="selected === index"
          class="h-[60px] w-36 shrink-0 snap-start rounded-xl border px-3 py-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#008A9B]"
          :class="selected === index ? 'border-[#008A9B] bg-[#E8F7FA]' : 'border-[#E2E8F0] bg-white hover:border-[#008A9B]/40'"
          @click="selected = index"
        >
          <span class="block text-[13px] font-semibold leading-5" :class="selected === index ? 'text-[#008A9B]' : 'text-[#101D3A]'">{{ t('planner.board.day', { n: index + 1 }) }}</span>
          <span class="block truncate text-[12px] leading-[18px] text-[#64748B]">{{ entry.theme }}</span>
        </button>
      </div>

      <div class="grid gap-4 xl:grid-cols-[minmax(0,1.85fr)_minmax(12rem,1fr)]">
        <section v-if="day" class="min-w-0">
          <div class="flex flex-wrap items-baseline justify-between gap-2">
            <h3 class="text-[16px] font-bold leading-6 tracking-[-0.025em] text-[#101D3A]">{{ t('planner.board.dayTitle', { n: selected + 1, theme: day.theme }) }}</h3>
            <p class="text-[12px] font-medium leading-[18px] text-[#64748B]">{{ formatDay(day.date) }}</p>
          </div>

          <ol class="mt-3 space-y-2.5">
            <li v-for="(item, index) in day.items" :key="index" class="relative grid grid-cols-[56px_44px_minmax(0,1fr)] gap-2.5">
              <p class="pt-3 text-[11px] font-medium uppercase leading-4 text-[#64748B]">{{ t(`planner.slots.${item.slot}`) }}</p>
              <div class="relative flex justify-center">
                <span
                  v-if="index < day.items.length - 1"
                  class="absolute bottom-[-0.65rem] top-10 w-px border-l border-dashed border-[#008A9B]/35"
                  aria-hidden="true"
                ></span>
                <span class="relative mt-1 inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#E8F7FA] text-[#008A9B]">
                  <PlannerIcon :name="slotIcons[item.slot]" class="h-4 w-4" />
                </span>
              </div>
              <article class="flex min-w-0 gap-3 rounded-xl border border-[#E2E8F0] bg-white p-3">
                <div class="min-w-0 flex-1">
                  <p class="text-xs font-semibold uppercase tracking-wide" :class="kindTone(item)">{{ itemKind(item) }}</p>
                  <p class="mt-0.5 text-[14px] font-semibold leading-5 text-[#101D3A]">{{ item.title }}</p>
                  <p class="mt-1 text-[12px] leading-[18px] text-[#64748B]">{{ item.description }}</p>
                  <p v-if="isSuggestion(item)" class="mt-2 text-[12px] leading-[18px] text-[#64748B]">
                    {{ t('planner.board.suggestionOnly') }}
                  </p>
                  <p v-if="item.familyTip" class="mt-2 rounded-lg bg-sand px-2.5 py-1.5 text-sm text-ink">
                    <span class="font-semibold">{{ t('planner.board.forParents') }} </span>{{ item.familyTip }}
                  </p>
                  <template v-if="activityFor(item)">
                    <div v-if="activityFor(item)!.verified" class="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
                      <span class="text-sm font-semibold text-ink">{{ priceLabel(activityFor(item)!) }}</span>
                      <span v-if="activityFor(item)!.checkedAt" class="text-xs text-ink/70">
                        {{ t('planner.board.checked', { date: formatShortDate(activityFor(item)!.checkedAt!) }) }}
                      </span>
                      <NuxtLink
                        v-if="activityFor(item)!.href"
                        :to="activityFor(item)!.href!"
                        class="inline-flex min-h-11 items-center rounded-lg bg-ink px-3 text-sm font-semibold text-white hover:bg-ink/90"
                      >
                        {{ t('planner.board.seeTickets') }}
                      </NuxtLink>
                      <button
                        v-else-if="activityFor(item)!.offerId"
                        type="button"
                        class="inline-flex min-h-11 items-center rounded-lg bg-ink px-3 text-sm font-semibold text-white hover:bg-ink/90"
                        @click="openOffer(activityFor(item)!)"
                      >
                        {{ t('planner.board.checkOn', { provider: providerLabel(activityFor(item)!.provider) }) }}
                      </button>
                    </div>
                    <p v-else-if="!activityFor(item)!.available" class="mt-2 text-sm text-ink/70">{{ t('planner.board.noLongerListed') }}</p>
                  </template>
                </div>
                <img
                  v-if="activityFor(item)?.image"
                  :src="activityFor(item)!.image!"
                  alt=""
                  width="88"
                  height="56"
                  loading="lazy"
                  class="hidden h-14 w-[88px] shrink-0 rounded-lg object-cover sm:block"
                />
              </article>
            </li>
          </ol>

          <div class="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              class="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-white px-3.5 text-sm font-semibold text-ink hover:bg-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sea"
              @click="view = 'destination'"
            >
              <PlannerIcon name="pin" class="h-4 w-4 text-sea" />
              {{ t('planner.board.destinationOverview') }}
            </button>
            <button
              type="button"
              class="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-white px-3.5 text-sm font-semibold text-ink hover:bg-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sea"
              @click="copy(daySummary(), 'day')"
            >
              <PlannerIcon :name="copied === 'day' ? 'check' : 'copy'" class="h-4 w-4 text-sea" />
              {{ copied === 'day' ? t('planner.board.copied') : t('planner.board.copyDay') }}
            </button>
            <button
              type="button"
              class="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-white px-3.5 text-sm font-semibold text-ink hover:bg-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sea"
              @click="$emit('refine')"
            >
              <PlannerIcon name="refresh" class="h-4 w-4 text-sea" />
              {{ t('planner.board.refine') }}
            </button>
          </div>
        </section>

        <aside class="space-y-5">
          <section class="overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
            <div class="relative aspect-[16/10] bg-sea-50">
              <img v-if="cityPhotoLarge" :src="cityPhotoLarge" alt="" class="absolute inset-0 h-full w-full object-cover" loading="lazy" />
              <span class="absolute inset-0 bg-gradient-to-t from-ink/75 to-transparent"></span>
              <div class="absolute inset-x-0 bottom-0 p-3">
                <p class="text-xs font-semibold uppercase tracking-wide text-white/90">{{ t('planner.board.destination') }}</p>
                <p class="font-display text-xl text-white">{{ placeName(city) }}</p>
              </div>
            </div>
            <div class="p-3 text-sm">
              <p class="text-ink/70">{{ t('planner.board.daysStops', { days: itinerary.days.length, stops: stopCount }) }}</p>
              <ul v-if="places.length" class="mt-2 space-y-1">
                <li v-for="place in places.slice(0, 4)" :key="place" class="flex items-start gap-1.5 text-ink">
                  <PlannerIcon name="pin" class="mt-0.5 h-4 w-4 shrink-0 text-sea" />
                  <span class="min-w-0">{{ place }}</span>
                </li>
              </ul>
              <NuxtLink :to="`/destinations/${slug}`" class="mt-2 inline-flex min-h-11 items-center gap-1 font-semibold text-sea hover:underline">
                {{ t('planner.board.exploreCity', { city: placeName(city) }) }}
                <PlannerIcon name="arrow" class="h-4 w-4" />
              </NuxtLink>
            </div>
          </section>

          <section v-if="partnerPicks.length">
            <div class="flex items-center justify-between gap-2">
              <h3 class="text-[13px] font-bold leading-5 tracking-[-0.025em] text-[#101D3A]">{{ t('planner.board.recommended') }}</h3>
              <NuxtLink :to="`/destinations/${slug}`" class="text-sm font-semibold text-sea hover:underline">{{ t('planner.board.viewAll') }}</NuxtLink>
            </div>
            <div class="mt-3 grid grid-cols-2 gap-3 xl:grid-cols-1 2xl:grid-cols-2">
              <article v-for="activity in partnerPicks" :key="activity.id" class="flex flex-col overflow-hidden rounded-xl border border-line bg-white shadow-sm">
                <div class="relative aspect-video bg-[#F1F5F9]">
                  <img v-if="activity.image" :src="activity.image" alt="" loading="lazy" class="absolute inset-0 h-full w-full object-cover" />
                </div>
                <div class="flex flex-1 flex-col p-2.5">
                  <p class="text-xs font-semibold text-sea">{{ providerLabel(activity.provider) }}</p>
                  <p class="mt-0.5 line-clamp-2 text-sm font-semibold leading-snug text-ink">{{ activity.title }}</p>
                  <p v-if="activity.priceFrom" class="mt-1 text-xs text-ink/70">{{ priceLabel(activity) }}</p>
                  <button
                    type="button"
                    class="mt-auto inline-flex min-h-11 items-center justify-center rounded-lg border border-line text-sm font-semibold text-ink hover:bg-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sea"
                    @click="openOffer(activity)"
                  >
                    {{ t('planner.board.checkOn', { provider: providerLabel(activity.provider) }) }}
                  </button>
                </div>
              </article>
            </div>
          </section>

          <section class="rounded-2xl border border-[#E2E8F0] bg-white p-3">
            <h3 class="text-[13px] font-bold leading-5 tracking-[-0.025em] text-[#101D3A]">{{ t('planner.board.searchTitle') }}</h3>
            <p class="mt-1 text-[12px] leading-[18px] text-[#64748B]">
              {{ t('planner.board.searchText') }}
            </p>
            <div class="mt-3 flex flex-col gap-2">
              <button
                type="button"
                class="inline-flex min-h-11 items-center justify-center rounded-lg border border-line px-3 text-sm font-semibold text-ink hover:bg-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sea"
                @click="searchActivities"
              >
                {{ t('planner.board.searchKlook') }}
              </button>
              <button
                v-if="hotelSearchUrl"
                type="button"
                class="inline-flex min-h-11 items-center justify-center rounded-lg border border-line px-3 text-sm font-semibold text-ink hover:bg-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sea"
                @click="searchHotels"
              >
                {{ t('planner.board.searchTrip') }}
              </button>
            </div>
          </section>
        </aside>
      </div>
    </template>

    <section v-else-if="view === 'overview'" class="space-y-4">
      <p class="text-base leading-7 text-ink">{{ itinerary.summary }}</p>
      <ol class="divide-y divide-line overflow-hidden rounded-2xl border border-line">
        <li v-for="(entry, index) in itinerary.days" :key="entry.date">
          <button
            type="button"
            class="flex min-h-14 w-full items-center gap-3 px-4 py-3 text-left hover:bg-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sea"
            @click="openDay(index)"
          >
            <span class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sea-50 text-sm font-semibold text-sea">{{ index + 1 }}</span>
            <span class="min-w-0 flex-1">
              <span class="block font-semibold text-ink">{{ entry.theme }}</span>
              <span class="block text-sm text-ink/70">{{ t('planner.board.stops', { date: formatDay(entry.date), count: entry.items.length }) }}</span>
            </span>
            <PlannerIcon name="arrow" class="h-4 w-4 text-ink/70" />
          </button>
        </li>
      </ol>
      <p class="text-sm leading-6 text-ink/70">
        {{ t('planner.board.aiNote') }}
      </p>
    </section>

    <section v-else-if="view === 'destination'" class="grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div class="relative min-h-56 overflow-hidden rounded-2xl bg-sea-50">
        <img v-if="cityPhotoLarge" :src="cityPhotoLarge" alt="" class="absolute inset-0 h-full w-full object-cover" />
        <span class="absolute inset-0 bg-gradient-to-t from-ink/75 to-transparent"></span>
        <div class="absolute inset-x-0 bottom-0 p-4">
          <p class="font-display text-2xl text-white">{{ placeName(city) }}</p>
          <p class="text-sm text-white/90">{{ stayLabel }}</p>
        </div>
      </div>
      <div>
        <h3 class="font-display text-xl text-ink">{{ t('planner.board.stopsByDay') }}</h3>
        <p class="mt-1 text-sm text-ink/70">{{ t('planner.board.placeNote') }}</p>
        <ol class="mt-3 space-y-3">
          <li v-for="(entry, index) in itinerary.days" :key="entry.date">
            <p class="text-sm font-semibold text-sea">{{ t('planner.board.day', { n: index + 1 }) }}</p>
            <ul class="mt-1 space-y-1 text-sm">
              <li v-for="(item, itemIndex) in entry.items" :key="itemIndex" class="text-ink">
                {{ item.title }}
                <span v-if="activityFor(item)?.location" class="text-ink/70"> · {{ activityFor(item)!.location }}</span>
              </li>
            </ul>
          </li>
        </ol>
      </div>
    </section>

    <section v-else-if="view === 'cost'" class="space-y-4">
      <div class="grid gap-3 sm:grid-cols-2">
        <div class="rounded-2xl border border-line bg-sand p-4">
          <p class="text-sm text-ink/70">{{ t('planner.board.yourBudget') }}</p>
          <p class="mt-1 font-display text-2xl text-ink">{{ budgetAmount || t('planner.board.notSet') }}</p>
        </div>
        <div class="rounded-2xl border border-line bg-sea-50 p-4">
          <p class="text-sm text-ink/70">{{ t('planner.board.checkedPrices') }}</p>
          <p class="mt-1 font-display text-2xl text-ink">{{ costTotal ? formatMoney(costTotal.amount, costTotal.currency) : '—' }}</p>
        </div>
      </div>
      <p class="text-sm leading-6 text-ink/70">
        {{ t('planner.board.costNote') }}
      </p>
      <ul v-if="costLines.length" class="divide-y divide-line overflow-hidden rounded-2xl border border-line">
        <li v-for="(line, index) in costLines" :key="index" class="flex items-start justify-between gap-3 px-4 py-3 text-sm">
          <span>
            <span class="block font-semibold text-ink">{{ line.title }}</span>
            <span class="text-ink/70">{{ t('planner.board.costLine', { day: line.day, provider: providerLabel(line.provider) }) }}</span>
          </span>
          <span class="shrink-0 font-semibold text-ink">{{ formatMoney(line.priceFrom, line.currency) }}</span>
        </li>
      </ul>
      <p v-else class="rounded-2xl border border-dashed border-line px-4 py-6 text-center text-sm text-ink">{{ t('planner.board.noPrices') }}</p>
      <p v-if="costLines.length && !costTotal" class="text-sm text-ink/70">{{ t('planner.board.mixedCurrency') }}</p>
      <p v-if="unpricedCount" class="text-sm text-ink/70">{{ t('planner.board.unpriced', { count: unpricedCount }) }}</p>
    </section>

    <section v-else class="space-y-3">
      <ul v-if="itinerary.tips.length" class="space-y-2">
        <li v-for="(tip, index) in itinerary.tips" :key="index" class="flex gap-3 rounded-xl border border-line bg-white p-3 text-sm leading-6 text-ink">
          <PlannerIcon name="bulb" class="mt-0.5 h-5 w-5 shrink-0 text-sea" />
          {{ tip }}
        </li>
      </ul>
      <p v-else class="text-sm text-ink/70">{{ t('planner.board.noTips') }}</p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import PlannerIcon from '~/components/planner/PlannerIcon.vue'
import type { PlannerIconName } from '~/components/planner/PlannerIcon.vue'
import type { Itinerary, ItineraryItem, LiveActivity } from '~/types/trip'
import { appendKlookAffiliateId, appendTripAffiliateIds, openTrackedOutbound } from '~/utils/affiliate-links'
import { destinationPhoto } from '~/utils/destination-photos'
import { cityOf, destinationSlug } from '~/utils/destination-slug'
import { SEARCH_CITIES, tripHotelUrl } from '~/utils/trip-search'
import { getVisitorSessionId } from '~/utils/visitor-session'

interface BoardRequest {
  destination: string
  startDate: string
  endDate: string
  party: Array<{ name?: string; age: number }>
  budget?: number | null
}

const props = defineProps<{
  itinerary: Itinerary
  activities: Record<string, LiveActivity>
  request: BoardRequest
  authenticated: boolean
  saving: boolean
}>()

defineEmits<{
  save: []
  refine: []
}>()

const { openOffer, priceLabel } = usePartnerOffer('trip_planner')
const { track } = useFunnel()
const { t, locale, localeTag, placeName } = useI18n()
const config = useRuntimeConfig().public

const slotIcons: Record<ItineraryItem['slot'], PlannerIconName> = { morning: 'sun', afternoon: 'sunset', evening: 'moon' }

const views: Array<{ id: 'itinerary' | 'overview' | 'destination' | 'cost' | 'tips'; icon: PlannerIconName }> = [
  { id: 'itinerary', icon: 'calendar' },
  { id: 'overview', icon: 'info' },
  { id: 'destination', icon: 'pin' },
  { id: 'cost', icon: 'wallet' },
  { id: 'tips', icon: 'bulb' }
]

const view = ref<(typeof views)[number]['id']>('itinerary')
const selected = ref(0)
const copied = ref<'trip' | 'day' | null>(null)
const copyError = ref('')
let copiedTimer: ReturnType<typeof setTimeout> | null = null

watch(
  () => props.itinerary,
  () => {
    selected.value = 0
    view.value = 'itinerary'
  }
)

const day = computed(() => props.itinerary.days[selected.value] || props.itinerary.days[0])
const city = computed(() => cityOf(props.request.destination))
const slug = computed(() => destinationSlug(props.request.destination))
const cityPhoto = computed(() => destinationPhoto(props.request.destination, 160))
const cityPhotoLarge = computed(() => destinationPhoto(props.request.destination, 800))

const hotelCity = computed(() => SEARCH_CITIES.find((entry) => entry.name.toLowerCase() === city.value.toLowerCase()) || null)

const hotelSearchUrl = computed(() => {
  const match = hotelCity.value
  if (!match || !props.request.startDate || !props.request.endDate || props.request.endDate <= props.request.startDate) return ''
  const adults = props.request.party.filter((person) => person.age >= 18).length || 1
  const children = props.request.party.filter((person) => person.age < 18).length
  return tripHotelUrl({
    cityId: match.hotelCityId,
    checkIn: props.request.startDate,
    checkOut: props.request.endDate,
    adults,
    children,
    rooms: 1
  })
})

const openPartnerSearch = (provider: 'klook' | 'trip', url: string, searchType: 'activity' | 'hotel') => {
  const sessionId = getVisitorSessionId()
  const placement = 'trip_planner_search'
  track('travel_search_submitted', { provider, placement, destination: city.value, searchType })
  const fallback =
    provider === 'klook'
      ? appendKlookAffiliateId(url, String(config.KLOOK_AD_ID || ''))
      : appendTripAffiliateIds(url, String(config.TRIP_ALLIANCE_ID || ''), String(config.TRIP_SID || ''))
  openTrackedOutbound(async () => {
    const response = await $fetch<{ outboundUrl?: string }>('/api/affiliate/click', {
      method: 'POST',
      body: {
        provider,
        baseUrl: url,
        placementKey: placement,
        pagePath: '/planner',
        sessionId,
        metadata: { destination: city.value, searchType, funnel: 'affiliate_outbound_clicked' }
      }
    })
    return response?.outboundUrl
  }, fallback)
}

const searchActivities = () => {
  const path = ({ en: 'en-SG', vi: 'vi', zh: 'zh-CN' } as const)[locale.value]
  const url = `https://www.klook.com/${path}/search/result/?query=${encodeURIComponent(city.value)}`
  openPartnerSearch('klook', url, 'activity')
}

const searchHotels = () => {
  if (!hotelSearchUrl.value) return
  openPartnerSearch('trip', hotelSearchUrl.value, 'hotel')
}

const activityFor = (item: ItineraryItem) => (item.activityId ? props.activities[item.activityId] || null : null)

const providerLabel = (provider: string | null) => {
  const name = (provider || '').toLowerCase()
  if (name === 'klook') return 'Klook'
  if (name === 'trip' || name === 'trip.com') return 'Trip.com'
  if (name === 'attractionsg') return 'GoTravelNha'
  return provider || t('planner.board.partner')
}

const itemKind = (item: ItineraryItem) => {
  const activity = activityFor(item)
  if (activity?.verified && activity.href) return t('planner.board.kindTicket')
  if (activity?.verified && activity.offerId) return t('planner.board.kindOffer', { provider: providerLabel(activity.provider) })
  return t('planner.board.kindSuggestion')
}

const isSuggestion = (item: ItineraryItem) => {
  const activity = activityFor(item)
  return !(activity?.verified && (activity.href || activity.offerId))
}

const kindTone = (item: ItineraryItem) => (activityFor(item)?.verified ? 'text-sea' : 'text-ink/70')

const openDay = (index: number) => {
  selected.value = index
  view.value = 'itinerary'
}

const stayLabel = computed(() => {
  const start = new Date(`${props.request.startDate}T00:00:00Z`)
  const end = new Date(`${props.request.endDate}T00:00:00Z`)
  const nights = Math.max(0, Math.round((end.getTime() - start.getTime()) / 86_400_000))
  const days = props.itinerary.days.length
  const dayText = t('planner.board.days', { count: days })
  return nights > 0 ? `${dayText} · ${t('planner.board.nights', { count: nights })}` : dayText
})

const partyLabel = computed(() => {
  const adults = props.request.party.filter((person) => person.age >= 18).length
  const children = props.request.party.filter((person) => person.age < 18)
  const parts: string[] = []
  if (adults) parts.push(t('planner.brief.adults', { count: adults }))
  if (children.length) {
    const ages = children.map((person) => person.age).join(', ')
    parts.push(t('planner.board.childrenAges', { count: children.length, ages }))
  }
  return parts.join(' · ') || t('planner.board.travellersCount', { count: props.request.party.length })
})

const formatMoney = (amount: number, currency: string) => {
  const whole = Math.round(amount).toLocaleString(localeTag.value)
  return currency === 'SGD' ? `S$${whole}` : `${currency} ${whole}`
}

const budgetAmount = computed(() => (props.request.budget ? formatMoney(props.request.budget, 'SGD') : ''))
const budgetLabel = computed(() => (budgetAmount.value ? t('planner.board.forActivities', { amount: budgetAmount.value }) : ''))

const allItems = computed(() =>
  props.itinerary.days.flatMap((entry, index) => entry.items.map((item) => ({ item, day: index + 1 })))
)

const stopCount = computed(() => allItems.value.length)

const places = computed(() => {
  const seen = new Set<string>()
  for (const { item } of allItems.value) {
    const location = activityFor(item)?.location?.trim()
    if (location) seen.add(location)
  }
  return [...seen]
})

const costLines = computed(() =>
  allItems.value.flatMap(({ item, day }) => {
    const activity = activityFor(item)
    if (!activity?.verified || !activity.priceFrom || activity.priceFrom <= 0) return []
    return [{ title: item.title, day, priceFrom: activity.priceFrom, currency: activity.currency || 'SGD', provider: activity.provider }]
  })
)

const unpricedCount = computed(() => stopCount.value - costLines.value.length)

const costTotal = computed(() => {
  const lines = costLines.value
  if (!lines.length) return null
  const currency = lines[0].currency
  if (lines.some((line) => line.currency !== currency)) return null
  return { currency, amount: lines.reduce((sum, line) => sum + line.priceFrom, 0) }
})

const partnerPicks = computed(() => {
  const seen = new Set<string>()
  return allItems.value
    .map(({ item }) => activityFor(item))
    .filter((activity): activity is LiveActivity => {
      if (!activity?.verified || !activity.offerId || seen.has(activity.id)) return false
      const provider = (activity.provider || '').toLowerCase()
      if (!['klook', 'trip', 'trip.com'].includes(provider)) return false
      seen.add(activity.id)
      return true
    })
    .slice(0, 4)
})

watch(
  partnerPicks,
  (picks) => {
    if (!picks.length) return
    track(
      'ai_offer_viewed',
      {
        placement: 'trip_planner',
        provider: picks.map((activity) => (activity.provider || '').toLowerCase()).filter(Boolean).join(','),
        destination: city.value
      },
      true
    )
  },
  { immediate: true }
)

const formatDay = (date: string) =>
  new Intl.DateTimeFormat(localeTag.value, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(
    new Date(`${date}T00:00:00Z`)
  )

const formatShortDate = (value: string) => new Intl.DateTimeFormat(localeTag.value, { dateStyle: 'medium' }).format(new Date(value))

const dayLines = (entry: Itinerary['days'][number], index: number) => [
  `${t('planner.board.day', { n: index + 1 })} (${formatDay(entry.date)}): ${entry.theme}`,
  ...entry.items.map((item) => `- ${t(`planner.slots.${item.slot}`)}: ${item.title}`)
]

const tripSummary = () =>
  [
    props.itinerary.title,
    [placeName(props.request.destination), stayLabel.value, partyLabel.value].join(' · '),
    '',
    ...props.itinerary.days.flatMap((entry, index) => [...dayLines(entry, index), '']),
    t('planner.board.plannedWith')
  ].join('\n')

const daySummary = () => (day.value ? dayLines(day.value, selected.value).join('\n') : '')

const copy = async (text: string, kind: 'trip' | 'day') => {
  copyError.value = ''
  try {
    await navigator.clipboard.writeText(text)
    copied.value = kind
    if (copiedTimer) clearTimeout(copiedTimer)
    copiedTimer = setTimeout(() => {
      copied.value = null
    }, 2000)
  } catch {
    copyError.value = t('planner.board.copyFailed')
  }
}
</script>
