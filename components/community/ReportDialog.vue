<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-[85] flex items-end justify-center bg-[#0A1024]/50 backdrop-blur-sm sm:items-center sm:p-6" @click.self="close">
      <form class="w-full max-w-[460px] rounded-t-[20px] bg-white p-5 font-brand shadow-cm-panel sm:rounded-[20px] sm:p-6" role="dialog" aria-modal="true" aria-labelledby="report-title" @submit.prevent="submit" @keydown.esc="close">
        <template v-if="!sent">
          <h2 id="report-title" class="text-[18px] font-bold text-cm-ink">{{ t(`community.report.title.${targetType}`) }}</h2>
          <p class="mt-1 text-[14px] text-cm-muted">{{ t('community.report.intro') }}</p>
          <fieldset class="mt-4 space-y-2">
            <legend class="sr-only">{{ t('community.report.reason') }}</legend>
            <label v-for="option in REASONS" :key="option" class="flex cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-2.5 text-[14.5px]" :class="reason === option ? 'border-cm-primary bg-cm-soft text-cm-ink' : 'border-cm-line text-cm-body'">
              <input v-model="reason" type="radio" :value="option" class="h-4 w-4 accent-[#0066E4]" />
              {{ t(`community.report.reasons.${option}`) }}
            </label>
          </fieldset>
          <label class="mt-3 block">
            <span class="sr-only">{{ t('community.report.note') }}</span>
            <textarea v-model="note" maxlength="500" class="form-input min-h-[72px]" :placeholder="t('community.report.note')"></textarea>
          </label>
          <p v-if="error" class="alert-error mt-3" role="alert">{{ error }}</p>
          <div class="mt-4 flex justify-end gap-2">
            <button type="button" class="cm-btn-outline h-11 px-5 text-[14.5px]" @click="close">{{ t('community.profile.cancel') }}</button>
            <button type="submit" class="cm-btn-primary h-11 px-6 text-[14.5px]" :disabled="!reason || sending">{{ sending ? t('community.publish.saving') : t('community.report.send') }}</button>
          </div>
        </template>
        <template v-else>
          <h2 id="report-title" class="text-[18px] font-bold text-cm-ink">{{ t('community.report.thanksTitle') }}</h2>
          <p class="mt-2 text-[14.5px] leading-[22px] text-cm-body">{{ t('community.report.thanksText') }}</p>
          <div class="mt-5 flex justify-end"><button type="button" class="cm-btn-primary h-11 px-6 text-[14.5px]" @click="close">{{ t('community.customize.close') }}</button></div>
        </template>
      </form>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const REASONS = ['spam', 'unsafe', 'personal_info', 'offensive', 'other'] as const

const props = defineProps<{ open: boolean; targetType: 'TRIP' | 'COMMENT' | 'PROFILE'; target: string }>()
const emit = defineEmits<{ close: [] }>()
const { t } = useI18n()
const { isAuthenticated } = useAuthState()
const route = useRoute()

const reason = ref<(typeof REASONS)[number] | ''>('')
const note = ref('')
const sending = ref(false)
const sent = ref(false)
const error = ref('')

watch(
  () => props.open,
  (open) => {
    if (!open) return
    // Reporting needs an account (one report per person, and abuse limits)
    if (!isAuthenticated.value) {
      emit('close')
      goToLogin(route.fullPath)
      return
    }
    reason.value = ''
    note.value = ''
    sent.value = false
    error.value = ''
  }
)

const close = () => emit('close')

const submit = async () => {
  if (!reason.value) return
  try {
    sending.value = true
    error.value = ''
    await $api('/api/community/reports', { method: 'POST', body: { targetType: props.targetType, target: props.target, reason: reason.value, note: note.value.trim() || undefined } })
    sent.value = true
  } catch (err: any) {
    error.value = err?.statusCode === 429 || err?.status === 429 ? t('community.report.tooMany') : t('community.report.failed')
  } finally {
    sending.value = false
  }
}
</script>
