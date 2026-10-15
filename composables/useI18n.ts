import { computed, ref } from 'vue'
import en, { type Messages } from '~/locales/en'
import vi from '~/locales/vi'
import zh from '~/locales/zh'

// Site language. One URL per page: the server always renders English (that is what search
// engines index and what the swr cache stores), then plugins/i18n.client.ts switches to the
// visitor's saved or browser language after hydration. Saved in localStorage `gotravelnha_lang`.

export type Locale = 'en' | 'vi' | 'zh'

export const LOCALES: { code: Locale; label: string; short: string; tag: string }[] = [
  { code: 'en', label: 'English', short: 'EN', tag: 'en-SG' },
  { code: 'vi', label: 'Tiếng Việt', short: 'VI', tag: 'vi-VN' },
  { code: 'zh', label: '简体中文', short: '中文', tag: 'zh-CN' }
]

export const LOCALE_STORAGE_KEY = 'gotravelnha_lang'

const MESSAGES: Record<Locale, Messages> = { en, vi, zh }

// Module-level like useAuthState. Only ever changed in the browser, so the server stays 'en'.
const locale = ref<Locale>('en')

export const isLocale = (value: unknown): value is Locale => value === 'en' || value === 'vi' || value === 'zh'

const lookup = (messages: unknown, key: string): unknown =>
  key.split('.').reduce<unknown>((node, part) => (node && typeof node === 'object' ? (node as Record<string, unknown>)[part] : undefined), messages)

const interpolate = (text: string, params?: Record<string, string | number>) =>
  params ? text.replace(/\{(\w+)\}/g, (match, name) => (name in params ? String(params[name]) : match)) : text

export const useI18n = () => {
  /**
   * Text for `key` ("explore.hero.title"), with {name} placeholders filled. Falls back to English,
   * then the key. With a numeric `count` of 1, `key_one` is used when it exists ("1 adult" / "2 adults").
   */
  const t = (key: string, params?: Record<string, string | number>): string => {
    const pick = (messages: unknown) => {
      if (params?.count === 1) {
        const one = lookup(messages, `${key}_one`)
        if (typeof one === 'string') return one
      }
      return lookup(messages, key)
    }
    const value = pick(MESSAGES[locale.value]) ?? pick(en)
    return typeof value === 'string' ? interpolate(value, params) : key
  }

  /** Arrays and objects (lists of bullets, FAQ entries). Falls back to English. */
  const tm = <T>(key: string): T => (lookup(MESSAGES[locale.value], key) ?? lookup(en, key)) as T

  const setLocale = (code: Locale, persist = true) => {
    locale.value = code
    if (typeof document !== 'undefined') document.documentElement.lang = code === 'zh' ? 'zh-Hans' : code
    if (persist) {
      try {
        localStorage.setItem(LOCALE_STORAGE_KEY, code)
      } catch {
        // Private mode or blocked storage: the choice lasts for this page view only
      }
    }
  }

  /** BCP 47 tag for Intl date and number formatting */
  const localeTag = computed(() => LOCALES.find((item) => item.code === locale.value)?.tag ?? 'en-SG')

  /** Translated city or country name ("Tokyo" → "东京"); unknown names are returned as given */
  const placeName = (name: string): string => {
    const places = MESSAGES[locale.value].common.places as Record<string, string>
    return places[name] ?? name
  }

  return { locale, t, tm, setLocale, localeTag, placeName }
}
