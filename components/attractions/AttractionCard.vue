<template>
  <NuxtLink
    v-if="kind === 'direct' && href"
    :to="href"
    class="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sea"
    @click="emit('navigate')"
  >
    <div class="relative aspect-[3/2] overflow-hidden bg-sand">
      <img
        v-if="image"
        :src="image"
        alt=""
        width="640"
        height="427"
        loading="lazy"
        decoding="async"
        class="absolute inset-0 h-full w-full object-cover"
      />
    </div>
    <div class="flex flex-1 flex-col p-4 sm:p-5">
      <p v-if="meta" class="text-xs font-semibold uppercase tracking-wide text-ink/70">{{ meta }}</p>
      <h3 class="mt-1.5 font-display text-xl leading-snug text-ink">{{ title }}</h3>
      <p v-if="price" class="mt-2 text-sm font-semibold text-ink">
        {{ price }}
        <span v-if="originalPrice" class="ml-2 font-normal text-ink/70 line-through">{{ originalPrice }}</span>
      </p>
      <p v-if="bookable" class="mt-2 text-sm text-ink/70">{{ t('attractions.card.buyHere') }}</p>
      <span class="mt-auto inline-flex items-center pt-4 text-sm font-semibold text-sea">{{ action }}</span>
    </div>
  </NuxtLink>
  <button
    v-else
    type="button"
    class="group flex h-full w-full flex-col overflow-hidden rounded-2xl border border-line bg-white text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sea"
    @click="emit('open')"
  >
    <div class="relative aspect-[3/2] overflow-hidden bg-sand">
      <img
        v-if="image"
        :src="image"
        alt=""
        width="640"
        height="427"
        loading="lazy"
        decoding="async"
        class="absolute inset-0 h-full w-full object-cover"
      />
    </div>
    <div class="flex flex-1 flex-col p-4 sm:p-5">
      <p v-if="meta" class="text-xs font-semibold uppercase tracking-wide text-ink/70">{{ meta }}</p>
      <h3 class="mt-1.5 font-display text-xl leading-snug text-ink">{{ title }}</h3>
      <p v-if="providerLabel" class="mt-2 text-sm text-ink/70">{{ providerLabel }}</p>
      <span class="mt-auto inline-flex items-center pt-4 text-sm font-semibold text-sea">{{ action }}</span>
    </div>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  kind: 'direct' | 'partner'
  href?: string
  title: string
  image?: string
  destination?: string
  category?: string
  price?: string
  originalPrice?: string
  bookable?: boolean
  providerLabel?: string
  action: string
}>()

const emit = defineEmits<{
  navigate: []
  open: []
}>()

const { t } = useI18n()
const meta = computed(() => [props.destination, props.category].filter(Boolean).join(' · '))
</script>
