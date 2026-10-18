<template>
  <div class="flex flex-wrap items-end justify-between gap-3 font-brand">
    <div class="min-w-0">
      <p v-if="eyebrow" class="text-[12px] font-semibold uppercase leading-[18px] tracking-[0.08em] text-[#0066E4]">{{ eyebrow }}</p>
      <h2 class="text-[24px] font-bold leading-8 tracking-[-0.025em] text-[#0A1024] sm:text-[30px] sm:leading-[38px]" :class="eyebrow ? 'mt-1' : ''">{{ title }}</h2>
      <p v-if="subtitle" class="mt-1.5 max-w-2xl text-[15px] leading-6 text-[#64748B]">{{ subtitle }}</p>
    </div>
    <slot name="action" />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  eyebrow?: string
  subtitle?: string
}>()
</script>
