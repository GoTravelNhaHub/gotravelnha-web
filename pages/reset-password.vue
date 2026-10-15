<template>
  <AuthShell
    :title="t('auth.reset.title')"
    :description="t('auth.reset.description')"
    image="https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1600&q=80"
    :headline="t('auth.forgot.headline')"
    :subline="t('auth.forgot.subline')"
  >
    <div v-if="success" class="alert-success" role="status">
      <p class="font-semibold">{{ t('auth.reset.updated') }}</p>
      <p class="mt-1">{{ success }}</p>
    </div>

    <form v-else class="space-y-5" @submit.prevent="handleResetPassword">
      <div>
        <label for="reset-new" class="form-label">{{ t('auth.reset.newPassword') }}</label>
        <input id="reset-new" v-model="newPassword" type="password" autocomplete="new-password" required minlength="8" class="form-input" :placeholder="t('auth.reset.newPlaceholder')" />
      </div>
      <div>
        <label for="reset-confirm" class="form-label">{{ t('auth.reset.confirm') }}</label>
        <input id="reset-confirm" v-model="confirmPassword" type="password" autocomplete="new-password" required minlength="8" class="form-input" :placeholder="t('auth.reset.confirmPlaceholder')" />
      </div>

      <p v-if="error || tokenMissing" class="alert-error" role="alert">{{ error || t('auth.reset.invalidToken') }}</p>

      <button type="submit" class="btn-primary" :disabled="loading">
        <span v-if="loading" class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true"></span>
        {{ loading ? t('auth.reset.saving') : t('auth.reset.save') }}
      </button>
    </form>

    <div class="mt-8 text-center text-[14px]">
      <NuxtLink to="/login" class="text-link">{{ success ? t('auth.reset.continue') : t('auth.reset.back') }}</NuxtLink>
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
const { t } = useI18n()

const token = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const error = ref<string | null>(null)
const success = ref<string | null>(null)
// A flag, not text: onMounted runs before the visitor's language is applied
const tokenMissing = ref(false)

onMounted(() => {
  // Get token from URL query
  const tokenParam = route.query.token
  if (tokenParam && typeof tokenParam === 'string') {
    token.value = tokenParam
  } else {
    tokenMissing.value = true
  }
})

const handleResetPassword = async () => {
  loading.value = true
  error.value = null
  success.value = null

  // Validate passwords match
  if (newPassword.value !== confirmPassword.value) {
    error.value = t('auth.reset.mismatch')
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
    
    success.value = t('auth.reset.success')
    
    // Auto-redirect after 3 seconds
    setTimeout(() => {
      router.push('/login')
    }, 3000)
  } catch (err: any) {
    error.value = err.data?.message || t('auth.reset.failed')
    console.error('Reset password error:', err)
  } finally {
    loading.value = false
  }
}
</script>

