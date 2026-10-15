<template>
  <div class="flex h-full flex-col overflow-hidden font-brand text-[#334155]">
    <PlannerWorkspace v-model:tab="tab" :has-plan="!!result">
      <template #conversation>
        <div class="flex h-full min-h-0 min-w-0 flex-col">
          <header class="flex shrink-0 items-center justify-between gap-2 border-b border-[#E2E8F0] pb-3">
            <div class="flex min-w-0 items-center gap-2.5">
              <span class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E8F7FA] text-[#008A9B]" aria-hidden="true">
                <PlannerIcon name="spark" class="h-4 w-4" />
              </span>
              <div class="min-w-0">
                <h1 class="truncate text-[15px] font-bold leading-5 tracking-[-0.01em] text-[#101D3A]">{{ t('planner.header.title') }}</h1>
                <p class="truncate text-[12px] leading-[18px] text-[#64748B]">{{ t('planner.header.subtitle') }}</p>
              </div>
            </div>
            <!-- Icon-only on phones so the title keeps one line; labels from sm up -->
            <div class="flex shrink-0 items-center gap-0.5 sm:gap-1">
              <button
                v-if="hasUserNote || result"
                type="button"
                :title="t('planner.header.newTrip')"
                class="inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-lg text-[13px] font-semibold leading-5 text-[#101D3A] hover:bg-[#F1F5F9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#008A9B] disabled:opacity-50 sm:min-h-9 sm:min-w-0 sm:px-2.5"
                :disabled="busy"
                @click="newTrip"
              >
                <PlannerIcon name="refresh" class="h-4 w-4 text-[#008A9B]" />
                <span class="sr-only sm:not-sr-only">{{ t('planner.header.newTrip') }}</span>
              </button>
              <NuxtLink
                :to="tripsTo"
                :title="t('planner.header.myTrips')"
                class="inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-lg text-[13px] font-semibold leading-5 text-[#101D3A] hover:bg-[#F1F5F9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#008A9B] sm:min-h-9 sm:min-w-0 sm:px-2.5"
              >
                <PlannerIcon name="bookmark" class="h-4 w-4 text-[#008A9B]" />
                <span class="sr-only sm:not-sr-only">{{ t('planner.header.myTrips') }}</span>
              </NuxtLink>
            </div>
          </header>

          <section class="shrink-0 border-b border-[#E2E8F0] py-3" :aria-label="t('planner.brief.title')">
            <div class="flex items-center justify-between gap-2">
              <h2 class="text-[11px] font-semibold uppercase leading-4 tracking-[0.06em] text-[#64748B]">{{ t('planner.brief.title') }}</h2>
              <span class="inline-flex items-center gap-1.5 text-[11px] font-semibold leading-4" :class="briefMissing.length ? 'text-[#C2410C]' : 'text-[#047857]'">
                <span class="h-1.5 w-1.5 rounded-full" :class="briefMissing.length ? 'bg-[#F97316]' : 'bg-[#10B981]'" aria-hidden="true"></span>
                {{ briefMissing.length ? t('planner.brief.needs', { fields: briefMissing.map((field) => t(`planner.brief.missing.${field}`)).join(', ') }) : t('planner.brief.ready') }}
              </span>
            </div>
            <div class="mt-2 flex flex-wrap gap-1.5">
              <button
                v-for="field in briefFields"
                :key="field.id"
                type="button"
                class="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-lg border px-2.5 text-[12px] font-semibold leading-[18px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#008A9B] sm:min-h-8"
                :class="[
                  field.active ? 'border-[#008A9B] bg-[#E8F7FA] text-[#008A9B]' : 'bg-white hover:bg-[#F8FAFC]',
                  !field.active && (field.value ? 'border-[#E2E8F0] text-[#101D3A]' : 'border-dashed border-[#CBD5E1] text-[#64748B]')
                ]"
                :aria-expanded="field.active"
                :aria-label="t('planner.brief.edit', { label: field.label, value: field.value || t('planner.brief.notSet') })"
                @click="toggleControl(field.control)"
              >
                <PlannerIcon :name="field.icon" class="h-3.5 w-3.5 shrink-0" :class="field.value || field.active ? 'text-[#008A9B]' : ''" />
                {{ field.value || field.placeholder }}
              </button>
            </div>
            <div v-if="partyOpen || preferencesOpen" class="mt-3 max-h-[45dvh] overflow-y-auto">
              <div v-if="partyOpen" class="rounded-xl border border-[#E2E8F0] bg-white p-3">
                <TravellerStrip :party="party" :authenticated="isAuthenticated" @add="addTraveller" @remove="removeTraveller" />
              </div>
              <PreferenceSheet v-if="preferencesOpen" v-model:open="preferencesOpen" :form="form" :today="today" />
            </div>
          </section>

          <div ref="logEl" class="-mx-1 min-h-0 flex-1 space-y-4 overflow-y-auto px-1 py-4">
            <ul class="space-y-5" role="log" aria-live="polite" aria-relevant="additions">
              <li
                v-for="(note, index) in messages"
                :key="note.id"
                class="flex flex-col"
                :class="note.role === 'user' ? 'items-end' : 'items-start'"
              >
                <div class="max-w-[92%]" :class="note.role === 'user' ? 'text-right' : ''">
                  <p v-if="note.time" class="mb-1 text-[11px] leading-4 text-[#94A3B8]">
                    {{ note.role === 'user' ? t('planner.chat.you') : t('planner.chat.agent') }} · {{ note.time }}
                  </p>
                  <p
                    class="inline-block whitespace-pre-line px-3.5 py-2.5 text-left text-[14px] leading-[21px]"
                    :class="note.role === 'user' ? 'rounded-2xl rounded-br-md bg-[#008A9B] text-white' : 'rounded-2xl rounded-bl-md bg-[#F1F5F9] text-[#1E293B]'"
                  >
                    {{ note.key ? t(note.key) : note.text }}
                  </p>
                  <ul v-if="note.actions?.length" class="mt-2 space-y-1 rounded-xl border border-[#E2E8F0] bg-white px-3 py-2 text-left" :aria-label="t('planner.chat.briefUpdated')">
                    <li v-for="action in note.actions" :key="action" class="flex items-start gap-1.5 text-[12px] leading-[18px] text-[#475569]">
                      <PlannerIcon name="check" class="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#059669]" />
                      {{ action }}
                    </li>
                  </ul>
                  <div v-if="repliesFor(note).length && index === messages.length - 1 && !busy" class="mt-2 flex flex-wrap gap-1.5">
                    <button
                      v-for="reply in repliesFor(note)"
                      :key="reply"
                      type="button"
                      class="min-h-11 rounded-full border border-[#008A9B]/40 bg-white px-3 text-[13px] font-medium leading-5 text-[#007789] hover:bg-[#E8F7FA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#008A9B] sm:min-h-8"
                      @click="sendReply(reply)"
                    >
                      {{ reply }}
                    </button>
                  </div>
                </div>
              </li>
              <li v-if="thinking" class="flex items-start">
                <div class="inline-flex items-center gap-1 rounded-2xl rounded-bl-md bg-[#F1F5F9] px-3.5 py-3">
                  <span class="sr-only">{{ t('planner.chat.thinking') }}</span>
                  <span v-for="n in 3" :key="n" class="h-1.5 w-1.5 animate-bounce rounded-full bg-[#64748B]" :style="{ animationDelay: `${(n - 1) * 150}ms` }" aria-hidden="true"></span>
                </div>
              </li>
            </ul>
            <PromptSuggestions v-if="!hasUserNote" class="lg:hidden" @select="applyPrompt" />
          </div>

          <div class="shrink-0 space-y-2 pt-1">
            <div v-if="result && !busy" class="-mx-1 flex gap-1.5 overflow-x-auto px-1 [scrollbar-width:none]" :aria-label="t('planner.chat.quickChanges')">
              <button
                v-for="item in adjustments"
                :key="item.id"
                type="button"
                class="min-h-11 shrink-0 rounded-full border border-[#E2E8F0] bg-white px-3 text-[12px] font-semibold leading-[18px] text-[#334155] hover:border-[#008A9B] hover:text-[#008A9B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#008A9B] sm:min-h-8"
                @click="adjust(item.id)"
              >
                {{ t(`planner.adjust.${item.id}`) }}
              </button>
            </div>
            <RequestComposer v-model="draft" :loading="loading" :thinking="thinking" :authenticated="isAuthenticated" @submit="ask" />
          </div>
        </div>
      </template>

      <template #itinerary>
        <div class="space-y-4">
          <div v-if="result && !loading" class="flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              class="inline-flex min-h-11 items-center gap-1.5 text-[13px] font-semibold text-[#64748B] hover:text-[#101D3A]"
              @click="startOver"
            >
              <PlannerIcon name="refresh" class="h-4 w-4" />
              {{ t('planner.plan.another') }}
            </button>
            <p v-if="result.catalogueSize === 0" class="text-sm text-ink/70">
              {{ t('planner.plan.ideasOnly', { destination: placeName(result.request.destination) }) }}
            </p>
          </div>

          <template v-if="result && !loading">
            <PlannerBoard
              :itinerary="result.itinerary"
              :activities="result.activities"
              :request="result.request"
              :authenticated="isAuthenticated"
              :saving="saving"
              @save="saveTrip"
              @refine="refine"
            />
            <!-- Asked right after a plan, when interest is highest -->
            <NewsletterSignup
              source="planner_after_plan"
              :title="t('planner.plan.newsletterTitle', { destination: placeName(result.request.destination) })"
              :text="t('planner.plan.newsletterText')"
              :button-label="t('planner.plan.newsletterButton')"
            />
          </template>
          <PlannerStates v-else-if="loading" kind="loading" :destination="form.destination" :revising="revising" />
          <PlannerStates v-else-if="error" kind="error" :message="error" @retry="retry" />
          <div v-else class="mx-auto max-w-5xl py-2 sm:py-4">
            <p class="text-[12px] font-semibold uppercase leading-[18px] tracking-[0.06em] text-[#008A9B]">{{ t('planner.start.eyebrow') }}</p>
            <h2 class="mt-1 text-[24px] font-bold leading-8 tracking-[-0.025em] text-[#101D3A] sm:text-[28px] sm:leading-9">{{ t('planner.start.title') }}</h2>
            <p class="mt-2 max-w-2xl text-[14px] leading-[22px] text-[#64748B]">
              {{ t('planner.start.text') }}
            </p>
            <PromptSuggestions layout="gallery" class="mt-6" @select="applyPrompt" />
            <ol class="mt-8 grid gap-4 border-t border-[#E2E8F0] pt-6 sm:grid-cols-3">
              <li v-for="(step, index) in tm<{ title: string; text: string }[]>('planner.start.how')" :key="step.title" class="flex items-start gap-3">
                <span class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#E8F7FA] text-[13px] font-bold text-[#008A9B]">{{ index + 1 }}</span>
                <span>
                  <span class="block text-[14px] font-semibold leading-5 text-[#101D3A]">{{ step.title }}</span>
                  <span class="mt-0.5 block text-[13px] leading-5 text-[#64748B]">{{ step.text }}</span>
                </span>
              </li>
            </ol>
            <p class="mt-6 text-[12px] leading-[18px] text-[#94A3B8]">{{ t('planner.start.disclaimer') }}</p>
          </div>
        </div>
      </template>
    </PlannerWorkspace>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ wide: true })

import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PlannerBoard from '~/components/planner/PlannerBoard.vue'
import NewsletterSignup from '~/components/NewsletterSignup.vue'
import PlannerIcon from '~/components/planner/PlannerIcon.vue'
import type { PlannerIconName } from '~/components/planner/PlannerIcon.vue'
import PlannerStates from '~/components/planner/PlannerStates.vue'
import PlannerWorkspace from '~/components/planner/PlannerWorkspace.vue'
import PreferenceSheet from '~/components/planner/PreferenceSheet.vue'
import PromptSuggestions from '~/components/planner/PromptSuggestions.vue'
import type { PlannerPrompt } from '~/components/planner/PromptSuggestions.vue'
import RequestComposer from '~/components/planner/RequestComposer.vue'
import TravellerStrip from '~/components/planner/TravellerStrip.vue'
import type { PartyRow } from '~/components/planner/TravellerStrip.vue'
import type { Itinerary, LiveActivity, TripPace } from '~/types/trip'

interface PlannerResult {
  generationId: string
  request: {
    destination: string
    startDate: string
    endDate: string
    party: Array<{ name?: string; age: number }>
    budget?: number | null
    pace?: TripPace
    interests?: string
  }
  itinerary: Itinerary
  activities: Record<string, LiveActivity>
  catalogueSize?: number
}

interface Note {
  id: number
  role: 'user' | 'assistant'
  text: string
  /** Translation key, for notes created before the visitor's language is applied */
  key?: string
  /** Translation key of a list of quick replies */
  repliesKey?: string
  time?: string
  /** What the agent changed in the brief this turn */
  actions?: string[]
  /** Tap-to-send replies the agent suggested */
  replies?: string[]
}

interface AgentTurn {
  reply: string
  updates: {
    destination?: string
    startDate?: string
    endDate?: string
    travellers?: Array<{ age: number; label: string | null }>
    budget?: number
    pace?: TripPace
    interests?: string
  }
  action: 'ask' | 'plan' | 'revise' | 'none'
  change: string | null
  quickReplies: string[]
}

type ControlId = 'dates' | 'family' | 'budget' | 'style'

const CITIES = ['Ho Chi Minh City', 'Kuala Lumpur', 'Hong Kong', 'Singapore', 'Bangkok', 'Phuket', 'Hanoi', 'Taipei', 'Seoul', 'Tokyo', 'Osaka', 'Sydney', 'Bali']

const adjustments = [{ id: 'cheaper' }, { id: 'kids' }, { id: 'walking' }, { id: 'food' }] as const

type AdjustmentId = (typeof adjustments)[number]['id']

const PENDING_KEY = 'gotravelnha_pending_trip'

// Where the first message came from, for the planner_started funnel event
let startSource: 'chat' | 'home_prompt' | 'example' | 'shared_trip' = 'chat'

const route = useRoute()
const router = useRouter()
const { track } = useFunnel()
const { t, tm, locale, localeTag, placeName } = useI18n()
const { isAuthenticated } = useAuthState()
const tripsTo = computed(() => (isAuthenticated.value ? '/mytrip' : '/login?redirect=/mytrip'))

const today = new Date().toISOString().slice(0, 10)
const form = reactive({
  destination: 'Singapore',
  startDate: '',
  endDate: '',
  budget: null as number | null,
  pace: 'balanced' as TripPace,
  interests: ''
})
const party = ref<PartyRow[]>([
  { name: '', age: 35, include: true, fromProfile: false },
  { name: '', age: 6, include: true, fromProfile: false }
])
const result = ref<PlannerResult | null>(null)
const loading = ref(false)
const thinking = ref(false)
const revising = ref(false)
const busy = computed(() => loading.value || thinking.value)
const saving = ref(false)
const error = ref<string | null>(null)
const draft = ref('')
const preferencesOpen = ref(false)
const partyOpen = ref(false)
const tab = ref<'talk' | 'plan'>('talk')
const logEl = ref<HTMLElement | null>(null)
let noteId = 1
const messages = ref<Note[]>([
  {
    id: noteId,
    role: 'assistant',
    text: '',
    key: 'planner.chat.welcome',
    repliesKey: 'planner.chat.welcomeReplies'
  }
])

const hasUserNote = computed(() => messages.value.some((note) => note.role === 'user'))

const repliesFor = (note: Note) => (note.repliesKey ? tm<string[]>(note.repliesKey) : note.replies || [])

const paceLabel = (pace: TripPace) => t(`planner.pace.${pace}`)

const shortDate = (value: string) =>
  new Intl.DateTimeFormat(localeTag.value, { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`))

const includedParty = computed(() => party.value.filter((person) => person.include))
const agesKnown = computed(
  () =>
    includedParty.value.length > 0 &&
    includedParty.value.every((person) => person.age !== null && person.age !== undefined && !Number.isNaN(Number(person.age)))
)

const briefMissing = computed(() => {
  const missing: string[] = []
  if (!form.destination.trim() || form.destination.trim().length < 2) missing.push('destination')
  if (!form.startDate || !form.endDate) missing.push('dates')
  if (!agesKnown.value) missing.push('ages')
  return missing
})

const partyLabel = () => {
  const people = includedParty.value
  if (!people.length || !agesKnown.value) return null
  const children = people.filter((person) => Number(person.age) < 18).length
  const adults = people.length - children
  const parts = [t('planner.brief.adults', { count: adults })]
  if (children) parts.push(t('planner.brief.children', { count: children }))
  return parts.join(', ')
}

const briefFields = computed<
  Array<{ id: string; label: string; icon: PlannerIconName; value: string | null; placeholder: string; control: ControlId; active: boolean }>
>(() => [
  { id: 'destination', label: t('planner.brief.destination'), icon: 'pin', value: form.destination.trim() ? placeName(form.destination.trim()) : null, placeholder: t('planner.brief.addDestination'), control: 'dates', active: preferencesOpen.value },
  {
    id: 'dates',
    label: t('planner.brief.dates'),
    icon: 'calendar',
    value: form.startDate && form.endDate ? `${shortDate(form.startDate)} – ${shortDate(form.endDate)}` : null,
    placeholder: t('planner.brief.addDates'),
    control: 'dates',
    active: preferencesOpen.value
  },
  { id: 'party', label: t('planner.brief.travellers'), icon: 'users', value: partyLabel(), placeholder: t('planner.brief.addAges'), control: 'family', active: partyOpen.value },
  {
    id: 'budget',
    label: t('planner.brief.budget'),
    icon: 'wallet',
    value: form.budget ? `S$${form.budget.toLocaleString(localeTag.value)}` : null,
    placeholder: t('planner.brief.budgetOptional'),
    control: 'budget',
    active: preferencesOpen.value
  },
  { id: 'pace', label: t('planner.brief.pace'), icon: 'sliders', value: paceLabel(form.pace), placeholder: t('planner.brief.pace'), control: 'style', active: preferencesOpen.value }
])

const toggleControl = (id: ControlId) => {
  if (id === 'family') {
    partyOpen.value = !partyOpen.value
    if (partyOpen.value) preferencesOpen.value = false
    return
  }
  preferencesOpen.value = !preferencesOpen.value
  if (preferencesOpen.value) partyOpen.value = false
}

const scrollLog = () => {
  nextTick(() => {
    if (logEl.value) logEl.value.scrollTop = logEl.value.scrollHeight
  })
}

const pushNote = (role: Note['role'], text: string, extra: Pick<Note, 'actions' | 'replies' | 'key'> = {}) => {
  noteId += 1
  const time = new Intl.DateTimeFormat(localeTag.value, { hour: '2-digit', minute: '2-digit' }).format(new Date())
  messages.value.push({ id: noteId, role, text, time, ...extra })
  scrollLog()
}

const iso = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const fillWeekend = () => {
  const start = new Date()
  start.setHours(12, 0, 0, 0)
  const delta = (6 - start.getDay() + 7) % 7 || 7
  start.setDate(start.getDate() + delta)
  const end = new Date(start)
  end.setDate(start.getDate() + 1)
  form.startDate = iso(start)
  form.endDate = iso(end)
}

// Local reading of a request, used when the agent is unavailable
const readDraft = (input = draft.value) => {
  const text = input.trim()
  if (!text) return
  const city = CITIES.find((name) => text.toLowerCase().includes(name.toLowerCase()))
  if (city) form.destination = city
  if (/\brelaxed\b/i.test(text) || /\bquiet\b/i.test(text)) form.pace = 'relaxed'
  else if (/\bpacked\b/i.test(text)) form.pace = 'packed'
  else if (/\bbalanced\b/i.test(text)) form.pace = 'balanced'
  const dayCount = text.match(/\b(\d{1,2})\s*-?\s*days?\b/i)
  if (dayCount && (!form.startDate || !form.endDate)) {
    const days = Math.min(Math.max(Number(dayCount[1]), 1), 10)
    const start = new Date()
    start.setHours(12, 0, 0, 0)
    start.setDate(start.getDate() + 1)
    const end = new Date(start)
    end.setDate(start.getDate() + days - 1)
    form.startDate = iso(start)
    form.endDate = iso(end)
  }
  if ((!form.startDate || !form.endDate) && /weekend/i.test(text)) fillWeekend()
  const budgetMatch = text.match(/(?:s\$|sgd|\$)\s*([\d,]+)/i)
  if (budgetMatch) {
    const amount = Number(budgetMatch[1].replace(/,/g, ''))
    if (amount > 0 && amount <= 1_000_000) form.budget = amount
  }
  if (!form.interests.trim()) form.interests = text.slice(0, 500)
}

const ageOn = (birthDate: string, onDate: string) => {
  const birth = new Date(birthDate)
  const on = new Date(onDate || today)
  let age = on.getUTCFullYear() - birth.getUTCFullYear()
  const beforeBirthday =
    on.getUTCMonth() < birth.getUTCMonth() ||
    (on.getUTCMonth() === birth.getUTCMonth() && on.getUTCDate() < birth.getUTCDate())
  if (beforeBirthday) age -= 1
  return Math.max(age, 0)
}

const loadFamily = async () => {
  try {
    const response = await $fetch<{ data: Array<{ name: string; birthDate: string | null; notes: string | null }> }>(
      '/api/travellers'
    )
    if (response.data.length) {
      party.value = response.data.map((traveller) => ({
        name: traveller.name,
        age: traveller.birthDate ? ageOn(traveller.birthDate, form.startDate) : null,
        include: true,
        fromProfile: true,
        birthDate: traveller.birthDate,
        notes: traveller.notes
      }))
    }
  } catch {
    // Not signed in on the server, or no profiles yet: keep the manual rows
  }
}

watch(
  () => form.startDate,
  (startDate) => {
    for (const person of party.value) {
      if (person.birthDate) person.age = ageOn(person.birthDate, startDate)
    }
  }
)

const addTraveller = () => {
  if (party.value.length >= 10) return
  party.value.push({ name: '', age: 8, include: true, fromProfile: false })
}

const removeTraveller = (index: number) => {
  const person = party.value[index]
  if (!person || person.fromProfile || party.value.length <= 1) return
  party.value.splice(index, 1)
}

const applyPrompt = (prompt: PlannerPrompt) => {
  form.destination = prompt.destination
  form.startDate = prompt.startDate
  form.endDate = prompt.endDate
  form.pace = prompt.pace
  const copy = tm<{ label: string; caption: string; interests: string; note: string }>(`planner.prompts.items.${prompt.id}`)
  form.interests = copy.interests
  if (prompt.budget !== undefined) form.budget = prompt.budget
  draft.value = `${copy.label}: ${copy.caption.toLocaleLowerCase(localeTag.value)}`
  startSource = 'example'
  preferencesOpen.value = false
  pushNote('assistant', copy.note)
}

const addInterest = (phrase: string) => {
  const current = form.interests.trim()
  if (current.toLowerCase().includes(phrase.toLowerCase())) return
  form.interests = current ? `${current}. ${phrase}` : phrase
  form.interests = form.interests.slice(0, 500)
}

const focusRequest = () => {
  nextTick(() => document.getElementById('planner-request')?.focus())
}

const adjust = async (id: AdjustmentId) => {
  if (busy.value) return
  let change: string
  let note: string
  if (id === 'cheaper') {
    const current = form.budget && form.budget > 0 ? form.budget : 2000
    form.budget = Math.max(200, Math.round(current * 0.8))
    change = t('planner.adjust.cheaperChange', { budget: form.budget })
    note = t('planner.adjust.cheaperNote', { budget: form.budget.toLocaleString(localeTag.value) })
  } else {
    if (id === 'walking') form.pace = 'relaxed'
    addInterest(t(`planner.adjust.${id}Interest`))
    change = t(`planner.adjust.${id}Change`)
    note = t(`planner.adjust.${id}Note`)
  }

  const label = t(`planner.adjust.${id}`)
  if (result.value) {
    // A plan exists: edit it now instead of waiting for another message
    pushNote('user', label)
    await generate({ change })
    return
  }
  draft.value = change
  pushNote('assistant', t('planner.chat.sendToBuild', { note }))
  tab.value = 'talk'
  focusRequest()
}

const refine = () => {
  tab.value = 'talk'
  pushNote('assistant', t('planner.chat.refine'), { replies: tm<string[]>('planner.chat.refineReplies') })
  focusRequest()
}

const clarify = () => {
  if (!form.destination.trim() || form.destination.trim().length < 2) {
    preferencesOpen.value = true
    partyOpen.value = false
    return t('planner.chat.askCity')
  }
  if (!form.startDate || !form.endDate) {
    preferencesOpen.value = true
    partyOpen.value = false
    return t('planner.chat.askDates')
  }
  const travellers = party.value.filter((person) => person.include)
  if (!travellers.length || travellers.some((person) => person.age === null || person.age === undefined || Number.isNaN(Number(person.age)))) {
    partyOpen.value = true
    preferencesOpen.value = false
    return t('planner.chat.askAges')
  }
  return null
}

const planFromBrief = async () => {
  const question = clarify()
  if (question) {
    error.value = question
    pushNote('assistant', question)
    tab.value = 'talk'
    return
  }
  await generate()
}

/** Applies the agent's brief updates and returns a line for each field that changed. */
const applyUpdates = (updates: AgentTurn['updates']) => {
  const done: string[] = []
  if (updates.destination && updates.destination !== form.destination) {
    form.destination = updates.destination
    done.push(t('planner.updates.destination', { value: placeName(updates.destination) }))
  }
  if (updates.startDate || updates.endDate) {
    if (updates.startDate) form.startDate = updates.startDate
    if (updates.endDate) form.endDate = updates.endDate
    if (form.endDate && form.startDate && form.endDate < form.startDate) form.endDate = ''
    if (form.startDate && form.endDate) done.push(t('planner.updates.dates', { value: `${shortDate(form.startDate)} – ${shortDate(form.endDate)}` }))
  }
  if (updates.travellers?.length && !party.value.some((person) => person.fromProfile)) {
    party.value = updates.travellers.map((person) => ({ name: person.label || '', age: person.age, include: true, fromProfile: false }))
    done.push(t('planner.updates.travellers', { count: updates.travellers.length, ages: updates.travellers.map((person) => person.age).join(', ') }))
  }
  if (updates.budget && updates.budget !== form.budget) {
    form.budget = updates.budget
    done.push(t('planner.updates.budget', { value: `S$${updates.budget.toLocaleString(localeTag.value)}` }))
  }
  if (updates.pace && updates.pace !== form.pace) {
    form.pace = updates.pace
    done.push(t('planner.updates.pace', { value: paceLabel(updates.pace).toLocaleLowerCase(localeTag.value) }))
  }
  if (updates.interests && updates.interests !== form.interests) {
    form.interests = updates.interests
    done.push(t('planner.updates.interests', { value: updates.interests }))
  }
  return done
}

const sendReply = (text: string) => {
  draft.value = text
  ask()
}

const ask = async () => {
  if (busy.value) return
  const spoken = draft.value.trim()

  // Empty box: plan from the brief as it stands
  if (!spoken) {
    const when = form.startDate && form.endDate ? `${shortDate(form.startDate)} – ${shortDate(form.endDate)}` : t('planner.chat.datesNotSet')
    track('planner_started', { source: startSource }, true)
    pushNote('user', t('planner.chat.planBrief', { destination: form.destination ? placeName(form.destination) : t('planner.chat.myTrip'), when }))
    await planFromBrief()
    return
  }

  track('planner_started', { source: startSource }, true)
  pushNote('user', spoken)
  draft.value = ''
  thinking.value = true
  let turn: AgentTurn | null = null
  try {
    turn = await $fetch<AgentTurn>('/api/planner/chat', {
      method: 'POST',
      body: {
        messages: messages.value.slice(1).map((note) => ({ role: note.role, text: (note.key ? t(note.key) : note.text).slice(0, 800) })),
        brief: {
          destination: form.destination || undefined,
          startDate: form.startDate || undefined,
          endDate: form.endDate || undefined,
          travellers: includedParty.value.map((person) => ({
            age: person.age === null || person.age === undefined || Number.isNaN(Number(person.age)) ? null : Number(person.age)
          })),
          travellersFromProfile: party.value.some((person) => person.fromProfile),
          budget: form.budget || null,
          pace: form.pace,
          interests: form.interests || undefined
        },
        language: locale.value,
        plan: result.value
          ? { title: result.value.itinerary.title.slice(0, 200), days: result.value.itinerary.days.map((day) => day.theme.slice(0, 200)) }
          : null
      }
    })
  } catch {
    turn = null
  } finally {
    thinking.value = false
  }

  if (!turn) {
    // Agent unavailable: read the message locally and plan as before
    readDraft(spoken)
    await planFromBrief()
    return
  }

  const destinationChanged = !!turn.updates.destination && turn.updates.destination !== form.destination
  const done = applyUpdates(turn.updates)
  pushNote('assistant', turn.reply, { actions: done, replies: turn.quickReplies })

  if (turn.action === 'plan') {
    await planFromBrief()
  } else if (turn.action === 'revise' && result.value) {
    // A new city is a new trip, not an edit of the old one
    if (destinationChanged) await planFromBrief()
    else await generate({ change: turn.change || spoken })
  } else if (turn.action === 'ask') {
    // Open the editor for the missing detail; the agent has already asked in its reply
    clarify()
  }
}

const generate = async (revision?: { change: string }) => {
  const travellers = party.value.filter((person) => person.include)
  const revise = revision && result.value ? { generationId: result.value.generationId, change: revision.change.slice(0, 300) } : undefined
  try {
    loading.value = true
    revising.value = !!revise
    error.value = null
    preferencesOpen.value = false
    partyOpen.value = false
    tab.value = 'plan'
    const response = await $fetch<PlannerResult & { success: boolean }>('/api/planner/itinerary', {
      method: 'POST',
      body: {
        destination: form.destination,
        startDate: form.startDate,
        endDate: form.endDate,
        party: travellers.map((person) => ({
          name: person.name || undefined,
          age: Number(person.age),
          notes: person.notes || undefined
        })),
        budget: form.budget || null,
        currency: 'SGD',
        pace: form.pace,
        interests: form.interests || undefined,
        language: locale.value,
        revise
      }
    })
    result.value = response
    localStorage.setItem(PENDING_KEY, response.generationId)
    track('ai_itinerary_generated', {
      provider: 'planner',
      placement: 'trip_planner',
      destination: response.request.destination,
      searchType: 'itinerary'
    })
    const days = response.itinerary.days.length
    pushNote(
      'assistant',
      t(revise ? 'planner.chat.planUpdated' : 'planner.chat.planReady', { days, destination: placeName(response.request.destination) }),
      { replies: revise ? [] : tm<string[]>('planner.chat.planReplies') }
    )
  } catch (err: any) {
    const status = err?.statusCode ?? err?.status
    const message =
      status === 429
        ? t(isAuthenticated.value ? 'planner.chat.limitUser' : 'planner.chat.limitGuest')
        : locale.value === 'en'
          ? err?.data?.message || t('planner.chat.failed')
          : t('planner.chat.failed')
    track('ai_itinerary_failed', { revise: !!revise, status: err?.statusCode ?? err?.status ?? null })
    error.value = message
    pushNote('assistant', message)
    tab.value = 'talk'
  } finally {
    loading.value = false
    revising.value = false
  }
}

// The error screen only shows before a plan exists, so retry re-runs the first plan,
// checking the brief again in case the error was a missing detail
const retry = () => {
  if (busy.value) return
  track('ai_itinerary_retried')
  planFromBrief()
}

const useRequest = (request: PlannerResult['request']) => {
  form.destination = request.destination
  form.startDate = request.startDate < today ? '' : request.startDate
  form.endDate = request.startDate < today ? '' : request.endDate
  form.budget = request.budget ?? null
  if (request.pace) form.pace = request.pace
  if (request.interests) form.interests = request.interests
  if (request.party?.length && !party.value.some((person) => person.fromProfile)) {
    party.value = request.party.map((person) => ({ name: person.name || '', age: person.age, include: true, fromProfile: false }))
  }
}

const saveTrip = async () => {
  if (!result.value) return
  try {
    saving.value = true
    error.value = null
    const response = await $fetch<{ data: { id: string } }>('/api/trips', {
      method: 'POST',
      body: { generationId: result.value.generationId }
    })
    localStorage.removeItem(PENDING_KEY)
    track('trip_saved', { destination: result.value.request.destination })
    router.push(`/mytrip/${response.data.id}`)
  } catch (err: any) {
    const message = locale.value === 'en' ? err?.data?.message || t('planner.chat.saveFailed') : t('planner.chat.saveFailed')
    error.value = message
    pushNote('assistant', message)
  } finally {
    saving.value = false
  }
}

// Fresh conversation for a different trip; travellers stay so the family profile is kept
const newTrip = () => {
  if (busy.value) return
  result.value = null
  error.value = null
  draft.value = ''
  localStorage.removeItem(PENDING_KEY)
  form.startDate = ''
  form.endDate = ''
  form.budget = null
  form.interests = ''
  form.pace = 'balanced'
  preferencesOpen.value = false
  partyOpen.value = false
  tab.value = 'talk'
  messages.value = [messages.value[0]]
}

const startOver = () => {
  result.value = null
  error.value = null
  localStorage.removeItem(PENDING_KEY)
  tab.value = 'talk'
  pushNote('assistant', t('planner.chat.startOver'))
}

onMounted(async () => {
  if (typeof route.query.destination === 'string' && route.query.destination.trim()) {
    form.destination = route.query.destination.trim().slice(0, 80)
  }
  if (route.query.from === 'shared_trip') startSource = 'shared_trip'

  if (isAuthenticated.value) {
    await loadFamily()
  }

  // Trip described on the home page or a guide: put it in the message box instead of restoring the
  // last plan. It is not sent until the visitor presses send, so a stray click or a crawler
  // following the link never calls the AI.
  const prompt = typeof route.query.prompt === 'string' ? route.query.prompt.trim().slice(0, 500) : ''
  if (prompt) {
    const { prompt: _drop, ...rest } = route.query
    await router.replace({ query: rest })
    // Drop the Singapore / 1 adult + 1 child defaults so the brief only shows what the visitor
    // wrote; anything the agent cannot read from the prompt is then asked for, not assumed
    if (!rest.destination) form.destination = ''
    if (!party.value.some((person) => person.fromProfile)) party.value = []
    startSource = 'home_prompt'
    draft.value = prompt
    // Keyed: this runs before plugins/i18n.client.ts applies the visitor's language
    pushNote('assistant', '', { key: 'planner.chat.promptReady' })
    await nextTick()
    // Desktop only: on phones focusing opens the keyboard over the brief
    if (window.matchMedia('(min-width: 1024px)').matches) {
      const box = document.getElementById('planner-request') as HTMLTextAreaElement | null
      box?.focus({ preventScroll: true })
      box?.setSelectionRange(prompt.length, prompt.length)
    }
    return
  }

  const pendingId = localStorage.getItem(PENDING_KEY)
  if (pendingId) {
    try {
      result.value = await $fetch<PlannerResult>(`/api/planner/generations/${pendingId}`)
      useRequest(result.value.request)
      pushNote('assistant', '', { key: isAuthenticated.value ? 'planner.chat.restored' : 'planner.chat.restoredGuest' })
      tab.value = 'plan'
    } catch {
      localStorage.removeItem(PENDING_KEY)
    }
  }
})

useHead(() => ({
  title: t('planner.meta.title'),
  // Full-screen app: stop Safari's rubber-band scroll from dragging the whole page
  htmlAttrs: { class: 'overscroll-none' },
  meta: [
    {
      name: 'description',
      content: t('planner.meta.description')
    }
  ]
}))
</script>
