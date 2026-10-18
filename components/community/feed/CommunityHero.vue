<template>
  <section class="relative font-brand" aria-labelledby="cm-hero-title">
    <!-- Tablet and desktop: photo banner -->
    <div class="relative hidden h-[213px] rounded-[16px] shadow-cm-card sm:block">
      <div class="absolute inset-0 overflow-hidden rounded-[16px] bg-[#1B5E9C]">
        <img :src="photo" alt="" width="1840" height="426" fetchpriority="high" decoding="async" class="h-full w-full object-cover object-[50%_55%]" />
        <span class="absolute inset-0 bg-[linear-gradient(90deg,rgba(6,32,66,0.55)_0%,rgba(6,32,66,0.32)_38%,rgba(6,32,66,0)_70%)]"></span>
      </div>
      <div class="relative px-[36px] pt-[38px]">
        <h1 id="cm-hero-title" class="pl-[7px] text-[36px] font-bold leading-[46px] tracking-[-0.02em] text-white [text-shadow:0_2px_12px_rgba(0,20,50,0.35)] lg:text-[39px] lg:leading-[48px]">{{ t('community.feed.hero.title') }}</h1>
        <p class="mt-[2px] pl-[7px] text-[20px] font-semibold leading-7 tracking-[-0.01em] text-white [text-shadow:0_1px_8px_rgba(0,20,50,0.4)] lg:text-[23px]">{{ t('community.feed.hero.subtitle') }}</p>
      </div>
      <div class="absolute inset-x-[36px] bottom-[24px] flex items-center gap-[10px]">
        <form role="search" class="flex h-[44px] w-[190px] shrink-0 xl:w-[233px] items-center gap-[10px] rounded-full bg-white px-[18px] shadow-[0_4px_14px_-6px_rgba(0,20,50,0.4)]" @submit.prevent="search">
          <CmIcon name="search" :size="20" class="text-[#2B3245]" />
          <label for="cm-hero-search" class="sr-only">{{ t('community.feed.searchLabel') }}</label>
          <input id="cm-hero-search" v-model="draft" type="search" maxlength="80" enterkeyhint="search" :placeholder="t('community.feed.hero.searchPlaceholder')" class="h-full min-w-0 flex-1 bg-transparent text-[15px] text-cm-ink outline-none placeholder:text-[#4A5468]" />
        </form>
        <!-- Scrolls sideways when labels are long (e.g. Vietnamese); More stays outside so it is always visible -->
        <ul class="scrollbar-hide -my-3 flex min-w-0 flex-1 items-center gap-[10px] overflow-x-auto py-3" :aria-label="t('community.feed.hero.filters')">
          <li v-for="chip in chips" :key="chip.key" class="shrink-0" :class="chip.wide && 'hidden xl:block'">
            <NuxtLink :to="chip.to" class="flex h-[39px] items-center rounded-full px-[15px] text-[15px] backdrop-blur-md transition" :class="chip.active ? 'bg-white font-medium text-cm-ink shadow-[0_4px_14px_-6px_rgba(0,20,50,0.45)]' : 'bg-white/75 font-normal text-[#1F2638] hover:bg-white/90'" :aria-current="chip.active ? 'true' : undefined">
              {{ chip.label }}
            </NuxtLink>
          </li>
        </ul>
        <div class="relative shrink-0" data-cm-more>
          <button type="button" class="flex h-[39px] items-center gap-[6px] rounded-full px-[15px] text-[15px] backdrop-blur-md transition" :class="moreActive ? 'bg-white font-semibold text-cm-active' : 'bg-white/85 font-normal text-[#1F2638] hover:bg-white'" :aria-expanded="moreOpen" aria-haspopup="true" @click="moreOpen = !moreOpen">
            {{ t('community.feed.hero.more') }}
            <CmIcon name="chevronDown" :size="16" stroke="2" />
          </button>
          <MoreFilters v-if="moreOpen" class="absolute right-0 top-[46px] z-30 w-[300px]" :filters="filters" @pick="moreOpen = false" />
        </div>
      </div>
    </div>

    <!-- Phone: search and scrollable chips, as in the approved mobile feed -->
    <div class="sm:hidden">
      <h1 class="sr-only">{{ t('community.feed.hero.title') }}</h1>
      <form role="search" class="flex h-11 items-center gap-2.5 rounded-full border border-cm-line bg-white px-4 shadow-cm-card" @submit.prevent="search">
        <CmIcon name="search" :size="18" class="text-cm-muted" />
        <label for="cm-hero-search-m" class="sr-only">{{ t('community.feed.searchLabel') }}</label>
        <input id="cm-hero-search-m" v-model="draft" type="search" maxlength="80" enterkeyhint="search" :placeholder="t('community.feed.hero.searchPlaceholder')" class="h-full min-w-0 flex-1 bg-transparent text-[16px] text-cm-ink outline-none placeholder:text-cm-subtle" />
      </form>
      <ul class="scrollbar-hide -mx-4 mt-3 flex gap-2 overflow-x-auto px-4" :aria-label="t('community.feed.hero.filters')">
        <li v-for="chip in chips" :key="chip.key" class="shrink-0">
          <NuxtLink :to="chip.to" class="flex h-9 items-center rounded-full border px-4 text-[14px] font-medium" :class="chip.active ? 'border-cm-primary bg-cm-primary text-white' : 'border-cm-line bg-white text-cm-body'">{{ chip.label }}</NuxtLink>
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CmIcon from '~/components/community/feed/CmIcon.vue'
import MoreFilters from '~/components/community/feed/MoreFilters.vue'
import { communityHeroPhoto } from '~/utils/community-photos'
import { filtersToQuery, hasActiveFilters, type CommunityFilters } from '~/utils/community-filters'

const props = defineProps<{ filters: CommunityFilters }>()
const { t, placeName } = useI18n()
const route = useRoute()
const router = useRouter()

const photo = communityHeroPhoto(1840)
const draft = ref(props.filters.q || '')
watch(() => props.filters.q, (value) => (draft.value = value || ''))
const moreOpen = ref(false)

// Keeps the sort tab; a chip replaces the filters it controls
const link = (patch: Partial<CommunityFilters>, reset = false) => {
  const base: Partial<CommunityFilters> = reset ? { sort: props.filters.sort } : { ...props.filters }
  const query = filtersToQuery({ ...base, ...patch })
  if (typeof route.query.sort === 'string') query.sort = route.query.sort
  return { path: '/community', query }
}

const chips = computed(() => {
  const f = props.filters
  return [
    { key: 'all', label: t('community.feed.hero.all'), to: link({}, true), active: !hasActiveFilters(f) },
    { key: 'family', label: t('community.feed.hero.family'), to: link({ family: f.family ? undefined : true }), active: !!f.family },
    { key: 'japan', label: placeName('Japan'), to: link({ country: f.country === 'Japan' ? undefined : 'Japan' }), active: f.country === 'Japan' },
    // Under 1280px these two live only in More, so the row fits the narrower banner
    { key: 'vietnam', label: placeName('Vietnam'), to: link({ country: f.country === 'Vietnam' ? undefined : 'Vietnam' }), active: f.country === 'Vietnam', wide: true },
    { key: 'budget', label: t('community.feed.hero.budget'), to: link({ budget: f.budget === 'budget' ? undefined : 'budget' }), active: f.budget === 'budget', wide: true }
  ]
})
const moreActive = computed(() => !!(props.filters.duration || props.filters.style || (props.filters.budget && props.filters.budget !== 'budget') || (props.filters.country && !['Japan', 'Vietnam'].includes(props.filters.country))))

const search = () => {
  const q = draft.value.trim()
  router.push(link({ q: q || undefined }))
}

const closeMore = (event: MouseEvent) => {
  if (moreOpen.value && !(event.target as HTMLElement).closest('[data-cm-more]')) moreOpen.value = false
}
onMounted(() => document.addEventListener('click', closeMore))
onBeforeUnmount(() => document.removeEventListener('click', closeMore))
</script>
