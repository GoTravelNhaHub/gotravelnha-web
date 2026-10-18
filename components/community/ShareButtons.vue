<template>
  <div class="flex flex-wrap gap-2">
    <button type="button" class="btn-secondary min-h-11 w-auto px-4 text-[14px]" @click="copyLink">
      <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" /></svg>
      <span aria-live="polite">{{ copied ? t('community.trip.copied') : t('community.trip.copy') }}</span>
    </button>
    <a :href="whatsAppLink" target="_blank" rel="noopener noreferrer" class="btn-secondary min-h-11 w-auto px-4 text-[14px]" @click="shared('whatsapp')">
      <svg class="h-4 w-4 fill-[#25D366]" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.04c-5.51 0-9.96 4.45-9.96 9.96 0 1.76.47 3.49 1.36 5.01L2 22l5.16-1.33c1.46.8 3.1 1.23 4.78 1.23h.01c5.51 0 9.96-4.45 9.96-9.96 0-2.66-1.04-5.17-2.93-7.07A9.92 9.92 0 0 0 12 2.04z"/></svg>
      WhatsApp
    </a>
    <button v-if="canNativeShare" type="button" class="btn-secondary min-h-11 w-auto px-4 text-[14px]" @click="nativeShare">{{ t('community.trip.moreOptions') }}</button>
    <p v-if="error" class="w-full text-[13px] text-[#B91C1C]" role="alert">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

const props = defineProps<{ url: string; title: string; destination: string; tripId: string }>()
const { t, placeName } = useI18n()
const { track } = useFunnel()
const copied = ref(false)
const error = ref('')
const canNativeShare = ref(false)

// UTM tags let plugins/attribution.client.ts credit visits and bookings to the share
const tagged = (medium: string) => `${props.url}?utm_source=community_share&utm_medium=${medium}`
const message = computed(() => t('community.trip.shareMessage', { destination: placeName(props.destination), title: props.title }))
const whatsAppLink = computed(() => `https://wa.me/?text=${encodeURIComponent(`${message.value} ${tagged('whatsapp')}`)}`)

const shared = (channel: string) => track('itinerary_share', { tripId: props.tripId, channel })

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(tagged('copy'))
    copied.value = true
    error.value = ''
    shared('copy')
    setTimeout(() => (copied.value = false), 2000)
  } catch {
    error.value = t('community.trip.copyFailed')
  }
}

const nativeShare = async () => {
  try {
    await navigator.share({ title: props.title, text: message.value, url: tagged('native') })
    shared('native')
  } catch {
    // Cancelled by the user
  }
}

onMounted(() => {
  canNativeShare.value = typeof navigator.share === 'function'
})
</script>
