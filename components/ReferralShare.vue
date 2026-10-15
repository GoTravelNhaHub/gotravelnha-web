<template>
  <section class="rounded-2xl border border-[#E2E8F0] bg-white p-5 font-brand" aria-labelledby="referral-title">
    <div class="flex items-start gap-3">
      <span class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFF7ED] text-[#C2410C]" aria-hidden="true">
        <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M20 12v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-8m16-4H4v4h16V8Zm-8 0v13M12 8H8.5a2.5 2.5 0 1 1 0-5C11 3 12 8 12 8Zm0 0h3.5a2.5 2.5 0 1 0 0-5C13 3 12 8 12 8Z" /></svg>
      </span>
      <div>
        <h2 id="referral-title" class="text-[15px] font-bold leading-5 text-[#101D3A]">{{ t('account.referral.title') }}</h2>
        <p class="mt-0.5 text-[13px] leading-5 text-[#64748B]">{{ t('account.referral.text') }}</p>
      </div>
    </div>

    <div v-if="referralCode" class="mt-4 space-y-3">
      <div>
        <label for="referral-code" class="form-label">{{ t('account.referral.code') }}</label>
        <div class="flex gap-2">
          <code id="referral-code" class="flex min-h-11 flex-1 items-center rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 font-mono text-[15px] font-bold tracking-wide text-[#101D3A]">{{ referralCode }}</code>
          <button type="button" class="btn-secondary min-h-11 w-auto px-3.5 text-[13px]" @click="copyReferralCode">{{ copied ? t('account.referral.copied') : t('account.referral.copy') }}</button>
        </div>
      </div>
      <div>
        <label for="referral-link" class="form-label">{{ t('account.referral.link') }}</label>
        <div class="flex gap-2">
          <input id="referral-link" :value="referralLink" readonly class="form-input min-w-0 flex-1 bg-[#F8FAFC] text-[14px] sm:text-[13px]" />
          <button type="button" class="btn-secondary min-h-11 w-auto px-3.5 text-[13px]" @click="copyReferralLink">{{ copiedLink ? t('account.referral.copied') : t('account.referral.copy') }}</button>
        </div>
      </div>

      <div class="grid grid-cols-3 gap-2">
        <button type="button" class="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-[#E2E8F0] text-[13px] font-semibold text-[#101D3A] hover:bg-[#F8FAFC]" @click="shareViaWhatsApp">
          <svg class="h-4 w-4 fill-[#25D366]" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.04c-5.51 0-9.96 4.45-9.96 9.96 0 1.76.47 3.49 1.36 5.01L2 22l5.16-1.33c1.46.8 3.1 1.23 4.78 1.23h.01c5.51 0 9.96-4.45 9.96-9.96 0-2.66-1.04-5.17-2.93-7.07A9.92 9.92 0 0 0 12 2.04z"/></svg>
          WhatsApp
        </button>
        <button type="button" class="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-[#E2E8F0] text-[13px] font-semibold text-[#101D3A] hover:bg-[#F8FAFC]" @click="shareViaEmail">
          <svg class="h-4 w-4 text-[#64748B]" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M4 6h16v12H4V6Zm0 0 8 7 8-7" /></svg>
          {{ t('account.referral.email') }}
        </button>
        <button type="button" class="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-[#E2E8F0] text-[13px] font-semibold text-[#101D3A] hover:bg-[#F8FAFC]" @click="shareViaTelegram">
          <svg class="h-4 w-4 fill-[#229ED9]" viewBox="0 0 24 24" aria-hidden="true"><path d="M22 3.24c-.24-.24-.6-.31-.9-.19L2.35 11.01a.75.75 0 0 0 .02 1.4l5.32 2.02 2.05 5.44c.11.3.39.5.7.52h.05c.29 0 .56-.16.69-.42l2.39-4.68 4.35 4.35a.75.75 0 0 0 .53.22h.06a.75.75 0 0 0 .53-.33c2.53-3.79 3.71-7.12 3.81-10.54a.76.76 0 0 0-.22-.56z"/></svg>
          Telegram
        </button>
      </div>

      <dl v-if="stats" class="grid grid-cols-3 gap-2 border-t border-[#F1F5F9] pt-3 text-center">
        <div class="flex flex-col-reverse">
          <dt class="text-[12px] text-[#64748B]">{{ t('account.referral.invited') }}</dt>
          <dd class="text-[20px] font-bold text-[#101D3A]">{{ stats.totalReferrals || 0 }}</dd>
        </div>
        <div class="flex flex-col-reverse">
          <dt class="text-[12px] text-[#64748B]">{{ t('account.referral.signedUp') }}</dt>
          <dd class="text-[20px] font-bold text-[#101D3A]">{{ stats.signedUp || 0 }}</dd>
        </div>
        <div class="flex flex-col-reverse">
          <dt class="text-[12px] text-[#64748B]">{{ t('account.referral.points') }}</dt>
          <dd class="text-[20px] font-bold text-[#C2410C]">{{ stats.totalRewards || 0 }}</dd>
        </div>
      </dl>
    </div>

    <p v-else-if="loading" class="mt-4 text-[14px] text-[#64748B]">{{ t('account.referral.loading') }}</p>
    <p v-else class="mt-4 text-[14px] text-[#64748B]">{{ t('account.referral.signIn') }}</p>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthState } from '~/composables/useAuthState'
import { useReferral } from '~/composables/useReferral'
import { useActivityTracker } from '~/composables/useActivityTracker'

const { user, isAuthenticated } = useAuthState()
const { getMyReferralCode, getReferralLink, getReferralStats } = useReferral()
const { trackClick } = useActivityTracker()
const { t } = useI18n()

const referralCode = ref<string | null>(null)
const referralLink = ref<string>('')
const stats = ref<any>(null)
const loading = ref(true)
const copied = ref(false)
const copiedLink = ref(false)

const loadReferralCode = async () => {
  if (!isAuthenticated.value || !user.value) {
    loading.value = false
    return
  }

  try {
    const response = await getMyReferralCode(user.value.id)
    if (response) {
      referralCode.value = response
      referralLink.value = getReferralLink(response)
      
      // Load stats
      const statsResponse = await getReferralStats(user.value.id)
      if (statsResponse.success) {
        stats.value = statsResponse.stats
      }
    }
  } catch (error) {
    console.error('Error loading referral code:', error)
  } finally {
    loading.value = false
  }
}

const copyReferralCode = async () => {
  if (!referralCode.value) return
  
  await navigator.clipboard.writeText(referralCode.value)
  copied.value = true
  trackClick('referral', { action: 'copy_code' })
  setTimeout(() => { copied.value = false }, 2000)
}

const copyReferralLink = async () => {
  if (!referralLink.value) return
  
  await navigator.clipboard.writeText(referralLink.value)
  copiedLink.value = true
  trackClick('referral', { action: 'copy_link' })
  setTimeout(() => { copiedLink.value = false }, 2000)
}

const shareViaWhatsApp = () => {
  const text = `${t('account.referral.shareText', { code: referralCode.value || '' })}\n${referralLink.value}`
  const url = `https://wa.me/?text=${encodeURIComponent(text)}`
  window.open(url, '_blank')
  trackClick('referral', { action: 'share_whatsapp' })
}

const shareViaEmail = () => {
  const subject = t('account.referral.emailSubject')
  const body = t('account.referral.emailBody', { code: referralCode.value || '', link: referralLink.value })
  const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  window.location.href = url
  trackClick('referral', { action: 'share_email' })
}

const shareViaTelegram = () => {
  const text = t('account.referral.shareText', { code: referralCode.value || '' })
  const url = `https://t.me/share/url?url=${encodeURIComponent(referralLink.value)}&text=${encodeURIComponent(text)}`
  window.open(url, '_blank')
  trackClick('referral', { action: 'share_telegram' })
}

onMounted(() => {
  loadReferralCode()
})
</script>

