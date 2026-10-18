<template>
  <section class="cm-card px-[15px] pb-[14px] pt-[13px]" aria-labelledby="cm-destinations">
    <div class="flex items-center justify-between">
      <h2 id="cm-destinations" class="text-[19px] font-bold tracking-[-0.01em] text-cm-ink">{{ t('community.feed.destinationsTitle') }}</h2>
      <NuxtLink to="/explore" class="flex items-center gap-1 text-[14.5px] font-medium text-cm-active hover:underline">{{ t('community.feed.seeAll') }}<CmIcon name="arrowRight" :size="16" stroke="2" /></NuxtLink>
    </div>
    <ul class="mt-[12px] grid grid-cols-2 gap-x-[14px] gap-y-[6px] sm:grid-cols-4 lg:grid-cols-2">
      <li v-for="item in tiles" :key="item.country">
        <NuxtLink :to="{ path: '/community', query: { country: item.country } }" class="group block">
          <span class="block aspect-[145/128] overflow-hidden rounded-[10px] bg-[#DCE7F5]">
            <img :src="item.photo" alt="" width="300" height="280" loading="lazy" decoding="async" class="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
          </span>
          <span class="mt-[6px] block text-[15px] text-cm-body group-hover:text-cm-active">{{ placeName(item.country) }}</span>
        </NuxtLink>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import CmIcon from '~/components/community/feed/CmIcon.vue'
import type { CommunityDestination } from '~/types/community'
import { countryPhoto, FEATURED_COUNTRIES } from '~/utils/community-photos'

const props = defineProps<{ destinations: CommunityDestination[] }>()
const { t, placeName } = useI18n()

// Countries with the most real trips first, then fixed shortcuts. No counts are shown.
const tiles = computed(() => {
  const totals = new Map<string, number>()
  for (const item of props.destinations) {
    if (item.country) totals.set(item.country, (totals.get(item.country) ?? 0) + item.count)
  }
  const ranked = [...totals.entries()].sort((a, b) => b[1] - a[1]).map(([country]) => country)
  return [...new Set([...ranked, ...FEATURED_COUNTRIES])]
    .map((country) => ({ country, photo: countryPhoto(country, 300) }))
    .filter((item): item is { country: string; photo: string } => !!item.photo)
    .slice(0, 4)
})
</script>
