<template>
  <div class="mx-auto max-w-[1200px] space-y-6 pb-12 font-brand">
    <!-- Profile header -->
    <section class="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#E2E8F0] bg-white p-5 sm:p-6">
      <div class="flex min-w-0 items-center gap-4">
        <span class="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#008A9B] text-[22px] font-bold text-white" aria-hidden="true">{{ profile.initial }}</span>
        <div class="min-w-0">
          <h1 class="truncate text-[22px] font-bold leading-8 tracking-[-0.02em] text-[#101D3A]">{{ profile.name }}</h1>
          <p class="truncate text-[14px] text-[#64748B]">{{ profile.email }}<span v-if="profile.memberSince"> · {{ t('account.profile.memberSince', { date: profile.memberSince }) }}</span></p>
        </div>
      </div>
      <div class="flex w-full gap-2 sm:w-auto">
        <NuxtLink to="/planner" class="btn-primary flex-1 sm:w-auto sm:flex-none sm:px-5">
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 3l1.9 4.8L19 9.5l-4.4 2.9L15.6 18 12 15l-3.6 3 1-5.6L5 9.5l5.1-1.7L12 3Z" /></svg>
          {{ t('account.profile.planTrip') }}
        </NuxtLink>
        <NuxtLink v-if="isAdmin" to="/admin" class="btn-secondary flex-1 sm:w-auto sm:flex-none sm:px-5">{{ t('account.profile.admin') }}</NuxtLink>
      </div>
    </section>

    <!-- Summary -->
    <section class="grid grid-cols-3 gap-3" :aria-label="t('account.profile.summary')">
      <NuxtLink
        v-for="tile in tiles"
        :key="tile.label"
        :to="tile.to"
        class="group rounded-2xl border border-[#E2E8F0] bg-white p-4 transition hover:border-[#008A9B]/40 sm:p-5"
      >
        <p class="text-[13px] font-medium text-[#64748B]">{{ tile.label }}</p>
        <p class="mt-1 text-[26px] font-semibold leading-8 tracking-[-0.02em] text-[#101D3A]">{{ loaded ? tile.value : '–' }}</p>
        <p class="mt-0.5 hidden text-[12px] text-[#008A9B] group-hover:underline sm:block">{{ tile.cta }} →</p>
      </NuxtLink>
    </section>

    <div class="grid items-start gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
      <div class="min-w-0 space-y-6">
        <!-- Upcoming trips -->
        <section class="rounded-2xl border border-[#E2E8F0] bg-white" aria-labelledby="trips-title">
          <header class="flex items-center justify-between gap-3 border-b border-[#F1F5F9] px-5 py-4">
            <h2 id="trips-title" class="text-[16px] font-bold text-[#101D3A]">{{ t('account.profile.upcoming') }}</h2>
            <NuxtLink to="/mytrip" class="text-link text-[13px]">{{ t('account.profile.allTrips') }}</NuxtLink>
          </header>
          <ul v-if="upcomingTrips.length" class="divide-y divide-[#F1F5F9]">
            <li v-for="trip in upcomingTrips" :key="trip.id">
              <NuxtLink :to="`/mytrip/${trip.id}`" class="flex items-center gap-4 px-5 py-3.5 hover:bg-[#F8FAFC]">
                <span class="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-[#E8F7FA]">
                  <img v-if="destinationPhoto(trip.destination, 120)" :src="destinationPhoto(trip.destination, 120)!" alt="" width="48" height="48" class="h-full w-full object-cover" />
                </span>
                <span class="min-w-0 flex-1">
                  <span class="block truncate text-[15px] font-semibold text-[#101D3A]">{{ trip.title }}</span>
                  <span class="block text-[13px] text-[#64748B]">{{ placeName(trip.destination) }} · {{ dateRange(trip.startDate, trip.endDate) }}</span>
                </span>
                <span class="shrink-0 rounded-full bg-[#E8F7FA] px-2.5 py-0.5 text-[12px] font-semibold text-[#007789]">{{ countdown(trip.startDate) }}</span>
              </NuxtLink>
            </li>
          </ul>
          <div v-else class="px-5 py-8 text-center">
            <p class="text-[14px] text-[#64748B]">{{ loaded ? t('account.profile.noUpcoming') : t('account.profile.loading') }}</p>
            <NuxtLink v-if="loaded" to="/planner" class="text-link mt-1 inline-block text-[14px]">{{ t('account.profile.planOne') }}</NuxtLink>
          </div>
        </section>

        <!-- Recent bookings -->
        <section class="rounded-2xl border border-[#E2E8F0] bg-white" aria-labelledby="bookings-title">
          <header class="flex items-center justify-between gap-3 border-b border-[#F1F5F9] px-5 py-4">
            <h2 id="bookings-title" class="text-[16px] font-bold text-[#101D3A]">{{ t('account.profile.recentBookings') }}</h2>
            <NuxtLink to="/bookings" class="text-link text-[13px]">{{ t('account.profile.allBookings') }}</NuxtLink>
          </header>
          <ul v-if="recentBookings.length" class="divide-y divide-[#F1F5F9]">
            <li v-for="booking in recentBookings" :key="booking.reference || booking.createdAt">
              <NuxtLink to="/bookings" class="flex items-center justify-between gap-4 px-5 py-3.5 hover:bg-[#F8FAFC]">
                <span class="min-w-0">
                  <span class="block truncate text-[15px] font-semibold text-[#101D3A]">{{ booking.eventTitle }}</span>
                  <span class="block text-[13px] text-[#64748B]">
                    <span class="font-mono">{{ booking.reference }}</span> · {{ booking.currency }} {{ booking.amount.toFixed(2) }} · {{ shortDate(booking.paidAt || booking.createdAt) }}
                  </span>
                </span>
                <span class="shrink-0 rounded-full border px-2.5 py-0.5 text-[12px] font-semibold" :class="stateBadge(booking.state)">{{ t(`account.card.states.${booking.state}.label`) }}</span>
              </NuxtLink>
            </li>
          </ul>
          <div v-else class="px-5 py-8 text-center">
            <p class="text-[14px] text-[#64748B]">{{ loaded ? t('account.profile.noBookings') : t('account.profile.loading') }}</p>
            <NuxtLink v-if="loaded" to="/explore" class="text-link mt-1 inline-block text-[14px]">{{ t('account.profile.findSomething') }}</NuxtLink>
          </div>
        </section>
      </div>

      <aside class="min-w-0 space-y-6">
        <!-- Family -->
        <section class="rounded-2xl border border-[#E2E8F0] bg-white p-5" aria-labelledby="family-title">
          <div class="flex items-center justify-between gap-3">
            <h2 id="family-title" class="text-[16px] font-bold text-[#101D3A]">{{ t('account.profile.familyProfile') }}</h2>
            <NuxtLink to="/user/family" class="text-link text-[13px]">{{ travellers.length ? t('account.profile.edit') : t('account.profile.add') }}</NuxtLink>
          </div>
          <p class="mt-1 text-[13px] leading-5 text-[#64748B]">{{ t('account.profile.familyNote') }}</p>
          <ul v-if="travellers.length" class="mt-3 flex flex-wrap gap-2">
            <li v-for="person in travellers" :key="person.id" class="inline-flex items-center gap-2 rounded-full border border-[#E2E8F0] bg-[#F8FAFC] py-1 pl-1 pr-3 text-[13px] text-[#101D3A]">
              <span class="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#E8F7FA] text-[11px] font-bold text-[#007789]" aria-hidden="true">{{ person.name.charAt(0).toUpperCase() }}</span>
              {{ person.name }}<span v-if="person.age !== null" class="text-[#64748B]">· {{ person.age }}</span>
            </li>
          </ul>
          <NuxtLink v-else-if="loaded" to="/user/family" class="btn-secondary mt-3 min-h-10 text-[13px]">{{ t('account.profile.addFamily') }}</NuxtLink>
        </section>

        <ReferralShare />

        <!-- Account links -->
        <nav class="rounded-2xl border border-[#E2E8F0] bg-white p-2" :aria-label="t('account.profile.accountLabel')">
          <NuxtLink
            v-for="link in accountLinks"
            :key="link.to"
            :to="link.to"
            class="flex min-h-11 items-center justify-between gap-3 rounded-xl px-3 text-[14px] font-medium text-[#334155] hover:bg-[#F8FAFC]"
          >
            {{ link.label }}
            <svg class="h-4 w-4 text-[#94A3B8]" viewBox="0 0 20 20" fill="none" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="m8 5 5 5-5 5" /></svg>
          </NuxtLink>
          <button type="button" class="flex min-h-11 w-full items-center rounded-xl px-3 text-left text-[14px] font-medium text-[#B91C1C] hover:bg-[#FEF2F2]" @click="logout">{{ t('account.profile.logout') }}</button>
        </nav>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CustomerBooking } from '~/types/booking'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthState } from '~/composables/useAuthState'
import ReferralShare from '~/components/ReferralShare.vue'
import { destinationPhoto } from '~/utils/destination-photos'

definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

interface SavedTrip {
  id: string
  title: string
  destination: string
  startDate: string
  endDate: string
}

interface Traveller {
  id: string
  name: string
  birthDate: string | null
  age: number | null
}

const router = useRouter()
const { user, isAdmin, clearUser } = useAuthState()
const { t, localeTag, placeName } = useI18n()

const bookings = ref<CustomerBooking[]>([])
const trips = ref<SavedTrip[]>([])
const travellers = ref<Traveller[]>([])
const loaded = ref(false)

const profile = computed(() => {
  const value = user.value
  const name = value ? [value.firstName, value.lastName].filter(Boolean).join(' ') || value.username : ''
  return {
    name,
    email: value?.email || '',
    initial: (name || '?').charAt(0).toUpperCase(),
    memberSince: value?.createdAt
      ? new Intl.DateTimeFormat(localeTag.value, { month: 'short', year: 'numeric' }).format(new Date(value.createdAt))
      : ''
  }
})

const stateBadge = (state: CustomerBooking['state']) => {
  if (state === 'confirmed') return 'border-[#A7F3D0] bg-[#ECFDF5] text-[#047857]'
  if (state === 'processing' || state === 'awaiting_payment') return 'border-[#FDE68A] bg-[#FFFBEB] text-[#B45309]'
  if (state === 'failed') return 'border-[#FECACA] bg-[#FEF2F2] text-[#B91C1C]'
  return 'border-[#E2E8F0] bg-[#F8FAFC] text-[#475569]'
}

const today = new Date().toISOString().slice(0, 10)
const upcomingTrips = computed(() => trips.value.filter((trip) => trip.endDate.slice(0, 10) >= today).slice(0, 3))
const recentBookings = computed(() => bookings.value.slice(0, 3))

const tiles = computed(() => [
  { label: t('account.profile.bookings'), value: bookings.value.filter((b) => ['processing', 'confirmed'].includes(b.state)).length, to: '/bookings', cta: t('account.profile.viewBookings') },
  { label: t('account.profile.savedTrips'), value: trips.value.length, to: '/mytrip', cta: t('account.profile.viewTrips') },
  { label: t('account.profile.family'), value: travellers.value.length, to: '/user/family', cta: t('account.profile.editFamily') }
])

const accountLinks = computed(() => [
  { to: '/mytrip', label: t('account.profile.links.trips') },
  { to: '/bookings', label: t('account.profile.links.bookings') },
  { to: '/user/family', label: t('account.profile.links.family') },
  { to: '/help', label: t('account.profile.links.help') },
  { to: '/contact', label: t('account.profile.links.contact') }
])

const shortDate = (value: string) => new Intl.DateTimeFormat(localeTag.value, { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value))
const dateRange = (start: string, end: string) => {
  const format = new Intl.DateTimeFormat(localeTag.value, { day: 'numeric', month: 'short', timeZone: 'UTC' })
  return `${format.format(new Date(start))} – ${format.format(new Date(end))}`
}
const countdown = (start: string) => {
  const days = Math.round((new Date(`${start.slice(0, 10)}T00:00:00Z`).getTime() - new Date(`${today}T00:00:00Z`).getTime()) / 86400000)
  if (days <= 0) return t('account.profile.now')
  if (days === 1) return t('account.profile.tomorrow')
  return t('account.profile.inDays', { count: days })
}

const ageOf = (birthDate: string | null) => {
  if (!birthDate) return null
  const birth = new Date(birthDate)
  const now = new Date()
  let age = now.getFullYear() - birth.getFullYear()
  if (now.getMonth() < birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())) age -= 1
  return Math.max(age, 0)
}

const logout = () => {
  clearUser()
  router.push('/')
}

onMounted(async () => {
  // Each list loads on its own, so one failing does not blank the page
  const [bookingRes, tripRes, travellerRes] = await Promise.allSettled([
    $fetch<{ data: CustomerBooking[] }>('/api/bookings'),
    $fetch<{ data: SavedTrip[] }>('/api/trips'),
    $fetch<{ data: Array<{ id: string; name: string; birthDate: string | null }> }>('/api/travellers')
  ])
  if (bookingRes.status === 'fulfilled') bookings.value = bookingRes.value.data
  if (tripRes.status === 'fulfilled') trips.value = tripRes.value.data
  if (travellerRes.status === 'fulfilled') {
    travellers.value = travellerRes.value.data.map((person) => ({ ...person, age: ageOf(person.birthDate) }))
  }
  loaded.value = true
})
</script>
