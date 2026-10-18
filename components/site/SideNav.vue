<template>
  <nav :aria-label="t('community.feed.nav.label')" class="font-brand">
    <ul class="space-y-[1px]">
      <li v-for="item in main" :key="item.key">
        <NuxtLink
          v-if="item.to"
          :to="item.to"
          :class="[rowClass, isActive(item) && '!bg-cm-soft font-semibold !text-cm-active']"
          :aria-current="isActive(item) ? 'page' : undefined"
          @click="emit('navigate')"
        >
          <NavIcon :item="item" :active="isActive(item)" :class="isActive(item) ? 'text-cm-active' : 'text-[#3B4560]'" />
          {{ item.label }}
        </NuxtLink>
        <span v-else :class="[rowClass, 'cursor-default !gap-[16px] pr-1']" :title="t('community.feed.nav.comingSoon')" aria-disabled="true">
          <NavIcon :item="item" class="text-[#3B4560]" />
          <span class="flex-1">{{ item.label }}</span>
          <span class="shrink-0 rounded-full bg-cm-canvas px-1 py-0.5 text-[9.5px] font-semibold text-cm-subtle">{{ t('community.feed.nav.soon') }}</span>
        </span>
      </li>
    </ul>

    <p class="mb-1 mt-5 pl-[12px] text-[11.5px] font-semibold uppercase tracking-[0.08em] text-cm-subtle">{{ t('community.feed.nav.partners') }}</p>
    <ul class="space-y-[1px]">
      <li v-for="item in partners" :key="item.key">
        <a v-if="item.href" :href="item.href" target="_blank" rel="noopener noreferrer" :class="rowClass" @click="track('familyhub_nav_clicked', { placement: 'rail' }); emit('navigate')">
          <CmIcon name="heart" :size="22" class="text-[#3B4560]" />
          <span class="flex-1">{{ item.label }}</span>
          <CmIcon name="external" :size="15" class="text-cm-subtle" />
          <span class="sr-only">{{ t('common.nav.opensNewTab') }}</span>
        </a>
        <NuxtLink
          v-else-if="item.to"
          :to="item.to"
          :class="[rowClass, isActive(item) && '!bg-cm-soft font-semibold !text-cm-active']"
          :aria-current="isActive(item) ? 'page' : undefined"
          @click="emit('navigate')"
        >
          <NavIcon :item="item" :active="isActive(item)" :class="isActive(item) ? 'text-cm-active' : 'text-[#3B4560]'" />
          {{ item.label }}
        </NuxtLink>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import CmIcon from '~/components/community/feed/CmIcon.vue'
import NavIcon from '~/components/site/NavIcon.vue'

const emit = defineEmits<{ navigate: [] }>()
const { t } = useI18n()
const { track } = useFunnel()
const { main, partners, isActive } = useAppNav()

// Row geometry measured from the community mockup: 44px rows, icon at 12px, label 20px after it
const rowClass = 'flex min-h-[44px] items-center gap-[20px] rounded-[12px] py-1.5 pl-[12px] pr-3 text-[16px] font-medium leading-5 text-[#2B3245] transition hover:bg-cm-canvas'
</script>
