<template>
  <section class="relative isolate overflow-hidden rounded-cm-lg bg-[linear-gradient(180deg,#E9F3FE_0%,#E1EEFC_100%)] px-6 pb-[34px] pt-[22px] text-center shadow-cm-card" aria-labelledby="cm-publish">
    <!-- Skyline and hills, after the approved artwork -->
    <svg class="absolute inset-x-0 bottom-0 -z-10 h-[90px] w-full" viewBox="0 0 330 90" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <path d="M0 90V40c10-14 22-18 32-6 8-12 18-10 26 2 10-8 22-4 30 10 12-4 20 4 26 14l6 30Z" fill="#F7C6D8" opacity=".55" />
      <path d="M0 90V58c14-8 30-6 44 2 18-10 38-8 56 4l20 26Z" fill="#B9D8F7" opacity=".7" />
      <path d="M150 90V78h10V64h8v8h6V54h10v-8h4v8h8V36h4V22l3-6 3 6v14h4v24h8V48h12v14h6V40h10v22h8V52h10v16h8V58h12v12h8v20Z" fill="#8EC0F5" opacity=".75" />
      <path d="M120 90c40-14 90-18 130-12s60 4 80-2v14Z" fill="#6FAEF2" opacity=".55" />
    </svg>
    <svg class="mx-auto h-[44px] w-[50px]" viewBox="0 0 48 40" aria-hidden="true">
      <path d="M2.5 19.5 46 2 18.5 25.5Z" fill="#5AA2F7" />
      <path d="M18.5 25.5 46 2 34 37Z" fill="#1F74E6" />
      <path d="M18.5 25.5 20.5 37.5l6-7.4Z" fill="#0B4FC0" />
    </svg>
    <h2 id="cm-publish" class="mt-[18px] text-[18.5px] font-bold tracking-[-0.01em] text-cm-ink">{{ t('community.feed.publishTitle') }}</h2>
    <p class="mx-auto mt-[8px] max-w-[240px] text-[15px] leading-[20px] text-cm-body">{{ t('community.feed.publishText') }}</p>
    <NuxtLink to="/mytrip" class="cm-btn-primary mt-[18px] h-[38px] px-[24px] text-[15px]">{{ t('community.feed.publishButton') }}<CmIcon name="arrowRight" :size="17" stroke="2" /></NuxtLink>
  </section>
</template>

<script setup lang="ts">
import CmIcon from '~/components/community/feed/CmIcon.vue'

const { t } = useI18n()
</script>
