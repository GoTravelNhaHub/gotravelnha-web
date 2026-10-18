<template>
  <article class="overflow-hidden rounded-2xl border bg-white font-brand" :class="badge.border">
    <div class="flex flex-wrap items-start justify-between gap-3 px-5 pt-5">
      <div class="min-w-0">
        <div class="flex items-center gap-1.5">
          <span class="font-mono text-[12px] font-semibold tracking-wide text-[#64748B]">{{ booking.reference }}</span>
          <button
            v-if="booking.reference"
            type="button"
            class="inline-flex h-7 items-center rounded-md px-1.5 text-[11px] font-semibold text-[#0057C8] hover:bg-[#EAF2FC]"
            :aria-label="t('account.card.copyReference', { reference: booking.reference })"
            @click="copyReference"
          >
            {{ copied ? t('account.card.copied') : t('account.card.copy') }}
          </button>
        </div>
        <h3 class="text-[17px] font-bold leading-6 text-[#0A1024]">
          <NuxtLink v-if="booking.eventSlug" :to="`/attractionsg/${booking.eventSlug}`" class="hover:text-[#0057C8] hover:underline">{{ booking.eventTitle }}</NuxtLink>
          <template v-else>{{ booking.eventTitle }}</template>
        </h3>
        <p class="mt-0.5 text-[14px] text-[#475569]">
          <span v-if="booking.optionName">{{ booking.optionName }} · </span>{{ guests }}
        </p>
      </div>
      <span class="inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold" :class="badge.pill">
        <svg class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="badge.icon" /></svg>
        {{ t(`account.card.states.${booking.state}.label`) }}
      </span>
    </div>

    <!-- Progress while tickets are being ordered -->
    <ol v-if="booking.state === 'processing' || booking.state === 'confirmed'" class="mx-5 mt-4 grid grid-cols-3 gap-2" :aria-label="t('account.card.progress')">
      <li v-for="(step, index) in tm<string[]>('account.card.steps')" :key="step" class="min-w-0">
        <span class="block h-1.5 rounded-full" :class="index < doneSteps ? 'bg-[#10B981]' : index === doneSteps ? 'bg-[#F59E0B]' : 'bg-[#E2E8F0]'" aria-hidden="true"></span>
        <span class="mt-1.5 block truncate text-[12px]" :class="index <= doneSteps ? 'font-semibold text-[#334155]' : 'text-[#94A3B8]'">
          {{ step }}<span class="sr-only">{{ index < doneSteps ? t('account.card.done') : index === doneSteps ? t('account.card.inProgress') : '' }}</span>
        </span>
      </li>
    </ol>

    <p class="mx-5 mt-4 text-[14px] leading-[22px] text-[#475569]">{{ t(`account.card.states.${booking.state}.detail`) }}</p>

    <div v-if="booking.state === 'confirmed' && (booking.voucherUrl || booking.voucherNote)" class="mx-5 mt-4 space-y-2 rounded-xl border border-[#A7F3D0] bg-[#ECFDF5] p-4">
      <a v-if="booking.voucherUrl" :href="booking.voucherUrl" target="_blank" rel="noopener noreferrer" class="btn-primary w-full sm:w-auto sm:px-6">
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M3 9V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a3 3 0 0 0 0 6v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a3 3 0 0 0 0-6Z" /></svg>
        {{ t('account.card.openTickets') }}
      </a>
      <p v-if="booking.voucherNote" class="whitespace-pre-wrap text-[14px] leading-[22px] text-[#065F46]">{{ booking.voucherNote }}</p>
    </div>

    <dl class="mx-5 mt-4 grid grid-cols-2 gap-3 border-t border-[#F1F5F9] py-4 text-[13px] sm:grid-cols-4">
      <div>
        <dt class="text-[#64748B]">{{ t('account.card.paid') }}</dt>
        <dd class="font-semibold tabular-nums text-[#0A1024]">{{ money(booking.amount) }}</dd>
      </div>
      <div>
        <dt class="text-[#64748B]">{{ t('account.card.booked') }}</dt>
        <dd class="font-semibold text-[#0A1024]">{{ formatDate(booking.paidAt || booking.createdAt) }}</dd>
      </div>
      <div v-if="booking.discountAmount">
        <dt class="text-[#64748B]">{{ t('account.card.discount') }}</dt>
        <dd class="font-semibold tabular-nums text-[#0A1024]">{{ money(booking.discountAmount) }}</dd>
      </div>
      <div v-if="booking.refundedAmount">
        <dt class="text-[#64748B]">{{ t('account.card.refunded') }}</dt>
        <dd class="font-semibold tabular-nums text-[#0A1024]">{{ money(booking.refundedAmount) }}</dd>
      </div>
    </dl>

    <div class="flex flex-wrap items-center justify-between gap-2 border-t border-[#F1F5F9] bg-[#F8FAFC] px-5 py-3 text-[13px]">
      <NuxtLink :to="`/contact?ref=${booking.reference}`" class="text-link">{{ t('account.card.help') }}</NuxtLink>
      <NuxtLink to="/refund-policy" class="text-[#64748B] hover:text-[#0A1024]">{{ t('account.card.refundPolicy') }}</NuxtLink>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { CustomerBooking } from '~/types/booking'

const props = defineProps<{ booking: CustomerBooking }>()
const { t, tm, localeTag } = useI18n()

const ICON = {
  check: 'm5 10.5 3 3 7-7',
  clock: 'M10 6v4l2.5 1.5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z',
  refund: 'M4 8h9a4 4 0 0 1 0 8H8M4 8l3-3M4 8l3 3',
  cross: 'M6 6l8 8M14 6l-8 8',
  card: 'M3 7h14v8H3V7Zm0 3h14'
}

const BADGES = {
  awaiting_payment: {
    label: 'Awaiting payment',
    pill: 'bg-[#F1F5F9] text-[#475569]',
    border: 'border-[#E2E8F0]',
    icon: ICON.card,
    detail: 'We have not received payment for this booking.'
  },
  processing: {
    label: 'Confirming tickets',
    pill: 'bg-[#FFFBEB] text-[#B45309]',
    border: 'border-[#FDE68A]',
    icon: ICON.clock,
    detail: 'Payment received. We are ordering your tickets from our supplier and will email them as soon as they are confirmed.'
  },
  confirmed: {
    label: 'Confirmed',
    pill: 'bg-[#ECFDF5] text-[#047857]',
    border: 'border-[#E2E8F0]',
    icon: ICON.check,
    detail: 'Your tickets are confirmed. We have also emailed them to you.'
  },
  refunded: {
    label: 'Refunded',
    pill: 'bg-[#EAF2FC] text-[#0057C8]',
    border: 'border-[#E2E8F0]',
    icon: ICON.refund,
    detail: 'This booking was refunded to your original payment method.'
  },
  cancelled: {
    label: 'Cancelled',
    pill: 'bg-[#F1F5F9] text-[#475569]',
    border: 'border-[#E2E8F0]',
    icon: ICON.cross,
    detail: 'Checkout was not completed. You were not charged.'
  },
  failed: {
    label: 'Payment failed',
    pill: 'bg-[#FEF2F2] text-[#B91C1C]',
    border: 'border-[#FECACA]',
    icon: ICON.cross,
    detail: 'The payment did not go through. You were not charged.'
  }
} as const

const badge = computed(() => BADGES[props.booking.state])

// processing: payment done, ordering in progress; confirmed: all done
const doneSteps = computed(() => (props.booking.state === 'confirmed' ? 3 : 1))

const guests = computed(() => {
  const parts: string[] = []
  if (props.booking.adultCount) parts.push(t('account.card.adults', { count: props.booking.adultCount }))
  if (props.booking.childCount) parts.push(t('account.card.children', { count: props.booking.childCount }))
  return parts.join(' + ') || t('account.card.tickets', { count: props.booking.quantity })
})

const money = (value: number) => `${props.booking.currency} ${value.toFixed(2)}`
const formatDate = (value: string) => new Intl.DateTimeFormat(localeTag.value, { dateStyle: 'medium' }).format(new Date(value))

const copied = ref(false)
const copyReference = async () => {
  if (!props.booking.reference) return
  try {
    await navigator.clipboard.writeText(props.booking.reference)
    copied.value = true
    setTimeout(() => (copied.value = false), 2000)
  } catch {
    // Clipboard blocked; the reference is visible to copy by hand
  }
}
</script>
