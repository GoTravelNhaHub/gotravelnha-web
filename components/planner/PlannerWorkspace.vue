<template>
  <!-- Side padding as .site-gutter, except beside the side rail (1280px and up), which gives the left spacing.
       Bottom: the phone tab bar covers the home-indicator area, so only a small gap is needed there. -->
  <div class="flex h-full min-h-0 flex-col px-4 pt-3 pb-3 sm:px-6 lg:px-8 md:pb-[max(0.75rem,env(safe-area-inset-bottom))] xl:pl-0 xl:pr-[26px] 3xl:pr-8">
    <div class="mb-2 shrink-0 lg:hidden">
      <div class="grid grid-cols-2 rounded-full bg-[#F1F5F9] p-1" role="tablist" :aria-label="t('planner.workspace.label')">
        <button
          type="button"
          role="tab"
          :aria-selected="tab === 'talk'"
          class="inline-flex min-h-11 items-center justify-center rounded-full text-[13px] font-semibold leading-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066E4]"
          :class="tab === 'talk' ? 'bg-[#0066E4] text-white' : 'text-[#0A1024]'"
          @click="$emit('update:tab', 'talk')"
        >
          {{ t('planner.workspace.chat') }}
        </button>
        <button
          type="button"
          role="tab"
          :aria-selected="tab === 'plan'"
          class="inline-flex min-h-11 items-center justify-center gap-2 rounded-full text-[13px] font-semibold leading-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066E4]"
          :class="tab === 'plan' ? 'bg-[#0066E4] text-white' : 'text-[#0A1024]'"
          @click="$emit('update:tab', 'plan')"
        >
          {{ t('planner.workspace.itinerary') }}
          <span v-if="hasPlan && tab !== 'plan'" class="h-2 w-2 rounded-full bg-[#059669]" :aria-label="t('planner.workspace.planReady')"></span>
        </button>
      </div>
    </div>

    <div class="grid min-h-0 flex-1 grid-cols-1 grid-rows-[minmax(0,1fr)] gap-2 sm:gap-3 lg:grid-cols-[minmax(360px,400px)_minmax(0,1fr)] 2xl:grid-cols-[440px_minmax(0,1fr)]">
      <section
        :class="tab === 'talk' ? 'flex' : 'hidden lg:flex'"
        class="min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white p-3 shadow-[0_1px_3px_rgba(10,16,36,0.06)] sm:p-4"
      >
        <slot name="conversation" />
      </section>
      <section
        :class="tab === 'plan' ? 'block' : 'hidden lg:block'"
        class="min-h-0 overflow-y-auto rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-[0_1px_3px_rgba(10,16,36,0.06)] sm:p-6 xl:p-8"
      >
        <slot name="itinerary" />
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  tab: 'talk' | 'plan'
  hasPlan?: boolean
}>()

defineEmits<{
  'update:tab': [tab: 'talk' | 'plan']
}>()

const { t } = useI18n()
</script>
