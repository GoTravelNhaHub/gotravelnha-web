<template>
  <AuthShell
    title="Create your account"
    description="Free to join. Save trip plans and keep the family's details in one place."
    image="https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1600&q=80"
    headline="Plan family trips with less back-and-forth."
    subline="An account keeps your plans, travellers and bookings together."
    :points="['Save trip plans from the AI Travel Agent', 'Up to 10 AI trip plans a day (guests get 3)', 'One family profile with ages and needs', 'Bookings tracked in one place']"
  >
    <p v-if="referralCode" class="mb-5 rounded-xl border border-[#99E3EC] bg-[#E8F7FA] px-3.5 py-3 text-[14px] leading-5 text-[#005F6B]">
      You're joining with a referral code. The friend who invited you earns points when you sign up.
    </p>

    <button type="button" class="btn-secondary" :disabled="loadingGoogle" @click="handleGoogleSignUp">
      <svg class="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      {{ loadingGoogle ? 'Opening Google…' : 'Sign up with Google' }}
    </button>

    <div class="form-divider">or use your email</div>

    <form class="space-y-4" @submit.prevent="handleRegister">
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label for="register-first" class="form-label">First name</label>
          <input id="register-first" v-model="registerForm.firstName" type="text" autocomplete="given-name" required class="form-input" placeholder="Mai" />
        </div>
        <div>
          <label for="register-last" class="form-label">Last name</label>
          <input id="register-last" v-model="registerForm.lastName" type="text" autocomplete="family-name" required class="form-input" placeholder="Nguyen" />
        </div>
      </div>

      <div>
        <label for="register-username" class="form-label">Username</label>
        <input id="register-username" v-model="registerForm.username" type="text" autocomplete="username" required class="form-input" placeholder="mainguyen" />
      </div>

      <div>
        <label for="register-email" class="form-label">Email</label>
        <input id="register-email" v-model="registerForm.email" type="email" autocomplete="email" required class="form-input" placeholder="you@example.com" />
      </div>

      <div>
        <label for="register-password" class="form-label">Password</label>
        <div class="relative">
          <input
            id="register-password"
            v-model="registerForm.password"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="new-password"
            required
            minlength="8"
            aria-describedby="register-password-hint"
            class="form-input pr-12"
            placeholder="At least 8 characters"
          />
          <button
            type="button"
            class="absolute inset-y-0 right-0 inline-flex w-12 items-center justify-center rounded-r-xl text-[#64748B] hover:text-[#101D3A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#008A9B]"
            :aria-label="showPassword ? 'Hide password' : 'Show password'"
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
        <p id="register-password-hint" class="mt-1.5 text-[12px] text-[#64748B]">Use 8 or more characters.</p>
      </div>

      <label class="flex items-start gap-2.5 text-[14px] leading-5 text-[#334155]">
        <input v-model="registerForm.agreedToTerms" type="checkbox" required class="mt-0.5 h-4 w-4 shrink-0 rounded accent-[#008A9B]" />
        <span>
          I agree to the
          <NuxtLink to="/terms" target="_blank" class="text-link">Terms of Service</NuxtLink>
          and
          <NuxtLink to="/privacy" target="_blank" class="text-link">Privacy Policy</NuxtLink>
        </span>
      </label>

      <p v-if="error" class="alert-error" role="alert">{{ error }}</p>
      <p v-if="success" class="alert-success" role="status">{{ success }}</p>

      <button type="submit" class="btn-primary" :disabled="loading">
        <span v-if="loading" class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true"></span>
        {{ loading ? 'Creating account…' : 'Create account' }}
      </button>
    </form>

    <p class="mt-8 text-center text-[14px] text-[#64748B]">
      Already have an account?
      <NuxtLink to="/login" class="text-link">Sign in</NuxtLink>
    </p>
  </AuthShell>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthState } from '~/composables/useAuthState'
import { useReferral } from '~/composables/useReferral'
import AuthShell from '~/components/site/AuthShell.vue'

definePageMeta({
  layout: 'auth'
})

const router = useRouter()
const route = useRoute()
const { setUser } = useAuthState()
const { trackReferralClick } = useReferral()
const rawReferral = route.query.ref
const referralCode = typeof rawReferral === 'string' ? rawReferral : ''

const registerForm = ref({
  firstName: '',
  lastName: '',
  username: '',
  email: '',
  password: '',
  agreedToTerms: false
})

const loading = ref(false)
const loadingGoogle = ref(false)
const showPassword = ref(false)
const error = ref<string | null>(null)
const success = ref<string | null>(null)

const handleGoogleSignUp = async () => {
  loadingGoogle.value = true
  error.value = null
  success.value = null

  try {
    // Redirect to Google OAuth (same endpoint as sign-in)
    window.location.href = '/api/auth/google?redirect=' + encodeURIComponent('/user')
  } catch (err: any) {
    error.value = 'Failed to sign up with Google'
    console.error('Google sign-up error:', err)
    loadingGoogle.value = false
  }
}

const handleRegister = async () => {
  loading.value = true
  error.value = null
  success.value = null

  try {
    // Track referral click if code exists (before signup)
    if (referralCode) {
      await trackReferralClick(referralCode, registerForm.value.email)
    }

    // Call registration API
    const response = await $fetch('/api/auth/register', {
      method: 'POST',
      body: {
        firstName: registerForm.value.firstName,
        lastName: registerForm.value.lastName,
        username: registerForm.value.username,
        email: registerForm.value.email,
        password: registerForm.value.password,
        referralCode: referralCode || null
      }
    })

    // Set user in auth state
    setUser(response.user)
    
    success.value = 'Account created successfully! Redirecting...'
    
    // Redirect after 2 seconds
    setTimeout(() => {
      router.push('/user')
    }, 2000)
  } catch (err: any) {
    error.value = err.data?.message || 'Registration failed. Please try again.'
    console.error('Registration error:', err)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  // Track referral click if code exists in URL (before user fills form)
  if (referralCode) {
    await trackReferralClick(referralCode)
  }
})
</script>

