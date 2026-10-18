<template>
  <!-- Phone tab bar from the approved mobile design -->
  <nav class="fixed inset-x-0 bottom-0 z-40 border-t border-cm-line bg-white/95 pb-[env(safe-area-inset-bottom)] font-brand backdrop-blur md:hidden print:hidden" :aria-label="t('community.feed.nav.label')">
    <ul class="grid h-[60px]" :style="{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }">
      <li v-for="item in tabs" :key="item.key">
        <NuxtLink v-if="item.to" :to="item.to" class="flex h-full flex-col items-center justify-center gap-0.5 text-[11px] font-medium" :class="isActive(item) ? 'text-cm-active' : 'text-cm-muted'" :aria-current="isActive(item) ? 'page' : undefined">
          <NavIcon :item="item" :active="isActive(item)" />
          <span class="max-w-full truncate px-1">{{ item.label }}</span>
        </NuxtLink>
        <span v-else class="flex h-full flex-col items-center justify-center gap-0.5 text-[11px] font-medium text-cm-subtle" :title="t('community.feed.nav.comingSoon')" aria-disabled="true">
          <NavIcon :item="item" />
          <span class="max-w-full truncate px-1">{{ item.label }}</span>
        </span>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import NavIcon from '~/components/site/NavIcon.vue'

const { t } = useI18n()
const { tabs, isActive } = useAppNav()
</script>
