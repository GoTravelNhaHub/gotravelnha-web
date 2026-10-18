<template>
  <!-- Logo and name as in the community design; `light` for dark backgrounds -->
  <span class="inline-flex min-w-0 items-center gap-2.5">
    <Logo :size="logoSize" :light="light" />
    <span class="min-w-0 leading-none">
      <span class="block truncate font-bold tracking-[-0.025em]" :class="[light ? 'text-white' : 'text-cm-brand', textClass]" :style="textClass ? undefined : { fontSize: `${textSize}px` }">GoTravelNha</span>
      <!-- Tagline from 640px up, so the name fits next to the menu button on phones -->
      <span v-if="tagline" class="mt-[3px] hidden truncate sm:block text-[13px] font-medium tracking-[-0.01em]" :class="light ? 'text-white/70' : 'text-[#30425A]'">{{ t('community.feed.tagline') }}</span>
      <slot />
    </span>
  </span>
</template>

<script setup lang="ts">
import Logo from '~/components/Logo.vue'

withDefaults(defineProps<{ logoSize?: number | string; textSize?: number; textClass?: string; light?: boolean; tagline?: boolean }>(), {
  logoSize: 36,
  textSize: 19,
  light: false,
  tagline: false
})
const { t } = useI18n()
</script>
