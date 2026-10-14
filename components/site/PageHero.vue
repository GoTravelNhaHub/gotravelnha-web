<template>
  <section class="relative isolate overflow-hidden bg-[#101D3A] font-brand">
    <img
      :src="image"
      alt=""
      width="2400"
      height="1200"
      fetchpriority="high"
      class="absolute inset-0 h-full w-full object-cover"
      :style="{ objectPosition: imagePosition }"
    />
    <div class="absolute inset-0 bg-gradient-to-r from-[#101D3A]/95 via-[#101D3A]/75 to-[#101D3A]/25"></div>
    <div class="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#101D3A]/70 to-transparent"></div>

    <div class="site-shell relative z-10 pt-12 sm:pt-16 lg:pt-20" :class="overlap ? 'pb-28 sm:pb-32' : 'pb-12 sm:pb-16'">
      <slot name="badge" />
      <p class="text-[12px] font-semibold uppercase leading-[18px] tracking-[0.1em] text-[#5EEAD4]" :class="$slots.badge ? 'mt-5' : ''">{{ eyebrow }}</p>
      <h1 class="mt-3 max-w-3xl text-[34px] font-extrabold leading-[1.08] tracking-[-0.03em] text-white sm:text-[48px] lg:text-[56px]">{{ title }}</h1>
      <p class="mt-4 max-w-2xl text-[16px] leading-[26px] text-white/80 sm:text-[18px] sm:leading-[28px]">{{ subtitle }}</p>
      <ul v-if="trust?.length" class="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-[13px] font-medium leading-5 text-white/85">
        <li v-for="line in trust" :key="line" class="inline-flex items-center gap-1.5">
          <svg class="h-4 w-4 shrink-0 text-[#5EEAD4]" viewBox="0 0 20 20" fill="none" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m5 10.5 3 3 7-7" />
          </svg>
          {{ line }}
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup lang="ts">
// Full-width page hero. With `overlap`, leaves room for a card pulled up over its bottom edge.
withDefaults(
  defineProps<{
    eyebrow: string
    title: string
    subtitle: string
    image: string
    imagePosition?: string
    trust?: string[]
    overlap?: boolean
  }>(),
  { imagePosition: 'center', overlap: false }
)
</script>
