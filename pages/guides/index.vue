<template>
  <div class="py-4 font-brand sm:py-6">
    <SectionHeading
      :eyebrow="t('places.guides.listEyebrow')"
      :title="t('places.guides.listTitle')"
      :subtitle="t('places.guides.listSubtitle')"
    />

    <div v-if="guides.length" class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <NuxtLink
        v-for="guide in guides"
        :key="guide.slug"
        :to="`/guides/${guide.slug}`"
        class="group overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white transition hover:border-[#008A9B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#008A9B]"
      >
        <img :src="destinationPhoto(guide.destination, 800)" alt="" width="800" height="450" loading="lazy" class="aspect-[16/9] w-full object-cover" />
        <div class="p-5">
          <p class="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#008A9B]">{{ t('places.guides.listCard', { destination: placeName(guide.destination), days: guide.days }) }}</p>
          <h2 class="mt-1 text-[18px] font-bold leading-6 text-[#101D3A] group-hover:text-[#007789]">{{ guide.title }}</h2>
          <p class="mt-1.5 text-[14px] leading-[22px] text-[#64748B]">{{ guide.suits }}</p>
        </div>
      </NuxtLink>
    </div>

    <div v-else class="mt-8 rounded-2xl border border-dashed border-[#CBD5E1] bg-white p-10 text-center">
      <p class="text-[15px] text-[#475569]">{{ t('places.guides.listEmpty') }}</p>
      <NuxtLink to="/planner" class="mt-4 inline-flex min-h-11 items-center rounded-xl bg-[#008A9B] px-5 text-[14px] font-semibold text-white hover:bg-[#007789]">
        {{ t('places.guides.openPlanner') }}
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import SectionHeading from '~/components/site/SectionHeading.vue'
import { publishedGuides } from '~/utils/destination-guides'
import { destinationPhoto } from '~/utils/destination-photos'

const guides = publishedGuides()
const { t, placeName } = useI18n()

useHead(() => ({
  title: t('places.guides.listMetaTitle'),
  meta: [
    {
      name: 'description',
      content: t('places.guides.listMetaDescription'),
      key: 'description'
    },
    // An empty list is not worth indexing
    ...(guides.length ? [] : [{ name: 'robots', content: 'noindex', key: 'robots' }])
  ]
}))
</script>
