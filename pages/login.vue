<template>
  <AuthShell
    :title="t('auth.login.title')"
    :description="t('auth.login.description')"
    image="https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?auto=format&fit=crop&w=1600&q=80"
    :headline="t('auth.login.headline')"
    :subline="t('auth.login.subline')"
    :points="tm<string[]>('auth.login.points')"
  >
    <p v-if="failed" class="alert-error mb-5" role="alert">{{ t('auth.redirect.failed') }}</p>
    <p v-else class="mb-5 flex items-center gap-2.5 text-[14px] text-[#64748B]" role="status">
      <span class="h-4 w-4 animate-spin rounded-full border-2 border-[#CBD5E1] border-t-[#0066E4]" aria-hidden="true"></span>
      {{ t('auth.redirect.opening') }}
    </p>

    <a :href="href" class="btn-primary">{{ t('auth.login.submit') }}</a>

    <p class="mt-8 text-center text-[14px] text-[#64748B]">
      {{ t('auth.login.newHere') }}
      <NuxtLink :to="{ path: '/register', query: route.query.redirect ? { redirect: route.query.redirect } : {} }" class="text-link">{{ t('auth.login.create') }}</NuxtLink>
    </p>
  </AuthShell>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AuthShell from '~/components/site/AuthShell.vue'

// Sign-in happens on auth.gotravelnha.com (Keycloak), through the API. The site sends visitors there
// directly with goToLogin(); this page only keeps old /login?redirect= links working, and shows a
// retry button when a sign-in keeps coming back without a session (goToLogin's loop guard).
definePageMeta({
  layout: 'auth'
})

const route = useRoute()
const { t, tm } = useI18n()

// Only same-site paths, so ?redirect= can't send users to another domain
const safeRedirect = () => {
  const redirect = route.query.redirect
  return typeof redirect === 'string' && redirect.startsWith('/') && !redirect.startsWith('//') && !redirect.startsWith('/\\') ? redirect : '/user'
}

const { refreshUser } = useAuthState()
const failed = computed(() => Boolean(route.query.auth_error))
const href = computed(() => loginUrl(safeRedirect()))

onMounted(async () => {
  if (failed.value) return
  // Already signed in (e.g. back from Keycloak): go where the visitor was heading
  if (await refreshUser()) return navigateTo(safeRedirect(), { replace: true })
  await goToLogin(safeRedirect(), { automatic: true })
})
</script>
