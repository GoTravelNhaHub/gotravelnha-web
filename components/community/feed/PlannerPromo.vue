<template>
  <section class="overflow-hidden rounded-[16px] bg-[linear-gradient(180deg,#E6F1FD_0%,#E1EEFC_100%)] px-[18px] pb-[20px] pt-[12px] text-center shadow-cm-card" aria-labelledby="cm-planner-promo">
    <!-- Robot with a map, after the approved artwork -->
    <svg class="mx-auto h-[118px] w-[170px]" viewBox="0 0 170 118" aria-hidden="true">
      <ellipse cx="85" cy="104" rx="72" ry="12" fill="#D4E6FB" />
      <circle cx="146" cy="12" r="3.5" fill="#7FB4F5" />
      <g transform="rotate(-10 52 66)">
        <path d="M18 44l22-6 22 6 22-6v50l-22 6-22-6-22 6Z" fill="#7CC7A0" />
        <path d="M40 38v50M62 44v50" stroke="#5AA982" stroke-width="1.5" />
        <path d="M24 70c8-10 14-4 20-12s12 2 18-6 10 4 16-2" stroke="#F2B544" stroke-width="2.4" fill="none" stroke-linecap="round" />
        <path d="M20 50h14M48 82h10" stroke="#5BB4E6" stroke-width="5" stroke-linecap="round" />
        <circle cx="62" cy="54" r="3" fill="#E0476A" />
      </g>
      <path d="M96 34c0-12 10-20 22-20s22 8 22 20Z" fill="#F5B323" />
      <rect x="92" y="32" width="52" height="4" rx="2" fill="#E29E0C" />
      <rect x="94" y="36" width="48" height="36" rx="16" fill="#FFFFFF" stroke="#D4E2F4" stroke-width="1.5" />
      <rect x="101" y="43" width="34" height="21" rx="10" fill="#12204A" />
      <circle cx="112" cy="53.5" r="3.6" fill="#4FD8F0" />
      <circle cx="124" cy="53.5" r="3.6" fill="#4FD8F0" />
      <rect x="88" y="47" width="7" height="12" rx="3.5" fill="#3D8EF5" />
      <rect x="141" y="47" width="7" height="12" rx="3.5" fill="#3D8EF5" />
      <rect x="100" y="73" width="36" height="26" rx="12" fill="#FFFFFF" stroke="#D4E2F4" stroke-width="1.5" />
      <path d="M113 80h10l-1 7-4 3-4-3Z" fill="#F5A623" />
      <path d="M100 82c-8 0-14-4-18-10" stroke="#FFFFFF" stroke-width="7" stroke-linecap="round" fill="none" />
      <circle cx="82" cy="71" r="4.5" fill="#3D8EF5" />
      <rect x="106" y="96" width="9" height="10" rx="4" fill="#FFFFFF" stroke="#D4E2F4" stroke-width="1.5" />
      <rect x="121" y="96" width="9" height="10" rx="4" fill="#FFFFFF" stroke="#D4E2F4" stroke-width="1.5" />
    </svg>
    <h2 id="cm-planner-promo" class="mt-[12px] text-[17.5px] font-bold leading-[23px] tracking-[-0.01em] text-[#0B2A86]">{{ t('community.feed.plannerTitle') }}</h2>
    <NuxtLink to="/planner" class="cm-btn-primary mt-[14px] h-[36px] px-[18px] text-[15px]">{{ t('community.feed.plannerButton') }}<CmIcon name="arrowRight" :size="17" stroke="2" /></NuxtLink>
  </section>
</template>

<script setup lang="ts">
import CmIcon from '~/components/community/feed/CmIcon.vue'

const { t } = useI18n()
</script>
