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
                <h1 class="truncate text-[15px] font-bold leading-5 tracking-[-0.01em] text-[#101D3A]">AI Travel Agent</h1>
                <p class="truncate text-[12px] leading-[18px] text-[#64748B]">GoTravelNha AI · family trip planning</p>
              </div>
            </div>
            <!-- Icon-only on phones so the title keeps one line; labels from sm up -->
            <div class="flex shrink-0 items-center gap-0.5 sm:gap-1">
              <button
                v-if="hasUserNote || result"
                type="button"
                title="New trip"
                class="inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-lg text-[13px] font-semibold leading-5 text-[#101D3A] hover:bg-[#F1F5F9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#008A9B] disabled:opacity-50 sm:min-h-9 sm:min-w-0 sm:px-2.5"
                :disabled="busy"
                @click="newTrip"
              >
                <PlannerIcon name="refresh" class="h-4 w-4 text-[#008A9B]" />
                <span class="sr-only sm:not-sr-only">New trip</span>
              </button>
              <NuxtLink
                :to="tripsTo"
                title="My trips"
                class="inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-lg text-[13px] font-semibold leading-5 text-[#101D3A] hover:bg-[#F1F5F9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#008A9B] sm:min-h-9 sm:min-w-0 sm:px-2.5"
              >
                <PlannerIcon name="bookmark" class="h-4 w-4 text-[#008A9B]" />
                <span class="sr-only sm:not-sr-only">My trips</span>
              </NuxtLink>
            </div>
          </header>

          <section class="shrink-0 border-b border-[#E2E8F0] py-3" aria-label="Trip brief">
            <div class="flex items-center justify-between gap-2">
              <h2 class="text-[11px] font-semibold uppercase leading-4 tracking-[0.06em] text-[#64748B]">Trip brief</h2>
              <span class="inline-flex items-center gap-1.5 text-[11px] font-semibold leading-4" :class="briefMissing.length ? 'text-[#C2410C]' : 'text-[#047857]'">
                <span class="h-1.5 w-1.5 rounded-full" :class="briefMissing.length ? 'bg-[#F97316]' : 'bg-[#10B981]'" aria-hidden="true"></span>
                {{ briefMissing.length ? `Needs ${briefMissing.join(', ')}` : 'Ready to plan' }}
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
                :aria-label="`${field.label}: ${field.value || 'not set'}. Edit`"
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
                    {{ note.role === 'user' ? 'You' : 'GoTravelNha AI' }} · {{ note.time }}
                  </p>
                  <p
                    class="inline-block whitespace-pre-line px-3.5 py-2.5 text-left text-[14px] leading-[21px]"
                    :class="note.role === 'user' ? 'rounded-2xl rounded-br-md bg-[#008A9B] text-white' : 'rounded-2xl rounded-bl-md bg-[#F1F5F9] text-[#1E293B]'"
                  >
                    {{ note.text }}
                  </p>
                  <ul v-if="note.actions?.length" class="mt-2 space-y-1 rounded-xl border border-[#E2E8F0] bg-white px-3 py-2 text-left" aria-label="Brief updated">
                    <li v-for="action in note.actions" :key="action" class="flex items-start gap-1.5 text-[12px] leading-[18px] text-[#475569]">
                      <PlannerIcon name="check" class="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#059669]" />
                      {{ action }}
                    </li>
                  </ul>
                  <div v-if="note.replies?.length && index === messages.length - 1 && !busy" class="mt-2 flex flex-wrap gap-1.5">
                    <button
                      v-for="reply in note.replies"
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
                  <span class="sr-only">GoTravelNha AI is thinking</span>
                  <span v-for="n in 3" :key="n" class="h-1.5 w-1.5 animate-bounce rounded-full bg-[#64748B]" :style="{ animationDelay: `${(n - 1) * 150}ms` }" aria-hidden="true"></span>
                </div>
              </li>
            </ul>
            <PromptSuggestions v-if="!hasUserNote" class="lg:hidden" @select="applyPrompt" />
          </div>

          <div class="shrink-0 space-y-2 pt-1">
            <div v-if="result && !busy" class="-mx-1 flex gap-1.5 overflow-x-auto px-1 [scrollbar-width:none]" aria-label="Quick changes">
              <button
                v-for="item in adjustments"
                :key="item.id"
                type="button"
                class="min-h-11 shrink-0 rounded-full border border-[#E2E8F0] bg-white px-3 text-[12px] font-semibold leading-[18px] text-[#334155] hover:border-[#008A9B] hover:text-[#008A9B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#008A9B] sm:min-h-8"
                @click="adjust(item.id)"
              >
                {{ item.label }}
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
              Plan another trip
            </button>
            <p v-if="result.catalogueSize === 0" class="text-sm text-ink/70">
              No bookable activities for {{ result.request.destination }} yet, so this plan has ideas only.
            </p>
          </div>

          <PlannerBoard
            v-if="result && !loading"
            :itinerary="result.itinerary"
            :activities="result.activities"
            :request="result.request"
            :authenticated="isAuthenticated"
            :saving="saving"
            @save="saveTrip"
            @refine="refine"
          />
          <PlannerStates v-else-if="loading" kind="loading" :destination="form.destination" :revising="revising" />
          <PlannerStates v-else-if="error" kind="error" :message="error" />
          <div v-else class="mx-auto max-w-5xl py-2 sm:py-4">
            <p class="text-[12px] font-semibold uppercase leading-[18px] tracking-[0.06em] text-[#008A9B]">Start here</p>
            <h2 class="mt-1 text-[24px] font-bold leading-8 tracking-[-0.025em] text-[#101D3A] sm:text-[28px] sm:leading-9">Where should the family go next?</h2>
            <p class="mt-2 max-w-2xl text-[14px] leading-[22px] text-[#64748B]">
              Pick a trip to fill in the brief, or describe your own in the chat. The agent asks for anything missing, then plans the days.
            </p>
            <PromptSuggestions layout="gallery" class="mt-6" @select="applyPrompt" />
            <ol class="mt-8 grid gap-4 border-t border-[#E2E8F0] pt-6 sm:grid-cols-3">
              <li v-for="(step, index) in howItWorks" :key="step.title" class="flex items-start gap-3">
                <span class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#E8F7FA] text-[13px] font-bold text-[#008A9B]">{{ index + 1 }}</span>
                <span>
                  <span class="block text-[14px] font-semibold leading-5 text-[#101D3A]">{{ step.title }}</span>
                  <span class="mt-0.5 block text-[13px] leading-5 text-[#64748B]">{{ step.text }}</span>
                </span>
              </li>
            </ol>
            <p class="mt-6 text-[12px] leading-[18px] text-[#94A3B8]">A suggestion is not a booking. A price appears only when a partner has checked it.</p>
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

const howItWorks = [
  { title: 'Describe the trip', text: 'Where, when and who is coming, in your own words.' },
  { title: 'The agent fills the brief', text: 'It sets dates and travellers and asks for anything missing.' },
  { title: 'Review and refine', text: 'Read the days, then ask for changes in the chat.' }
]

const adjustments = [
  { id: 'cheaper', label: 'Make it cheaper' },
  { id: 'kids', label: 'More kid-friendly' },
  { id: 'walking', label: 'Less walking' },
  { id: 'food', label: 'Add more food options' }
] as const

type AdjustmentId = (typeof adjustments)[number]['id']

const PENDING_KEY = 'gotravelnha_pending_trip'

const route = useRoute()
const router = useRouter()
const { track } = useFunnel()
const { isAuthenticated } = useAuthState()
const tripsTo = computed(() => (isAuthenticated.value ? '/trips' : '/login?redirect=/trips'))

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
    text: "Hi, I'm GoTravelNha AI. Tell me where you'd like to go, when, and who is coming. I'll fill in the brief, ask for anything missing, and plan the days.",
    replies: ['Weekend in Singapore with a 5-year-old', '5 days in Tokyo, family of four']
  }
])

const hasUserNote = computed(() => messages.value.some((note) => note.role === 'user'))

const paceLabels: Record<TripPace, string> = { relaxed: 'Relaxed', balanced: 'Balanced', packed: 'Packed' }

const shortDate = (value: string) =>
  new Intl.DateTimeFormat('en-SG', { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`))

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
  const parts = [`${adults} ${adults === 1 ? 'adult' : 'adults'}`]
  if (children) parts.push(`${children} ${children === 1 ? 'child' : 'children'}`)
  return parts.join(', ')
}

const briefFields = computed<
  Array<{ id: string; label: string; icon: PlannerIconName; value: string | null; placeholder: string; control: ControlId; active: boolean }>
>(() => [
  { id: 'destination', label: 'Destination', icon: 'pin', value: form.destination.trim() || null, placeholder: 'Add destination', control: 'dates', active: preferencesOpen.value },
  {
    id: 'dates',
    label: 'Dates',
    icon: 'calendar',
    value: form.startDate && form.endDate ? `${shortDate(form.startDate)} – ${shortDate(form.endDate)}` : null,
    placeholder: 'Add dates',
    control: 'dates',
    active: preferencesOpen.value
  },
  { id: 'party', label: 'Travellers', icon: 'users', value: partyLabel(), placeholder: 'Add ages', control: 'family', active: partyOpen.value },
  {
    id: 'budget',
    label: 'Activity budget',
    icon: 'wallet',
    value: form.budget ? `S$${form.budget.toLocaleString('en-SG')}` : null,
    placeholder: 'Budget (optional)',
    control: 'budget',
    active: preferencesOpen.value
  },
  { id: 'pace', label: 'Pace', icon: 'sliders', value: paceLabels[form.pace], placeholder: 'Pace', control: 'style', active: preferencesOpen.value }
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

const pushNote = (role: Note['role'], text: string, extra: Pick<Note, 'actions' | 'replies'> = {}) => {
  noteId += 1
  const time = new Intl.DateTimeFormat('en-SG', { hour: '2-digit', minute: '2-digit' }).format(new Date())
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
  form.interests = prompt.interests
  if (prompt.budget !== undefined) form.budget = prompt.budget
  draft.value = `${prompt.label}: ${prompt.caption.toLowerCase()}`
  preferencesOpen.value = false
  pushNote('assistant', prompt.note)
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
    change = `Keep activities within S$${form.budget} for the whole family and prefer free or low-cost options`
    note = `I set the activity budget to SGD ${form.budget.toLocaleString('en-SG')}.`
  } else if (id === 'kids') {
    addInterest('kid-friendly, playgrounds, short queues')
    change = 'Make it more kid-friendly, with playgrounds and short queues'
    note = 'I added kid-friendly time and shorter queues.'
  } else if (id === 'walking') {
    form.pace = 'relaxed'
    addInterest('less walking, rest after lunch')
    change = 'Cut walking between places and leave rest after lunch'
    note = 'I set a relaxed pace and less walking.'
  } else {
    addInterest('more local food')
    change = 'Add more local food stops'
    note = 'I added more local food.'
  }

  const label = adjustments.find((item) => item.id === id)?.label ?? change
  if (result.value) {
    // A plan exists: edit it now instead of waiting for another message
    pushNote('user', label)
    await generate({ change })
    return
  }
  draft.value = change
  pushNote('assistant', `${note} Send the message to build the plan.`)
  tab.value = 'talk'
  focusRequest()
}

const refine = () => {
  tab.value = 'talk'
  pushNote('assistant', 'What should I change? For example, "swap day 2 for something indoors". I will edit this plan and keep the rest.', {
    replies: ['Add a rest afternoon', 'More indoor options', 'Fewer early starts']
  })
  focusRequest()
}

const clarify = () => {
  if (!form.destination.trim() || form.destination.trim().length < 2) {
    preferencesOpen.value = true
    partyOpen.value = false
    return 'Which city should we plan? Add it under Dates.'
  }
  if (!form.startDate || !form.endDate) {
    preferencesOpen.value = true
    partyOpen.value = false
    return 'Add a start date and an end date, then send again.'
  }
  const travellers = party.value.filter((person) => person.include)
  if (!travellers.length || travellers.some((person) => person.age === null || person.age === undefined || Number.isNaN(Number(person.age)))) {
    partyOpen.value = true
    preferencesOpen.value = false
    return 'Add at least one traveller and fill in every age.'
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
    done.push(`Destination set to ${updates.destination}`)
  }
  if (updates.startDate || updates.endDate) {
    if (updates.startDate) form.startDate = updates.startDate
    if (updates.endDate) form.endDate = updates.endDate
    if (form.endDate && form.startDate && form.endDate < form.startDate) form.endDate = ''
    if (form.startDate && form.endDate) done.push(`Dates set to ${shortDate(form.startDate)} – ${shortDate(form.endDate)}`)
  }
  if (updates.travellers?.length && !party.value.some((person) => person.fromProfile)) {
    party.value = updates.travellers.map((person) => ({ name: person.label || '', age: person.age, include: true, fromProfile: false }))
    done.push(`Travellers set to ${updates.travellers.length} (ages ${updates.travellers.map((person) => person.age).join(', ')})`)
  }
  if (updates.budget && updates.budget !== form.budget) {
    form.budget = updates.budget
    done.push(`Activity budget set to S$${updates.budget.toLocaleString('en-SG')}`)
  }
  if (updates.pace && updates.pace !== form.pace) {
    form.pace = updates.pace
    done.push(`Pace set to ${paceLabels[updates.pace].toLowerCase()}`)
  }
  if (updates.interests && updates.interests !== form.interests) {
    form.interests = updates.interests
    done.push(`Interests: ${updates.interests}`)
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
    const when = form.startDate && form.endDate ? `${shortDate(form.startDate)} – ${shortDate(form.endDate)}` : 'dates not set yet'
    pushNote('user', `Plan ${form.destination || 'my trip'}, ${when}`)
    await planFromBrief()
    return
  }

  pushNote('user', spoken)
  draft.value = ''
  thinking.value = true
  let turn: AgentTurn | null = null
  try {
    turn = await $fetch<AgentTurn>('/api/planner/chat', {
      method: 'POST',
      body: {
        messages: messages.value.slice(1).map((note) => ({ role: note.role, text: note.text.slice(0, 800) })),
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
      revise
        ? `I updated the ${days}-day plan for ${response.request.destination}. Anything else to change?`
        : `Here is a ${days}-day plan for ${response.request.destination}. Prices stay with the partner that checked them. Tell me what to change and I will edit it.`,
      { replies: revise ? [] : ['Make day 1 lighter', 'Add a rainy-day backup', 'More food stops'] }
    )
  } catch (err: any) {
    const message = err?.data?.message || 'The trip planner could not finish. Please try again.'
    error.value = message
    pushNote('assistant', message)
    tab.value = 'talk'
  } finally {
    loading.value = false
    revising.value = false
  }
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
    router.push(`/trips/${response.data.id}`)
  } catch (err: any) {
    const message = err?.data?.message || 'Could not save this trip.'
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
  pushNote('assistant', 'What should we plan next? Describe the trip and I will set up a new brief.')
}

onMounted(async () => {
  if (typeof route.query.destination === 'string' && route.query.destination.trim()) {
    form.destination = route.query.destination.trim().slice(0, 80)
  }

  if (isAuthenticated.value) {
    await loadFamily()
  }

  const pendingId = localStorage.getItem(PENDING_KEY)
  if (pendingId) {
    try {
      result.value = await $fetch<PlannerResult>(`/api/planner/generations/${pendingId}`)
      useRequest(result.value.request)
      pushNote(
        'assistant',
        isAuthenticated.value
          ? 'I brought back the last plan from this browser.'
          : 'I brought back the last plan from this browser. Sign in to save it.'
      )
      tab.value = 'plan'
    } catch {
      localStorage.removeItem(PENDING_KEY)
    }
  }
})

useHead({
  title: 'AI Trip Planner for Families | GoTravelNha',
  // Full-screen app: stop Safari's rubber-band scroll from dragging the whole page
  htmlAttrs: { class: 'overscroll-none' },
  meta: [
    {
      name: 'description',
      content: 'Describe your family trip and the GoTravelNha AI agent plans it day by day, asks for missing details and edits the plan on request. Partner links appear only after a price has been checked.'
    }
  ]
})
</script>
