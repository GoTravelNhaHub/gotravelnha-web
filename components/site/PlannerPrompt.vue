<template>
  <form class="rounded-3xl border border-[#E2E8F0] bg-white p-5 shadow-xl sm:p-6" @submit.prevent="submit">
    <label :for="inputId" class="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#008A9B]">Describe your trip</label>
    <textarea
      :id="inputId"
      v-model="prompt"
      rows="3"
      maxlength="600"
      :placeholder="examples[0]"
      class="mt-2 block w-full resize-none rounded-xl border border-[#CBD5E1] px-4 py-3 text-[16px] leading-6 text-[#101D3A] placeholder:text-[#94A3B8] focus:border-[#008A9B] focus:outline-none focus:ring-2 focus:ring-[#008A9B]/30"
      @keydown.enter.exact.prevent="submit"
    ></textarea>

    <div class="mt-3 flex flex-wrap gap-2">
      <span class="text-[13px] leading-8 text-[#64748B]">Try:</span>
      <button
        v-for="example in examples.slice(1)"
        :key="example"
        type="button"
        class="min-h-8 rounded-full border border-[#E2E8F0] px-3 text-left text-[13px] text-[#334155] transition hover:border-[#008A9B] hover:bg-[#E8F7FA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#008A9B]"
        @click="prompt = example"
      >
        {{ example }}
      </button>
    </div>

    <div class="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
      <button
        type="submit"
        class="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#008A9B] px-6 text-[15px] font-semibold text-white hover:bg-[#007789] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#008A9B] focus-visible:ring-offset-2"
      >
        Plan my trip
        <svg class="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 10h12m0 0-5-5m5 5-5 5" />
        </svg>
      </button>
      <a
        :href="secondaryHref"
        class="inline-flex min-h-12 items-center justify-center rounded-xl px-4 text-[15px] font-semibold text-[#101D3A] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#008A9B]"
      >
        Or find travel deals
      </a>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, useId } from 'vue'

const props = withDefaults(defineProps<{ placement: string; secondaryHref?: string }>(), { secondaryHref: '#deals' })

const examples = [
  '5 days in Tokyo with 2 adults and 2 kids aged 4 and 9, relaxed pace',
  '4 days in Seoul with a toddler',
  'Weekend in Bangkok with teens',
  'A week in Bali for the school holidays'
]

const inputId = useId()
const prompt = ref('')
const { track } = useFunnel()

// An empty box sends the placeholder example, so the first click always shows a plan
const submit = () => {
  const text = (prompt.value.trim() || examples[0]).slice(0, 600)
  track('planner_prompt_submitted', { placement: props.placement, example: !prompt.value.trim() })
  navigateTo({ path: '/planner', query: { prompt: text } })
}
</script>
