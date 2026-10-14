<template>
  <AuthShell
    title="Choose a new password"
    description="Use 8 or more characters. You'll sign in with it next time."
    image="https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1600&q=80"
    headline="Back to planning in a minute."
    subline="Your saved trips and family profile stay as they are."
  >
    <div v-if="success" class="auth-success" role="status">
      <p class="font-semibold">Password updated</p>
      <p class="mt-1">{{ success }}</p>
    </div>

    <form v-else class="space-y-5" @submit.prevent="handleResetPassword">
      <div>
        <label for="reset-new" class="auth-label">New password</label>
        <input id="reset-new" v-model="newPassword" type="password" autocomplete="new-password" required minlength="8" class="auth-input" placeholder="At least 8 characters" />
      </div>
      <div>
        <label for="reset-confirm" class="auth-label">Confirm new password</label>
        <input id="reset-confirm" v-model="confirmPassword" type="password" autocomplete="new-password" required minlength="8" class="auth-input" placeholder="Type it again" />
      </div>

      <p v-if="error" class="auth-error" role="alert">{{ error }}</p>

      <button type="submit" class="auth-primary" :disabled="loading">
        <span v-if="loading" class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true"></span>
        {{ loading ? 'Saving…' : 'Save new password' }}
      </button>
    </form>

    <div class="mt-8 text-center text-[14px]">
      <NuxtLink to="/login" class="auth-link">{{ success ? 'Continue to sign in' : 'Back to sign in' }}</NuxtLink>
    </div>
  </AuthShell>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AuthShell from '~/components/site/AuthShell.vue'

definePageMeta({
  layout: 'auth'
})

const route = useRoute()
const router = useRouter()

const token = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const error = ref<string | null>(null)
const success = ref<string | null>(null)

onMounted(() => {
  // Get token from URL query
  const tokenParam = route.query.token
  if (tokenParam && typeof tokenParam === 'string') {
    token.value = tokenParam
  } else {
    error.value = 'Invalid or missing reset token. Please request a new password reset.'
  }
})

const handleResetPassword = async () => {
  loading.value = true
  error.value = null
  success.value = null

  // Validate passwords match
  if (newPassword.value !== confirmPassword.value) {
    error.value = 'Passwords do not match'
    loading.value = false
    return
  }

  try {
    await $fetch('/api/auth/reset-password', {
      method: 'POST',
      body: {
        token: token.value,
        password: newPassword.value
      }
    })
    
    success.value = 'Your password has been reset successfully. You can now sign in with your new password.'
    
    // Auto-redirect after 3 seconds
    setTimeout(() => {
      router.push('/login')
    }, 3000)
  } catch (err: any) {
    error.value = err.data?.message || 'Failed to reset password. The link may be invalid or expired.'
    console.error('Reset password error:', err)
  } finally {
    loading.value = false
  }
}
</script>

