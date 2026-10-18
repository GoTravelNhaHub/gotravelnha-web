<template>
  <component
    :is="to ? NuxtLink : 'button'"
    v-bind="to ? { to } : { type: 'button' }"
    class="group relative block aspect-[4/5] overflow-hidden rounded-2xl bg-[#0A1024] text-left font-brand shadow-[0_1px_2px_rgba(10,16,36,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_32px_-16px_rgba(10,16,36,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066E4] focus-visible:ring-offset-2"
    @click="$emit('select')"
  >
    <img
      :src="image"
      alt=""
      width="480"
      height="600"
      loading="lazy"
      decoding="async"
      class="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
    />
    <span class="absolute inset-0 bg-gradient-to-t from-[#0A1024]/90 via-[#0A1024]/20 to-transparent"></span>
    <span class="absolute inset-x-0 bottom-0 p-4">
      <span class="block text-[18px] font-bold leading-6 tracking-[-0.02em] text-white">{{ name }}</span>
      <span v-if="caption" class="mt-0.5 block text-[13px] leading-5 text-white/80">{{ caption }}</span>
      <span class="mt-3 inline-flex items-center gap-1 text-[13px] font-semibold leading-5 text-[#7DB4FF]">
        {{ cta }}
        <svg class="h-3.5 w-3.5 transition group-hover:translate-x-0.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 10h12m0 0-5-5m5 5-5 5" />
        </svg>
      </span>
    </span>
  </component>
</template>

<script setup lang="ts">
import { resolveComponent } from 'vue'

// Photo tile for a city. Renders a link when `to` is set, otherwise a button that emits `select`.
defineProps<{
  name: string
  image: string
  cta: string
  caption?: string
  to?: string
}>()

defineEmits<{ select: [] }>()

const NuxtLink = resolveComponent('NuxtLink')
</script>
