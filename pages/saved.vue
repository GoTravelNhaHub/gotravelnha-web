<template>
  <div class="pb-14 font-brand">
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 class="text-[28px] font-bold tracking-[-0.02em] text-cm-ink">{{ t('community.saved.title') }}</h1>
        <p class="mt-1 text-[15px] text-cm-muted">{{ t('community.saved.subtitle') }}</p>
      </div>
      <NuxtLink to="/community" class="cm-btn-outline h-10 px-5 text-[14px]">{{ t('community.saved.browse') }}</NuxtLink>
    </div>

    <p v-if="failed" class="alert-error mt-6" role="alert">{{ t('community.saved.loadFailed') }}</p>
    <div v-else-if="loading" class="mt-6 space-y-3" aria-hidden="true">
      <div v-for="index in 3" :key="index" class="h-[230px] animate-pulse rounded-cm-lg bg-white"></div>
    </div>
    <CommunityEmpty v-else-if="!trips.length" class="mt-6" :title="t('community.saved.emptyTitle')" :text="t('community.saved.emptyText')" />
    <div v-else class="mt-6 grid gap-[8px] 3xl:grid-cols-[repeat(auto-fill,minmax(560px,1fr))] 3xl:gap-3">
      <FeedCard v-for="trip in trips" :key="trip.id" :trip="trip" placement="saved_list" />
    </div>

    <div v-if="nextCursor" class="pt-6 text-center">
      <button type="button" class="cm-btn-outline h-11 px-6 text-[14px]" :disabled="loadingMore" @click="loadMore">
        {{ loadingMore ? t('community.discover.loading') : t('community.discover.loadMore') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import CommunityEmpty from '~/components/community/CommunityEmpty.vue'
import FeedCard from '~/components/community/feed/FeedCard.vue'
import type { CommunityTripCard } from '~/types/community'
import { communityEnabled } from '~/utils/feature-flags'

if (!communityEnabled(useRuntimeConfig().public)) {
  throw createError({ statusCode: 404, statusMessage: 'Not found', fatal: true })
}

// Personal list: loaded in the browser with the session cookie, never server-rendered or indexed
definePageMeta({ middleware: 'auth' })

const { t } = useI18n()
const { loadState } = useSavedTrips()
const trips = ref<CommunityTripCard[]>([])
const nextCursor = ref<string | null>(null)
const loading = ref(true)
const loadingMore = ref(false)
const failed = ref(false)

const fetchPage = (cursor?: string) =>
  $api<{ data: CommunityTripCard[]; nextCursor: string | null }>(`/api/community/saved${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ''}`)

onMounted(async () => {
  try {
    const page = await fetchPage()
    trips.value = page.data
    nextCursor.value = page.nextCursor
    // Everything listed here is saved; this marks the bookmarks
    await loadState(page.data.map((trip) => trip.id))
  } catch {
    failed.value = true
  } finally {
    loading.value = false
  }
})

const loadMore = async () => {
  if (!nextCursor.value || loadingMore.value) return
  try {
    loadingMore.value = true
    const page = await fetchPage(nextCursor.value)
    trips.value = [...trips.value, ...page.data]
    nextCursor.value = page.nextCursor
    await loadState(page.data.map((trip) => trip.id))
  } finally {
    loadingMore.value = false
  }
}

useHead(() => ({
  title: t('community.saved.metaTitle'),
  meta: [{ name: 'robots', content: 'noindex, nofollow', key: 'robots' }]
}))
</script>
