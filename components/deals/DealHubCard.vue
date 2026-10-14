<template>
  <NuxtLink
    :to="`/explore/${template.slug}`"
    class="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white font-brand transition hover:-translate-y-0.5 hover:shadow-[0_20px_40px_-24px_rgba(16,29,58,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#008A9B]"
  >
    <div class="relative aspect-[16/10] overflow-hidden bg-[#F1F5F9]">
      <img
        v-if="template.heroImage"
        :src="template.heroImage"
        :alt="template.title"
        width="640"
        height="400"
        loading="lazy"
        decoding="async"
        class="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
      />
      <span class="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold uppercase leading-4 tracking-[0.06em] text-[#101D3A]">
        {{ template.category }}
      </span>
    </div>
    <div class="flex flex-1 flex-col p-5">
      <p class="text-[12px] font-medium leading-[18px] text-[#64748B]">{{ template.destination }}</p>
      <h3 class="mt-1 text-[18px] font-bold leading-6 tracking-[-0.02em] text-[#101D3A]">{{ template.title }}</h3>
      <p class="mt-2 line-clamp-2 text-[14px] leading-[22px] text-[#475569]">{{ outcome }}</p>
      <div class="mt-auto flex items-center justify-between gap-3 border-t border-[#F1F5F9] pt-4">
        <div class="flex items-center gap-1.5 text-[11px]">
          <span class="inline-flex items-center rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-2 py-0.5 font-semibold text-[#101D3A]">
            <TripWordmark />
          </span>
          <span class="inline-flex items-center gap-1 rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-2 py-0.5 font-semibold text-[#101D3A]">
            <KlookIcon :size="14" class="shrink-0" />
            Klook
          </span>
        </div>
        <span class="inline-flex shrink-0 items-center gap-1 text-[13px] font-semibold text-[#008A9B]">
          Compare
          <svg class="h-3.5 w-3.5 transition group-hover:translate-x-0.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 10h12m0 0-5-5m5 5-5 5" />
          </svg>
        </span>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { DealPageTemplate } from '~/types/deal-template'
import KlookIcon from '~/components/KlookIcon.vue'
import TripWordmark from '~/components/TripWordmark.vue'

defineProps<{
  template: DealPageTemplate
  outcome: string
}>()
</script>
