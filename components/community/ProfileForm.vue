<template>
  <form class="space-y-4 font-brand" @submit.prevent="submit">
    <div class="grid gap-3 sm:grid-cols-2">
      <label class="block">
        <span class="form-label">{{ t('community.publish.displayName') }}</span>
        <input v-model="displayName" class="form-input" maxlength="50" required autocomplete="nickname" />
      </label>
      <label class="block">
        <span class="form-label">{{ t('community.publish.handle') }}</span>
        <span class="relative block">
          <span class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-cm-muted">@</span>
          <input v-model="handle" class="form-input pl-7" maxlength="31" required autocomplete="off" autocapitalize="none" spellcheck="false" :aria-invalid="!handleValid" />
        </span>
        <span class="mt-1 block text-[12.5px]" :class="handleValid ? 'text-cm-muted' : 'text-[#B91C1C]'">{{ t('community.publish.handleHint') }}</span>
      </label>
    </div>
    <label v-if="withBio" class="block">
      <span class="form-label">{{ t('community.profile.bio') }} <span class="font-normal text-cm-subtle">({{ t('community.customize.optional') }})</span></span>
      <textarea v-model="bio" class="form-input min-h-[88px]" maxlength="280" :placeholder="t('community.profile.bioPlaceholder')"></textarea>
      <span class="mt-1 block text-right text-[12px] text-cm-subtle">{{ bio.length }}/280</span>
    </label>
    <p class="text-[12.5px] leading-5 text-cm-muted">{{ t('community.profile.privacy') }}</p>
    <p v-if="error" class="alert-error" role="alert">{{ error }}</p>
    <div class="flex flex-wrap justify-end gap-2">
      <button v-if="cancellable" type="button" class="cm-btn-outline h-11 px-5 text-[14.5px]" @click="emit('cancel')">{{ t('community.profile.cancel') }}</button>
      <button type="submit" class="cm-btn-primary h-11 px-6 text-[14.5px]" :disabled="saving || !handleValid || !displayName.trim()">
        {{ saving ? t('community.publish.saving') : submitLabel || t('community.profile.save') }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { HANDLE_PATTERN, normaliseHandle } from '~/utils/community-handle'
import type { OwnProfile } from '~/composables/useOwnProfile'

// Create or edit the public traveler profile: what others see on trips, comments and /travelers/<handle>
const props = withDefaults(defineProps<{ withBio?: boolean; cancellable?: boolean; submitLabel?: string }>(), { withBio: true, cancellable: false, submitLabel: '' })
const emit = defineEmits<{ saved: [profile: OwnProfile]; cancel: [] }>()
const { t, locale } = useI18n()
const { profile, suggestion, load, save } = useOwnProfile()

const handle = ref('')
const displayName = ref('')
const bio = ref('')
const saving = ref(false)
const error = ref('')

const fill = () => {
  handle.value = profile.value?.handle ?? suggestion.value?.handle ?? ''
  displayName.value = profile.value?.displayName ?? suggestion.value?.displayName ?? ''
  bio.value = profile.value?.bio ?? ''
}
load().then(fill)
watch([profile, suggestion], fill)

const handleValid = computed(() => HANDLE_PATTERN.test(normaliseHandle(handle.value)))

const submit = async () => {
  if (!handleValid.value || !displayName.value.trim()) return
  try {
    saving.value = true
    error.value = ''
    const saved = await save({ handle: normaliseHandle(handle.value), displayName: displayName.value.trim(), bio: props.withBio ? bio.value.trim() || null : profile.value?.bio ?? null })
    emit('saved', saved)
  } catch (err: any) {
    // Server messages are English; other languages get the generic text
    error.value = locale.value === 'en' && err?.data?.message ? err.data.message : t('community.profile.saveFailed')
  } finally {
    saving.value = false
  }
}
</script>
