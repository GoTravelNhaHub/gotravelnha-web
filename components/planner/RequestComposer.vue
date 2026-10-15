<template>
  <form @submit.prevent="$emit('submit')">
    <label class="sr-only" for="planner-request">Describe your trip, or ask for a change</label>
    <div
      class="rounded-2xl border border-[#E2E8F0] bg-white shadow-[0_1px_2px_rgba(16,29,58,0.06)] transition focus-within:border-[#008A9B] focus-within:shadow-[0_0_0_3px_rgba(0,138,155,0.15)]"
    >
      <textarea
        id="planner-request"
        ref="box"
        :value="modelValue"
        rows="1"
        :maxlength="MAX_LENGTH"
        placeholder="Describe your trip, or ask for a change…"
        aria-describedby="planner-request-help"
        class="block w-full resize-none border-0 bg-transparent px-4 pb-1 pt-3.5 text-[16px] leading-6 text-[#1E293B] placeholder:text-[#94A3B8] focus:outline-none focus:ring-0 sm:text-[15px]"
        :style="{ maxHeight: `${MAX_HEIGHT}px` }"
        @input="onInput"
        @keydown.enter.exact.prevent="$emit('submit')"
      ></textarea>

      <div class="flex items-center justify-between gap-3 px-3 pb-3 pt-1">
        <p id="planner-request-help" class="min-w-0 truncate pl-1 text-[12px] leading-[18px] text-[#94A3B8]">
          <span v-if="nearLimit" :class="modelValue.length >= MAX_LENGTH ? 'font-semibold text-[#B45309]' : ''">
            {{ modelValue.length }} / {{ MAX_LENGTH }}
          </span>
          <span v-else class="hidden sm:inline">
            <kbd class="font-sans font-semibold text-[#64748B]">Enter</kbd> to send ·
            <kbd class="font-sans font-semibold text-[#64748B]">Shift + Enter</kbd> for a new line
          </span>
        </p>
        <button
          type="submit"
          :disabled="loading || thinking"
          class="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl bg-[#008A9B] px-4 text-[14px] font-semibold text-white transition hover:bg-[#007789] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#101D3A] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span v-if="loading || thinking" class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true"></span>
          <PlannerIcon v-else name="send" class="h-4 w-4" />
          {{ buttonLabel }}
        </button>
      </div>
    </div>
    <p v-if="loading" class="mt-2 text-[12px] leading-[18px] text-[#64748B]">Planning the days. This can take up to a minute.</p>
    <p v-else-if="thinking" class="mt-2 text-[12px] leading-[18px] text-[#64748B]">The agent is reading your message.</p>
    <p v-else-if="!authenticated" class="mt-2 text-[12px] leading-[18px] text-[#64748B]">Guests can create 3 plans a day.</p>
  </form>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import PlannerIcon from '~/components/planner/PlannerIcon.vue'

const MAX_LENGTH = 500
// About seven lines; longer text scrolls inside the box
const MAX_HEIGHT = 184

const props = defineProps<{
  modelValue: string
  loading: boolean
  thinking?: boolean
  authenticated: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  submit: []
}>()

const box = ref<HTMLTextAreaElement | null>(null)

const nearLimit = computed(() => props.modelValue.length >= MAX_LENGTH - 100)
// An empty box plans from the brief as it stands (see ask() in pages/planner/index.vue)
const buttonLabel = computed(() => {
  if (props.loading) return 'Planning'
  if (props.thinking) return 'Replying'
  return props.modelValue.trim() ? 'Send' : 'Plan trip'
})

// Grow with the text, including text set from outside (a prompt from the home page, a quick reply)
const resize = () => {
  const el = box.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT)}px`
  el.style.overflowY = el.scrollHeight > MAX_HEIGHT ? 'auto' : 'hidden'
}

const onInput = (event: Event) => {
  emit('update:modelValue', (event.target as HTMLTextAreaElement).value)
  resize()
}

watch(
  () => props.modelValue,
  () => nextTick(resize)
)
onMounted(resize)
</script>
