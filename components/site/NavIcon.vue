<template>
  <!-- Fixed-size box, so labels line up whichever icon is used -->
  <span class="inline-flex shrink-0 items-center justify-center" :style="{ width: `${size}px`, height: `${size}px` }">
    <KlookIcon v-if="item.icon === 'klook'" :size="Number(size) - 3" />
    <CmIcon v-else :name="active && item.activeIcon ? item.activeIcon : item.icon" :size="size" />
  </span>
</template>

<script setup lang="ts">
import CmIcon from '~/components/community/feed/CmIcon.vue'
import KlookIcon from '~/components/KlookIcon.vue'
import type { AppNavItem } from '~/composables/useAppNav'

withDefaults(defineProps<{ item: AppNavItem; active?: boolean; size?: number }>(), { active: false, size: 22 })
</script>
