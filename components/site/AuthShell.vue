<template>
  <div class="grid min-h-dvh bg-white font-brand lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
    <!-- Form panel -->
    <main class="flex min-h-dvh flex-col px-5 py-6 sm:px-10">
      <div class="flex items-center justify-between gap-3">
        <NuxtLink to="/" class="inline-flex items-center gap-2 text-[16px] font-bold tracking-[-0.02em] text-[#101D3A] lg:invisible">
          <Logo :size="'30'" />
          <span>GoTravel<span class="text-[#008A9B]">Nha</span></span>
        </NuxtLink>
        <div class="flex items-center gap-1">
        <LanguageSwitcher />
        <NuxtLink
          to="/"
          class="inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2.5 text-[13px] font-semibold text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#101D3A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#008A9B]"
        >
          <svg class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 10H4m0 0 5-5m-5 5 5 5" />
          </svg>
          {{ t('auth.shell.back') }}
        </NuxtLink>
        </div>
      </div>

      <div class="flex flex-1 items-center justify-center py-8 sm:py-10">
        <div class="w-full max-w-[400px]">
          <h1 class="text-[28px] font-bold leading-9 tracking-[-0.025em] text-[#101D3A]">{{ title }}</h1>
          <p v-if="description" class="mt-1.5 text-[15px] leading-6 text-[#64748B]">{{ description }}</p>
          <div class="mt-8">
            <slot />
          </div>
        </div>
      </div>

      <p class="text-center text-[12px] leading-[18px] text-[#94A3B8]">
        © {{ new Date().getFullYear() }} GoTravelNha ·
        <NuxtLink to="/privacy" class="hover:text-[#64748B]">{{ t('auth.shell.privacy') }}</NuxtLink> ·
        <NuxtLink to="/terms" class="hover:text-[#64748B]">{{ t('auth.shell.terms') }}</NuxtLink>
      </p>
    </main>

    <!-- Photo panel, desktop only. Comes after the form in the markup: Logo's SVG gradient is
         referenced by id, and the first copy must not sit inside a display:none panel. -->
    <aside class="relative isolate hidden overflow-hidden bg-[#101D3A] lg:sticky lg:top-0 lg:order-first lg:block lg:h-dvh lg:self-start" aria-hidden="true">
      <img :src="image" alt="" width="1600" height="1800" fetchpriority="high" class="absolute inset-0 h-full w-full object-cover" />
      <div class="absolute inset-0 bg-gradient-to-t from-[#101D3A] via-[#101D3A]/55 to-[#101D3A]/20"></div>
      <div class="relative flex h-full flex-col justify-between p-10 xl:p-14">
        <NuxtLink to="/" class="inline-flex w-fit items-center gap-2.5 text-[18px] font-bold tracking-[-0.02em] text-white" tabindex="-1">
          <Logo :size="'34'" />
          <span>GoTravel<span class="text-[#5EEAD4]">Nha</span></span>
        </NuxtLink>
        <div class="max-w-lg">
          <h2 class="text-[34px] font-extrabold leading-[1.15] tracking-[-0.03em] text-white xl:text-[40px]">{{ headline }}</h2>
          <p v-if="subline" class="mt-3 text-[16px] leading-[26px] text-white/80">{{ subline }}</p>
          <ul v-if="points?.length" class="mt-7 space-y-3">
            <li v-for="point in points" :key="point" class="flex items-center gap-3 text-[15px] leading-6 text-white/90">
              <span class="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-[#5EEAD4] ring-1 ring-white/20">
                <svg class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="m5 10.5 3 3 7-7" /></svg>
              </span>
              {{ point }}
            </li>
          </ul>
        </div>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import Logo from '~/components/Logo.vue'
import LanguageSwitcher from '~/components/site/LanguageSwitcher.vue'

// Split sign-in frame: travel photo on the left (desktop), form on the right
defineProps<{
  title: string
  description?: string
  image: string
  headline: string
  subline?: string
  points?: string[]
}>()

const { t } = useI18n()
</script>
