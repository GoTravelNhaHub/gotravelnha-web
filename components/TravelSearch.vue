<template>
  <div class="rounded-2xl border border-[#E2E8F0] bg-white p-4 font-brand shadow-[0_24px_60px_-28px_rgba(10,16,36,0.45)] sm:p-6">
    <div class="mb-5 inline-grid grid-cols-2 gap-1 rounded-xl bg-[#F1F5F9] p-1" role="tablist">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        type="button"
        role="tab"
        :aria-selected="mode === tab.id"
        @click="mode = tab.id"
        :class="[
          'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg px-4 text-[14px] font-semibold transition-colors sm:min-h-10 sm:px-5',
          mode === tab.id ? 'bg-white text-[#0A1024] shadow-[0_1px_3px_rgba(10,16,36,0.12)]' : 'text-[#64748B] hover:text-[#0A1024]'
        ]"
      >
        <svg class="h-4 w-4" :class="mode === tab.id ? 'text-[#0066E4]' : ''" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" :d="tab.icon" />
        </svg>
        {{ t(tab.label) }}
      </button>
    </div>

    <form v-if="mode === 'flight'" @submit.prevent="searchFlights" @focusin="markStarted" class="space-y-4">
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-3">
        <label class="block min-w-0">
          <span class="field-label">{{ t('common.search.from') }}</span>
          <select v-model="flight.from" required class="field-control">
            <option v-for="city in cities" :key="city.airport" :value="city.airport">{{ placeName(city.name) }} ({{ city.airport }})</option>
          </select>
        </label>
        <label class="block min-w-0">
          <span class="field-label">{{ t('common.search.to') }}</span>
          <select v-model="flight.to" required class="field-control">
            <option v-for="city in cities" :key="city.airport" :value="city.airport">{{ placeName(city.name) }} ({{ city.airport }})</option>
          </select>
        </label>
        <label class="block min-w-0">
          <span class="field-label">{{ t('common.search.depart') }}</span>
          <input v-model="flight.departDate" type="date" required :min="today" class="field-control" />
        </label>
        <label class="block min-w-0">
          <span class="field-label">{{ t('common.search.returnOptional') }}</span>
          <input v-model="flight.returnDate" type="date" :min="flight.departDate || today" class="field-control" />
        </label>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <label class="block min-w-0">
          <span class="field-label">{{ t('common.search.adults') }}</span>
          <input v-model.number="flight.adults" type="number" min="1" max="9" required class="field-control" />
        </label>
        <label class="block min-w-0">
          <span class="field-label">{{ t('common.search.children') }} <span class="font-normal text-ink/70">{{ t('common.search.childrenAges') }}</span></span>
          <input v-model.number="flight.children" type="number" min="0" max="8" class="field-control" />
        </label>
        <label class="block min-w-0">
          <span class="field-label">{{ t('common.search.infants') }} <span class="font-normal text-ink/70">{{ t('common.search.infantAges') }}</span></span>
          <input v-model.number="flight.infants" type="number" min="0" max="4" class="field-control" />
        </label>
        <label class="block min-w-0">
          <span class="field-label">{{ t('common.search.cabin') }}</span>
          <select v-model="flight.cabin" class="field-control">
            <option value="y">{{ t('common.search.economy') }}</option>
            <option value="c">{{ t('common.search.business') }}</option>
            <option value="f">{{ t('common.search.first') }}</option>
          </select>
        </label>
      </div>
      <div class="flex">
        <button type="submit" class="min-h-12 w-full rounded-xl bg-[#0066E4] px-7 py-3 text-[15px] font-semibold text-white hover:bg-[#0057C8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A1024] focus-visible:ring-offset-2 sm:ml-auto sm:w-auto">
          {{ t('common.search.searchFlights') }}
        </button>
      </div>
    </form>

    <form v-else @submit.prevent="searchHotels" @focusin="markStarted" class="space-y-4">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <label class="block min-w-0">
          <span class="field-label">{{ t('common.search.city') }}</span>
          <select v-model.number="hotel.cityId" required class="field-control">
            <option v-for="city in cities" :key="city.hotelCityId" :value="city.hotelCityId">{{ placeName(city.name) }}</option>
          </select>
        </label>
        <label class="block min-w-0">
          <span class="field-label">{{ t('common.search.checkIn') }}</span>
          <input v-model="hotel.checkIn" type="date" required :min="today" class="field-control" />
        </label>
        <label class="block min-w-0">
          <span class="field-label">{{ t('common.search.checkOut') }}</span>
          <input v-model="hotel.checkOut" type="date" required :min="hotel.checkIn || today" class="field-control" />
        </label>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <label class="block min-w-0">
          <span class="field-label">{{ t('common.search.adults') }}</span>
          <input v-model.number="hotel.adults" type="number" min="1" max="20" required class="field-control" />
        </label>
        <label class="block min-w-0">
          <span class="field-label">{{ t('common.search.children') }}</span>
          <input v-model.number="hotel.children" type="number" min="0" max="10" class="field-control" />
        </label>
        <label class="block min-w-0">
          <span class="field-label">{{ t('common.search.rooms') }}</span>
          <input v-model.number="hotel.rooms" type="number" min="1" max="10" required class="field-control" />
        </label>
      </div>
      <div class="flex">
        <button type="submit" class="min-h-12 w-full rounded-xl bg-[#0066E4] px-7 py-3 text-[15px] font-semibold text-white hover:bg-[#0057C8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A1024] focus-visible:ring-offset-2 sm:ml-auto sm:w-auto">
          {{ t('common.search.searchHotels') }}
        </button>
      </div>
    </form>

    <p v-if="error" class="mt-3 text-sm text-red-600">{{ error }}</p>
      <p class="mt-4 border-t border-[#F1F5F9] pt-3 text-[13px] leading-5 text-[#64748B]">
      {{ t('common.search.checkoutNote') }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import { appendTripAffiliateIds, openTrackedOutbound } from '~/utils/affiliate-links'
import { SEARCH_CITIES, tripFlightUrl, tripHotelUrl } from '~/utils/trip-search'
import { getVisitorSessionId } from '~/utils/visitor-session'

const props = withDefaults(defineProps<{ initialMode?: 'flight' | 'hotel'; placement?: string }>(), {
  initialMode: 'flight',
  placement: 'travel_search'
})

const route = useRoute()
const config = useRuntimeConfig().public
const { track } = useFunnel()
const { t, placeName } = useI18n()
const cities = SEARCH_CITIES
const tabs = [
  { id: 'flight' as const, label: 'common.search.flights', icon: 'M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2Z' },
  { id: 'hotel' as const, label: 'common.search.hotels', icon: 'M3 20V6a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v14M14 10h6a1 1 0 0 1 1 1v9M2 20h20M7 9h3M7 13h3M7 17h3' }
]

const today = new Date().toISOString().slice(0, 10)
const mode = ref<'flight' | 'hotel'>(props.initialMode)
const error = ref<string | null>(null)

const flight = reactive({
  from: 'SIN',
  to: 'BKK',
  departDate: '',
  returnDate: '',
  adults: 2,
  children: 0,
  infants: 0,
  cabin: 'y' as 'y' | 'c' | 'f'
})

const hotel = reactive({ cityId: 359, checkIn: '', checkOut: '', adults: 2, children: 0, rooms: 1 })

const count = (value: unknown, min: number) => Math.max(min, Math.floor(Number(value) || 0))

const markStarted = () => {
  track('travel_search_started', { provider: 'trip', placement: props.placement, searchType: mode.value }, true)
}

const open = (provider: string, url: string, search: Record<string, string | number | boolean | null>) => {
  const sessionId = getVisitorSessionId()
  track('travel_search_submitted', {
    provider,
    placement: `${props.placement}_${mode.value}`,
    searchType: mode.value,
    destination: typeof search.to === 'string' ? search.to : typeof search.cityId === 'number' ? String(search.cityId) : null
  })
  const fallback = appendTripAffiliateIds(url, String(config.TRIP_ALLIANCE_ID || ''), String(config.TRIP_SID || ''))

  openTrackedOutbound(async () => {
    const response: any = await $api('/api/affiliate/click', {
      method: 'POST',
      body: {
        provider,
        baseUrl: url,
        placementKey: `${props.placement}_${mode.value}`,
        pagePath: route.path,
        sessionId,
        metadata: { search, funnel: 'affiliate_outbound_clicked' }
      }
    })
    return response?.outboundUrl
  }, fallback)
}

const searchFlights = () => {
  error.value = null
  if (flight.from === flight.to) {
    error.value = t('common.search.sameCity')
    return
  }
  if (flight.returnDate && flight.returnDate < flight.departDate) {
    error.value = t('common.search.returnAfterDepart')
    return
  }
  const adults = count(flight.adults, 1)
  const infants = count(flight.infants, 0)
  if (infants > adults) {
    error.value = t('common.search.infantNeedsAdult')
    return
  }
  const search = {
    type: 'flight',
    from: flight.from,
    to: flight.to,
    departDate: flight.departDate,
    returnDate: flight.returnDate || null,
    adults,
    children: count(flight.children, 0),
    infants,
    cabin: flight.cabin
  }
  open('trip', tripFlightUrl(search), search)
}

const selectHotelCity = (cityId: number) => {
  mode.value = 'hotel'
  hotel.cityId = cityId
}

const searchHotels = () => {
  error.value = null
  if (hotel.checkOut <= hotel.checkIn) {
    error.value = t('common.search.checkoutAfterCheckin')
    return
  }
  const search = {
    type: 'hotel',
    cityId: hotel.cityId,
    checkIn: hotel.checkIn,
    checkOut: hotel.checkOut,
    adults: count(hotel.adults, 1),
    children: count(hotel.children, 0),
    rooms: count(hotel.rooms, 1)
  }
  open('trip', tripHotelUrl(search), search)
}

defineExpose({ selectHotelCity })
</script>

<style scoped>
.field-label {
  display: block;
  font-size: 0.75rem;
  line-height: 1rem;
  font-weight: 600;
  color: #475569;
}

.field-control {
  margin-top: 0.25rem;
  width: 100%;
  min-width: 0;
  max-width: 100%;
  padding: 0.625rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  font-size: 1rem;
  line-height: 1.5rem;
  background: white;
  color: #0A1024;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.field-control:hover {
  border-color: #cbd5e1;
}

.field-control:focus {
  outline: none;
  border-color: #0066E4;
  box-shadow: 0 0 0 3px rgba(0,102,228, 0.18);
}

input[type='date'].field-control {
  height: 48px;
  min-height: 48px;
  padding: 0 0.75rem;
  line-height: normal;
}
</style>
