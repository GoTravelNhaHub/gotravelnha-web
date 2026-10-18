<template>
  <Teleport to="body">
    <Transition enter-active-class="transition-opacity duration-200" enter-from-class="opacity-0" leave-active-class="transition-opacity duration-150" leave-to-class="opacity-0">
      <div v-if="open" class="fixed inset-0 z-[80] flex items-end justify-center bg-[#0A1024]/50 backdrop-blur-sm md:items-center md:p-6" @click.self="close">
        <form
          ref="panel"
          tabindex="-1"
          class="flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-[24px] bg-white font-brand shadow-cm-panel md:max-w-[600px] md:rounded-[20px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="customize-title"
          @submit.prevent="submit"
          @keydown.esc="close"
        >
          <header class="flex items-center justify-between gap-3 border-b border-cm-line px-5 py-4 md:px-6">
            <h2 id="customize-title" class="flex items-center gap-2 text-[19px] font-bold tracking-[-0.01em] text-cm-ink">
              <CmIcon name="sparkles" :size="20" class="text-cm-primary" />
              {{ t('community.customize.title') }}
            </h2>
            <button type="button" class="flex h-10 w-10 items-center justify-center rounded-full text-cm-muted hover:bg-cm-canvas hover:text-cm-ink" :aria-label="t('community.customize.close')" @click="close">
              <CmIcon name="close" :size="20" />
            </button>
          </header>

          <div class="flex-1 overflow-y-auto px-5 py-5 md:px-6">
            <!-- Source trip: attribution stays visible -->
            <div class="flex items-center gap-4">
              <img v-if="cover" :src="cover" alt="" width="140" height="84" class="h-[84px] w-[140px] shrink-0 rounded-xl object-cover" />
              <div class="min-w-0">
                <p class="line-clamp-2 text-[16px] font-semibold leading-[22px] text-cm-ink">{{ trip.title }}</p>
                <p class="mt-1.5 flex items-center gap-2 text-[13.5px] text-cm-muted">
                  <CreatorAvatar :name="trip.author.displayName" :src="trip.author.avatarUrl" :size="24" />
                  {{ t('community.trip.by', { name: trip.author.displayName }) }}
                </p>
              </div>
            </div>

            <p class="mt-6 text-[15px] font-semibold text-cm-ink">{{ t('community.customize.tellUs') }}</p>

            <div class="mt-3 grid gap-3 sm:grid-cols-2">
              <label class="block">
                <span class="form-label">{{ t('community.customize.startDate') }}</span>
                <input ref="firstField" v-model="startDate" type="date" required :min="today" class="form-input" />
              </label>
              <label class="block">
                <span class="form-label">{{ t('community.customize.endDate') }}</span>
                <input v-model="endDate" type="date" required :min="startDate || today" class="form-input" />
              </label>
            </div>
            <p class="mt-1.5 text-[12.5px] text-cm-muted">
              {{ dayCount ? t('community.customize.days', { count: dayCount }) : '' }}
              <template v-if="trip.durationDays > MAX_DAYS"> · {{ t('community.customize.maxDays', { max: MAX_DAYS }) }}</template>
            </p>

            <fieldset class="mt-5">
              <legend class="form-label">{{ t('community.customize.travellers') }}</legend>
              <div class="flex flex-wrap items-center gap-3 rounded-xl border border-cm-line px-3.5 py-3">
                <span class="text-[14.5px] text-cm-body">{{ t('community.customize.adults') }}</span>
                <div class="flex items-center gap-1.5">
                  <button type="button" class="stepper" :disabled="adults <= 1" :aria-label="t('community.customize.fewerAdults')" @click="adults--">−</button>
                  <span class="w-6 text-center text-[15px] font-semibold tabular-nums text-cm-ink" aria-live="polite">{{ adults }}</span>
                  <button type="button" class="stepper" :disabled="adults >= 8" :aria-label="t('community.customize.moreAdults')" @click="adults++">+</button>
                </div>
                <span class="mx-1 hidden h-6 w-px bg-cm-line sm:block" aria-hidden="true"></span>
                <span class="text-[14.5px] text-cm-body">{{ t('community.customize.children') }}</span>
                <div class="flex flex-wrap items-center gap-1.5">
                  <label v-for="(age, childIndex) in childAges" :key="childIndex" class="flex items-center gap-1 rounded-full bg-cm-canvas py-1 pl-3 pr-1 text-[13.5px] text-cm-body">
                    <span class="sr-only">{{ t('community.customize.childAge', { n: childIndex + 1 }) }}</span>
                    <select v-model.number="childAges[childIndex]" class="bg-transparent text-[13.5px] font-semibold text-cm-ink outline-none">
                      <option v-for="value in 18" :key="value - 1" :value="value - 1">{{ t('community.customize.age', { age: value - 1 }) }}</option>
                    </select>
                    <button type="button" class="flex h-7 w-7 items-center justify-center rounded-full text-cm-muted hover:bg-white" :aria-label="t('community.customize.removeChild')" @click="childAges.splice(childIndex, 1)">
                      <CmIcon name="close" :size="14" />
                    </button>
                  </label>
                  <button v-if="childAges.length < 6" type="button" class="h-8 rounded-full border border-dashed border-[#CFE0F7] px-3 text-[13px] font-semibold text-cm-active hover:border-cm-primary" @click="childAges.push(6)">
                    + {{ t('community.customize.addChild') }}
                  </button>
                </div>
              </div>
            </fieldset>

            <label class="mt-5 block">
              <span class="form-label">{{ t('community.customize.budget') }} <span class="font-normal text-cm-subtle">({{ t('community.customize.optional') }})</span></span>
              <span class="relative block">
                <span class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[14px] text-cm-muted">SGD</span>
                <input v-model.number="budget" type="number" min="0" step="50" inputmode="numeric" :placeholder="t('community.customize.budgetPlaceholder')" class="form-input pl-14" />
              </span>
            </label>

            <fieldset class="mt-5">
              <legend class="form-label">{{ t('community.customize.interests') }} <span class="font-normal text-cm-subtle">({{ t('community.customize.optional') }})</span></legend>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="interest in INTERESTS"
                  :key="interest"
                  type="button"
                  class="h-9 rounded-full px-4 text-[14px] font-medium transition"
                  :class="picked.has(interest) ? 'bg-cm-soft text-cm-active ring-1 ring-[#CFE0F7]' : 'bg-cm-canvas text-cm-body hover:bg-[#EEF2F8]'"
                  :aria-pressed="picked.has(interest)"
                  @click="togglePick(interest)"
                >
                  {{ t(`community.customize.chips.${interest}`) }}
                </button>
              </div>
              <label class="mt-3 block">
                <span class="sr-only">{{ t('community.customize.notesLabel') }}</span>
                <input v-model="notes" type="text" maxlength="300" :placeholder="t('community.customize.notesPlaceholder')" class="form-input" />
              </label>
            </fieldset>

            <p v-if="error" class="alert-error mt-4" role="alert">{{ error }}</p>
            <p class="mt-4 text-[12.5px] leading-5 text-cm-muted">{{ t('community.customize.privacy') }}</p>
          </div>

          <footer class="border-t border-cm-line px-5 py-4 md:px-6">
            <button type="submit" class="cm-btn-primary h-[52px] w-full text-[16px]">
              {{ t('community.customize.submit') }}
              <CmIcon name="arrowRight" :size="18" stroke="2" />
            </button>
          </footer>
        </form>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import CmIcon from '~/components/community/feed/CmIcon.vue'
import CreatorAvatar from '~/components/community/feed/CreatorAvatar.vue'
import type { PublishedTripView } from '~/types/community'
import { writeAdaptHandoff } from '~/utils/community-adapt'

// The planner's limit (MAX_TRIP_DAYS in server/services/itinerary-generator.ts)
const MAX_DAYS = 10
const INTERESTS = ['kids', 'food', 'culture', 'lessWalking', 'nature', 'themeParks'] as const
type Interest = (typeof INTERESTS)[number]
// Interests are sent to the planner in English, like its other inputs
const INTEREST_TEXT: Record<Interest, string> = {
  kids: 'kid-friendly',
  food: 'food',
  culture: 'culture',
  lessWalking: 'less walking',
  nature: 'nature and parks',
  themeParks: 'theme parks'
}
const BAND_AGES: Record<string, number> = { '0-2': 1, '3-5': 4, '6-12': 8, '13-17': 14 }

const props = defineProps<{ open: boolean; trip: PublishedTripView; cover: string | null; placement: string }>()
const emit = defineEmits<{ close: [] }>()
const { t } = useI18n()
const { track } = useFunnel()

const iso = (date: Date) => date.toISOString().slice(0, 10)
const addDays = (value: string, days: number) => {
  const date = new Date(`${value}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return iso(date)
}
const today = iso(new Date())

const startDate = ref('')
const endDate = ref('')
const adults = ref(2)
const childAges = ref<number[]>([])
const budget = ref<number | null>(null)
const picked = ref(new Set<Interest>())
const notes = ref('')
const error = ref('')
const panel = ref<HTMLElement | null>(null)
const firstField = ref<HTMLInputElement | null>(null)

// Defaults from the trip: same length (up to the planner's limit) starting in a month,
// children from the age groups the author shared
const reset = () => {
  startDate.value = addDays(today, 30)
  endDate.value = addDays(startDate.value, Math.min(props.trip.durationDays, MAX_DAYS) - 1)
  adults.value = 2
  childAges.value = props.trip.childAgeBands.map((band) => BAND_AGES[band]).filter((age) => age !== undefined)
  if (!childAges.value.length && props.trip.familyFriendly) childAges.value = [6]
  budget.value = null
  picked.value = new Set(props.trip.familyFriendly ? ['kids'] : [])
  notes.value = ''
  error.value = ''
}

const dayCount = computed(() => {
  if (!startDate.value || !endDate.value || endDate.value < startDate.value) return 0
  return Math.round((Date.parse(endDate.value) - Date.parse(startDate.value)) / 86_400_000) + 1
})

const togglePick = (interest: Interest) => {
  const next = new Set(picked.value)
  if (next.has(interest)) next.delete(interest)
  else next.add(interest)
  picked.value = next
}

watch(
  () => props.open,
  async (open) => {
    if (import.meta.client) document.body.style.overflow = open ? 'hidden' : ''
    if (!open) return
    reset()
    await nextTick()
    // Desktop only: on phones focusing a date field opens the keyboard over the sheet
    if (window.matchMedia('(min-width: 768px)').matches) firstField.value?.focus()
    else panel.value?.focus()
  }
)

const close = () => emit('close')

const submit = () => {
  error.value = ''
  if (!startDate.value || startDate.value < today) return (error.value = t('community.customize.errorStart'))
  if (!dayCount.value) return (error.value = t('community.customize.errorEnd'))
  if (dayCount.value > MAX_DAYS) return (error.value = t('community.customize.maxDays', { max: MAX_DAYS }))

  const interests = [...[...picked.value].map((interest) => INTEREST_TEXT[interest]), notes.value.trim()].filter(Boolean).join('; ')
  const pace = props.trip.travelStyle === 'relaxed' || props.trip.travelStyle === 'balanced' || props.trip.travelStyle === 'packed' ? props.trip.travelStyle : null
  writeAdaptHandoff({
    slug: props.trip.slug,
    tripId: props.trip.id,
    startDate: startDate.value,
    endDate: endDate.value,
    adults: adults.value,
    childAges: [...childAges.value],
    budget: budget.value && budget.value > 0 ? budget.value : null,
    interests,
    pace
  })
  track('itinerary_customize_submit', { tripId: props.trip.id, placement: props.placement, days: dayCount.value })
  if (import.meta.client) document.body.style.overflow = ''
  navigateTo(`/planner?adapt=${encodeURIComponent(props.trip.slug)}`)
}
</script>

<style scoped>
.stepper {
  @apply flex h-8 w-8 items-center justify-center rounded-full border border-[#CFE0F7] text-[17px] font-semibold text-cm-active transition hover:border-cm-primary disabled:cursor-not-allowed disabled:opacity-40;
}
</style>
