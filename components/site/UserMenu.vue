<template>
  <ClientOnly>
    <div v-if="isAuthenticated" class="relative font-brand" data-user-menu>
      <button
        type="button"
        class="flex items-center gap-2 rounded-full p-0.5 transition hover:bg-cm-soft"
        :aria-label="t('common.nav.profile')"
        :aria-expanded="open"
        aria-haspopup="menu"
        @click="open = !open"
      >
        <span class="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#3D8EF5] to-cm-active text-[17px] font-semibold text-white shadow-[0_2px_8px_rgba(16,32,72,0.25)] ring-2 ring-white">{{ initial }}</span>
      </button>
      <Transition enter-active-class="transition duration-150 ease-out" enter-from-class="translate-y-1 opacity-0" leave-active-class="transition duration-100 ease-in" leave-to-class="translate-y-1 opacity-0">
        <div v-if="open" class="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-cm-lg border border-cm-line bg-white shadow-cm-panel" role="menu">
          <div class="flex items-center gap-3 border-b border-cm-line bg-cm-canvas px-4 py-3.5">
            <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#3D8EF5] to-cm-active text-[16px] font-semibold text-white">{{ initial }}</span>
            <span class="min-w-0 leading-tight">
              <span class="block truncate text-[15px] font-semibold text-cm-ink">{{ displayName }}</span>
              <span v-if="user?.email" class="mt-0.5 block truncate text-[12.5px] text-cm-muted">{{ user.email }}</span>
            </span>
          </div>
          <ul class="py-1.5">
            <li v-for="link in links" :key="link.to">
              <NuxtLink :to="link.to" class="flex items-center gap-3 px-4 py-2.5 text-[14.5px] font-medium text-cm-body hover:bg-cm-canvas hover:text-cm-active" role="menuitem" @click="open = false">
                <CmIcon :name="link.icon" :size="18" class="text-[#5B6478]" />{{ link.label }}
              </NuxtLink>
            </li>
          </ul>
          <div class="border-t border-cm-line py-1.5">
            <button type="button" class="flex w-full items-center gap-3 px-4 py-2.5 text-left text-[14.5px] font-medium text-red-600 hover:bg-red-50" role="menuitem" @click="logout">
              <CmIcon name="logout" :size="18" />{{ t('common.nav.logout') }}
            </button>
          </div>
        </div>
      </Transition>
    </div>
    <a v-else href="/login" class="cm-btn-primary h-10 whitespace-nowrap px-4 text-[14px] sm:px-5" @click.prevent="goToLogin('/user')">{{ t('common.nav.login') }}</a>
    <template #fallback>
      <span class="block h-11 w-11 rounded-full bg-cm-soft"></span>
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import CmIcon from '~/components/community/feed/CmIcon.vue'

const { t } = useI18n()
const route = useRoute()
const { user, isAuthenticated, isAdmin, clearUser } = useAuthState()
const { community } = useAppNav()
const open = ref(false)

const displayName = computed(() => [user.value?.firstName, user.value?.lastName].filter(Boolean).join(' ') || user.value?.username || '')
const initial = computed(() => String(user.value?.firstName || user.value?.username || '?').charAt(0).toUpperCase())
const links = computed(() => [
  { to: '/user', label: t('common.nav.profile'), icon: 'user' },
  ...(community.value ? [{ to: '/travelers/me', label: t('community.profile.menu'), icon: 'users' }] : []),
  { to: '/mytrip', label: t('account.profile.links.trips'), icon: 'trips' },
  { to: '/user/family', label: t('account.profile.links.family'), icon: 'users' },
  ...(isAdmin.value ? [{ to: String(useRuntimeConfig().public.adminUrl), label: t('common.nav.admin'), icon: 'lock' }] : [])
])

const logout = () => {
  open.value = false
  // Navigates to the API logout, which ends the Keycloak session and returns home
  clearUser('/')
}

watch(() => route.fullPath, () => (open.value = false))
const onDocumentClick = (event: MouseEvent) => {
  if (open.value && !(event.target as HTMLElement).closest('[data-user-menu]')) open.value = false
}
const onKey = (event: KeyboardEvent) => {
  if (event.key === 'Escape') open.value = false
}
onMounted(() => {
  document.addEventListener('click', onDocumentClick)
  document.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick)
  document.removeEventListener('keydown', onKey)
})
</script>
