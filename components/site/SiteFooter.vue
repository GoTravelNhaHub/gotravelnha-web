<template>
  <footer class="w-full bg-[#0A1024] font-brand text-white print:hidden">
    <div class="site-shell py-7 sm:py-12">
      <!-- Phones: Plan and Help side by side, products on one line, so the footer stays short -->
      <div class="grid grid-cols-2 gap-x-6 gap-y-5 md:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))] md:gap-8">
        <div class="col-span-2 max-w-sm md:col-span-1">
          <Wordmark light tagline :logo-size="32" :text-size="19" />
          <p class="mt-2 text-[13px] leading-5 text-white/70 sm:mt-3 sm:text-[14px] sm:leading-[22px]">
            {{ t('common.footer.tagline') }}
          </p>
        </div>
        <nav :aria-label="t('common.footer.plan')">
          <h3 class="text-[12px] font-semibold uppercase tracking-[0.08em] text-white/50">{{ t('common.footer.plan') }}</h3>
          <ul class="mt-1.5 sm:mt-3 sm:space-y-1">
            <li v-for="item in navItems" :key="item.to">
              <NuxtLink :to="item.to" class="inline-flex min-h-9 items-center text-[13px] font-medium text-white/85 hover:text-white sm:text-[14px]">{{ item.footerLabel || item.label }}</NuxtLink>
            </li>
          </ul>
        </nav>
        <nav :aria-label="t('common.footer.help')">
          <h3 class="text-[12px] font-semibold uppercase tracking-[0.08em] text-white/50">{{ t('common.footer.help') }}</h3>
          <ul class="mt-1.5 sm:mt-3 sm:space-y-1">
            <li v-for="item in footerHelp" :key="item.to">
              <NuxtLink :to="item.to" class="inline-flex min-h-9 items-center text-[13px] font-medium text-white/85 hover:text-white sm:text-[14px]">{{ item.label }}</NuxtLink>
            </li>
          </ul>
        </nav>
        <div class="col-span-2 flex items-center gap-4 md:col-span-1 md:block">
          <h3 class="text-[12px] font-semibold uppercase tracking-[0.08em] text-white/50">{{ t('common.footer.products') }}</h3>
          <a
            :href="FAMILY_HUB_URL"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex min-h-9 items-center gap-1.5 text-[13px] font-medium text-white/85 hover:text-white sm:text-[14px] md:mt-3"
            @click="track('familyhub_nav_clicked', { placement: 'footer' })"
          >
            FamilyHub
            <svg class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M8 5H5.5A1.5 1.5 0 0 0 4 6.5v8A1.5 1.5 0 0 0 5.5 16h8a1.5 1.5 0 0 0 1.5-1.5V12M11 4h5m0 0v5m0-5L9 11" />
            </svg>
            <span class="sr-only">{{ t('common.nav.opensNewTab') }}</span>
          </a>
        </div>
      </div>

      <div class="mt-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-white/10 pt-3 md:mt-10 md:pt-5">
        <p class="text-[12px] text-white/55 sm:text-[13px]">{{ t('common.footer.rights', { year: new Date().getFullYear() }) }}</p>
        <div class="flex flex-wrap items-center gap-x-5 gap-y-1 text-[12px] text-white/60 sm:text-[13px]">
          <LanguageSwitcher variant="footer" />
          <NuxtLink to="/privacy" class="py-1 hover:text-white">{{ t('common.footer.privacy') }}</NuxtLink>
          <NuxtLink to="/terms" class="py-1 hover:text-white">{{ t('common.footer.terms') }}</NuxtLink>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Wordmark from '~/components/site/Wordmark.vue'
import LanguageSwitcher from '~/components/site/LanguageSwitcher.vue'
import { FAMILY_HUB_URL } from '~/utils/family-hub'

const { t } = useI18n()
const { track } = useFunnel()
const { navItems } = useSiteNav()

const footerHelp = computed(() => [
  { to: '/help', label: t('common.footer.helpLink') },
  { to: '/contact', label: t('common.footer.contact') }
])
</script>
