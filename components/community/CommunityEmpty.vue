<template>
  <div class="relative isolate overflow-hidden rounded-3xl border border-[#CFE0F7] bg-gradient-to-br from-white via-[#F5F9FF] to-[#EAF2FC] px-6 py-10 text-center font-brand sm:px-10">
    <span class="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0066E4] text-white" aria-hidden="true">
      <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 21s-7-5.6-7-11a7 7 0 1 1 14 0c0 5.4-7 11-7 11ZM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" /></svg>
    </span>
    <p class="mt-4 text-[20px] font-bold leading-7 tracking-[-0.02em] text-[#0A1024]">{{ title || t('community.discover.emptyTitle') }}</p>
    <p class="mx-auto mt-2 max-w-lg text-[15px] leading-6 text-[#475569]">{{ text || t('community.discover.emptyText') }}</p>
    <div class="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
      <NuxtLink :to="shareLink" class="btn-primary sm:w-auto sm:px-6">{{ t('community.discover.emptyShare') }}</NuxtLink>
      <NuxtLink :to="planLink" class="btn-secondary sm:w-auto sm:px-6">{{ t('community.discover.emptyPlan') }}</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ title?: string; text?: string; destination?: string }>()
const { t } = useI18n()
// Publishing starts from a saved trip. /mytrip sends signed-out visitors to sign in; checking
// sign-in here would render differently on the server and the client.
const shareLink = '/mytrip'
const planLink = computed(() => (props.destination ? `/planner?destination=${encodeURIComponent(props.destination)}` : '/planner'))
</script>
