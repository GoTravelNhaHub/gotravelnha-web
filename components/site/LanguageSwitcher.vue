<template>
  <div ref="root" class="relative">
    <button
      type="button"
      class="inline-flex items-center gap-1.5 rounded-lg font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#008A9B]"
      :class="variant === 'footer' ? 'min-h-9 text-[13px] text-white/85 hover:text-white' : 'h-10 border border-[#E2E8F0] px-2.5 text-[13px] text-[#334155] hover:bg-[#F1F5F9]'"
      :aria-expanded="open"
      aria-haspopup="listbox"
      :aria-label="t('common.language.choose')"
      @click="open = !open"
    >
      <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0 0c2.5-2.4 3.8-5.4 3.8-9S14.5 5.4 12 3m0 18c-2.5-2.4-3.8-5.4-3.8-9S9.5 5.4 12 3M3.5 9h17M3.5 15h17" />
      </svg>
      {{ variant === 'footer' ? current.label : current.short }}
    </button>
    <ul
      v-if="open"
      role="listbox"
      :aria-label="t('common.language.choose')"
      class="absolute z-[80] w-44 overflow-hidden rounded-xl border border-[#E2E8F0] bg-white py-1 shadow-xl"
      :class="variant === 'footer' ? 'bottom-full left-0 mb-2' : 'right-0 mt-2'"
    >
      <li v-for="item in LOCALES" :key="item.code">
        <button
          type="button"
          role="option"
          :aria-selected="item.code === locale"
          :lang="item.code === 'zh' ? 'zh-Hans' : item.code"
          class="flex w-full items-center justify-between px-4 py-2.5 text-left text-[14px] text-[#101D3A] hover:bg-[#F1F5F9]"
          :class="item.code === locale ? 'font-semibold' : ''"
          @click="choose(item.code)"
        >
          {{ item.label }}
          <svg v-if="item.code === locale" class="h-4 w-4 text-[#008A9B]" viewBox="0 0 20 20" fill="none" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m5 10.5 3 3 7-7" />
          </svg>
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { LOCALES, useI18n, type Locale } from '~/composables/useI18n'

withDefaults(defineProps<{ variant?: 'header' | 'footer' }>(), { variant: 'header' })

const { locale, setLocale, t } = useI18n()
const { track } = useFunnel()
const open = ref(false)
const root = ref<HTMLElement | null>(null)
const current = computed(() => LOCALES.find((item) => item.code === locale.value) ?? LOCALES[0])

const choose = (code: Locale) => {
  if (code !== locale.value) track('language_changed', { from: locale.value, to: code })
  setLocale(code)
  open.value = false
}

const onDocumentClick = (event: MouseEvent) => {
  if (open.value && root.value && !root.value.contains(event.target as Node)) open.value = false
}
const onKey = (event: KeyboardEvent) => {
  if (event.key === 'Escape') open.value = false
}
onMounted(() => {
  document.addEventListener('click', onDocumentClick)
  document.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick)
  document.removeEventListener('keydown', onKey)
})
</script>
