<template>
  <AuthShell
    :title="t('auth.forgot.title')"
    :description="t('auth.forgot.description')"
    image="https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1600&q=80"
    :headline="t('auth.forgot.headline')"
    :subline="t('auth.forgot.subline')"
  >
    <div v-if="success" class="alert-success" role="status">
      <p class="font-semibold">{{ t('auth.forgot.checkEmail') }}</p>
      <p class="mt-1">{{ success }}</p>
    </div>

    <form v-else class="space-y-5" @submit.prevent="handleForgotPassword">
      <div>
        <label for="forgot-email" class="form-label">{{ t('auth.forgot.email') }}</label>
        <input id="forgot-email" v-model="email" type="email" autocomplete="email" required class="form-input" placeholder="you@example.com" />
      </div>

      <p v-if="error" class="alert-error" role="alert">{{ error }}</p>

      <button type="submit" class="btn-primary" :disabled="loading">
        <span v-if="loading" class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true"></span>
        {{ loading ? t('auth.forgot.sending') : t('auth.forgot.send') }}
      </button>
    </form>

    <div class="mt-8 flex flex-col items-center gap-2 text-[14px] text-[#64748B]">
      <NuxtLink to="/login" class="text-link">{{ t('auth.forgot.backToSignIn') }}</NuxtLink>
      <p>
        {{ t('auth.forgot.noAccount') }}
        <NuxtLink to="/register" class="text-link">{{ t('auth.forgot.createOne') }}</NuxtLink>
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

const { t } = useI18n()
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
    
    success.value = t('auth.forgot.sent', { email: email.value })
  } catch (err: any) {
    // Still show success message to prevent email enumeration
    success.value = t('auth.forgot.sentMaybe')
    console.error('Forgot password error:', err)
  } finally {
    loading.value = false
  }
}
</script>

