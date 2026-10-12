<template>
  <div class="min-h-full bg-gray-50 pb-12">
    <div class="px-4 sm:px-6 lg:px-8 py-5 space-y-6">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">Support</h2>
          <p class="text-sm text-gray-600">Messages from the contact form. Reply by email, then mark them handled.</p>
        </div>
        <div class="flex items-center gap-3">
          <select v-model="view" class="px-3 py-2 border border-gray-300 rounded-lg text-sm">
            <option value="open">Open</option>
            <option value="all">All</option>
          </select>
          <button
            @click="load"
            :disabled="loading"
            class="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {{ loading ? 'Refreshing…' : 'Refresh' }}
          </button>
        </div>
      </div>

      <div v-if="error" class="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">{{ error }}</div>

      <div class="space-y-3">
        <div v-for="message in messages" :key="message.id" class="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div class="font-semibold text-gray-900">{{ message.name }}</div>
              <a :href="replyLink(message)" class="text-sm text-blue-600 hover:underline">{{ message.email }}</a>
              <div class="text-xs text-gray-500 mt-1">
                {{ formatDate(message.createdAt) }}
                <span v-if="message.reference"> · Booking <span class="font-mono">{{ message.reference }}</span></span>
                <span v-if="!message.emailedAt" class="text-amber-700"> · email notification failed</span>
              </div>
            </div>
            <button
              @click="mark(message, message.handledAt ? 'reopen' : 'handled')"
              :class="[
                'px-3 py-1 rounded-lg text-xs',
                message.handledAt ? 'border border-gray-300 text-gray-700' : 'bg-emerald-600 text-white hover:bg-emerald-700'
              ]"
            >
              {{ message.handledAt ? 'Reopen' : 'Mark handled' }}
            </button>
          </div>
          <p class="mt-3 text-sm text-gray-800 whitespace-pre-wrap">{{ message.message }}</p>
        </div>
        <div v-if="!loading && messages.length === 0" class="bg-white border border-dashed border-gray-300 rounded-xl p-8 text-center text-gray-500">
          {{ view === 'open' ? 'No open messages.' : 'No messages yet.' }}
        </div>
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

interface ContactMessage {
  id: string
  name: string
  email: string
  message: string
  reference: string | null
  emailedAt: string | null
  handledAt: string | null
  createdAt: string
}

const view = ref<'open' | 'all'>('open')
const messages = ref<ContactMessage[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('en-SG', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))

const replyLink = (message: ContactMessage) =>
  `mailto:${message.email}?subject=${encodeURIComponent(message.reference ? `Re: booking ${message.reference}` : 'Re: your message to GoTravelNha')}`

const load = async () => {
  try {
    loading.value = true
    error.value = null
    const response = await $fetch<{ data: ContactMessage[] }>('/api/admin/support/messages', { query: { view: view.value } })
    messages.value = response.data
  } catch (err: any) {
    error.value = err?.data?.message || 'Failed to load messages.'
  } finally {
    loading.value = false
  }
}

const mark = async (message: ContactMessage, action: 'handled' | 'reopen') => {
  try {
    await $fetch(`/api/admin/support/messages/${message.id}`, { method: 'POST', body: { action } })
    await load()
  } catch (err: any) {
    error.value = err?.data?.message || 'Could not update the message.'
  }
}

watch(view, load)
onMounted(load)
</script>
