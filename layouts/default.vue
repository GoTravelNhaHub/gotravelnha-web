<template>
  <!-- One shell for the site, from the community design: header, side rail (1280px and up), page,
       footer, phone tab bar. Full-screen app pages (meta.wide, the AI planner) keep the rail and tab bar
       but have no footer, and use the visible height (dvh): 100vh is taller than the visible area
       on phones while the address bar shows. -->
  <div class="flex flex-col bg-cm-canvas text-ink" :class="wide ? 'h-dvh overflow-hidden' : 'min-h-screen'">
    <SiteHeader />

    <div v-if="wide" class="min-h-0 w-full flex-1 xl:grid xl:grid-cols-[198px_minmax(0,1fr)] xl:gap-[18px] xl:pl-[26px] 3xl:grid-cols-[220px_minmax(0,1fr)] 3xl:gap-6 3xl:pl-8">
      <!-- The rail scrolls on its own; no planner promo here, this is the planner -->
      <aside class="hidden min-h-0 overflow-y-auto xl:block print:hidden">
        <div class="pb-6 pt-[19px]">
          <SideNav />
        </div>
      </aside>
      <!-- Phones: room for the fixed tab bar, so the planner's message box sits above it -->
      <main class="h-full min-h-0 min-w-0 overflow-hidden pb-[calc(60px+env(safe-area-inset-bottom))] md:pb-0">
        <NuxtPage />
      </main>
    </div>

    <div v-else class="w-full flex-1 xl:grid xl:grid-cols-[198px_minmax(0,1fr)] xl:gap-[18px] xl:px-[26px] 3xl:grid-cols-[220px_minmax(0,1fr)] 3xl:gap-6 3xl:px-8">
      <aside class="hidden xl:block print:hidden">
        <div class="sticky top-[82px] pb-6 pt-[19px]">
          <SideNav />
          <PlannerPromo class="mt-[29px]" />
        </div>
      </aside>
      <!-- Full-width pages (meta.bleed) draw their own hero and use .site-shell for content -->
      <main class="min-w-0" :class="bleed ? 'xl:pt-px' : 'site-shell pt-6 xl:px-0 print:pt-0'">
        <NuxtPage />
      </main>
    </div>

    <SiteFooter v-if="!wide" class="mb-[60px] md:mb-0" :class="bleed ? 'mt-0' : 'mt-12 sm:mt-16'" />
    <TabBar />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import PlannerPromo from '~/components/community/feed/PlannerPromo.vue'
import SideNav from '~/components/site/SideNav.vue'
import SiteFooter from '~/components/site/SiteFooter.vue'
import SiteHeader from '~/components/site/SiteHeader.vue'
import TabBar from '~/components/site/TabBar.vue'

const route = useRoute()
const wide = computed(() => route.meta.wide === true)
const bleed = computed(() => route.meta.bleed === true)
</script>
