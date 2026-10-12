<template>
  <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6">
    <div class="grid grid-cols-2 gap-2 mb-4 sm:flex" role="tablist">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        type="button"
        role="tab"
        :aria-selected="mode === tab.id"
        @click="mode = tab.id"
        :class="[
          'px-4 py-2 rounded-xl text-sm font-semibold transition-colors min-h-[44px] sm:w-auto',
          mode === tab.id ? 'bg-ink text-white' : 'bg-sand text-ink hover:bg-line'
        ]"
      >
        {{ tab.icon }} {{ tab.label }}
      </button>
    </div>

    <form v-if="mode === 'flight'" @submit.prevent="searchFlights" class="space-y-4">
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-3">
        <label class="block min-w-0">
          <span class="field-label">From</span>
          <select v-model="flight.from" required class="field-control">
            <option v-for="city in cities" :key="city.airport" :value="city.airport">{{ city.name }} ({{ city.airport }})</option>
          </select>
        </label>
        <label class="block min-w-0">
          <span class="field-label">To</span>
          <select v-model="flight.to" required class="field-control">
            <option v-for="city in cities" :key="city.airport" :value="city.airport">{{ city.name }} ({{ city.airport }})</option>
          </select>
        </label>
        <label class="block min-w-0">
          <span class="field-label">Depart</span>
          <input v-model="flight.departDate" type="date" required :min="today" class="field-control" />
        </label>
        <label class="block min-w-0">
          <span class="field-label">Return (optional)</span>
          <input v-model="flight.returnDate" type="date" :min="flight.departDate || today" class="field-control" />
        </label>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <label class="block min-w-0">
          <span class="field-label">Adults</span>
          <input v-model.number="flight.adults" type="number" min="1" max="9" required class="field-control" />
        </label>
        <label class="block min-w-0">
          <span class="field-label">Children <span class="font-normal text-ink/70">2–11</span></span>
          <input v-model.number="flight.children" type="number" min="0" max="8" class="field-control" />
        </label>
        <label class="block min-w-0">
          <span class="field-label">Infants <span class="font-normal text-ink/70">&lt;2</span></span>
          <input v-model.number="flight.infants" type="number" min="0" max="4" class="field-control" />
        </label>
        <label class="block min-w-0">
          <span class="field-label">Cabin</span>
          <select v-model="flight.cabin" class="field-control">
            <option value="y">Economy</option>
            <option value="c">Business</option>
            <option value="f">First</option>
          </select>
        </label>
      </div>
      <div class="flex">
        <button type="submit" class="w-full sm:ml-auto sm:w-auto min-h-12 rounded-xl bg-ink px-6 py-3 font-semibold text-white hover:bg-ink/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sea">
          Search flights
        </button>
      </div>
    </form>

    <form v-else @submit.prevent="searchHotels" class="space-y-4">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <label class="block min-w-0">
          <span class="field-label">City</span>
          <select v-model.number="hotel.cityId" required class="field-control">
            <option v-for="city in cities" :key="city.hotelCityId" :value="city.hotelCityId">{{ city.name }}</option>
          </select>
        </label>
        <label class="block min-w-0">
          <span class="field-label">Check-in</span>
          <input v-model="hotel.checkIn" type="date" required :min="today" class="field-control" />
        </label>
        <label class="block min-w-0">
          <span class="field-label">Check-out</span>
          <input v-model="hotel.checkOut" type="date" required :min="hotel.checkIn || today" class="field-control" />
        </label>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <label class="block min-w-0">
          <span class="field-label">Adults</span>
          <input v-model.number="hotel.adults" type="number" min="1" max="20" required class="field-control" />
        </label>
        <label class="block min-w-0">
          <span class="field-label">Children</span>
          <input v-model.number="hotel.children" type="number" min="0" max="10" class="field-control" />
        </label>
        <label class="block min-w-0">
          <span class="field-label">Rooms</span>
          <input v-model.number="hotel.rooms" type="number" min="1" max="10" required class="field-control" />
        </label>
      </div>
      <div class="flex">
        <button type="submit" class="w-full sm:ml-auto sm:w-auto min-h-12 rounded-xl bg-ink px-6 py-3 font-semibold text-white hover:bg-ink/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sea">
          Search hotels
        </button>
      </div>
    </form>

    <p v-if="error" class="mt-3 text-sm text-red-600">{{ error }}</p>
    <p class="mt-3 text-sm leading-relaxed text-ink/70">
      Opens Trip.com in a new tab with your search filled in. Prices, taxes and availability are set by Trip.com and shown there before you pay.
    </p>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import { openTrackedOutbound } from '~/utils/affiliate-links'
import { SEARCH_CITIES, tripFlightUrl, tripHotelUrl } from '~/utils/trip-search'

const props = withDefaults(defineProps<{ initialMode?: 'flight' | 'hotel'; placement?: string }>(), {
  initialMode: 'flight',
  placement: 'travel_search'
})

const route = useRoute()
const cities = SEARCH_CITIES
const tabs = [
  { id: 'flight' as const, label: 'Flights', icon: '✈️' },
  { id: 'hotel' as const, label: 'Hotels', icon: '🏨' }
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

const open = (provider: string, url: string, search: Record<string, unknown>) => {
  const sessionId = localStorage.getItem('activity_session_id') || `search-${Date.now().toString(36)}`
  if (!localStorage.getItem('activity_session_id')) localStorage.setItem('activity_session_id', sessionId)

  openTrackedOutbound(async () => {
    const response: any = await $fetch('/api/affiliate/click', {
      method: 'POST',
      body: {
        provider,
        baseUrl: url,
        placementKey: `${props.placement}_${mode.value}`,
        pagePath: route.path,
        sessionId,
        // What people search for, so demand can be measured
        metadata: { search }
      }
    })
    return response?.outboundUrl
  }, url)
}

const searchFlights = () => {
  error.value = null
  if (flight.from === flight.to) {
    error.value = 'Choose different departure and arrival cities.'
    return
  }
  if (flight.returnDate && flight.returnDate < flight.departDate) {
    error.value = 'The return date must be after the departure date.'
    return
  }
  const adults = count(flight.adults, 1)
  const infants = count(flight.infants, 0)
  if (infants > adults) {
    error.value = 'Each infant needs an adult travelling with them.'
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
    error.value = 'Check-out must be after check-in.'
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
  color: rgb(71 85 105);
}

.field-control {
  margin-top: 0.25rem;
  width: 100%;
  min-width: 0;
  max-width: 100%;
  padding: 0.625rem 0.75rem;
  border: 1px solid #e4e0d8;
  border-radius: 0.5rem;
  font-size: 1rem;
  line-height: 1.5rem;
  background: white;
  color: #0b1f33;
}

.field-control:focus {
  outline: none;
  border-color: #0e7c86;
  box-shadow: 0 0 0 2px #0e7c86;
}

input[type='date'].field-control {
  height: 48px;
  min-height: 48px;
  padding: 0 0.75rem;
  line-height: normal;
}
</style>
