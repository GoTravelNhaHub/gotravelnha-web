<template>
  <div class="mx-auto max-w-md py-10 font-brand">
    <section class="rounded-2xl border border-[#E2E8F0] bg-white p-6 text-center">
      <h1 class="text-[22px] font-bold text-[#101D3A]">{{ done ? "You're unsubscribed" : 'Unsubscribe from emails' }}</h1>
      <p class="mt-2 text-[14px] leading-[22px] text-[#64748B]">
        {{ done ? `We won't send newsletter emails to ${email} any more.` : `Stop newsletter emails to ${email || 'this address'}?` }}
      </p>
      <!-- A button, not an automatic action, so email link scanners can't unsubscribe people -->
      <button v-if="!done" type="button" class="btn-primary mt-5" :disabled="loading || !email" @click="unsubscribe">
        {{ loading ? 'Unsubscribing…' : 'Unsubscribe' }}
      </button>
      <p v-if="error" class="alert-error mt-4" role="alert">{{ error }}</p>
      <NuxtLink to="/explore" class="text-link mt-5 inline-block text-[14px]">Back to GoTravelNha</NuxtLink>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const email = typeof route.query.email === 'string' ? route.query.email : ''
const token = typeof route.query.token === 'string' ? route.query.token : ''
const loading = ref(false)
const done = ref(false)
const error = ref('')

const unsubscribe = async () => {
  try {
    loading.value = true
    error.value = ''
    await $fetch('/api/newsletter/unsubscribe', { method: 'POST', body: { email, token } })
    done.value = true
  } catch (err: any) {
    error.value = err?.data?.message || 'Could not unsubscribe. Please try again.'
  } finally {
    loading.value = false
  }
}

useHead({ title: 'Unsubscribe | GoTravelNha', meta: [{ name: 'robots', content: 'noindex' }] })
</script>
