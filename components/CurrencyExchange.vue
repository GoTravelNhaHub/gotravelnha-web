// frontend/components/CurrencyExchange.vue
<template>
  <div class="bg-white p-6 rounded-xl shadow max-w-xl mx-auto space-y-6">
    <h2 class="text-2xl font-bold text-center text-gray-800">{{ t('info.exchange.title') }}</h2>

    <div class="flex justify-center gap-4">
      <button
        :class="tab === 'sgd-vnd' ? activeClass : inactiveClass"
        @click="switchTab('sgd-vnd')"
      >
        SGD → VND
      </button>
      <button
        :class="tab === 'vnd-sgd' ? activeClass : inactiveClass"
        @click="switchTab('vnd-sgd')"
      >
        VND → SGD
      </button>
    </div>

    <p class="text-center text-sm text-gray-500">
      {{ t('info.exchange.powered') }}
    </p>

    <form @submit.prevent="submitForm" class="space-y-4">
      <div>
        <label class="block font-medium">{{ t('info.exchange.name') }}</label>
        <input v-model="form.name" required class="input" />
      </div>

      <div>
        <label class="block font-medium">{{ t('info.exchange.email') }}</label>
        <input v-model="form.email" type="email" required class="input" />
      </div>

      <div>
        <label class="block font-medium">{{ inputLabel }}</label>
        <input
            v-model.number="form.inputAmount"
            type="number"
            min="1"
            required
            class="input"
            :placeholder="t('info.exchange.amountPlaceholder')"
        />
      </div>

      <div>
        <label class="block font-medium">{{ outputLabel }}</label>
        <input :value="formattedConvertedAmount" readonly class="input bg-gray-100" />
      </div>

      <button type="submit" class="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700">
        {{ t('info.exchange.submit') }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useToast } from 'vue-toastification'
import { useDebounce } from '@vueuse/core'

const toast = useToast()
const { t } = useI18n()
const config = useRuntimeConfig()

const tab = ref('sgd-vnd')
const exchangeRate = ref(17500)

const form = ref({
  name: '',
  email: '',
  inputAmount: 0
})

const convertedAmount = ref(0)

const amount = computed(() => form.value.inputAmount)
const debouncedAmount = useDebounce(amount, 600)

watch(debouncedAmount, async (amount) => {
  if (!amount || amount <= 0) {
    convertedAmount.value = 0
    return
  }

  const from = tab.value === 'sgd-vnd' ? 'SGD' : 'VND'
  const to = tab.value === 'sgd-vnd' ? 'VND' : 'SGD'

  try {
    const { converted } = await $fetch(`${config.public.apiBase}/exchange/convert`, {
      params: {
        from,
        to,
        amount
      }
    })
    convertedAmount.value = converted

  } catch (e) {
    convertedAmount.value = 0
    toast.error(t('info.exchange.unavailable'))
  }
})

const switchTab = (value) => {
  tab.value = value
  form.value.inputAmount = 0
  convertedAmount.value = 0
}

const inputLabel = computed(() => t(tab.value === 'sgd-vnd' ? 'info.exchange.sgdAmount' : 'info.exchange.vndAmount'))
const outputLabel = computed(() => t(tab.value === 'sgd-vnd' ? 'info.exchange.vndAmount' : 'info.exchange.sgdAmount'))

const formattedConvertedAmount = computed(() => {
  const locale = tab.value === 'sgd-vnd' ? 'vi-VN' : 'en-SG'
  const currency = tab.value === 'sgd-vnd' ? 'VND' : 'SGD'
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(convertedAmount.value || 0)
})

const submitForm = async () => {
  try {
    await $fetch('/api/exchange', {
      method: 'POST',
      body: {
        name: form.value.name,
        email: form.value.email,
        direction: tab.value,
        amount: form.value.inputAmount,
        converted: convertedAmount.value
      }
    })
    toast.success(t('info.exchange.sent'))
    form.value = { name: '', email: '', inputAmount: 0 }
    convertedAmount.value = 0
  } catch (e) {
    toast.error(t('info.exchange.failed'))
  }
}

const activeClass = 'px-4 py-2 bg-blue-600 text-white rounded font-semibold'
const inactiveClass = 'px-4 py-2 bg-white text-gray-800 border rounded font-semibold'
</script>

<style scoped>
.input {
  @apply w-full mt-1 rounded border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring focus:border-blue-500;
}
</style>