<template>
  <div class="min-h-full bg-gray-50 pb-12">
    <div class="px-4 sm:px-6 lg:px-8 py-5 space-y-6">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">Bookings</h2>
          <p class="text-sm text-gray-600">
            Self-checkout bookings that need action: tickets not confirmed, customer emails not sent, or refunded orders still to cancel with the supplier.
          </p>
        </div>
        <div class="flex items-center gap-3">
          <select
            v-model="view"
            class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="attention">Needs attention</option>
            <option value="all">All bookings</option>
          </select>
          <button
            @click="fetchBookings"
            :disabled="loading"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <span v-if="loading" class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
            <span>{{ loading ? 'Refreshing…' : 'Refresh' }}</span>
          </button>
        </div>
      </div>

      <div v-if="error" class="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
        {{ error }}
      </div>
      <div v-if="notice" class="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg">
        {{ notice }}
      </div>

      <div v-if="fulfil.id" class="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <form @submit.prevent="submitFulfil" class="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                  <div class="md:col-span-3 text-sm font-semibold text-gray-900">
                    Tickets for {{ fulfil.reference }} – sent to the customer by email
                  </div>
                  <label class="block text-xs text-gray-600">
                    Ticket link (https)
                    <input v-model.trim="fulfil.voucherUrl" type="url" placeholder="https://…" class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                  </label>
                  <label class="block text-xs text-gray-600">
                    Supplier order reference (optional)
                    <input v-model.trim="fulfil.supplierOrderId" class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                  </label>
                  <label class="block text-xs text-gray-600 md:row-span-2">
                    Note for the customer (optional)
                    <textarea v-model.trim="fulfil.voucherNote" rows="3" placeholder="e.g. show the QR code at gate 2" class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"></textarea>
                  </label>
                  <div class="flex gap-2 md:col-span-2">
                    <button type="submit" :disabled="actionId === fulfil.id" class="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm hover:bg-emerald-700 disabled:opacity-60">
                      Save and email tickets
                    </button>
                    <button type="button" @click="fulfil.id = ''" class="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm">Cancel</button>
                  </div>
                </form>
      </div>

      <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 text-sm">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Created</th>
              <th class="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Attraction</th>
              <th class="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Customer</th>
              <th class="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Amount</th>
              <th class="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Payment</th>
              <th class="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Supplier</th>
              <th class="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="booking in bookings" :key="booking.id" class="hover:bg-gray-50 align-top">
              <td class="px-4 py-3 text-gray-700 whitespace-nowrap">{{ formatDate(booking.createdAt) }}</td>
              <td class="px-4 py-3">
                <div class="font-medium text-gray-900">{{ booking.eventTitle }}</div>
                <div class="text-xs text-gray-500">
                  {{ booking.optionName || '—' }} · Qty {{ booking.quantity }}
                </div>
                <div class="text-xs font-mono text-gray-700">{{ booking.reference || booking.id }}</div>
              </td>
              <td class="px-4 py-3 text-gray-700">
                <div>{{ booking.customerName || '—' }}</div>
                <div class="text-xs text-gray-500">{{ booking.customerEmail || '—' }}</div>
              </td>
              <td class="px-4 py-3 text-gray-700 whitespace-nowrap">
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
                  <div :class="booking.confirmationSentAt ? 'text-gray-500' : 'text-red-600 font-semibold'">
                    {{ booking.confirmationSentAt ? '✓ Confirmation emailed' : '✗ Confirmation not sent' }}
                  </div>
                  <div v-if="booking.supplierStatus === 'CONFIRMED'" :class="booking.ticketSentAt ? 'text-gray-500' : 'text-red-600 font-semibold'">
                    {{ booking.ticketSentAt ? '✓ Ticket emailed' : '✗ Ticket not sent' }}
                  </div>
                </div>
              </td>
              <td class="px-4 py-3">
                <span :class="['px-2 py-1 rounded-full text-xs font-semibold border', supplierBadge(booking.supplierStatus)]">
                  {{ booking.supplierStatus || 'NOT SENT' }}
                </span>
                <div v-if="booking.supplierOrderId" class="text-xs text-gray-500 mt-1">#{{ booking.supplierOrderId }}</div>
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
                    class="px-3 py-1 rounded-lg bg-blue-600 text-white text-xs hover:bg-blue-700 disabled:opacity-60"
                  >
                    Send to supplier
                  </button>
                  <button
                    v-if="booking.status === 'PAID'"
                    @click="openFulfil(booking)"
                    :disabled="actionId === booking.id"
                    class="px-3 py-1 rounded-lg bg-emerald-600 text-white text-xs hover:bg-emerald-700 disabled:opacity-60"
                  >
                    {{ booking.supplierStatus === 'CONFIRMED' ? 'Edit tickets' : 'Mark fulfilled' }}
                  </button>
                  <button
                    v-if="booking.status === 'PAID' && booking.supplierStatus === 'CONFIRMED'"
                    @click="runAction(booking, 'resend-ticket')"
                    :disabled="actionId === booking.id"
                    class="px-3 py-1 rounded-lg border border-gray-300 text-gray-700 text-xs hover:bg-gray-50 disabled:opacity-60"
                  >
                    Resend ticket
                  </button>
                  <button
                    v-if="booking.status === 'PAID'"
                    @click="runAction(booking, 'resend-confirmation')"
                    :disabled="actionId === booking.id"
                    class="px-3 py-1 rounded-lg border border-gray-300 text-gray-700 text-xs hover:bg-gray-50 disabled:opacity-60"
                  >
                    Resend confirmation
                  </button>
                  <button
                    v-if="booking.status === 'PAID'"
                    @click="refund(booking)"
                    :disabled="actionId === booking.id"
                    class="px-3 py-1 rounded-lg border border-red-200 text-red-700 text-xs hover:bg-red-50 disabled:opacity-60"
                  >
                    Refund…
                  </button>
                  <button
                    v-if="booking.supplierStatus === 'CANCEL_NEEDED'"
                    @click="runAction(booking, 'supplier-cancelled')"
                    :disabled="actionId === booking.id"
                    class="px-3 py-1 rounded-lg bg-amber-600 text-white text-xs hover:bg-amber-700 disabled:opacity-60"
                  >
                    Supplier order cancelled
                  </button>
                </div>
                <span v-else class="text-xs text-gray-400">—</span>
              </td>
            </tr>
            <tr v-if="!loading && bookings.length === 0">
              <td colspan="7" class="px-4 py-6 text-center text-gray-500">
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
    PAID: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    PENDING: 'bg-gray-50 text-gray-600 border-gray-200',
    FAILED: 'bg-red-50 text-red-700 border-red-100',
    CANCELLED: 'bg-gray-50 text-gray-500 border-gray-200',
    REFUNDED: 'bg-amber-50 text-amber-700 border-amber-100'
  })[status]

const supplierBadge = (status: string | null) => {
  if (status === 'CONFIRMED') return 'bg-emerald-50 text-emerald-700 border-emerald-100'
  if (status === 'FAILED') return 'bg-red-50 text-red-700 border-red-100'
  if (status === 'PLACING') return 'bg-blue-50 text-blue-700 border-blue-100'
  return 'bg-amber-50 text-amber-700 border-amber-100'
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
