<template>
  <div class="pb-14 font-brand">
    <div v-if="!traveler" class="cm-card px-6 py-14 text-center">
      <p class="text-[18px] font-bold text-cm-ink">{{ t('community.profile.notFoundTitle') }}</p>
      <p class="mx-auto mt-1 max-w-sm text-[14px] leading-[22px] text-cm-muted">{{ t('community.profile.notFoundText') }}</p>
      <NuxtLink to="/community" class="cm-btn-primary mx-auto mt-5 h-11 px-6 text-[15px]">{{ t('community.saved.browse') }}</NuxtLink>
    </div>

    <template v-else>
      <!-- Profile header -->
      <section class="cm-card overflow-hidden">
        <div class="h-[120px] bg-[linear-gradient(120deg,#E4F0FC_0%,#CFE3FB_55%,#B9D6F8_100%)] sm:h-[150px]" aria-hidden="true"></div>
        <div class="px-5 pb-6 sm:px-8">
          <div class="-mt-12 flex flex-wrap items-end justify-between gap-4">
            <CreatorAvatar :name="traveler.displayName" :src="traveler.avatarUrl" :size="104" class="ring-4 ring-white" />
            <div class="flex flex-wrap items-center gap-2 pb-1">
              <ClientOnly>
                <button v-if="isOwn" type="button" class="cm-btn-outline h-10 px-5 text-[14.5px]" @click="editing = true">{{ t('community.profile.edit') }}</button>
                <FollowButton v-else :handle="traveler.handle" placement="profile" />
              </ClientOnly>
              <button v-if="!isOwn" type="button" class="h-10 rounded-full px-4 text-[13.5px] font-medium text-cm-muted hover:bg-cm-canvas hover:text-cm-ink" @click="reporting = true">{{ t('community.report.action') }}</button>
            </div>
          </div>
          <h1 class="mt-4 text-[28px] font-bold tracking-[-0.02em] text-cm-ink">{{ traveler.displayName }}</h1>
          <p class="text-[15px] text-cm-muted">@{{ traveler.handle }} · {{ t('community.profile.joined', { date: joined }) }}</p>
          <p v-if="traveler.bio" class="mt-3 max-w-[70ch] whitespace-pre-line text-[15.5px] leading-6 text-cm-body">{{ traveler.bio }}</p>
          <ul class="mt-5 flex flex-wrap gap-x-8 gap-y-2 text-[14px] text-cm-muted">
            <li><strong class="text-[18px] font-bold text-cm-ink">{{ traveler.counts.trips }}</strong> {{ t('community.profile.tripsLabel', { count: traveler.counts.trips }) }}</li>
            <li><strong class="text-[18px] font-bold text-cm-ink">{{ followers }}</strong> {{ t('community.profile.followersLabel', { count: followers }) }}</li>
            <li><strong class="text-[18px] font-bold text-cm-ink">{{ traveler.counts.following }}</strong> {{ t('community.profile.followingLabel') }}</li>
          </ul>
        </div>
      </section>

      <!-- Edit (owner only) -->
      <section v-if="editing" class="cm-card mt-5 p-5 sm:p-6" aria-labelledby="edit-title">
        <h2 id="edit-title" class="mb-4 text-[18px] font-bold text-cm-ink">{{ t('community.profile.edit') }}</h2>
        <ProfileForm cancellable @cancel="editing = false" @saved="onSaved" />
      </section>

      <!-- Trips -->
      <section class="mt-8" aria-labelledby="trips-title">
        <h2 id="trips-title" class="text-[21px] font-bold tracking-[-0.01em] text-cm-ink">{{ t('community.profile.tripsTitle', { name: traveler.displayName }) }}</h2>
        <p v-if="!trips.length" class="mt-3 text-[14.5px] text-cm-muted">{{ isOwn ? t('community.profile.noTripsOwn') : t('community.profile.noTrips') }}</p>
        <div v-else class="mt-4 grid gap-[8px] 3xl:grid-cols-[repeat(auto-fill,minmax(560px,1fr))] 3xl:gap-3">
          <FeedCard v-for="trip in trips" :key="trip.id" :trip="trip" placement="profile" />
        </div>
        <div v-if="nextCursor" class="pt-5 text-center">
          <button type="button" class="cm-btn-outline h-11 px-6 text-[14px]" :disabled="loadingMore" @click="loadMore">{{ loadingMore ? t('community.discover.loading') : t('community.discover.loadMore') }}</button>
        </div>
      </section>

      <ReportDialog :open="reporting" target-type="PROFILE" :target="traveler.handle" @close="reporting = false" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CreatorAvatar from '~/components/community/feed/CreatorAvatar.vue'
import FeedCard from '~/components/community/feed/FeedCard.vue'
import FollowButton from '~/components/community/FollowButton.vue'
import ProfileForm from '~/components/community/ProfileForm.vue'
import ReportDialog from '~/components/community/ReportDialog.vue'
import type { CommunityTripCard } from '~/types/community'
import type { OwnProfile } from '~/composables/useOwnProfile'
import { communityEnabled } from '~/utils/feature-flags'
import { canonicalSiteOrigin } from '~/utils/site-origin'

interface TravelerView {
  handle: string
  displayName: string
  bio: string | null
  avatarUrl: string | null
  joinedAt: string
  counts: { trips: number; followers: number; following: number }
}
interface TravelerResponse {
  data: TravelerView
  trips: { data: CommunityTripCard[]; nextCursor: string | null }
}

const config = useRuntimeConfig().public
if (!communityEnabled(config)) throw createError({ statusCode: 404, statusMessage: 'Not found', fatal: true })

const route = useRoute()
const router = useRouter()
const handle = String(route.params.handle || '').toLowerCase()
const siteOrigin = canonicalSiteOrigin(config.siteUrl)
const { t, localeTag } = useI18n()
const { profile, load: loadProfile } = useOwnProfile()
const { loadState: loadFollows, followersOf } = useFollows()
const { loadState: loadSaved } = useSavedTrips()

// Public data only: the server render never reads the session, so the HTML can be cached
const { data: loaded } = await useAsyncData(`traveler-${handle}`, () =>
  $api<TravelerResponse>(`/api/community/profiles/${encodeURIComponent(handle)}`).catch(() => false as const)
)
const traveler = computed(() => (loaded.value ? loaded.value.data : null))
const trips = ref<CommunityTripCard[]>(loaded.value ? loaded.value.trips.data : [])
const nextCursor = ref<string | null>(loaded.value ? loaded.value.trips.nextCursor : null)
const loadingMore = ref(false)
const editing = ref(false)
const reporting = ref(false)

const isOwn = computed(() => !!profile.value && profile.value.handle === handle)
const followers = computed(() => (traveler.value ? followersOf(traveler.value.handle, traveler.value.counts.followers) : 0))
const joined = computed(() => (traveler.value ? new Intl.DateTimeFormat(localeTag.value, { month: 'long', year: 'numeric' }).format(new Date(traveler.value.joinedAt)) : ''))
// Profiles without a public trip have nothing for search engines
const indexable = computed(() => (traveler.value?.counts.trips ?? 0) > 0)

if (import.meta.server) {
  const event = useRequestEvent()
  if (!traveler.value && event) setResponseStatus(event, 404)
  useResponseHeader('cache-control').value = traveler.value ? 'public, s-maxage=60, stale-while-revalidate=300' : 'private, no-store'
}

const loadMore = async () => {
  if (!nextCursor.value) return
  try {
    loadingMore.value = true
    const page = await $api<{ data: CommunityTripCard[]; nextCursor: string | null }>(`/api/community/profiles/${handle}/trips?cursor=${encodeURIComponent(nextCursor.value)}`)
    trips.value = [...trips.value, ...page.data]
    nextCursor.value = page.nextCursor
    loadSaved(page.data.map((trip) => trip.id))
  } finally {
    loadingMore.value = false
  }
}

const onSaved = (saved: OwnProfile) => {
  editing.value = false
  // A new handle means a new URL
  if (saved.handle !== handle) return router.replace(`/travelers/${saved.handle}`)
  // Show the saved values directly: the public profile response is cached (CDN and browser)
  // for up to a minute, so refetching it could show the old text right after saving
  if (loaded.value) {
    loaded.value = { ...loaded.value, data: { ...loaded.value.data, displayName: saved.displayName, bio: saved.bio, avatarUrl: saved.avatarUrl } }
  }
}

onMounted(() => {
  loadProfile()
  if (!traveler.value) return
  loadFollows([traveler.value.handle])
  loadSaved(trips.value.map((trip) => trip.id))
  if (route.query.edit === '1') editing.value = true
})

useHead(() => {
  const value = traveler.value
  const title = value ? t('community.profile.metaTitle', { name: value.displayName, handle: value.handle }) : t('community.profile.notFoundTitle')
  const description = value?.bio || t('community.profile.metaDescription', { name: value?.displayName ?? '' })
  const canonical = `${siteOrigin}/travelers/${handle}`
  return {
    title,
    link: [{ rel: 'canonical', href: canonical, key: 'canonical' }],
    meta: [
      ...(indexable.value ? [] : [{ name: 'robots', content: 'noindex, follow', key: 'robots' }]),
      { name: 'description', content: description.slice(0, 300), key: 'description' },
      { property: 'og:title', content: title, key: 'og-title' },
      { property: 'og:description', content: description.slice(0, 300), key: 'og-description' },
      { property: 'og:url', content: canonical, key: 'og-url' },
      { property: 'og:type', content: 'profile', key: 'og-type' }
    ]
  }
})
</script>
