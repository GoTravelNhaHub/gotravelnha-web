<template>
  <div class="mx-auto max-w-[1200px] pb-12 font-brand">
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 class="text-[26px] font-bold leading-9 tracking-[-0.025em] text-[#0A1024]">{{ t('account.bookings.title') }}</h1>
        <p class="text-[15px] text-[#64748B]">{{ t('account.bookings.intro') }}</p>
      </div>
      <NuxtLink v-if="!isAuthenticated" to="/login?redirect=/bookings" class="btn-secondary w-auto px-5">{{ t('account.bookings.signIn') }}</NuxtLink>
    </div>

    <div class="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
      <div class="min-w-0 space-y-5">
        <!-- Signed in: the account's bookings -->
        <template v-if="isAuthenticated">
          <div v-if="myBookings.length" class="inline-grid grid-cols-4 gap-1 rounded-xl bg-[#E2E8F0]/70 p-1" role="tablist" :aria-label="t('account.bookings.filterLabel')">
            <button
              v-for="option in filters"
              :key="option.id"
              type="button"
              role="tab"
              :aria-selected="filter === option.id"
              class="min-h-9 whitespace-nowrap rounded-lg px-3 text-[13px] font-semibold"
              :class="filter === option.id ? 'bg-white text-[#0A1024] shadow-[0_1px_3px_rgba(10,16,36,0.12)]' : 'text-[#64748B] hover:text-[#0A1024]'"
              @click="filter = option.id"
            >
              {{ option.label }}<span v-if="option.count" class="ml-1 text-[#94A3B8]">{{ option.count }}</span>
            </button>
          </div>

          <p v-if="listError" class="alert-error" role="alert">{{ listError }}</p>

          <div v-if="listLoading" class="space-y-3" aria-hidden="true">
            <div v-for="n in 2" :key="n" class="h-48 animate-pulse rounded-2xl bg-[#E2E8F0]/60"></div>
          </div>
          <div v-else-if="shownBookings.length" class="space-y-4">
            <BookingStatusCard v-for="booking in shownBookings" :key="booking.reference || booking.createdAt" :booking="booking" />
          </div>
          <div v-else-if="!listError" class="rounded-2xl border border-dashed border-[#CBD5E1] bg-white px-6 py-12 text-center">
            <span class="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EAF2FC] text-[#0066E4]" aria-hidden="true">
              <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M3 9V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a3 3 0 0 0 0 6v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a3 3 0 0 0 0-6ZM13 5v2M13 17v2M13 11v2" /></svg>
            </span>
            <template v-if="myBookings.length">
              <p class="mt-3 font-semibold text-[#0A1024]">{{ t('account.bookings.noneInFilter') }}</p>
              <button type="button" class="text-link mt-1 text-[14px]" @click="filter = 'all'">{{ t('account.bookings.showAll') }}</button>
            </template>
            <template v-else>
              <p class="mt-3 font-semibold text-[#0A1024]">{{ t('account.bookings.noneYet') }}</p>
              <p class="mx-auto mt-1 max-w-sm text-[14px] leading-[22px] text-[#64748B]">{{ t('account.bookings.guestHint') }}</p>
            </template>
          </div>
        </template>

        <!-- Find a booking: main task for guests, secondary when signed in -->
        <section id="find-booking" class="rounded-2xl border border-[#E2E8F0] bg-white p-5 sm:p-6" aria-labelledby="find-title">
          <h2 id="find-title" class="text-[17px] font-bold text-[#0A1024]">{{ isAuthenticated ? t('account.bookings.guestTitle') : t('account.bookings.findTitle') }}</h2>
          <p class="mt-1 text-[14px] leading-[22px] text-[#64748B]">{{ t('account.bookings.findText') }}</p>
          <form class="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)_auto] sm:items-end" @submit.prevent="lookup">
            <div>
              <label for="lookup-ref" class="form-label">{{ t('account.bookings.reference') }}</label>
              <input id="lookup-ref" v-model.trim="reference" required maxlength="20" placeholder="GTN-XXXXXXXX" autocomplete="off" class="form-input font-mono uppercase placeholder:font-brand placeholder:normal-case" />
            </div>
            <div>
              <label for="lookup-email" class="form-label">{{ t('account.bookings.email') }}</label>
              <input id="lookup-email" v-model.trim="email" type="email" required maxlength="200" autocomplete="email" placeholder="you@example.com" class="form-input" />
            </div>
            <button type="submit" class="btn-primary sm:w-auto sm:px-6" :disabled="lookupLoading">
              <span v-if="lookupLoading" class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true"></span>
              {{ lookupLoading ? t('account.bookings.lookingUp') : t('account.bookings.find') }}
            </button>
          </form>
          <p v-if="lookupError" class="alert-error mt-3" role="alert">{{ lookupError }}</p>
        </section>

        <BookingStatusCard v-if="found" :booking="found" />
      </div>

      <aside class="min-w-0 space-y-4" :aria-label="t('account.bookings.helpLabel')">
        <section class="rounded-2xl border border-[#E2E8F0] bg-white p-5">
          <div class="flex items-start gap-3">
            <span class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F1F5F9] text-[#334155]" aria-hidden="true">
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M14 4h6v6M20 4l-9 9M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4" /></svg>
            </span>
            <div>
              <h2 class="text-[15px] font-bold leading-6 text-[#0A1024]">{{ t('account.bookings.partnerTitle') }}</h2>
              <p class="mt-1 text-[14px] leading-[22px] text-[#64748B]">
                {{ t('account.bookings.partnerText') }}
              </p>
            </div>
          </div>
        </section>

        <section class="rounded-2xl border border-[#E2E8F0] bg-white p-5">
          <h2 class="text-[15px] font-bold text-[#0A1024]">{{ t('account.bookings.aboutTickets') }}</h2>
          <ul class="mt-3 space-y-2.5 text-[14px] leading-[22px] text-[#475569]">
            <li v-for="line in tm<string[]>('account.bookings.ticketNotes')" :key="line" class="flex items-start gap-2.5">
              <span class="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#EAF2FC] text-[#0066E4]" aria-hidden="true">
                <svg class="h-3 w-3" viewBox="0 0 20 20" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.4" d="m5 10.5 3 3 7-7" /></svg>
              </span>
              {{ line }}
            </li>
          </ul>
          <div class="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-[14px]">
            <NuxtLink to="/contact" class="text-link">{{ t('account.bookings.contact') }}</NuxtLink>
            <NuxtLink to="/refund-policy" class="text-link">{{ t('account.bookings.refund') }}</NuxtLink>
          </div>
        </section>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import type { CustomerBooking } from '~/types/booking'

const route = useRoute()
const { isAuthenticated } = useAuthState()
const { t, tm } = useI18n()

const myBookings = ref<CustomerBooking[]>([])
const listLoading = ref(false)
const listError = ref<string | null>(null)

type Filter = 'all' | 'confirmed' | 'progress' | 'closed'
const filter = ref<Filter>('all')
const GROUPS: Record<Exclude<Filter, 'all'>, CustomerBooking['state'][]> = {
  confirmed: ['confirmed'],
  progress: ['processing', 'awaiting_payment'],
  closed: ['refunded', 'cancelled', 'failed']
}
const inGroup = (booking: CustomerBooking, group: Filter) => group === 'all' || GROUPS[group].includes(booking.state)
const shownBookings = computed(() => myBookings.value.filter((booking) => inGroup(booking, filter.value)))
const filters = computed(() => [
  { id: 'all' as const, label: t('account.bookings.filters.all'), count: 0 },
  { id: 'confirmed' as const, label: t('account.bookings.filters.confirmed'), count: myBookings.value.filter((b) => inGroup(b, 'confirmed')).length },
  { id: 'progress' as const, label: t('account.bookings.filters.progress'), count: myBookings.value.filter((b) => inGroup(b, 'progress')).length },
  { id: 'closed' as const, label: t('account.bookings.filters.closed'), count: myBookings.value.filter((b) => inGroup(b, 'closed')).length }
])

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
    lookupError.value = err?.data?.message || t('account.bookings.lookupFailed')
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
    listError.value = t('account.bookings.loadFailed')
  } finally {
    listLoading.value = false
  }
})

useHead(() => ({ title: t('account.bookings.metaTitle'), meta: [{ name: 'robots', content: 'noindex' }] }))
</script>
