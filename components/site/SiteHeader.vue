<template>
  <header class="sticky top-0 z-50 border-b border-[#EEF2F8] bg-white/95 font-brand shadow-[0_2px_12px_-8px_rgba(16,32,72,0.18)] backdrop-blur supports-[backdrop-filter]:bg-white/90 print:hidden">
    <div class="flex h-16 items-center gap-2 px-3 sm:gap-3 sm:px-5 lg:h-[82px] lg:gap-6 xl:pl-[28px] xl:pr-[34px]">
      <button
        type="button"
        class="-ml-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-cm-ink hover:bg-cm-soft xl:hidden"
        :aria-label="t('community.feed.nav.openMenu')"
        :aria-expanded="menuOpen"
        @click="menuOpen = true"
      >
        <CmIcon name="menu" :size="24" />
      </button>

      <NuxtLink to="/" class="flex min-w-0 shrink items-center" aria-label="GoTravelNha">
        <Wordmark :logo-size="40" text-class="text-[19px] lg:text-[22.5px]" tagline />
      </NuxtLink>

      <form v-if="community" role="search" class="ml-auto hidden h-[42px] min-w-0 flex-1 items-center gap-3 rounded-full bg-cm-search px-5 md:flex lg:hidden xl:ml-[46px] xl:flex xl:max-w-[535px]" @submit.prevent="submitSearch">
        <CmIcon name="search" :size="20" class="text-[#4A5468]" />
        <label for="site-header-search" class="sr-only">{{ t('community.feed.searchLabel') }}</label>
        <input id="site-header-search" v-model="query" type="search" maxlength="80" enterkeyhint="search" :placeholder="t('community.feed.searchPlaceholder')" class="h-full min-w-0 flex-1 bg-transparent text-[15px] text-cm-ink outline-none placeholder:text-[#5B6478]" />
      </form>

      <nav class="ml-auto hidden h-full items-stretch lg:flex" :aria-label="t('community.feed.nav.label')">
        <template v-for="item in header" :key="item.key">
          <NuxtLink
            v-if="item.to"
            :to="item.to"
            class="relative flex items-center gap-[6px] whitespace-nowrap px-[11px] text-[16px] font-medium text-[#2B3245] hover:text-cm-active xl:px-[17px]"
            :class="isActive(item) && 'font-semibold !text-cm-active after:absolute after:inset-x-0 after:bottom-[17px] after:h-[3px] after:rounded-full after:bg-cm-primary'"
            :aria-current="isActive(item) ? 'page' : undefined"
          >
            <NavIcon :item="item" :active="isActive(item)" :size="19" />
            {{ item.label }}
          </NuxtLink>
          <span v-else class="flex cursor-default items-center gap-[6px] whitespace-nowrap px-[11px] text-[16px] font-medium text-[#2B3245] xl:px-[17px]" :title="t('community.feed.nav.comingSoon')" aria-disabled="true">
            <NavIcon :item="item" :size="19" />
            {{ item.label }}
          </span>
        </template>
      </nav>

      <div class="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2 lg:ml-[14px] lg:gap-[14px]">
        <LanguageSwitcher class="hidden sm:block" />
        <span v-if="community" class="hidden h-10 w-10 cursor-default items-center justify-center rounded-full text-[#2B3245] sm:flex" :title="t('community.feed.nav.comingSoon')" aria-disabled="true">
          <CmIcon name="bell" :size="23" />
          <span class="sr-only">{{ t('community.feed.nav.notifications') }}</span>
        </span>
        <UserMenu />
      </div>
    </div>

    <!-- Phone and tablet menu: the side rail, plus language -->
    <Teleport to="body">
      <Transition enter-active-class="transition-opacity duration-200" enter-from-class="opacity-0" leave-active-class="transition-opacity duration-150" leave-to-class="opacity-0">
        <div v-if="menuOpen" class="fixed inset-0 z-[60] bg-[#0A1024]/45 backdrop-blur-sm" aria-hidden="true" @click="menuOpen = false"></div>
      </Transition>
      <Transition enter-active-class="transition-transform duration-300 ease-out" enter-from-class="-translate-x-full" leave-active-class="transition-transform duration-200 ease-in" leave-to-class="-translate-x-full">
        <aside v-if="menuOpen" class="fixed inset-y-0 left-0 z-[70] flex w-[86vw] max-w-[320px] flex-col bg-white font-brand shadow-2xl" role="dialog" aria-modal="true" :aria-label="t('community.feed.nav.label')">
          <div class="flex items-center justify-between border-b border-cm-line px-4 py-3">
            <Wordmark :logo-size="32" :text-size="19" />
            <button type="button" class="flex h-11 w-11 items-center justify-center rounded-xl text-cm-ink hover:bg-cm-soft" :aria-label="t('community.feed.nav.closeMenu')" @click="menuOpen = false"><CmIcon name="close" :size="22" /></button>
          </div>
          <div class="flex-1 overflow-y-auto px-3 py-4">
            <SideNav @navigate="menuOpen = false" />
            <div class="mt-5 px-3"><LanguageSwitcher /></div>
          </div>
        </aside>
      </Transition>
    </Teleport>
  </header>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CmIcon from '~/components/community/feed/CmIcon.vue'
import LanguageSwitcher from '~/components/site/LanguageSwitcher.vue'
import NavIcon from '~/components/site/NavIcon.vue'
import SideNav from '~/components/site/SideNav.vue'
import UserMenu from '~/components/site/UserMenu.vue'
import Wordmark from '~/components/site/Wordmark.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const { header, community, isActive } = useAppNav()

const menuOpen = ref(false)
const query = ref(typeof route.query.q === 'string' ? route.query.q : '')
watch(() => route.query.q, (value) => (query.value = typeof value === 'string' ? value : ''))
watch(() => route.fullPath, () => (menuOpen.value = false))
watch(menuOpen, (open) => {
  if (import.meta.client) document.body.style.overflow = open ? 'hidden' : ''
})

const submitSearch = () => {
  const q = query.value.trim()
  router.push({ path: '/community', query: q ? { q } : {} })
}
</script>
