<template>
  <section
    class="font-brand"
    :class="variant === 'band' ? 'relative isolate overflow-hidden rounded-3xl bg-[#0A1024] p-6 text-white sm:p-10' : 'rounded-2xl border border-[#E2E8F0] bg-white p-5'"
    :aria-labelledby="titleId"
  >
    <div v-if="variant === 'band'" class="absolute inset-0 bg-gradient-to-br from-[#0066E4]/35 to-transparent" aria-hidden="true"></div>
    <div class="relative" :class="variant === 'band' ? 'grid items-center gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]' : ''">
      <div>
        <h2 :id="titleId" :class="variant === 'band' ? 'text-[24px] font-bold leading-8 tracking-[-0.02em] sm:text-[28px] sm:leading-9' : 'text-[15px] font-bold leading-5 text-[#0A1024]'">
          {{ title || t('common.newsletter.title') }}
        </h2>
        <p :class="variant === 'band' ? 'mt-2 text-[15px] leading-6 text-white/80' : 'mt-1 text-[13px] leading-5 text-[#64748B]'">{{ text || t('common.newsletter.text') }}</p>
      </div>

      <div :class="variant === 'band' ? '' : 'mt-3'">
        <p v-if="success" class="rounded-xl px-4 py-3 text-[14px] font-medium" :class="variant === 'band' ? 'bg-white/10 text-white ring-1 ring-white/20' : 'alert-success'" role="status">
          {{ success }}
        </p>
        <form v-else class="flex flex-col gap-2 sm:flex-row" @submit.prevent="handleSubscribe">
          <label :for="inputId" class="sr-only">{{ t('common.newsletter.emailLabel') }}</label>
          <input
            :id="inputId"
            v-model.trim="email"
            type="email"
            required
            maxlength="200"
            autocomplete="email"
            placeholder="you@example.com"
            class="form-input min-w-0 flex-1"
            :disabled="loading"
          />
          <button type="submit" class="btn-primary sm:w-auto sm:px-6" :disabled="loading || !email">
            {{ loading ? t('common.newsletter.subscribing') : buttonLabel || t('common.newsletter.button') }}
          </button>
        </form>
        <p v-if="error" class="alert-error mt-2" role="alert">{{ error }}</p>
        <p class="mt-2 text-[12px] leading-[18px]" :class="variant === 'band' ? 'text-white/60' : 'text-[#94A3B8]'">
          {{ t('common.newsletter.unsubscribeBefore') }} <NuxtLink to="/privacy" class="underline underline-offset-2">{{ t('common.newsletter.privacy') }}</NuxtLink>.
        </p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, useId } from 'vue'

const props = withDefaults(
  defineProps<{
    source?: string
    variant?: 'band' | 'compact'
    title?: string
    text?: string
    buttonLabel?: string
  }>(),
  {
    source: 'newsletter_component',
    variant: 'compact'
  }
)

const { track } = useFunnel()
const { t } = useI18n()
const titleId = useId()
const inputId = useId()

const email = ref('')
const loading = ref(false)
const success = ref<string | null>(null)
const error = ref<string | null>(null)

const handleSubscribe = async () => {
  loading.value = true
  success.value = null
  error.value = null
  try {
    const response = await $api<{ success: boolean; message?: string; error?: string }>('/api/newsletter/subscribe', {
      method: 'POST',
      body: { email: email.value, source: props.source }
    })
    if (response.success) {
      success.value = t('common.newsletter.success')
      email.value = ''
      track('newsletter_subscribed', { source: props.source })
    } else {
      error.value = t('common.newsletter.error')
    }
  } catch (err: any) {
    error.value = t('common.newsletter.error')
  } finally {
    loading.value = false
  }
}
</script>
