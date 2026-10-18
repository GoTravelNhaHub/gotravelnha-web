<template>
  <article class="feed-card cm-card relative font-brand" :aria-labelledby="`trip-${trip.id}`">
    <div class="fc-grid">
      <div class="fc-media relative overflow-hidden rounded-[10px] bg-[#DCE7F5]">
        <!-- Fills the space the text needs, so the photo's own shape never sets the card height -->
        <img :src="photo" :alt="t('community.trip.imageAlt', { destination: placeName(trip.destination) })" width="720" height="432" :loading="eager ? 'eager' : 'lazy'" decoding="async" class="absolute inset-0 h-full w-full object-cover" />
        <span v-if="trip.demo" class="absolute left-[10px] top-[10px] inline-flex h-[24px] items-center gap-1 rounded-full bg-[#FFF7E0]/95 pl-2 pr-2.5 text-[12px] font-semibold text-cm-ink shadow-sm" :title="t('community.feed.card.demoHint')">
          <CmIcon v-if="trip.demoFeatured" name="star" :size="13" class="text-[#F5B323]" />
          {{ trip.demoFeatured ? `${t('community.feed.card.featured')} · ${t('community.feed.card.demo')}` : t('community.feed.card.demo') }}
        </span>
      </div>

      <div class="fc-author flex items-start gap-[9px]">
        <CreatorAvatar :name="trip.author.displayName" :src="trip.author.avatarUrl" :size="34" />
        <div class="min-w-0 flex-1 pt-[1px] leading-tight">
          <NuxtLink v-if="!trip.demo" :to="`/travelers/${trip.author.handle}`" class="block truncate text-[14px] font-semibold text-cm-ink hover:text-cm-active">{{ trip.author.displayName }}</NuxtLink>
          <p v-else class="truncate text-[14px] font-semibold text-cm-ink">{{ trip.author.displayName }}</p>
          <p class="mt-[2px] truncate text-[12px] text-cm-muted">
            <time :datetime="trip.publishedAt">{{ ago }}</time>
            <span aria-hidden="true"> • </span>{{ trip.familyFriendly ? t('community.feed.card.familyTrip') : t('community.feed.card.trip') }}
          </p>
        </div>
        <SaveButton v-if="!trip.demo" :trip="trip" :placement="placement" class="-mr-1 -mt-1 shrink-0" />
        <span v-else class="-mr-1 -mt-1 flex h-9 w-9 shrink-0 cursor-default items-center justify-center rounded-full text-[#5B6478]" :title="t('community.feed.card.demoHint')" aria-hidden="true">
          <CmIcon name="bookmark" :size="21" stroke="1.6" />
        </span>
      </div>

      <div class="fc-body min-w-0">
        <h3 :id="`trip-${trip.id}`" class="line-clamp-2 text-[16.5px] font-bold leading-[22px] tracking-[-0.01em] text-cm-ink">
          <NuxtLink v-if="!trip.demo" :to="viewLink" class="hover:text-cm-active" @click="emit('open', trip)">{{ trip.title }}</NuxtLink>
          <template v-else>{{ trip.title }}</template>
        </h3>
        <p v-if="description" class="mt-[4px] line-clamp-2 text-[13.5px] leading-[18px] text-cm-body">{{ description }}</p>
        <ul class="mt-[8px] flex flex-wrap items-center gap-x-[14px] gap-y-1 text-[13px] text-cm-body">
          <li class="flex items-center gap-[6px]"><CmIcon name="pin" :size="15" class="text-[#5B6478]" />{{ placeName(trip.country || trip.destination) }}</li>
          <li class="flex items-center gap-[6px]"><CmIcon name="calendar" :size="15" class="text-[#5B6478]" />{{ t('community.feed.card.days', { count: trip.durationDays }) }}</li>
          <li v-if="trip.familyFriendly" class="flex items-center gap-[6px]"><CmIcon name="users" :size="15" class="text-[#5B6478]" />{{ t('community.feed.card.family') }}</li>
          <li v-else-if="trip.travelStyle" class="flex items-center gap-[6px]"><CmIcon name="users" :size="15" class="text-[#5B6478]" />{{ t(`planner.pace.${trip.travelStyle}`) }}</li>
        </ul>
        <!-- Likes do not exist yet: only labelled demo cards show a heart count -->
        <ul class="mt-[8px] flex items-center gap-[16px] text-[13.5px] text-cm-body">
          <li v-if="trip.demoLikes !== undefined" class="flex items-center gap-[7px]" :aria-label="t('community.feed.card.likes', { count: trip.demoLikes })"><CmIcon name="heart" :size="17" class="text-cm-heart" />{{ compact(trip.demoLikes) }}</li>
          <li class="flex items-center gap-[7px]" :aria-label="t('community.feed.card.saves', { count: saveCount })"><CmIcon name="bookmark" :size="16" class="text-[#3B4560]" />{{ compact(saveCount) }}</li>
          <li class="flex items-center gap-[7px]" :aria-label="t('community.feed.card.comments', { count: trip.commentCount })"><CmIcon name="comment" :size="16" class="text-[#3B4560]" />{{ compact(trip.commentCount) }}</li>
        </ul>
      </div>

      <div class="fc-actions">
        <NuxtLink v-if="!trip.demo" :to="viewLink" class="cm-btn-primary fc-btn text-[13.5px]" @click="emit('open', trip)">
          {{ t('community.feed.card.view') }}<CmIcon name="arrowRight" :size="15" stroke="2" />
        </NuxtLink>
        <span v-else class="cm-btn-primary fc-btn cursor-default text-[13.5px]" :title="t('community.feed.card.demoHint')" aria-disabled="true">
          {{ t('community.feed.card.view') }}<CmIcon name="arrowRight" :size="15" stroke="2" />
        </span>
        <NuxtLink :to="customizeLink" class="cm-btn-outline fc-btn fc-btn-outline text-[12.5px]" @click="track('itinerary_customize_start', { tripId: trip.demo ? null : trip.id, placement })">
          <CmIcon name="sparkles" :size="15" class="text-cm-primary" />{{ t('community.feed.card.customize') }}
        </NuxtLink>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import CmIcon from '~/components/community/feed/CmIcon.vue'
import CreatorAvatar from '~/components/community/feed/CreatorAvatar.vue'
import SaveButton from '~/components/community/SaveButton.vue'
import type { CommunityTripCard } from '~/types/community'
import { destinationPhoto } from '~/utils/destination-photos'

const props = withDefaults(defineProps<{ trip: CommunityTripCard; placement?: string; eager?: boolean }>(), { placement: 'community_feed', eager: false })
const emit = defineEmits<{ open: [trip: CommunityTripCard] }>()
const { t, placeName, localeTag } = useI18n()
const { track } = useFunnel()

const { countFor } = useSavedTrips()
// Live after a save on this page; the server count otherwise
const saveCount = computed(() => (props.trip.demo ? props.trip.saveCount : countFor(props.trip.id, props.trip.saveCount)))

const photo = computed(() => props.trip.demoImage ?? destinationPhoto(props.trip.destination, 720) ?? props.trip.coverImage ?? '')
const viewLink = computed(() => `/community/trips/${props.trip.slug}`)
// Real trips open their page with the customize form (Reference B); demo cards have no page
const customizeLink = computed(() =>
  props.trip.demo
    ? `/planner?destination=${encodeURIComponent(props.trip.destination)}`
    : `/community/trips/${encodeURIComponent(props.trip.slug)}?customize=1`
)
const description = computed(() => props.trip.description || props.trip.highlights.join(' · '))

// Day-level relative time, so server and browser agree within a day
const ago = computed(() => {
  const days = Math.max(0, Math.round((Date.now() - new Date(props.trip.publishedAt).getTime()) / 86_400_000))
  const format = new Intl.RelativeTimeFormat(localeTag.value, { numeric: 'auto' })
  if (days >= 365) return format.format(-Math.floor(days / 365), 'year')
  if (days >= 30) return format.format(-Math.floor(days / 30), 'month')
  if (days >= 7) return format.format(-Math.floor(days / 7), 'week')
  return format.format(-days, 'day')
})
const compact = (value: number) => new Intl.NumberFormat(localeTag.value, { notation: 'compact', maximumFractionDigits: 1 }).format(value)
</script>

<style scoped>
.feed-card {
  container-type: inline-size;
}

/* Phone (as the approved mobile feed): author, photo, text, full-width buttons */
.fc-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  grid-template-areas: 'author' 'media' 'body' 'actions';
  gap: 10px;
  padding: 12px;
}
.fc-media {
  grid-area: media;
  aspect-ratio: 2 / 1;
}
.fc-author {
  grid-area: author;
}
.fc-body {
  grid-area: body;
}
.fc-actions {
  grid-area: actions;
  display: grid;
  gap: 6px;
}
.fc-btn {
  height: 36px;
  padding: 0 14px;
}

/* Tablet: photo on the left, buttons in a row under the text */
@container (min-width: 560px) {
  .fc-grid {
    grid-template-columns: 34% minmax(0, 1fr);
    grid-template-areas: 'media author' 'media body' 'media actions';
    grid-template-rows: auto auto 1fr;
    column-gap: 16px;
    row-gap: 6px;
  }
  .fc-media {
    aspect-ratio: auto;
    min-height: 140px;
  }
  .fc-actions {
    display: flex;
    align-self: end;
    flex-wrap: wrap;
  }
}

/* Desktop: compact version of the Reference A card (photo, text column, button column) */
@container (min-width: 800px) {
  .fc-grid {
    grid-template-columns: 30% minmax(0, 1fr) 136px;
    grid-template-areas: 'media author author' 'media body actions';
    grid-template-rows: auto 1fr;
    column-gap: 18px;
    row-gap: 6px;
    padding: 10px 12px;
  }
  .fc-media {
    min-height: 140px;
  }
  .fc-actions {
    display: flex;
    flex-direction: column;
    align-self: start;
    gap: 8px;
  }
  .fc-btn {
    height: 34px;
    padding: 0;
  }
  .fc-btn-outline {
    height: 36px;
  }
}
</style>
