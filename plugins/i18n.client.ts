import { LOCALE_STORAGE_KEY, isLocale, useI18n, type Locale } from '~/composables/useI18n'

// Applies the visitor's language after hydration, so the English server HTML (cached by swr)
// hydrates without mismatches. A saved choice wins; otherwise the browser language decides.

const fromBrowser = (): Locale | null => {
  for (const tag of navigator.languages || [navigator.language]) {
    const lower = (tag || '').toLowerCase()
    if (lower.startsWith('vi')) return 'vi'
    // Simplified Chinese only; zh-TW / zh-HK readers get English rather than the wrong script
    if (lower === 'zh' || lower.startsWith('zh-cn') || lower.startsWith('zh-sg') || lower.startsWith('zh-hans')) return 'zh'
    if (lower.startsWith('en')) return 'en'
  }
  return null
}

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:mounted', () => {
    const { setLocale } = useI18n()
    let saved: string | null = null
    try {
      saved = localStorage.getItem(LOCALE_STORAGE_KEY)
    } catch {
      saved = null
    }
    const code = isLocale(saved) ? saved : fromBrowser()
    if (code && code !== 'en') setLocale(code, false)
  })
})
