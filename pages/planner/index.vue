<template>
  <div class="flex flex-col font-[Inter,system-ui,-apple-system,BlinkMacSystemFont,sans-serif] text-[#334155] lg:h-full lg:overflow-hidden">
    <section class="relative isolate shrink-0 overflow-hidden bg-[#101D3A] lg:h-[248px]">
      <img
        src="https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?auto=format&fit=crop&w=2400&q=80"
        alt=""
        width="2400"
        height="900"
        fetchpriority="high"
        class="absolute inset-0 h-full w-full object-cover object-[center_58%]"
      />
      <div class="absolute inset-0 bg-gradient-to-r from-[#101D3A]/75 via-[#101D3A]/30 to-transparent"></div>
      <div class="relative z-10 flex items-start gap-6 px-4 py-4 sm:gap-8 sm:px-10 sm:py-4 lg:h-full lg:items-center xl:px-20">
        <div class="min-w-0 flex-1">
          <p class="text-[12px] font-semibold leading-[18px] text-white/80">GoTravelNha AI</p>
          <h1 class="mt-1 text-[28px] font-extrabold leading-9 tracking-[-0.025em] text-white sm:text-[40px] sm:leading-[48px]">Your Personal AI Travel Agent</h1>
          <p class="mt-1 text-[16px] font-semibold leading-6 text-white sm:text-[19px] sm:leading-7">Plan smarter. Travel better.</p>
          <p class="mt-1 hidden max-w-xl text-[14px] leading-[21px] text-white/90 sm:line-clamp-1 sm:block">
            Tell us where you want to go and who is coming. The agent writes a personalised day-by-day plan, and links experiences only when a partner has checked them.
          </p>
          <div class="mt-2 flex flex-wrap gap-2">
            <button
              v-for="chip in agentChips"
              :key="chip.label"
              type="button"
              class="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-white px-3 text-[13px] font-semibold leading-5 text-[#101D3A] hover:bg-[#F1F5F9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#008A9B] sm:min-h-9"
              @click="useExample(chip.draft, chip.note)"
            >
              <PlannerIcon :name="chip.icon" class="h-3.5 w-3.5 text-[#008A9B]" />
              {{ chip.label }}
            </button>
          </div>
        </div>
        <aside class="hidden w-60 shrink-0 rounded-2xl bg-white/95 p-3 xl:block">
          <p class="text-[13px] font-bold leading-5 tracking-[-0.025em] text-[#101D3A]">GoTravelNha AI</p>
          <ul class="mt-2 space-y-1.5 text-[12px] leading-[18px] text-[#334155]">
            <li v-for="line in capabilities" :key="line" class="flex items-start gap-1.5">
              <PlannerIcon name="check" class="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#059669]" />
              {{ line }}
            </li>
          </ul>
        </aside>
      </div>
    </section>

    <PlannerWorkspace v-model:tab="tab" :has-plan="!!result">
      <template #conversation>
        <div class="flex h-full min-h-0 min-w-0 flex-col gap-3 sm:gap-4">
          <nav class="grid grid-cols-3 gap-2" aria-label="Planner sections">
            <span class="inline-flex min-h-11 items-center justify-center rounded-full bg-[#008A9B] px-2 text-center text-[13px] font-semibold leading-5 text-white sm:min-h-9" aria-current="page">
              Plan with AI
            </span>
            <NuxtLink
              :to="tripsTo"
              class="inline-flex min-h-11 items-center justify-center rounded-full bg-[#F1F5F9] px-2 text-center text-[13px] font-semibold leading-5 text-[#101D3A] hover:bg-[#E2E8F0] sm:min-h-9"
            >
              My Trips
            </NuxtLink>
            <NuxtLink
              :to="tripsTo"
              class="inline-flex min-h-11 items-center justify-center rounded-full bg-[#F1F5F9] px-2 text-center text-[13px] font-semibold leading-5 text-[#101D3A] hover:bg-[#E2E8F0] sm:min-h-9"
            >
              Saved
            </NuxtLink>
          </nav>

          <div ref="logEl" class="-mx-1 min-h-0 flex-1 space-y-4 overflow-y-auto px-1">
            <ul class="space-y-4" role="log" aria-live="polite" aria-relevant="additions">
              <li v-for="note in messages" :key="note.id" class="flex items-start gap-2.5">
                <span
                  class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold"
                  :class="note.role === 'user' ? 'bg-[#101D3A] text-white' : 'bg-[#E8F7FA] text-[#008A9B]'"
                  aria-hidden="true"
                >
                  <PlannerIcon v-if="note.role === 'assistant'" name="spark" class="h-4 w-4" />
                  <template v-else>Y</template>
                </span>
                <div class="min-w-0 flex-1">
                  <p class="flex items-baseline gap-2">
                    <span class="text-[13px] font-semibold leading-5 text-[#101D3A]">{{ note.role === 'user' ? 'You' : 'GoTravelNha AI' }}</span>
                    <span v-if="note.time" class="text-[12px] leading-[18px] text-[#94A3B8]">{{ note.time }}</span>
                  </p>
                  <p class="mt-1 rounded-[14px] bg-[#F1F5F9] px-3.5 py-2.5 text-[14px] leading-[21px] text-[#334155]">
                    {{ note.text }}
                  </p>
                </div>
              </li>
            </ul>
            <PromptSuggestions v-if="!hasUserNote" @select="applyPrompt" />
          </div>

          <div class="space-y-2 border-t border-[#E2E8F0] pt-3 sm:space-y-3">
            <p class="text-[12px] leading-[18px] text-[#64748B]">{{ contextLine }}</p>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="control in controls"
                :key="control.id"
                type="button"
                class="inline-flex min-h-11 items-center gap-1.5 rounded-full border px-3 text-[13px] font-semibold leading-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#008A9B] sm:min-h-9"
                :class="control.active ? 'border-[#008A9B] bg-[#E8F7FA] text-[#008A9B]' : 'border-[#E2E8F0] bg-white text-[#101D3A] hover:bg-[#F1F5F9]'"
                :aria-expanded="control.active"
                @click="toggleControl(control.id)"
              >
                <PlannerIcon :name="control.icon" class="h-3.5 w-3.5" />
                {{ control.label }}
              </button>
            </div>

            <div v-if="partyOpen" class="rounded-2xl border border-line bg-white p-3">
              <TravellerStrip :party="party" :authenticated="isAuthenticated" @add="addTraveller" @remove="removeTraveller" />
            </div>
            <PreferenceSheet v-if="preferencesOpen" v-model:open="preferencesOpen" :form="form" :today="today" />

            <RequestComposer v-model="draft" :loading="loading" :authenticated="isAuthenticated" @submit="ask" />

            <div class="flex flex-wrap gap-2">
              <button
                v-for="item in adjustments"
                :key="item.id"
                type="button"
                class="min-h-11 rounded-full border border-[#E2E8F0] bg-white px-3 text-[13px] font-semibold leading-5 text-[#334155] hover:border-[#008A9B] hover:text-[#008A9B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#008A9B] sm:min-h-9"
                @click="adjust(item.id)"
              >
                {{ item.label }}
              </button>
            </div>
          </div>
        </div>
      </template>

      <template #itinerary>
        <div class="space-y-4">
          <div v-if="result" class="flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              class="inline-flex min-h-11 items-center text-sm font-semibold text-ink/70 hover:text-ink"
              @click="startOver"
            >
              Plan another trip
            </button>
            <p v-if="result.catalogueSize === 0" class="text-sm text-ink/70">
              No bookable activities for {{ result.request.destination }} yet, so this plan has ideas only.
            </p>
          </div>

          <PlannerBoard
            v-if="result"
            :itinerary="result.itinerary"
            :activities="result.activities"
            :request="result.request"
            :authenticated="isAuthenticated"
            :saving="saving"
            @save="saveTrip"
            @refine="refine"
          />
          <PlannerStates v-else-if="loading" kind="loading" />
          <PlannerStates v-else-if="error" kind="error" :message="error" />
          <PlannerStates v-else kind="empty" />
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
}

type ControlId = 'dates' | 'family' | 'budget' | 'style'

const CITIES = ['Ho Chi Minh City', 'Kuala Lumpur', 'Hong Kong', 'Singapore', 'Bangkok', 'Phuket', 'Hanoi', 'Taipei', 'Seoul', 'Tokyo', 'Osaka', 'Sydney', 'Bali']

const agentChips: ReadonlyArray<{ label: string; icon: PlannerIconName; draft: string; note: string }> = [
  {
    label: 'Personalised itineraries',
    icon: 'spark',
    draft: 'Plan a 5-day family holiday in Tokyo with a budget of S$4,000',
    note: 'I set Tokyo, five days, and an activity budget of SGD 4,000. Check the ages, then start planning.'
  },
  {
    label: 'Family-friendly planning',
    icon: 'users',
    draft: 'Plan a relaxed family weekend in Singapore with playgrounds and short queues',
    note: 'I set a relaxed Singapore weekend for a family. Check the ages, then start planning.'
  },
  {
    label: 'Smart recommendations',
    icon: 'bulb',
    draft: 'Suggest a balanced family trip with food and easy sightseeing',
    note: 'Add a city if this one is not right. Linked activities appear only when a partner has checked them.'
  },
  {
    label: 'Real travel options',
    icon: 'ticket',
    draft: 'Show a Singapore weekend with tickets we can check',
    note: 'I set a Singapore weekend. A ticket link appears only when we sell it or a partner has checked it.'
  }
]

const capabilities = [
  'Understands your travel style',
  'Creates personalised itineraries',
  'Links partner offers once checked',
  'Refines the whole trip on request',
  'Saves trips when you sign in'
]

const adjustments = [
  { id: 'cheaper', label: 'Make it cheaper' },
  { id: 'kids', label: 'More kid-friendly' },
  { id: 'walking', label: 'Less walking' },
  { id: 'food', label: 'Add more food options' }
] as const

const PENDING_KEY = 'gotravelnha_pending_trip'

const route = useRoute()
const router = useRouter()
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
    text: "Hi, I'm GoTravelNha AI, your travel agent. Tell me where you'd like to go, when, and who is coming, or pick a trip below to start. A suggestion is not a booking, and a price shows up only when a partner has checked it."
  }
])

const hasUserNote = computed(() => messages.value.some((note) => note.role === 'user'))

const paceLabels: Record<TripPace, string> = { relaxed: 'Relaxed', balanced: 'Balanced', packed: 'Packed' }

const shortDate = (value: string) =>
  new Intl.DateTimeFormat('en-SG', { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`))

const contextLine = computed(() => {
  const travellers = party.value.filter((person) => person.include).length
  const dates = form.startDate && form.endDate ? `${shortDate(form.startDate)} – ${shortDate(form.endDate)}` : 'No dates yet'
  const parts = [form.destination || 'No destination', dates, `${travellers} ${travellers === 1 ? 'traveller' : 'travellers'}`, paceLabels[form.pace]]
  if (form.budget) parts.push(`S$${form.budget.toLocaleString('en-SG')} activities`)
  return parts.join(' · ')
})

const controls = computed<Array<{ id: ControlId; label: string; icon: PlannerIconName; active: boolean }>>(() => [
  { id: 'dates', label: 'Dates', icon: 'calendar', active: preferencesOpen.value },
  { id: 'family', label: 'Family profile', icon: 'users', active: partyOpen.value },
  { id: 'budget', label: 'Budget', icon: 'wallet', active: preferencesOpen.value },
  { id: 'style', label: 'Travel style', icon: 'sliders', active: preferencesOpen.value }
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

const pushNote = (role: Note['role'], text: string) => {
  noteId += 1
  const time = new Intl.DateTimeFormat('en-SG', { hour: '2-digit', minute: '2-digit' }).format(new Date())
  messages.value.push({ id: noteId, role, text, time })
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

const readDraft = () => {
  const text = draft.value.trim()
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

const useExample = (text: string, note: string) => {
  draft.value = text
  readDraft()
  preferencesOpen.value = false
  tab.value = 'talk'
  pushNote('assistant', note)
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

const adjust = (id: (typeof adjustments)[number]['id']) => {
  if (id === 'cheaper') {
    const current = form.budget && form.budget > 0 ? form.budget : 2000
    form.budget = Math.max(200, Math.round(current * 0.8))
    draft.value = `Make this cheaper in ${form.destination}, with an activity budget of S$${form.budget}`
    pushNote('assistant', `I set the activity budget to SGD ${form.budget.toLocaleString('en-SG')}. Send the message to build a new plan.`)
  } else if (id === 'kids') {
    addInterest('kid-friendly, playgrounds, short queues')
    draft.value = `Make ${form.destination} more kid-friendly, with short queues`
    pushNote('assistant', 'I added kid-friendly time and shorter queues. Send the message to build a new plan.')
  } else if (id === 'walking') {
    form.pace = 'relaxed'
    addInterest('less walking, rest after lunch')
    draft.value = `A slower ${form.destination} trip with less walking`
    pushNote('assistant', 'I set a relaxed pace and less walking. Send the message to build a new plan.')
  } else {
    addInterest('more local food')
    draft.value = `Add more food stops in ${form.destination}`
    pushNote('assistant', 'I added more local food. Send the message to build a new plan.')
  }
  tab.value = 'talk'
  focusRequest()
}

const refine = () => {
  tab.value = 'talk'
  pushNote(
    'assistant',
    'Tell me what to change, or tap a quick change below. Sending builds a new plan for the whole trip from the dates and ages already set.'
  )
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

const ask = async () => {
  if (loading.value) return
  readDraft()
  const question = clarify()
  const spoken = draft.value.trim()
  const when = form.startDate && form.endDate ? `${form.startDate} to ${form.endDate}` : 'dates not set yet'
  pushNote('user', spoken || `${form.destination}, ${when}`)
  if (question) {
    error.value = question
    pushNote('assistant', question)
    tab.value = 'talk'
    return
  }
  draft.value = ''
  await generate()
}

const generate = async () => {
  const travellers = party.value.filter((person) => person.include)
  try {
    loading.value = true
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
        interests: form.interests || undefined
      }
    })
    result.value = response
    localStorage.setItem(PENDING_KEY, response.generationId)
    const days = response.itinerary.days.length
    pushNote('assistant', `Here is a ${days}-day plan for ${response.request.destination}. Prices stay with the partner that checked them.`)
  } catch (err: any) {
    const message = err?.data?.message || 'The trip planner could not finish. Please try again.'
    error.value = message
    pushNote('assistant', message)
    tab.value = 'talk'
  } finally {
    loading.value = false
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

const startOver = () => {
  result.value = null
  error.value = null
  localStorage.removeItem(PENDING_KEY)
  tab.value = 'talk'
  pushNote('assistant', 'What should we plan next?')
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
  title: 'Family Trip Planner | GoTravelNha',
  link: [
    { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap' }
  ],
  meta: [
    {
      name: 'description',
      content: 'Plan a family trip day by day, built around your children’s ages, with activities you can book on GoTravelNha.'
    }
  ]
})
</script>
