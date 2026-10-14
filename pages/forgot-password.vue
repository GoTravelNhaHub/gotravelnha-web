<template>
  <AuthShell
    title="Reset your password"
    description="Enter the email on your account and we'll send you a link to set a new password."
    image="https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1600&q=80"
    headline="Back to planning in a minute."
    subline="Your saved trips and family profile stay as they are."
  >
    <div v-if="success" class="alert-success" role="status">
      <p class="font-semibold">Check your email</p>
      <p class="mt-1">{{ success }}</p>
    </div>

    <form v-else class="space-y-5" @submit.prevent="handleForgotPassword">
      <div>
        <label for="forgot-email" class="form-label">Email</label>
        <input id="forgot-email" v-model="email" type="email" autocomplete="email" required class="form-input" placeholder="you@example.com" />
      </div>

      <p v-if="error" class="alert-error" role="alert">{{ error }}</p>

      <button type="submit" class="btn-primary" :disabled="loading">
        <span v-if="loading" class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true"></span>
        {{ loading ? 'Sending…' : 'Send reset link' }}
      </button>
    </form>

    <div class="mt-8 flex flex-col items-center gap-2 text-[14px] text-[#64748B]">
      <NuxtLink to="/login" class="text-link">Back to sign in</NuxtLink>
      <p>
        No account yet?
        <NuxtLink to="/register" class="text-link">Create one</NuxtLink>
      </p>
    </div>
  </AuthShell>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AuthShell from '~/components/site/AuthShell.vue'

definePageMeta({
  layout: 'auth'
})

const email = ref('')
const loading = ref(false)
const error = ref<string | null>(null)
const success = ref<string | null>(null)

const handleForgotPassword = async () => {
  loading.value = true
  error.value = null
  success.value = null

  try {
    await $fetch('/api/auth/forgot-password', {
      method: 'POST',
      body: { email: email.value }
    })
    
    success.value = `Password reset instructions have been sent to ${email.value}. Please check your email and follow the instructions to reset your password.`
  } catch (err: any) {
    // Still show success message to prevent email enumeration
    success.value = 'If an account exists with this email, reset instructions have been sent. Please check your inbox.'
    console.error('Forgot password error:', err)
  } finally {
    loading.value = false
  }
}
</script>

