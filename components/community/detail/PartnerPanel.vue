<template>
  <!-- Reference B: partner block with a coloured border and title; Trip.com blue, Klook orange -->
  <section class="rounded-[14px] border bg-white p-4 shadow-[0_1px_2px_rgba(16,32,72,0.04)]" :class="provider === 'trip' ? 'border-[#CCE0FC]' : 'border-[#FCE0D0]'" :aria-label="title">
    <div class="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
      <h4 class="text-[15.5px] font-bold" :class="provider === 'trip' ? 'text-[#0068FC]' : 'text-[#FC6008]'">{{ title }}</h4>
      <button type="button" class="inline-flex items-center gap-1 text-[13px] font-medium text-cm-muted hover:text-cm-ink" @click="emit('more')">
        {{ moreLabel }}
        <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" d="M4.5 12h15m-6.5-6.5 6.5 6.5-6.5 6.5" /></svg>
      </button>
    </div>
    <div class="mt-3">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{ provider: 'trip' | 'klook'; title: string; moreLabel: string }>()
const emit = defineEmits<{ more: [] }>()
</script>
