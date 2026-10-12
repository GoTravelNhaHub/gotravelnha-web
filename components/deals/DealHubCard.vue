<template>
  <NuxtLink
    :to="`/explore/${template.slug}`"
    class="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sea"
  >
    <div class="relative aspect-[3/2] overflow-hidden bg-sand">
      <img
        v-if="template.heroImage"
        :src="template.heroImage"
        :alt="template.title"
        width="640"
        height="427"
        loading="lazy"
        decoding="async"
        class="absolute inset-0 h-full w-full object-cover"
      />
    </div>
    <div class="flex flex-1 flex-col p-4 sm:p-5">
      <p class="text-xs font-semibold uppercase tracking-wide text-ink/70">
        {{ template.destination }} · {{ template.category }}
      </p>
      <h3 class="mt-1.5 font-display text-xl leading-snug text-ink">{{ template.title }}</h3>
      <p class="mt-2 line-clamp-2 text-sm leading-snug text-sea">{{ outcome }}</p>
      <div class="mt-auto flex flex-wrap items-center gap-2 pt-4 text-[11px]">
        <span class="inline-flex items-center rounded-full border border-line bg-sand px-2 py-0.5 font-semibold text-ink">
          <TripWordmark />
        </span>
        <span class="text-ink/35" aria-hidden="true">+</span>
        <span class="inline-flex items-center gap-1 rounded-full border border-line bg-sand px-2 py-0.5 font-semibold text-ink">
          <KlookIcon :size="14" class="shrink-0" />
          Klook
        </span>
      </div>
      <span class="mt-4 inline-flex items-center text-sm font-semibold text-sea">
        Compare partners
        <span class="ml-1" aria-hidden="true">→</span>
      </span>
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
