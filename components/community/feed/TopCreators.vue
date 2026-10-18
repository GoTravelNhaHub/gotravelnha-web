<template>
  <section class="cm-card px-[15px] pb-[14px] pt-[16px]" aria-labelledby="cm-creators">
    <div class="flex items-center justify-between">
      <h2 id="cm-creators" class="text-[19px] font-bold tracking-[-0.01em] text-cm-ink">{{ t('community.feed.creatorsTitle') }}</h2>
      <span class="flex cursor-default items-center gap-1 text-[14.5px] font-medium text-cm-active" :title="t('community.feed.nav.comingSoon')" aria-disabled="true">{{ t('community.feed.seeAll') }}<CmIcon name="arrowRight" :size="16" stroke="2" /></span>
    </div>
    <p v-if="!creators.length" class="mt-3 text-[14px] leading-5 text-cm-muted">{{ t('community.feed.creatorsEmpty') }}</p>
    <ul v-else class="mt-[14px] space-y-[19px]">
      <li v-for="creator in creators" :key="creator.handle" class="flex items-center gap-[13px]">
        <CreatorAvatar :name="creator.displayName" :src="creator.avatarUrl" :size="46" />
        <div class="min-w-0 flex-1 leading-tight">
          <p class="flex min-w-0 items-center gap-1.5 text-[16px] font-semibold text-cm-ink"><span class="truncate">
            <NuxtLink v-if="!creator.demo" :to="`/travelers/${creator.handle}`" class="hover:text-cm-active">{{ creator.displayName }}</NuxtLink><template v-else>{{ creator.displayName }}</template></span>
            <span v-if="creator.demo" class="shrink-0 rounded-full bg-[#FFF3D6] px-1.5 py-[1px] text-[10.5px] font-semibold text-[#8A5A00]" :title="t('community.feed.card.demoHint')">{{ t('community.feed.card.demo') }}</span>
          </p>
          <p class="mt-[5px] truncate text-[13px] text-[#5B6478]">
            {{ t('community.feed.trips', { count: creator.tripCount }) }}<span aria-hidden="true"> • </span>{{ followers(creator.demo ? creator.followerCount : followersOf(creator.handle, creator.followerCount)) }}
          </p>
        </div>
        <ClientOnly v-if="!creator.demo"><FollowButton :handle="creator.handle" placement="sidebar" variant="soft" size="sm" /></ClientOnly>
        <span v-else class="flex h-[34px] shrink-0 cursor-default items-center rounded-full bg-cm-soft px-[14px] text-[14.5px] font-semibold text-cm-active opacity-70 xl:px-[17px]" :title="t('community.feed.card.demoHint')" aria-disabled="true">{{ t('community.feed.follow') }}</span>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import CmIcon from '~/components/community/feed/CmIcon.vue'
import CreatorAvatar from '~/components/community/feed/CreatorAvatar.vue'
import FollowButton from '~/components/community/FollowButton.vue'
import type { CommunityCreator } from '~/types/community'

defineProps<{ creators: CommunityCreator[] }>()
const { t, localeTag } = useI18n()
const { followersOf } = useFollows()

// 8200 → "8.2K"; a count of 1 keeps the number so the singular form is used
const followers = (count: number) =>
  t('community.feed.followers', { count: count === 1 ? 1 : new Intl.NumberFormat(localeTag.value, { notation: 'compact', maximumFractionDigits: 1 }).format(count) })
</script>
