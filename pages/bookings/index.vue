<template>
  <div class="min-h-screen bg-slate-50 pb-16">
    <div class="max-w-3xl mx-auto px-4 pt-8 space-y-6">
      <div>
        <h1 class="text-3xl font-bold text-slate-900">🎟️ My bookings</h1>
        <p class="mt-1 text-slate-600">Check the status of an attraction booking and get your tickets.</p>
      </div>

      <template v-if="isAuthenticated">
        <div v-if="listError" class="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">{{ listError }}</div>
        <BookingStatusCard v-for="booking in myBookings" :key="booking.reference || booking.createdAt" :booking="booking" />
        <div v-if="!listLoading && !listError && myBookings.length === 0" class="bg-white border border-dashed border-slate-300 rounded-2xl p-6 text-center text-slate-500">
          No bookings on your account yet. Booked as a guest? Look it up below.
        </div>
      </template>

      <form @submit.prevent="lookup" class="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
        <h2 class="text-lg font-bold text-slate-900">Find a booking</h2>
        <p class="text-sm text-slate-600">Use the reference from your confirmation email (GTN-…) and the email you paid with.</p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label class="block">
            <span class="text-sm font-semibold text-slate-700">Booking reference</span>
            <input
              v-model.trim="reference"
              required
              maxlength="20"
              placeholder="GTN-XXXXXXXX"
              class="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg uppercase font-mono"
            />
          </label>
          <label class="block">
            <span class="text-sm font-semibold text-slate-700">Email</span>
            <input v-model.trim="email" type="email" required maxlength="200" class="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg" />
          </label>
        </div>
        <div v-if="lookupError" class="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{{ lookupError }}</div>
        <button
          type="submit"
          :disabled="lookupLoading"
          class="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-60"
        >
          {{ lookupLoading ? 'Looking up…' : 'Find booking' }}
        </button>
      </form>

      <BookingStatusCard v-if="found" :booking="found" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import type { CustomerBooking } from '~/types/booking'

const route = useRoute()
const { isAuthenticated } = useAuthState()

const myBookings = ref<CustomerBooking[]>([])
const listLoading = ref(false)
const listError = ref<string | null>(null)

const reference = ref(typeof route.query.ref === 'string' ? route.query.ref.slice(0, 20) : '')
const email = ref('')
const found = ref<CustomerBooking | null>(null)
const lookupLoading = ref(false)
const lookupError = ref<string | null>(null)

const lookup = async () => {
  try {
    lookupLoading.value = true
    lookupError.value = null
    found.value = null
    const response = await $fetch<{ data: CustomerBooking }>('/api/bookings/lookup', {
      method: 'POST',
      body: { reference: reference.value, email: email.value }
    })
    found.value = response.data
  } catch (err: any) {
    lookupError.value = err?.data?.message || 'Could not look up this booking. Please try again.'
  } finally {
    lookupLoading.value = false
  }
}

onMounted(async () => {
  if (!isAuthenticated.value) return
  try {
    listLoading.value = true
    const response = await $fetch<{ data: CustomerBooking[] }>('/api/bookings')
    myBookings.value = response.data
  } catch (err: any) {
    listError.value = err?.data?.message || 'Could not load your bookings. Please sign in again.'
  } finally {
    listLoading.value = false
  }
})

useHead({ title: 'My Bookings | GoTravelNha', meta: [{ name: 'robots', content: 'noindex' }] })
</script>
