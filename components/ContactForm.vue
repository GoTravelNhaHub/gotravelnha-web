<template>
  <div class="rounded-2xl border border-[#E2E8F0] bg-white p-5 font-brand shadow-[0_24px_60px_-28px_rgba(16,29,58,0.45)] sm:p-8">
    <div v-if="sent" class="py-6 text-center" role="status">
      <span class="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#ECFDF5] text-[#059669]" aria-hidden="true">
        <svg class="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m5 12.5 4.5 4.5L19 7.5" /></svg>
      </span>
      <h2 class="mt-4 text-[22px] font-bold leading-8 tracking-[-0.02em] text-[#101D3A]">{{ t('info.form.sentTitle') }}</h2>
      <p class="mx-auto mt-2 max-w-sm text-[15px] leading-6 text-[#64748B]">{{ t('info.form.sentText') }}</p>
      <button type="button" class="btn-secondary mx-auto mt-6 w-auto px-6" @click="sent = false">{{ t('info.form.another') }}</button>
    </div>

    <form v-else class="space-y-5" @submit.prevent="submitForm">
      <div>
        <h2 class="text-[20px] font-bold leading-7 tracking-[-0.02em] text-[#101D3A]">{{ t('info.form.title') }}</h2>
        <p class="mt-1 text-[14px] leading-[22px] text-[#64748B]">
          {{ t('info.form.requiredBefore') }} <span class="text-[#B91C1C]" aria-hidden="true">*</span><span class="sr-only">{{ t('info.form.withAsterisk') }}</span> {{ t('info.form.requiredAfter') }}
        </p>
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <div>
          <label for="contact-name" class="form-label">{{ t('info.form.name') }} <span class="text-[#B91C1C]" aria-hidden="true">*</span></label>
          <input id="contact-name" v-model="form.name" type="text" autocomplete="name" required class="form-input" :placeholder="t('info.form.namePlaceholder')" />
        </div>
        <div>
          <label for="contact-email" class="form-label">{{ t('info.form.email') }} <span class="text-[#B91C1C]" aria-hidden="true">*</span></label>
          <input id="contact-email" v-model="form.email" type="email" autocomplete="email" required class="form-input" placeholder="you@example.com" />
        </div>
      </div>

      <div>
        <label for="contact-reference" class="form-label">{{ t('info.form.reference') }} <span class="font-normal text-[#64748B]">{{ t('info.form.optional') }}</span></label>
        <input
          id="contact-reference"
          v-model="form.reference"
          type="text"
          maxlength="20"
          aria-describedby="contact-reference-hint"
          class="form-input font-mono uppercase placeholder:font-brand placeholder:normal-case"
          placeholder="GTN-XXXXXXXX"
        />
        <p id="contact-reference-hint" class="mt-1.5 text-[12px] leading-[18px] text-[#64748B]">{{ t('info.form.referenceHint') }}</p>
      </div>

      <div>
        <div class="flex items-baseline justify-between gap-2">
          <label for="contact-message" class="form-label">{{ t('info.form.message') }} <span class="text-[#B91C1C]" aria-hidden="true">*</span></label>
          <span class="text-[12px] text-[#94A3B8]" aria-live="polite">{{ form.message.length }}/5000</span>
        </div>
        <textarea
          id="contact-message"
          v-model="form.message"
          rows="6"
          required
          minlength="5"
          maxlength="5000"
          class="form-input resize-y"
          :placeholder="t('info.form.messagePlaceholder')"
        ></textarea>
      </div>

      <p v-if="error" class="alert-error" role="alert">{{ error }}</p>

      <div class="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p class="text-[12px] leading-[18px] text-[#94A3B8]">
          {{ t('info.form.privacyBefore') }} <NuxtLink to="/privacy" class="text-link font-medium">{{ t('info.form.privacy') }}</NuxtLink>.
        </p>
        <button type="submit" class="btn-primary sm:w-auto sm:px-7" :disabled="submitting">
          <span v-if="submitting" class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true"></span>
          <svg v-else class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 12 20 4l-4 16-4-7-8-1Z" />
          </svg>
          {{ submitting ? t('info.form.sending') : t('info.form.send') }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
  import { ref } from 'vue'
  import { useRoute } from 'vue-router'

  const route = useRoute()
  const { t } = useI18n()

  const form = ref({
    name: '',
    email: '',
    reference: typeof route.query.ref === 'string' ? route.query.ref.slice(0, 20) : '',
    message: ''
  })

  const error = ref('')
  const sent = ref(false)
  const submitting = ref(false)

  const submitForm = async () => {
    try {
      submitting.value = true
      error.value = ''
      await $fetch('/api/contact', {
        method: 'POST',
        body: form.value
      })
      sent.value = true
      form.value = { name: '', email: '', reference: '', message: '' }
    } catch (e) {
      error.value = e?.data?.message || t('info.form.failed')
    } finally {
      submitting.value = false
    }
  }
</script>
