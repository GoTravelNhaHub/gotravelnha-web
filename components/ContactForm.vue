<template>
  <div class="rounded-2xl border border-[#E2E8F0] bg-white p-5 font-brand shadow-[0_24px_60px_-28px_rgba(16,29,58,0.45)] sm:p-8">
    <div v-if="sent" class="py-6 text-center" role="status">
      <span class="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#ECFDF5] text-[#059669]" aria-hidden="true">
        <svg class="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m5 12.5 4.5 4.5L19 7.5" /></svg>
      </span>
      <h2 class="mt-4 text-[22px] font-bold leading-8 tracking-[-0.02em] text-[#101D3A]">Message sent</h2>
      <p class="mx-auto mt-2 max-w-sm text-[15px] leading-6 text-[#64748B]">Thanks for getting in touch. We'll reply to the email address you gave us.</p>
      <button type="button" class="btn-secondary mx-auto mt-6 w-auto px-6" @click="sent = false">Send another message</button>
    </div>

    <form v-else class="space-y-5" @submit.prevent="submitForm">
      <div>
        <h2 class="text-[20px] font-bold leading-7 tracking-[-0.02em] text-[#101D3A]">Send us a message</h2>
        <p class="mt-1 text-[14px] leading-[22px] text-[#64748B]">
          Fields marked <span class="text-[#B91C1C]" aria-hidden="true">*</span><span class="sr-only">with an asterisk</span> are required.
        </p>
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <div>
          <label for="contact-name" class="form-label">Name <span class="text-[#B91C1C]" aria-hidden="true">*</span></label>
          <input id="contact-name" v-model="form.name" type="text" autocomplete="name" required class="form-input" placeholder="Your full name" />
        </div>
        <div>
          <label for="contact-email" class="form-label">Email <span class="text-[#B91C1C]" aria-hidden="true">*</span></label>
          <input id="contact-email" v-model="form.email" type="email" autocomplete="email" required class="form-input" placeholder="you@example.com" />
        </div>
      </div>

      <div>
        <label for="contact-reference" class="form-label">Booking reference <span class="font-normal text-[#64748B]">(optional)</span></label>
        <input
          id="contact-reference"
          v-model="form.reference"
          type="text"
          maxlength="20"
          aria-describedby="contact-reference-hint"
          class="form-input font-mono uppercase placeholder:font-brand placeholder:normal-case"
          placeholder="GTN-XXXXXXXX"
        />
        <p id="contact-reference-hint" class="mt-1.5 text-[12px] leading-[18px] text-[#64748B]">For Singapore attraction tickets bought on GoTravelNha. It's in your confirmation email.</p>
      </div>

      <div>
        <div class="flex items-baseline justify-between gap-2">
          <label for="contact-message" class="form-label">Message <span class="text-[#B91C1C]" aria-hidden="true">*</span></label>
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
          placeholder="Tell us what you need help with"
        ></textarea>
      </div>

      <p v-if="error" class="alert-error" role="alert">{{ error }}</p>

      <div class="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p class="text-[12px] leading-[18px] text-[#94A3B8]">
          We use your details only to reply. See our <NuxtLink to="/privacy" class="text-link font-medium">Privacy Policy</NuxtLink>.
        </p>
        <button type="submit" class="btn-primary sm:w-auto sm:px-7" :disabled="submitting">
          <span v-if="submitting" class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true"></span>
          <svg v-else class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 12 20 4l-4 16-4-7-8-1Z" />
          </svg>
          {{ submitting ? 'Sending…' : 'Send message' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
  import { ref } from 'vue'
  import { useRoute } from 'vue-router'

  const route = useRoute()

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
      error.value = e?.data?.message || 'Your message could not be sent. Please try again later.'
    } finally {
      submitting.value = false
    }
  }
</script>
