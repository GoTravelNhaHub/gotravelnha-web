<template>
  <div class="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <div class="text-xs font-mono text-slate-500">{{ booking.reference }}</div>
        <div class="text-lg font-bold text-slate-900">{{ booking.eventTitle }}</div>
        <div class="text-sm text-slate-600">
          <span v-if="booking.optionName">{{ booking.optionName }} · </span>{{ guests }}
        </div>
      </div>
      <span :class="['px-3 py-1 rounded-full text-xs font-semibold', badge.class]">{{ badge.label }}</span>
    </div>

    <p class="text-sm text-slate-700">{{ badge.detail }}</p>

    <div class="text-sm text-slate-600 flex flex-wrap gap-x-6 gap-y-1">
      <span>Paid: <strong>{{ booking.currency }} {{ booking.amount.toFixed(2) }}</strong></span>
      <span v-if="booking.discountAmount">Discount: {{ booking.currency }} {{ booking.discountAmount.toFixed(2) }}</span>
      <span v-if="booking.refundedAmount">Refunded: {{ booking.currency }} {{ booking.refundedAmount.toFixed(2) }}</span>
      <span>Booked {{ formatDate(booking.paidAt || booking.createdAt) }}</span>
    </div>

    <div v-if="booking.state === 'confirmed' && (booking.voucherUrl || booking.voucherNote)" class="rounded-xl bg-emerald-50 border border-emerald-100 p-4 space-y-2">
      <a
        v-if="booking.voucherUrl"
        :href="booking.voucherUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
      >
        Open your tickets
      </a>
      <p v-if="booking.voucherNote" class="text-sm text-slate-700 whitespace-pre-wrap">{{ booking.voucherNote }}</p>
    </div>

    <p class="text-xs text-slate-500">
      Need help? <NuxtLink :to="`/contact?ref=${booking.reference}`" class="text-emerald-700 hover:underline">Contact us about this booking</NuxtLink>.
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CustomerBooking } from '~/types/booking'

const props = defineProps<{ booking: CustomerBooking }>()

const BADGES = {
  awaiting_payment: { label: 'Awaiting payment', class: 'bg-slate-100 text-slate-700', detail: 'We have not received payment for this booking.' },
  processing: {
    label: 'Confirming tickets',
    class: 'bg-amber-100 text-amber-800',
    detail: 'Payment received. We are ordering your tickets from our supplier and will email them as soon as they are confirmed.'
  },
  confirmed: { label: 'Confirmed', class: 'bg-emerald-100 text-emerald-800', detail: 'Your tickets are confirmed. We have also emailed them to you.' },
  refunded: { label: 'Refunded', class: 'bg-blue-100 text-blue-800', detail: 'This booking was refunded to your original payment method.' },
  cancelled: { label: 'Cancelled', class: 'bg-slate-100 text-slate-700', detail: 'Checkout was not completed. You were not charged.' },
  failed: { label: 'Payment failed', class: 'bg-red-100 text-red-700', detail: 'The payment did not go through. You were not charged.' }
} as const

const badge = computed(() => BADGES[props.booking.state])

const guests = computed(() => {
  const parts: string[] = []
  if (props.booking.adultCount) parts.push(`${props.booking.adultCount} adult${props.booking.adultCount === 1 ? '' : 's'}`)
  if (props.booking.childCount) parts.push(`${props.booking.childCount} child${props.booking.childCount === 1 ? '' : 'ren'}`)
  return parts.join(' + ') || `${props.booking.quantity} ticket${props.booking.quantity === 1 ? '' : 's'}`
})

const formatDate = (value: string) => new Intl.DateTimeFormat('en-SG', { dateStyle: 'medium' }).format(new Date(value))
</script>
