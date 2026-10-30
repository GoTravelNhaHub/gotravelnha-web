<template>
  <Teleport to="body">
    <Transition enter-active-class="transition-opacity duration-200" enter-from-class="opacity-0" leave-active-class="transition-opacity duration-150" leave-to-class="opacity-0">
      <div v-if="open" class="fixed inset-0 z-[80] flex items-end bg-[#0A1024]/50 backdrop-blur-sm" @click.self="emit('close')">
        <section class="flex max-h-[85dvh] w-full flex-col rounded-t-[24px] bg-white pb-[env(safe-area-inset-bottom)] font-brand shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="booking-sheet-title" @keydown.esc="emit('close')">
          <span class="mx-auto mt-2.5 h-1.5 w-10 rounded-full bg-[#D6DDE8]" aria-hidden="true"></span>
          <header class="flex items-center justify-between px-5 pt-3">
            <h2 id="booking-sheet-title" class="text-[19px] font-bold text-cm-ink">{{ t('community.booking.sheetTitle') }}</h2>
            <button type="button" class="flex h-10 w-10 items-center justify-center rounded-full text-cm-muted hover:bg-cm-canvas" :aria-label="t('community.customize.close')" @click="emit('close')">
              <CmIcon name="close" :size="20" />
            </button>
          </header>
          <div class="mx-5 mt-3 grid grid-cols-2 rounded-xl bg-cm-canvas p-1" role="tablist">
            <button v-for="option in tabs" :key="option.key" type="button" role="tab" class="h-10 rounded-lg text-[14px] font-semibold transition" :class="tab === option.key ? 'bg-white text-cm-active shadow-sm ring-1 ring-[#CFE0F7]' : 'text-cm-body'" :aria-selected="tab === option.key" @click="tab = option.key">
              {{ option.label }}
            </button>
          </div>

          <div class="flex-1 space-y-3 overflow-y-auto px-5 py-4">
            <template v-if="tab === 'hotels'">
              <div v-if="hotels" class="overflow-hidden rounded-2xl border border-cm-line">
                <div class="flex gap-3 p-3">
                  <div class="relative h-[96px] w-[110px] shrink-0 overflow-hidden rounded-xl bg-[#DCE7F5]">
                    <img v-if="photo" :src="photo" alt="" width="220" height="192" class="h-full w-full object-cover" />
                    <PartnerBadge provider="trip" class="absolute left-1.5 top-1.5" />
                  </div>
                  <div class="min-w-0">
                    <p class="text-[15.5px] font-semibold text-cm-ink">{{ t('community.booking.hotelsIn', { city: placeName(hotels.city) }) }}</p>
                    <p class="mt-1 text-[13px] leading-[18px] text-cm-muted">{{ t('community.booking.hotelsText') }}</p>
                  </div>
                </div>
                <button type="button" class="flex h-11 w-full items-center justify-center bg-[#0068FC] text-[15px] font-semibold text-white" @click="emit('hotels')">{{ t('community.booking.searchTrip') }}</button>
              </div>
              <p v-else class="rounded-xl bg-cm-canvas px-4 py-3 text-[14px] text-cm-muted">{{ t('community.booking.noHotels') }}</p>
            </template>

            <template v-else>
              <div v-for="(entry, index) in activities" :key="index" class="overflow-hidden rounded-2xl border border-cm-line">
                <div class="flex gap-3 p-3">
                  <div class="relative h-[96px] w-[110px] shrink-0 overflow-hidden rounded-xl bg-[#FFF1E8]">
                    <img v-if="entry.kind === 'offer' && entry.activity.image" :src="entry.activity.image" alt="" width="220" height="192" class="h-full w-full object-cover" />
                    <span v-else class="flex h-full w-full items-center justify-center text-[#FC6008]" aria-hidden="true"><CmIcon name="search" :size="26" /></span>
                    <PartnerBadge :provider="entry.kind === 'search' && entry.link ? entry.link.provider : 'klook'" class="absolute left-1.5 top-1.5" />
                  </div>
                  <div class="min-w-0">
                    <p class="line-clamp-2 text-[15px] font-semibold leading-5 text-cm-ink">{{ entry.kind === 'offer' ? entry.activity.title : entry.link?.title || entry.label }}</p>
                    <p v-if="entry.kind === 'offer'" class="mt-1.5 text-[16px] font-bold text-cm-ink">{{ priceLabel(entry.activity) }}</p>
                    <p v-else-if="entry.link" class="mt-1 text-[13px] leading-[18px] text-cm-muted">{{ t('community.booking.matchedHint', { partner: entry.link.provider === 'trip' ? 'Trip.com' : 'Klook' }) }}</p>
                    <p v-else class="mt-1 text-[13px] leading-[18px] text-cm-muted">{{ t('community.booking.searchHint') }}</p>
                  </div>
                </div>
                <NuxtLink v-if="entry.kind === 'offer' && entry.activity.href" :to="entry.activity.href" class="flex h-11 w-full items-center justify-center bg-[#FC6008] text-[15px] font-semibold text-white">{{ t('planner.itinerary.seeTickets') }}</NuxtLink>
                <button v-else type="button" class="flex h-11 w-full items-center justify-center text-[15px] font-semibold text-white" :class="entry.kind === 'search' && entry.link?.provider === 'trip' ? 'bg-[#0068FC]' : 'bg-[#FC6008]'" @click="entry.kind === 'offer' ? openOffer(entry.activity) : emit('search', entry.query)">
                  {{ actionLabel(entry) }}
                </button>
              </div>
              <button type="button" class="cm-btn-outline h-11 w-full text-[14px]" @click="emit('activities')">{{ t('community.booking.moreActivities') }}</button>
            </template>
            <p class="pt-1 text-[12px] leading-[18px] text-cm-muted">{{ t('community.trip.disclosure') }}</p>
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import CmIcon from '~/components/community/feed/CmIcon.vue'
import PartnerBadge from '~/components/community/detail/PartnerBadge.vue'
import type { DaySuggestions, KlookSuggestion } from '~/utils/community-booking'

const props = defineProps<{ open: boolean; suggestions: DaySuggestions[]; photo: string | null; placement: string }>()
const emit = defineEmits<{ close: []; hotels: []; activities: []; search: [query: string] }>()
const { t, placeName } = useI18n()
const { openOffer, priceLabel } = usePartnerOffer(props.placement)

const tab = ref<'hotels' | 'activities'>('hotels')
const tabs = computed(() => [
  { key: 'hotels' as const, label: t('community.booking.tabHotels') },
  { key: 'activities' as const, label: t('community.booking.tabActivities') }
])
const hotels = computed(() => props.suggestions.find((day) => day.hotels)?.hotels ?? null)
const actionLabel = (entry: KlookSuggestion) => {
  if (entry.kind === 'offer') return t('community.booking.viewOnKlook')
  if (entry.link) return entry.link.provider === 'trip' ? t('community.booking.viewOnTrip') : t('community.booking.viewOnKlook')
  return t('community.booking.searchKlook')
}
const activities = computed<KlookSuggestion[]>(() => props.suggestions.flatMap((day) => day.activities))
</script>
