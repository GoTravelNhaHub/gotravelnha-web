<template>
  <div class="site-gutter flex h-full min-h-0 flex-col py-3">
    <div class="mb-2 shrink-0 lg:hidden">
      <div class="grid grid-cols-2 rounded-full bg-[#F1F5F9] p-1" role="tablist" aria-label="Planner">
        <button
          type="button"
          role="tab"
          :aria-selected="tab === 'talk'"
          class="inline-flex min-h-11 items-center justify-center rounded-full text-[13px] font-semibold leading-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#008A9B]"
          :class="tab === 'talk' ? 'bg-[#008A9B] text-white' : 'text-[#101D3A]'"
          @click="$emit('update:tab', 'talk')"
        >
          Chat
        </button>
        <button
          type="button"
          role="tab"
          :aria-selected="tab === 'plan'"
          class="inline-flex min-h-11 items-center justify-center gap-2 rounded-full text-[13px] font-semibold leading-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#008A9B]"
          :class="tab === 'plan' ? 'bg-[#008A9B] text-white' : 'text-[#101D3A]'"
          @click="$emit('update:tab', 'plan')"
        >
          Itinerary
          <span v-if="hasPlan && tab !== 'plan'" class="h-2 w-2 rounded-full bg-[#059669]" aria-label="Plan ready"></span>
        </button>
      </div>
    </div>

    <div class="grid min-h-0 flex-1 grid-cols-1 grid-rows-[minmax(0,1fr)] gap-2 sm:gap-3 lg:grid-cols-[minmax(360px,400px)_minmax(0,1fr)] 2xl:grid-cols-[440px_minmax(0,1fr)]">
      <section
        :class="tab === 'talk' ? 'flex' : 'hidden lg:flex'"
        class="min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white p-3 shadow-[0_1px_3px_rgba(16,29,58,0.06)] sm:p-4"
      >
        <slot name="conversation" />
      </section>
      <section
        :class="tab === 'plan' ? 'block' : 'hidden lg:block'"
        class="min-h-0 overflow-y-auto rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-[0_1px_3px_rgba(16,29,58,0.06)] sm:p-6 xl:p-8"
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
</script>
