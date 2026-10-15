<template>
  <div class="flex min-h-[28rem] flex-col items-center justify-center rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-5 py-10 text-center">
    <span class="inline-flex h-14 w-14 items-center justify-center rounded-full bg-sea-50 text-sea">
      <span v-if="kind === 'loading'" class="h-6 w-6 animate-spin rounded-full border-2 border-sea/30 border-t-sea"></span>
      <PlannerIcon v-else :name="kind === 'error' ? 'info' : 'calendar'" class="h-7 w-7" />
    </span>
    <h2 class="mt-4 text-[22px] font-bold leading-[30px] tracking-[-0.025em] text-[#101D3A]">{{ title }}</h2>
    <p class="mx-auto mt-2 max-w-md text-sm leading-6 text-ink/70" :role="kind === 'error' ? 'alert' : undefined">{{ message }}</p>
    <button
      v-if="kind === 'error'"
      type="button"
      class="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#008A9B] px-5 text-[14px] font-semibold text-white hover:bg-[#007789] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#008A9B] focus-visible:ring-offset-2"
      @click="$emit('retry')"
    >
      <PlannerIcon name="refresh" class="h-4 w-4" />
      {{ t('planner.states.tryAgain') }}
    </button>

    <ol v-if="kind === 'loading'" class="mt-8 w-full max-w-md space-y-2 text-left" :aria-label="t('planner.states.progress')">
      <li
        v-for="(step, index) in workSteps"
        :key="step"
        class="flex items-center gap-3 rounded-xl border bg-white px-3 py-2.5 text-sm"
        :class="index === activeStep ? 'border-sea text-ink' : 'border-line text-ink/70'"
        :aria-current="index === activeStep ? 'step' : undefined"
      >
        <span class="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full" :class="index < activeStep ? 'bg-[#059669] text-white' : 'bg-sea-50 text-sea'">
          <PlannerIcon v-if="index < activeStep" name="check" class="h-3.5 w-3.5" />
          <span v-else-if="index === activeStep" class="h-3 w-3 animate-spin rounded-full border-2 border-sea/30 border-t-sea"></span>
          <span v-else class="text-xs font-semibold">{{ index + 1 }}</span>
        </span>
        <span :class="index === activeStep ? 'font-semibold' : ''">{{ step }}</span>
      </li>
    </ol>

    <ol v-else-if="kind === 'empty'" class="mt-8 grid w-full max-w-lg gap-3 text-left sm:grid-cols-3">
      <li v-for="(step, index) in tm<string[]>('planner.states.steps')" :key="step" class="rounded-xl border border-line bg-white p-3 text-sm text-ink">
        <span class="block text-xs font-semibold text-sea">{{ t('planner.states.step', { n: index + 1 }) }}</span>
        {{ step }}
      </li>
    </ol>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import PlannerIcon from '~/components/planner/PlannerIcon.vue'

const props = defineProps<{
  kind: 'empty' | 'loading' | 'error'
  message?: string
  destination?: string
  revising?: boolean
}>()

defineEmits<{ retry: [] }>()

const { t, tm, placeName } = useI18n()

// One request does all of this, so the steps advance on a timer and the last one
// stays open until the plan arrives
const workSteps = computed(() => [
  t(props.revising ? 'planner.states.readingChange' : 'planner.states.readingBrief'),
  props.destination ? t('planner.states.checkingActivitiesIn', { destination: placeName(props.destination) }) : t('planner.states.checkingActivities'),
  t(props.revising ? 'planner.states.rewriting' : 'planner.states.drafting'),
  t('planner.states.matching')
])
const activeStep = ref(0)
let timer: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  if (props.kind !== 'loading') return
  timer = setInterval(() => {
    if (activeStep.value < workSteps.value.length - 1) activeStep.value += 1
  }, 6000)
})
onBeforeUnmount(() => clearInterval(timer))

const title = computed(() => {
  if (props.kind === 'loading') return t(props.revising ? 'planner.states.revisingTitle' : 'planner.states.planningTitle')
  if (props.kind === 'error') return t('planner.states.errorTitle')
  return t('planner.states.emptyTitle')
})

const message = computed(() => {
  if (props.message) return props.message
  if (props.kind === 'loading') return t('planner.states.loadingText')
  return t('planner.states.emptyText')
})
</script>
