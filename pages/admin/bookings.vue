<template>
  <div class="min-h-full bg-gray-50 pb-12">
    <div class="px-4 sm:px-6 lg:px-8 py-5 space-y-6">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">Bookings</h2>
          <p class="text-sm text-gray-600">
            Paid self-checkout bookings the supplier has not confirmed. Retry the supplier order, or mark it fulfilled after ordering by hand.
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
                <div class="text-xs text-gray-400 font-mono">{{ booking.id }}</div>
              </td>
              <td class="px-4 py-3 text-gray-700">
                <div>{{ booking.customerName || '—' }}</div>
                <div class="text-xs text-gray-500">{{ booking.customerEmail || '—' }}</div>
              </td>
              <td class="px-4 py-3 text-gray-700 whitespace-nowrap">
                {{ booking.currency }} {{ booking.amount.toFixed(2) }}
                <div v-if="booking.refundedAmount" class="text-xs text-red-600">
                  Refunded {{ booking.refundedAmount.toFixed(2) }}
                </div>
              </td>
              <td class="px-4 py-3">
                <span :class="['px-2 py-1 rounded-full text-xs font-semibold border', paymentBadge(booking.status)]">
                  {{ booking.status }}
                </span>
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
                <div v-if="booking.status === 'PAID' && booking.supplierStatus !== 'CONFIRMED'" class="flex flex-col gap-2">
                  <button
                    v-if="!booking.supplierStatus || ['QUEUED', 'FAILED'].includes(booking.supplierStatus)"
                    @click="runAction(booking, 'retry-supplier')"
                    :disabled="actionId === booking.id"
                    class="px-3 py-1 rounded-lg bg-blue-600 text-white text-xs hover:bg-blue-700 disabled:opacity-60"
                  >
                    Send to supplier
                  </button>
                  <button
                    @click="runAction(booking, 'mark-fulfilled')"
                    :disabled="actionId === booking.id"
                    class="px-3 py-1 rounded-lg bg-emerald-600 text-white text-xs hover:bg-emerald-700 disabled:opacity-60"
                  >
                    Mark fulfilled
                  </button>
                </div>
                <span v-else class="text-xs text-gray-400">—</span>
              </td>
            </tr>
            <tr v-if="!loading && bookings.length === 0">
              <td colspan="7" class="px-4 py-6 text-center text-gray-500">
                {{ view === 'attention' ? 'Nothing waiting on the supplier.' : 'No bookings yet.' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

interface AdminBooking {
  id: string
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
  createdAt: string
}

const view = ref<'attention' | 'all'>('attention')
const bookings = ref<AdminBooking[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const actionId = ref<string | null>(null)

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

const runAction = async (booking: AdminBooking, action: 'retry-supplier' | 'mark-fulfilled') => {
  let supplierOrderId: string | undefined
  if (action === 'mark-fulfilled') {
    const input = window.prompt('Supplier order / ticket reference (optional):', booking.supplierOrderId || '')
    if (input === null) return
    supplierOrderId = input
  }

  try {
    actionId.value = booking.id
    error.value = null
    await $fetch(`/api/admin/bookings/${booking.id}`, {
      method: 'POST',
      body: { action, supplierOrderId }
    })
    await fetchBookings()
  } catch (err: any) {
    console.error('Booking action failed:', err)
    error.value = err?.data?.message || err?.message || 'Booking action failed.'
  } finally {
    actionId.value = null
  }
}

watch(view, fetchBookings)

onMounted(() => {
  fetchBookings()
})
</script>
