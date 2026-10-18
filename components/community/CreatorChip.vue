<template>
  <span class="inline-flex min-w-0 items-center gap-2.5">
    <img v-if="author.avatarUrl" :src="author.avatarUrl" alt="" width="36" height="36" class="h-9 w-9 shrink-0 rounded-full object-cover" referrerpolicy="no-referrer" />
    <span v-else class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0066E4] text-[14px] font-bold text-white" aria-hidden="true">{{ initial }}</span>
    <span class="min-w-0 leading-tight">
      <span class="block truncate text-[14px] font-semibold" :class="dark ? 'text-white' : 'text-[#0A1024]'">{{ t('community.trip.by', { name: author.displayName }) }}</span>
      <span class="block truncate text-[12px]" :class="dark ? 'text-white/70' : 'text-[#64748B]'">@{{ author.handle }}</span>
    </span>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CommunityAuthor } from '~/types/community'

const props = defineProps<{ author: CommunityAuthor; dark?: boolean }>()
const { t } = useI18n()
const initial = computed(() => (props.author.displayName.trim().charAt(0) || props.author.handle.charAt(0)).toLocaleUpperCase())
</script>
