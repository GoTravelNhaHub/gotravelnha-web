<template>
  <section class="flex items-start gap-4 rounded-2xl border border-[#E2E8F0] bg-white p-5 font-brand sm:p-6">
    <span class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EAF2FC] text-[#0066E4]" aria-hidden="true">
      <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 3 4.5 6v5.5c0 4.4 3.1 8.3 7.5 9.5 4.4-1.2 7.5-5.1 7.5-9.5V6L12 3Z" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="m9 12 2 2 4-4" />
      </svg>
    </span>
    <div class="min-w-0">
      <h2 class="text-[16px] font-bold leading-6 text-[#0A1024]">{{ title || t('common.bookingNote.title') }}</h2>
      <p class="mt-1 max-w-3xl text-[14px] leading-[22px] text-[#64748B]"><slot /></p>
      <slot name="links" />
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{ title?: string }>()
const { t } = useI18n()
</script>
