<template>
  <form @submit.prevent="$emit('submit')">
    <label class="sr-only" for="planner-request">Describe your trip, or ask for a change</label>
    <div class="flex min-h-12 items-end gap-2 rounded-2xl border border-[#E2E8F0] bg-white py-1 pl-3 pr-1 focus-within:ring-2 focus-within:ring-[#008A9B]">
      <textarea
        id="planner-request"
        :value="modelValue"
        rows="1"
        maxlength="500"
        placeholder="Message the agent…"
        class="max-h-32 min-h-11 w-full flex-1 resize-none border-0 bg-transparent py-2.5 text-[16px] leading-6 sm:text-[14px] sm:leading-[21px] text-[#334155] placeholder:text-[#94A3B8] focus:outline-none focus:ring-0"
        @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
        @keydown.enter.exact.prevent="$emit('submit')"
      ></textarea>
      <button
        type="submit"
        :disabled="loading || thinking"
        :aria-label="loading ? 'Planning' : thinking ? 'Agent is replying' : 'Send to the agent'"
        class="mb-0.5 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#008A9B] text-white hover:bg-[#007789] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#101D3A] disabled:opacity-60 sm:h-10 sm:w-10"
      >
        <span v-if="loading || thinking" class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"></span>
        <PlannerIcon v-else name="send" class="h-4 w-4" />
      </button>
    </div>
    <p v-if="loading" class="mt-2 text-[12px] leading-[18px] text-[#64748B]">Planning the days. This can take up to a minute.</p>
    <p v-else-if="thinking" class="mt-2 text-[12px] leading-[18px] text-[#64748B]">The agent is reading your message.</p>
    <p v-else-if="!authenticated" class="mt-2 text-[12px] leading-[18px] text-[#64748B]">Guests can create 3 plans a day.</p>
  </form>
</template>

<script setup lang="ts">
import PlannerIcon from '~/components/planner/PlannerIcon.vue'

defineProps<{
  modelValue: string
  loading: boolean
  thinking?: boolean
  authenticated: boolean
}>()

defineEmits<{
  'update:modelValue': [value: string]
  submit: []
}>()
</script>
