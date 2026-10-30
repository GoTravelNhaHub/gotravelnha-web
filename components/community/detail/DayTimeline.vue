<template>
  <section :id="`day-${index + 1}`" class="relative scroll-mt-[150px] pb-8 pl-9 sm:pl-11" :aria-labelledby="`day-${index + 1}-title`">
    <!-- Timeline rail and day marker (Reference B) -->
    <span v-if="!last" class="absolute bottom-0 left-[9px] top-[22px] w-[2px] bg-[#D6E4FB] sm:left-[11px]" aria-hidden="true"></span>
    <span class="absolute left-0 top-[4px] flex h-5 w-5 items-center justify-center rounded-full bg-[#0060FC] ring-4 ring-[#DCEBFE] sm:h-6 sm:w-6" aria-hidden="true">
      <span class="h-2 w-2 rounded-full bg-white"></span>
    </span>

    <div class="grid gap-5" :class="hasPartners ? 'lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] 3xl:grid-cols-[minmax(0,380px)_minmax(0,1fr)]' : ''">
      <!-- Day plan -->
      <div class="min-w-0">
        <h3 :id="`day-${index + 1}-title`" class="text-[19px] font-bold leading-7 tracking-[-0.01em] text-cm-ink">
          {{ t('community.detail.dayTitle', { day: index + 1, theme: day.theme }) }}
        </h3>
        <ol class="mt-3 space-y-3">
          <li v-for="(item, itemIndex) in day.items" :key="itemIndex" class="rounded-xl bg-cm-canvas px-3.5 py-3">
            <p class="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11.5px] font-semibold uppercase tracking-[0.06em] text-cm-muted">
              {{ t(`planner.slots.${item.slot}`) }}
              <span v-if="verifiedPrice(item)" class="rounded-full bg-cm-soft px-2 py-0.5 normal-case tracking-normal text-cm-active">{{ verifiedPrice(item) }}</span>
            </p>
            <p class="mt-1 text-[15px] font-semibold leading-[21px] text-cm-ink">{{ item.title }}</p>
            <p class="mt-1 text-[14px] leading-[21px] text-cm-body">{{ item.description }}</p>
            <p v-if="item.familyTip" class="mt-2 text-[13px] leading-5 text-[#78350F]"><span class="font-semibold">{{ t('planner.itinerary.forParents') }}</span>{{ item.familyTip }}</p>
          </li>
        </ol>
        <button v-if="mapAvailable" type="button" class="cm-btn-outline mt-4 h-10 px-4 text-[14px]" @click="emit('map')">
          <CmIcon name="pin" :size="18" class="text-cm-primary" />
          {{ t('community.detail.viewOnMap') }}
        </button>
      </div>

      <!-- Booking suggestions for this day: verified offers or partner searches, never invented prices -->
      <div v-if="hasPartners" class="min-w-0 space-y-4 print:hidden">
        <PartnerPanel
          v-if="suggestions.hotels"
          :id="index === 0 ? 'hotels' : undefined"
          class="scroll-mt-[150px]"
          provider="trip"
          :title="t('community.booking.hotelsTitle')"
          :more-label="t('community.booking.moreHotels')"
          @more="emit('hotels')"
        >
          <div class="grid gap-3 sm:grid-cols-[200px_minmax(0,1fr)] sm:items-center">
            <div class="relative aspect-[16/10] overflow-hidden rounded-xl bg-[#DCE7F5]">
              <img v-if="photo" :src="photo" alt="" width="400" height="250" loading="lazy" decoding="async" class="h-full w-full object-cover" />
              <PartnerBadge provider="trip" class="absolute left-2 top-2" />
            </div>
            <div>
              <p class="text-[16px] font-semibold text-cm-ink">{{ t('community.booking.hotelsIn', { city: placeName(suggestions.hotels.city) }) }}</p>
              <p class="mt-1 text-[13.5px] leading-5 text-cm-muted">{{ t('community.booking.hotelsText') }}</p>
              <button type="button" class="mt-3 inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-[#0068FC] px-5 text-[14px] font-semibold text-white hover:bg-[#0057D6]" @click="emit('hotels')">
                {{ t('community.booking.searchTrip') }}
              </button>
            </div>
          </div>
        </PartnerPanel>

        <PartnerPanel
          v-if="suggestions.activities.length"
          provider="klook"
          :title="t('community.booking.activitiesTitle')"
          :more-label="t('community.booking.moreActivities')"
          @more="emit('activities')"
        >
          <!-- One suggestion: a wide row like the Trip.com card; several: tiles -->
          <ul class="grid gap-3" :class="single ? '' : 'sm:grid-cols-2 xl:grid-cols-3'">
            <li v-for="(entry, entryIndex) in suggestions.activities" :key="entryIndex" class="overflow-hidden rounded-xl border border-cm-line bg-white" :class="single ? 'grid sm:grid-cols-[200px_minmax(0,1fr)]' : 'flex flex-col'">
              <div class="relative bg-[linear-gradient(135deg,#FFF4EC,#FFE4D2)]" :class="single ? 'aspect-[16/10] sm:aspect-auto sm:min-h-[124px]' : 'aspect-[16/10]'">
                <img v-if="entry.kind === 'offer' && entry.activity.image" :src="entry.activity.image" alt="" width="320" height="200" loading="lazy" decoding="async" class="h-full w-full object-cover" />
                <span v-else class="flex h-full w-full items-center justify-center text-[#FC6008]" aria-hidden="true"><CmIcon name="search" :size="30" /></span>
                <PartnerBadge :provider="entry.kind === 'search' && entry.link ? entry.link.provider : 'klook'" class="absolute left-2 top-2" />
              </div>
              <div class="flex flex-1 flex-col p-3">
                <p class="line-clamp-2 text-[14px] font-semibold leading-5 text-cm-ink">{{ entry.kind === 'offer' ? entry.activity.title : entry.link?.title || entry.label }}</p>
                <template v-if="entry.kind === 'offer'">
                  <p class="mt-1.5 text-[15px] font-bold text-cm-ink">{{ priceLabel(entry.activity) }}</p>
                  <p v-if="entry.activity.checkedAt" class="text-[12px] text-cm-muted">{{ t('planner.itinerary.priceChecked', { date: shortDate(entry.activity.checkedAt) }) }}</p>
                </template>
                <p v-else-if="entry.link" class="mt-1.5 text-[12.5px] leading-[18px] text-cm-muted">{{ t('community.booking.matchedHint', { partner: entry.link.provider === 'trip' ? 'Trip.com' : 'Klook' }) }}</p>
                <p v-else class="mt-1.5 text-[12.5px] leading-[18px] text-cm-muted">{{ t('community.booking.searchHint') }}</p>
                <div class="mt-auto pt-3">
                  <NuxtLink v-if="entry.kind === 'offer' && entry.activity.href" :to="entry.activity.href" :class="single ? 'sm:w-auto sm:px-6' : ''" class="flex h-9 w-full items-center justify-center rounded-full bg-[#FC6008] text-[13.5px] font-semibold text-white hover:bg-[#E85500]">
                    {{ t('planner.itinerary.seeTickets') }}
                  </NuxtLink>
                  <button v-else type="button" :class="[single ? 'sm:w-auto sm:px-6' : '', entry.kind === 'search' && entry.link?.provider === 'trip' ? 'bg-[#0068FC] hover:bg-[#0057D6]' : 'bg-[#FC6008] hover:bg-[#E85500]']" class="flex h-9 w-full items-center justify-center rounded-full text-[13.5px] font-semibold text-white" @click="entry.kind === 'offer' ? openOffer(entry.activity) : emit('search', entry.query)">
                    {{ actionLabel(entry) }}
                  </button>
                </div>
              </div>
            </li>
          </ul>
        </PartnerPanel>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import CmIcon from '~/components/community/feed/CmIcon.vue'
import PartnerBadge from '~/components/community/detail/PartnerBadge.vue'
import PartnerPanel from '~/components/community/detail/PartnerPanel.vue'
import type { ItineraryItem, LiveActivity } from '~/types/trip'
import type { DaySuggestions, KlookSuggestion } from '~/utils/community-booking'

const props = defineProps<{
  day: { theme: string; items: ItineraryItem[] }
  index: number
  last: boolean
  suggestions: DaySuggestions
  activities: Record<string, LiveActivity>
  photo: string | null
  mapAvailable: boolean
  placement: string
}>()
const emit = defineEmits<{ map: []; hotels: []; activities: []; search: [query: string] }>()
const { t, placeName, localeTag } = useI18n()
const { openOffer, priceLabel } = usePartnerOffer(props.placement)

const hasPartners = computed(() => !!props.suggestions.hotels || props.suggestions.activities.length > 0)
const single = computed(() => props.suggestions.activities.length === 1)

// Price chip only for activities the supplier verified recently
const verifiedPrice = (item: ItineraryItem) => {
  const activity = item.activityId ? props.activities[item.activityId] : null
  return activity?.verified && activity.priceFrom ? priceLabel(activity) : ''
}
const actionLabel = (entry: KlookSuggestion) => {
  if (entry.kind === 'offer') return t('community.booking.viewOnKlook')
  if (entry.link) return entry.link.provider === 'trip' ? t('community.booking.viewOnTrip') : t('community.booking.viewOnKlook')
  return t('community.booking.searchKlook')
}
const shortDate = (value: string) => new Intl.DateTimeFormat(localeTag.value, { dateStyle: 'medium' }).format(new Date(value))
</script>
