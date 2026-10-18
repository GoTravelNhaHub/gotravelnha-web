<template>
  <AuthShell
    :title="t('auth.login.title')"
    :description="t('auth.login.description')"
    image="https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?auto=format&fit=crop&w=1600&q=80"
    :headline="t('auth.login.headline')"
    :subline="t('auth.login.subline')"
    :points="tm<string[]>('auth.login.points')"
  >
    <button type="button" class="btn-secondary" :disabled="loadingGoogle" @click="handleGoogleSignIn">
      <svg class="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      {{ loadingGoogle ? t('auth.google.opening') : t('auth.google.continue') }}
    </button>

    <div class="form-divider">{{ t('auth.login.divider') }}</div>

    <form class="space-y-5" @submit.prevent="handleLogin">
      <div>
        <label for="login-username" class="form-label">{{ t('auth.login.username') }}</label>
        <input
          id="login-username"
          v-model="loginForm.username"
          type="text"
          autocomplete="username"
          required
          class="form-input"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <div class="flex items-center justify-between gap-2">
          <label for="login-password" class="form-label">{{ t('auth.login.password') }}</label>
          <NuxtLink to="/forgot-password" class="text-link mb-1.5 text-[13px]">{{ t('auth.login.forgot') }}</NuxtLink>
        </div>
        <div class="relative">
          <input
            id="login-password"
            v-model="loginForm.password"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="current-password"
            required
            class="form-input pr-12"
            :placeholder="t('auth.login.passwordPlaceholder')"
          />
          <button
            type="button"
            class="absolute inset-y-0 right-0 inline-flex w-12 items-center justify-center rounded-r-xl text-[#64748B] hover:text-[#0A1024] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066E4]"
            :aria-label="showPassword ? t('auth.password.hide') : t('auth.password.show')"
            :aria-pressed="showPassword"
            @click="showPassword = !showPassword"
          >
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
              <path v-if="showPassword" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.1A9.8 9.8 0 0 1 12 5c5 0 8.5 4.5 9.5 7a13 13 0 0 1-2.7 3.9M6.2 6.2C4.3 7.6 3 9.6 2.5 12c1 2.5 4.5 7 9.5 7 1.7 0 3.2-.5 4.5-1.2" />
              <template v-else>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M2.5 12C3.5 9.5 7 5 12 5s8.5 4.5 9.5 7c-1 2.5-4.5 7-9.5 7s-8.5-4.5-9.5-7Z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
              </template>
            </svg>
          </button>
        </div>
      </div>

      <label class="flex items-center gap-2.5 text-[14px] text-[#334155]">
        <input v-model="loginForm.rememberMe" type="checkbox" class="h-4 w-4 rounded accent-[#0066E4]" />
        {{ t('auth.login.remember') }}
      </label>

      <p v-if="error" class="alert-error" role="alert">{{ error }}</p>

      <button type="submit" class="btn-primary" :disabled="loading">
        <span v-if="loading" class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true"></span>
        {{ loading ? t('auth.login.submitting') : t('auth.login.submit') }}
      </button>
    </form>

    <p class="mt-8 text-center text-[14px] text-[#64748B]">
      {{ t('auth.login.newHere') }}
      <NuxtLink to="/register" class="text-link">{{ t('auth.login.create') }}</NuxtLink>
    </p>
  </AuthShell>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthState } from '~/composables/useAuthState'
import AuthShell from '~/components/site/AuthShell.vue'

definePageMeta({
  layout: 'auth'
})

const router = useRouter()
const { t, tm } = useI18n()

// Only same-site paths, so ?redirect= can't send users to another domain
const safeRedirect = () => {
  const redirect = new URLSearchParams(window.location.search).get('redirect')
  return redirect && redirect.startsWith('/') && !redirect.startsWith('//') && !redirect.startsWith('/\\') ? redirect : null
}
const { setUser } = useAuthState()

const loginForm = ref({
  username: '',
  password: '',
  rememberMe: false
})

const loading = ref(false)
const loadingGoogle = ref(false)
const showPassword = ref(false)
const error = ref<string | null>(null)

const handleGoogleSignIn = async () => {
  loadingGoogle.value = true
  error.value = null

  try {
    // Redirect to Google OAuth
    window.location.href = '/api/auth/google'
  } catch (err: any) {
    error.value = t('auth.google.failedIn')
    console.error('Google sign-in error:', err)
    loadingGoogle.value = false
  }
}

// Check for OAuth success/error in URL params
const checkOAuthResult = () => {
  const urlParams = new URLSearchParams(window.location.search)
  const success = urlParams.get('success')
  const errorParam = urlParams.get('error')

  if (errorParam) {
    error.value = decodeURIComponent(errorParam)
    // Clean up URL
    window.history.replaceState({}, '', '/login')
  } else if (success === 'true') {
    // Fetch user data and log them in
    loadUserAndRedirect()
  }
}

const loadUserAndRedirect = async () => {
  try {
    const response: any = await $fetch('/api/auth/me')
    if (response && response.user) {
      setUser(response.user)
      
      // Redirect based on role
      if (safeRedirect()) {
        router.push(safeRedirect()!)
      } else if (response.user.role === 'ADMIN') {
        router.push('/admin')
      } else {
        router.push('/user')
      }
    } else {
      error.value = t('auth.login.completeFailed')
    }
  } catch (err) {
    error.value = t('auth.login.completeFailed')
    console.error('Failed to load user:', err)
  }
}

const handleLogin = async () => {
  loading.value = true
  error.value = null

  try {
    // Call authentication API
    const response = await $fetch('/api/auth/login', {
      method: 'POST',
      body: {
        username: loginForm.value.username,
        password: loginForm.value.password
      }
    })

    // Set user in auth state
    setUser(response.user)

    // Redirect based on role
    if (safeRedirect()) {
      router.push(safeRedirect()!)
    } else if (response.role === 'ADMIN') {
      router.push('/admin')
    } else {
      router.push('/user')
    }
  } catch (err: any) {
    error.value = err.data?.message || t('auth.login.invalid')
    console.error('Login error:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  checkOAuthResult()
})
</script>

