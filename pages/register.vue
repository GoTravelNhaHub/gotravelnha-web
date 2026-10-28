<template>
  <AuthShell
    :title="t('auth.register.title')"
    :description="t('auth.register.description')"
    image="https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1600&q=80"
    :headline="t('auth.register.headline')"
    :subline="t('auth.register.subline')"
    :points="tm<string[]>('auth.register.points')"
  >
    <p v-if="referralCode" class="mb-5 rounded-xl border border-[#CFE0F7] bg-[#EAF2FC] px-3.5 py-3 text-[14px] leading-5 text-[#0642D2]">
      {{ t('auth.register.referral') }}
    </p>

    <p v-if="failed" class="alert-error mb-5" role="alert">{{ t('auth.redirect.failed') }}</p>
    <p v-else class="mb-5 flex items-center gap-2.5 text-[14px] text-[#64748B]" role="status">
      <span class="h-4 w-4 animate-spin rounded-full border-2 border-[#CBD5E1] border-t-[#0066E4]" aria-hidden="true"></span>
      {{ t('auth.redirect.opening') }}
    </p>

    <a :href="href" class="btn-primary">{{ t('auth.register.submit') }}</a>

    <p class="mt-8 text-center text-[14px] text-[#64748B]">
      {{ t('auth.register.haveAccount') }}
      <NuxtLink to="/login" class="text-link">{{ t('auth.register.signIn') }}</NuxtLink>
    </p>
  </AuthShell>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useReferral } from '~/composables/useReferral'
import AuthShell from '~/components/site/AuthShell.vue'

// Accounts are created on auth.gotravelnha.com (Keycloak registration page). A ?ref= code rides
// along through the login and is credited by the API when the new account is created.
definePageMeta({
  layout: 'auth'
})

const route = useRoute()
const { t, tm } = useI18n()
const { trackReferralClick } = useReferral()
const rawReferral = route.query.ref
const referralCode = typeof rawReferral === 'string' ? rawReferral : ''

const safeRedirect = () => {
  const redirect = route.query.redirect
  return typeof redirect === 'string' && redirect.startsWith('/') && !redirect.startsWith('//') && !redirect.startsWith('/\\') ? redirect : '/user'
}

const failed = computed(() => Boolean(route.query.auth_error))
const href = computed(() => loginUrl(safeRedirect(), { register: true, ref: referralCode || undefined }))

onMounted(async () => {
  if (failed.value) return
  if (referralCode) await trackReferralClick(referralCode)
  window.location.replace(href.value)
})
</script>
