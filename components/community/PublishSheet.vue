<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-[80] flex items-end justify-center bg-[#0A1024]/55 font-brand sm:items-center sm:p-4" @click.self="emit('close')">
      <div class="flex max-h-[92vh] w-full flex-col rounded-t-2xl bg-white shadow-2xl sm:max-w-2xl sm:rounded-2xl" role="dialog" aria-modal="true" aria-labelledby="publish-title">
        <header class="flex items-start justify-between gap-3 border-b border-[#F1F5F9] px-5 py-4 sm:px-6">
          <div>
            <h2 id="publish-title" class="text-[18px] font-bold text-[#0A1024]">{{ t('community.publish.title') }}</h2>
            <p class="mt-1 text-[14px] leading-[22px] text-[#64748B]">{{ t('community.publish.intro') }}</p>
          </div>
          <button type="button" class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#64748B] hover:bg-[#F1F5F9]" :aria-label="t('community.publish.close')" @click="emit('close')">
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 6l12 12M18 6 6 18" /></svg>
          </button>
        </header>

        <div class="flex-1 space-y-6 overflow-y-auto px-5 py-5 sm:px-6">
          <p v-if="loading" class="text-[14px] text-[#64748B]" role="status">{{ t('community.publish.loading') }}</p>
          <p v-else-if="loadError" class="alert-error" role="alert">{{ loadError }}</p>

          <!-- Saved -->
          <div v-else-if="saved" class="rounded-2xl border border-[#CFE0F7] bg-[#EAF2FC] p-5" role="status">
            <p class="text-[16px] font-bold text-[#0642D2]">{{ t('community.publish.savedTitle') }} · {{ t(`community.visibility.${saved.visibility}.label`) }}</p>
            <p class="mt-1 text-[14px] text-[#0642D2]">{{ t(`community.visibility.${saved.visibility}.text`) }}</p>
            <NuxtLink :to="`/community/trips/${saved.slug}`" class="btn-primary mt-4 w-auto px-5">{{ t('community.publish.view') }}</NuxtLink>
          </div>

          <template v-else-if="preview">
            <p v-if="preview.publication?.status === 'HIDDEN'" class="rounded-xl bg-[#FEF3C7] px-4 py-3 text-[14px] text-[#78350F]">{{ t('community.publish.hiddenNote') }}</p>

            <!-- Profile, first time only -->
            <section v-if="needsProfile" class="space-y-3" aria-labelledby="profile-title">
              <div>
                <h3 id="profile-title" class="text-[15px] font-bold text-[#0A1024]">{{ t('community.publish.profileTitle') }}</h3>
                <p class="text-[13px] text-[#64748B]">{{ t('community.publish.profileText') }}</p>
              </div>
              <div class="grid gap-3 sm:grid-cols-2">
                <div>
                  <label for="publish-handle" class="form-label">{{ t('community.publish.handle') }}</label>
                  <div class="relative">
                    <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[15px] text-[#94A3B8]" aria-hidden="true">@</span>
                    <input id="publish-handle" v-model="profile.handle" class="form-input pl-7" maxlength="30" autocomplete="off" autocapitalize="none" spellcheck="false" :aria-invalid="!handleValid" aria-describedby="publish-handle-hint" />
                  </div>
                  <p id="publish-handle-hint" class="mt-1 text-[12px]" :class="handleValid ? 'text-[#64748B]' : 'text-[#B91C1C]'">{{ t('community.publish.handleHint') }}</p>
                </div>
                <div>
                  <label for="publish-name" class="form-label">{{ t('community.publish.displayName') }}</label>
                  <input id="publish-name" v-model="profile.displayName" class="form-input" maxlength="50" />
                </div>
              </div>
            </section>

            <!-- What stays private -->
            <section class="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4" aria-labelledby="privacy-title">
              <h3 id="privacy-title" class="flex items-center gap-2 text-[15px] font-bold text-[#0A1024]">
                <svg class="h-4 w-4 text-[#0066E4]" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 3 5 6v5c0 4.5 3 8.3 7 10 4-1.7 7-5.5 7-10V6l-7-3Z" /></svg>
                {{ t('community.publish.privacyTitle') }}
              </h3>
              <ul class="mt-2 space-y-1 text-[13px] leading-5 text-[#475569]">
                <li>{{ t('community.publish.privacyDates') }}</li>
                <li>{{ t('community.publish.privacyParty') }}</li>
                <li v-if="preview.removals.names.length">{{ t('community.publish.privacyNames', { names: preview.removals.names.join(', ') }) }}</li>
                <li v-if="preview.removals.emailsOrPhones">{{ t('community.publish.privacyContacts', { count: preview.removals.emailsOrPhones }) }}</li>
              </ul>
              <div v-if="shortNames.length" class="mt-3 rounded-xl bg-[#FFFBEB] p-3">
                <p class="text-[13px] font-semibold text-[#78350F]">{{ t('community.publish.shortNamesTitle') }}</p>
                <p class="text-[12px] text-[#92400E]">{{ t('community.publish.shortNamesText') }}</p>
                <div class="mt-2 flex flex-wrap gap-3">
                  <label v-for="name in shortNames" :key="name" class="inline-flex min-h-9 items-center gap-2 text-[14px] text-[#78350F]">
                    <input type="checkbox" class="h-4 w-4 accent-[#0066E4]" :checked="alsoReplace.includes(name)" :disabled="refreshing" @change="toggleReplace(name)" />
                    {{ name }}
                  </label>
                </div>
              </div>
            </section>

            <!-- Details -->
            <section class="space-y-3" aria-labelledby="details-title">
              <h3 id="details-title" class="text-[15px] font-bold text-[#0A1024]">{{ t('community.publish.detailsTitle') }}</h3>
              <div>
                <label for="publish-title-input" class="form-label">{{ t('community.publish.titleLabel') }}</label>
                <input id="publish-title-input" v-model="form.title" class="form-input" maxlength="120" />
              </div>
              <div>
                <label for="publish-description" class="form-label">{{ t('community.publish.descriptionLabel') }}</label>
                <textarea id="publish-description" v-model="form.description" class="form-input min-h-24 py-2.5" maxlength="1000" rows="3"></textarea>
              </div>
              <div>
                <label for="publish-tips" class="form-label">{{ t('community.publish.tipsLabel') }}</label>
                <textarea id="publish-tips" v-model="form.tips" class="form-input min-h-28 py-2.5" rows="4" aria-describedby="publish-tips-hint"></textarea>
                <p id="publish-tips-hint" class="mt-1 text-[12px] text-[#64748B]">{{ t('community.publish.tipsHint') }}</p>
              </div>
              <div class="grid gap-3 sm:grid-cols-2">
                <div>
                  <label for="publish-style" class="form-label">{{ t('community.publish.styleLabel') }}</label>
                  <select id="publish-style" v-model="form.travelStyle" class="form-input">
                    <option :value="null">{{ t('community.publish.notSet') }}</option>
                    <option v-for="style in TRAVEL_STYLES" :key="style" :value="style">{{ t(`planner.pace.${style}`) }}</option>
                  </select>
                </div>
                <div>
                  <label for="publish-budget" class="form-label">{{ t('community.publish.budgetLabel') }}</label>
                  <select id="publish-budget" v-model="form.budgetLevel" class="form-input">
                    <option :value="null">{{ t('community.publish.notSet') }}</option>
                    <option v-for="level in BUDGET_LEVELS" :key="level" :value="level">{{ t(`community.budget.${level}`) }}</option>
                  </select>
                </div>
              </div>
              <label class="flex min-h-10 items-center gap-3 text-[14px] text-[#334155]">
                <input v-model="form.showTravelMonth" type="checkbox" class="h-5 w-5 accent-[#0066E4]" />
                {{ t('community.publish.showMonth', { month: monthName(preview.draft.travelMonth) }) }}
              </label>
              <label v-if="preview.draft.childAgeBands.length" class="flex min-h-10 items-center gap-3 text-[14px] text-[#334155]">
                <input v-model="form.showChildAges" type="checkbox" class="h-5 w-5 accent-[#0066E4]" />
                {{ t('community.publish.showAges', { bands: preview.draft.childAgeBands.join(', ') }) }}
              </label>
            </section>

            <!-- The plan as it will be shown -->
            <details class="rounded-2xl border border-[#E2E8F0]">
              <summary class="flex min-h-12 cursor-pointer items-center px-4 text-[15px] font-bold text-[#0A1024]">
                {{ t('community.publish.previewTitle') }} · {{ t('trips.display.days', { count: preview.draft.durationDays }) }}
              </summary>
              <ol class="space-y-3 border-t border-[#F1F5F9] px-4 py-3">
                <li v-for="(day, index) in preview.draft.itinerary.days" :key="index">
                  <p class="text-[13px] font-semibold text-[#0066E4]">{{ t('trips.detail.day', { n: index + 1 }) }} · {{ day.theme }}</p>
                  <ul class="mt-1 space-y-0.5 text-[13px] leading-5 text-[#475569]">
                    <li v-for="(item, itemIndex) in day.items" :key="itemIndex"><span class="font-medium text-[#0A1024]">{{ item.title }}</span> — {{ item.description }}</li>
                  </ul>
                </li>
              </ol>
            </details>

            <!-- Visibility -->
            <fieldset class="space-y-2">
              <legend class="text-[15px] font-bold text-[#0A1024]">{{ t('community.publish.visibilityTitle') }}</legend>
              <label
                v-for="option in VISIBILITIES"
                :key="option"
                class="flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3"
                :class="form.visibility === option ? 'border-[#0066E4] bg-[#F5F9FF]' : 'border-[#E2E8F0]'"
              >
                <input v-model="form.visibility" type="radio" name="publish-visibility" :value="option" class="mt-1 h-4 w-4 accent-[#0066E4]" />
                <span>
                  <span class="block text-[14px] font-semibold text-[#0A1024]">{{ t(`community.visibility.${option}.label`) }}</span>
                  <span class="block text-[13px] text-[#64748B]">{{ t(`community.visibility.${option}.text`) }}</span>
                </span>
              </label>
              <label v-if="form.visibility === 'PUBLIC'" class="flex items-start gap-3 rounded-xl bg-[#FFFBEB] px-4 py-3 text-[14px] text-[#78350F]">
                <input v-model="form.confirmPublic" type="checkbox" class="mt-0.5 h-5 w-5 shrink-0 accent-[#0066E4]" />
                {{ t('community.publish.confirmPublic') }}
              </label>
            </fieldset>

            <p v-if="preview.publication" class="text-[13px] text-[#64748B]">{{ t('community.publish.republishNote') }}</p>
            <p v-if="saveError" class="alert-error" role="alert">{{ saveError }}</p>
          </template>
        </div>

        <footer v-if="preview && !saved" class="flex flex-wrap items-center justify-between gap-3 border-t border-[#F1F5F9] px-5 py-4 sm:px-6">
          <button
            v-if="preview.publication"
            type="button"
            class="inline-flex min-h-11 items-center rounded-xl px-3 text-[14px] font-semibold text-[#B91C1C] hover:bg-[#FEF2F2] disabled:opacity-60"
            :disabled="busy"
            @click="removePublication"
          >
            {{ removing ? t('community.publish.removing') : t('community.publish.remove') }}
          </button>
          <span v-else></span>
          <button type="button" class="btn-primary w-auto px-6" :disabled="!canSubmit" @click="submit">
            {{ saving ? t('community.publish.saving') : t('community.publish.submit') }}
          </button>
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import {
  BUDGET_LEVELS,
  TRAVEL_STYLES,
  type BudgetLevel,
  type OwnPublication,
  type PublishDraft,
  type PublishRemovals,
  type TravelStyle,
  type TripVisibility
} from '~/types/community'
import { HANDLE_PATTERN, normaliseHandle } from '~/utils/community-handle'

interface Preview {
  draft: PublishDraft
  removals: PublishRemovals
  publication: OwnPublication | null
}

const props = defineProps<{ tripId: string }>()
const emit = defineEmits<{ close: []; saved: [publication: OwnPublication]; removed: [] }>()

const VISIBILITIES: TripVisibility[] = ['PRIVATE', 'UNLISTED', 'PUBLIC']

const { t, locale, localeTag } = useI18n()
const { track } = useFunnel()

const loading = ref(true)
const refreshing = ref(false)
const saving = ref(false)
const removing = ref(false)
const busy = computed(() => saving.value || removing.value || refreshing.value)
const loadError = ref('')
const saveError = ref('')
const preview = ref<Preview | null>(null)
const saved = ref<OwnPublication | null>(null)
const needsProfile = ref(false)
const profile = reactive({ handle: '', displayName: '' })
const alsoReplace = ref<string[]>([])
// Short names found in the first preview stay listed after they are replaced, so they can be unticked
const shortNames = ref<string[]>([])

const form = reactive({
  title: '',
  description: '',
  tips: '',
  travelStyle: null as TravelStyle | null,
  budgetLevel: null as BudgetLevel | null,
  showTravelMonth: false,
  showChildAges: false,
  visibility: 'PRIVATE' as TripVisibility,
  confirmPublic: false
})

const handleValid = computed(() => !needsProfile.value || HANDLE_PATTERN.test(normaliseHandle(profile.handle)))
const canSubmit = computed(
  () =>
    !busy.value &&
    form.title.trim().length >= 3 &&
    handleValid.value &&
    (!needsProfile.value || profile.displayName.trim().length > 0) &&
    (form.visibility !== 'PUBLIC' || form.confirmPublic)
)

const monthName = (month: number) =>
  new Intl.DateTimeFormat(localeTag.value, { month: 'long', timeZone: 'UTC' }).format(new Date(Date.UTC(2000, month - 1, 1)))

const serverMessage = (err: any, fallback: string) => (locale.value === 'en' && err?.data?.message) || t(fallback)

const fetchPreview = () =>
  $api<Preview>('/api/community/publications/preview', { method: 'POST', body: { tripId: props.tripId, alsoReplace: alsoReplace.value } })

// Fields the author has not edited follow the sanitized plan
const fillForm = (value: Preview) => {
  const existing = value.publication
  form.title = existing?.title ?? value.draft.title
  form.description = existing?.description ?? value.draft.description
  form.tips = (existing?.tips.length ? existing.tips : value.draft.tips).join('\n')
  form.travelStyle = ((existing ? existing.travelStyle : value.draft.travelStyle) as TravelStyle | null) ?? null
  form.budgetLevel = (existing?.budgetLevel as BudgetLevel | null) ?? null
  form.showTravelMonth = existing?.travelMonth != null
  form.showChildAges = !!existing?.childAgeBands.length
  form.visibility = existing?.visibility ?? 'PRIVATE'
  form.confirmPublic = existing?.visibility === 'PUBLIC'
}

const toggleReplace = async (name: string) => {
  alsoReplace.value = alsoReplace.value.includes(name) ? alsoReplace.value.filter((item) => item !== name) : [...alsoReplace.value, name]
  try {
    refreshing.value = true
    const next = await fetchPreview()
    // Replacing a name changes the generated text; keep what the author typed in title and tips
    if (preview.value) {
      if (form.description === preview.value.draft.description) form.description = next.draft.description
      if (form.title === preview.value.draft.title) form.title = next.draft.title
      if (form.tips === preview.value.draft.tips.join('\n')) form.tips = next.draft.tips.join('\n')
    }
    preview.value = next
  } catch (err: any) {
    saveError.value = serverMessage(err, 'community.publish.loadFailed')
  } finally {
    refreshing.value = false
  }
}

const submit = async () => {
  if (!canSubmit.value) return
  try {
    saving.value = true
    saveError.value = ''
    if (needsProfile.value) {
      await $api('/api/community/profile', {
        method: 'PUT',
        body: { handle: normaliseHandle(profile.handle), displayName: profile.displayName.trim() }
      })
      needsProfile.value = false
    }
    const response = await $api<{ data: OwnPublication }>('/api/community/publications', {
      method: 'POST',
      body: {
        tripId: props.tripId,
        title: form.title,
        description: form.description,
        tips: form.tips.split('\n').map((tip) => tip.trim()).filter(Boolean),
        travelStyle: form.travelStyle,
        budgetLevel: form.budgetLevel,
        showTravelMonth: form.showTravelMonth,
        showChildAges: form.showChildAges,
        visibility: form.visibility,
        confirmPublic: form.confirmPublic,
        alsoReplace: alsoReplace.value
      }
    })
    saved.value = response.data
    track('itinerary_publish', { tripId: response.data.id, visibility: response.data.visibility })
    emit('saved', response.data)
  } catch (err: any) {
    saveError.value = serverMessage(err, 'community.publish.saveFailed')
  } finally {
    saving.value = false
  }
}

const removePublication = async () => {
  const id = preview.value?.publication?.id
  if (!id || !window.confirm(t('community.publish.confirmRemove'))) return
  try {
    removing.value = true
    await $api(`/api/community/publications/${id}`, { method: 'DELETE' })
    emit('removed')
    emit('close')
  } catch {
    saveError.value = t('community.publish.removeFailed')
  } finally {
    removing.value = false
  }
}

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && !busy.value) emit('close')
}
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))

onMounted(async () => {
  window.addEventListener('keydown', onKeydown)
  try {
    const [profileResponse, first] = await Promise.all([
      $api<{ data: { handle: string } | null; suggestion: { handle: string; displayName: string } | null }>('/api/community/profile'),
      fetchPreview()
    ])
    needsProfile.value = !profileResponse.data
    if (profileResponse.suggestion) {
      profile.handle = profileResponse.suggestion.handle
      profile.displayName = profileResponse.suggestion.displayName
    }
    preview.value = first
    shortNames.value = first.removals.shortNames
    fillForm(first)
  } catch (err: any) {
    loadError.value = serverMessage(err, 'community.publish.loadFailed')
  } finally {
    loading.value = false
  }
})
</script>
