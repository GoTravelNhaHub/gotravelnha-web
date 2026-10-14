<template>
  <div class="mx-auto max-w-[1400px] space-y-5 px-4 py-6 sm:px-6 lg:px-8">
    <div class="space-y-5">
      <div class="flex flex-wrap items-end justify-between gap-3">
        <div class="max-w-2xl">
          <h2 class="text-[20px] font-bold leading-7 tracking-[-0.02em] text-[#101D3A]">Bookings</h2>
          <p class="text-[14px] text-[#64748B]">
            Singapore attraction tickets sold on GoTravelNha. "Needs attention" lists paid tickets not confirmed or emailed, and refunds still to cancel with the supplier.
          </p>
        </div>
        <div class="flex items-center gap-2">
          <div class="inline-grid grid-cols-2 gap-1 rounded-xl bg-[#E2E8F0]/70 p-1" role="tablist" aria-label="Bookings to show">
            <button
              v-for="option in views"
              :key="option.id"
              type="button"
              role="tab"
              :aria-selected="view === option.id"
              class="min-h-9 whitespace-nowrap rounded-lg px-3.5 text-[13px] font-semibold"
              :class="view === option.id ? 'bg-white text-[#101D3A] shadow-[0_1px_3px_rgba(16,29,58,0.12)]' : 'text-[#64748B] hover:text-[#101D3A]'"
              @click="view = option.id"
            >
              {{ option.label }}
            </button>
          </div>
          <button type="button" class="btn-secondary min-h-10 w-auto px-3.5 text-[13px]" :disabled="loading" @click="fetchBookings">
            <svg class="h-4 w-4" :class="loading ? 'animate-spin' : ''" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3M18 3v4h-4M6 21v-4h4" />
            </svg>
            <span class="sr-only sm:not-sr-only">{{ loading ? 'Refreshing…' : 'Refresh' }}</span>
          </button>
        </div>
      </div>

      <p v-if="error" class="alert-error" role="alert">{{ error }}</p>
      <p v-if="notice" class="alert-success" role="status">{{ notice }}</p>

      <section v-if="fulfil.id" class="rounded-2xl border border-[#99E3EC] bg-white p-5" aria-labelledby="fulfil-title">
        <form class="grid grid-cols-1 items-end gap-4 md:grid-cols-3" @submit.prevent="submitFulfil">
          <div class="md:col-span-3">
            <h3 id="fulfil-title" class="text-[15px] font-bold text-[#101D3A]">Tickets for <span class="font-mono">{{ fulfil.reference }}</span></h3>
            <p class="text-[13px] text-[#64748B]">Saved to the booking and emailed to the customer.</p>
          </div>
          <div>
            <label for="fulfil-url" class="form-label">Ticket link (https)</label>
            <input id="fulfil-url" v-model.trim="fulfil.voucherUrl" type="url" placeholder="https://…" class="form-input" />
          </div>
          <div>
            <label for="fulfil-order" class="form-label">Supplier order reference <span class="font-normal text-[#64748B]">(optional)</span></label>
            <input id="fulfil-order" v-model.trim="fulfil.supplierOrderId" class="form-input" />
          </div>
          <div class="md:row-span-2">
            <label for="fulfil-note" class="form-label">Note for the customer <span class="font-normal text-[#64748B]">(optional)</span></label>
            <textarea id="fulfil-note" v-model.trim="fulfil.voucherNote" rows="3" placeholder="e.g. show the QR code at gate 2" class="form-input"></textarea>
          </div>
          <div class="flex gap-2 md:col-span-2">
            <button type="submit" :disabled="actionId === fulfil.id" class="btn-primary w-auto px-5">Save and email tickets</button>
            <button type="button" class="btn-secondary w-auto px-5" @click="fulfil.id = ''">Cancel</button>
          </div>
        </form>
      </section>

      <div class="overflow-x-auto rounded-2xl border border-[#E2E8F0] bg-white">
        <table class="min-w-full divide-y divide-[#E2E8F0] text-[14px]">
          <thead class="bg-[#F8FAFC]">
            <tr>
              <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-[#64748B]">Created</th>
              <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-[#64748B]">Attraction</th>
              <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-[#64748B]">Customer</th>
              <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-[#64748B]">Amount</th>
              <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-[#64748B]">Payment</th>
              <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-[#64748B]">Supplier</th>
              <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-[#64748B]">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#F1F5F9] bg-white">
            <tr v-for="booking in bookings" :key="booking.id" class="align-top hover:bg-[#F8FAFC]">
              <td class="whitespace-nowrap px-4 py-3 text-[13px] text-[#64748B]">{{ formatDate(booking.createdAt) }}</td>
              <td class="px-4 py-3">
                <div class="font-semibold text-[#101D3A]">{{ booking.eventTitle }}</div>
                <div class="text-[12px] text-[#64748B]">
                  {{ booking.optionName || '—' }} · Qty {{ booking.quantity }}
                </div>
                <div class="mt-0.5 font-mono text-[12px] text-[#475569]">{{ booking.reference || booking.id }}</div>
              </td>
              <td class="px-4 py-3 text-[#334155]">
                <div>{{ booking.customerName || '—' }}</div>
                <div class="text-[12px] text-[#64748B]">{{ booking.customerEmail || '—' }}</div>
              </td>
              <td class="whitespace-nowrap px-4 py-3 font-semibold tabular-nums text-[#101D3A]">
                {{ booking.currency }} {{ booking.amount.toFixed(2) }}
                <div v-if="booking.discountAmount" class="text-xs text-amber-700">
                  Discount {{ booking.discountAmount.toFixed(2) }}
                </div>
                <div v-if="booking.refundedAmount" class="text-xs text-red-600">
                  Refunded {{ booking.refundedAmount.toFixed(2) }}
                </div>
              </td>
              <td class="px-4 py-3">
                <span :class="['px-2 py-1 rounded-full text-xs font-semibold border', paymentBadge(booking.status)]">
                  {{ booking.status }}
                </span>
                <div v-if="booking.status === 'PAID'" class="mt-2 space-y-0.5 text-xs">
                  <div :class="booking.confirmationSentAt ? 'text-[#64748B]' : 'font-semibold text-[#B91C1C]'">
                    {{ booking.confirmationSentAt ? '✓ Confirmation emailed' : '✗ Confirmation not sent' }}
                  </div>
                  <div v-if="booking.supplierStatus === 'CONFIRMED'" :class="booking.ticketSentAt ? 'text-[#64748B]' : 'font-semibold text-[#B91C1C]'">
                    {{ booking.ticketSentAt ? '✓ Ticket emailed' : '✗ Ticket not sent' }}
                  </div>
                </div>
              </td>
              <td class="px-4 py-3">
                <span :class="['px-2 py-1 rounded-full text-xs font-semibold border', supplierBadge(booking.supplierStatus)]">
                  {{ booking.supplierStatus || 'NOT SENT' }}
                </span>
                <div v-if="booking.supplierOrderId" class="mt-1 font-mono text-[12px] text-[#64748B]">#{{ booking.supplierOrderId }}</div>
                <div v-if="supplierError(booking)" class="text-xs text-red-600 mt-1 max-w-xs break-words">
                  {{ supplierError(booking) }}
                </div>
              </td>
              <td class="px-4 py-3">
                <div v-if="booking.status === 'PAID' || booking.supplierStatus === 'CANCEL_NEEDED'" class="flex flex-col gap-2">
                  <button
                    v-if="booking.status === 'PAID' && (!booking.supplierStatus || ['QUEUED', 'FAILED'].includes(booking.supplierStatus))"
                    @click="runAction(booking, 'retry-supplier')"
                    :disabled="actionId === booking.id"
                    class="btn-primary min-h-8 whitespace-nowrap px-3 text-[12px]"
                  >
                    Send to supplier
                  </button>
                  <button
                    v-if="booking.status === 'PAID'"
                    @click="openFulfil(booking)"
                    :disabled="actionId === booking.id"
                    class="btn-primary min-h-8 whitespace-nowrap px-3 text-[12px]"
                  >
                    {{ booking.supplierStatus === 'CONFIRMED' ? 'Edit tickets' : 'Mark fulfilled' }}
                  </button>
                  <button
                    v-if="booking.status === 'PAID' && booking.supplierStatus === 'CONFIRMED'"
                    @click="runAction(booking, 'resend-ticket')"
                    :disabled="actionId === booking.id"
                    class="btn-secondary min-h-8 whitespace-nowrap px-3 text-[12px]"
                  >
                    Resend ticket
                  </button>
                  <button
                    v-if="booking.status === 'PAID'"
                    @click="runAction(booking, 'resend-confirmation')"
                    :disabled="actionId === booking.id"
                    class="btn-secondary min-h-8 whitespace-nowrap px-3 text-[12px]"
                  >
                    Resend confirmation
                  </button>
                  <button
                    v-if="booking.status === 'PAID'"
                    @click="refund(booking)"
                    :disabled="actionId === booking.id"
                    class="inline-flex min-h-8 items-center justify-center whitespace-nowrap rounded-xl border border-[#FECACA] px-3 text-[12px] font-semibold text-[#B91C1C] hover:bg-[#FEF2F2] disabled:opacity-60"
                  >
                    Refund…
                  </button>
                  <button
                    v-if="booking.supplierStatus === 'CANCEL_NEEDED'"
                    @click="runAction(booking, 'supplier-cancelled')"
                    :disabled="actionId === booking.id"
                    class="inline-flex min-h-8 items-center justify-center whitespace-nowrap rounded-xl bg-[#B45309] px-3 text-[12px] font-semibold text-white hover:bg-[#92400E] disabled:opacity-60"
                  >
                    Supplier order cancelled
                  </button>
                </div>
                <span v-else class="text-[12px] text-[#94A3B8]">—</span>
              </td>
            </tr>
            <tr v-if="!loading && bookings.length === 0">
              <td colspan="7" class="px-4 py-12 text-center text-[14px] text-[#64748B]">
                {{ view === 'attention' ? 'Nothing needs attention.' : 'No bookings yet.' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

interface AdminBooking {
  id: string
  reference: string | null
  eventTitle: string
  optionName: string | null
  quantity: number
  amount: number
  currency: string
  status: 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED' | 'REFUNDED'
  paidAt: string | null
  refundedAmount: number | null
  supplierStatus: string | null
  supplierOrderId: string | null
  supplierPayload: any
  customerName: string | null
  customerEmail: string | null
  voucherUrl: string | null
  voucherNote: string | null
  discountAmount: number | null
  confirmationSentAt: string | null
  ticketSentAt: string | null
  createdAt: string
}

type BookingAction = 'retry-supplier' | 'resend-ticket' | 'resend-confirmation' | 'supplier-cancelled'

const ACTION_DONE: Record<BookingAction, string> = {
  'retry-supplier': 'Sent to supplier.',
  'resend-ticket': 'Ticket email sent.',
  'resend-confirmation': 'Confirmation email sent.',
  'supplier-cancelled': 'Marked as cancelled with the supplier.'
}

const view = ref<'attention' | 'all'>('attention')
const views = [
  { id: 'attention' as const, label: 'Needs attention' },
  { id: 'all' as const, label: 'All bookings' }
]
const bookings = ref<AdminBooking[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const actionId = ref<string | null>(null)
const notice = ref<string | null>(null)
const fulfil = reactive({ id: '', reference: '', voucherUrl: '', voucherNote: '', supplierOrderId: '' })

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('en-SG', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))

const paymentBadge = (status: AdminBooking['status']) =>
  ({
    PAID: 'bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]',
    PENDING: 'bg-[#F8FAFC] text-[#475569] border-[#E2E8F0]',
    FAILED: 'bg-[#FEF2F2] text-[#B91C1C] border-[#FECACA]',
    CANCELLED: 'bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0]',
    REFUNDED: 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]'
  })[status]

const supplierBadge = (status: string | null) => {
  if (status === 'CONFIRMED') return 'bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]'
  if (status === 'FAILED') return 'bg-[#FEF2F2] text-[#B91C1C] border-[#FECACA]'
  if (status === 'PLACING') return 'bg-[#E8F7FA] text-[#007789] border-[#99E3EC]'
  return 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]'
}

const supplierError = (booking: AdminBooking) =>
  booking.supplierStatus === 'FAILED'
    ? booking.supplierPayload?.error || booking.supplierPayload?.message || null
    : null

const fetchBookings = async () => {
  try {
    loading.value = true
    error.value = null
    const response = await $fetch<{ success: boolean; data: AdminBooking[] }>('/api/admin/bookings', {
      query: { view: view.value }
    })
    bookings.value = response.data
  } catch (err: any) {
    console.error('Failed to load bookings:', err)
    error.value = err?.data?.message || err?.message || 'Failed to load bookings.'
  } finally {
    loading.value = false
  }
}

const post = async (booking: AdminBooking, body: Record<string, unknown>, done: string) => {
  try {
    actionId.value = booking.id
    error.value = null
    notice.value = null
    await $fetch(`/api/admin/bookings/${booking.id}`, { method: 'POST', body })
    notice.value = done
    await fetchBookings()
    return true
  } catch (err: any) {
    console.error('Booking action failed:', err)
    error.value = err?.data?.message || err?.message || 'Booking action failed.'
    return false
  } finally {
    actionId.value = null
  }
}

const runAction = (booking: AdminBooking, action: BookingAction) =>
  post(booking, { action }, `${booking.reference}: ${ACTION_DONE[action]}`)

const openFulfil = (booking: AdminBooking) => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
  Object.assign(fulfil, {
    id: booking.id,
    reference: booking.reference || booking.id,
    voucherUrl: booking.voucherUrl || '',
    voucherNote: booking.voucherNote || '',
    supplierOrderId: booking.supplierOrderId || ''
  })
}

const submitFulfil = async () => {
  const booking = bookings.value.find((item) => item.id === fulfil.id)
  if (!booking) return
  const ok = await post(
    booking,
    {
      action: 'mark-fulfilled',
      voucherUrl: fulfil.voucherUrl || undefined,
      voucherNote: fulfil.voucherNote || undefined,
      supplierOrderId: fulfil.supplierOrderId || undefined
    },
    `${fulfil.reference}: tickets saved and emailed.`
  )
  if (ok) fulfil.id = ''
}

const refund = (booking: AdminBooking) => {
  const remaining = booking.amount - (booking.refundedAmount ?? 0)
  const input = window.prompt(
    `Refund ${booking.reference} through Stripe. Amount in ${booking.currency} (max ${remaining.toFixed(2)}):`,
    remaining.toFixed(2)
  )
  if (input === null) return
  const amount = Number(input)
  if (!Number.isFinite(amount) || amount <= 0) {
    error.value = 'Enter a refund amount greater than 0.'
    return
  }
  if (!window.confirm(`Refund ${booking.currency} ${amount.toFixed(2)} to the customer? This cannot be undone.`)) return
  post(booking, { action: 'refund', amount }, `${booking.reference}: refund of ${amount.toFixed(2)} requested. The status updates when Stripe confirms.`)
}

watch(view, fetchBookings)

onMounted(() => {
  fetchBookings()
})
</script>
