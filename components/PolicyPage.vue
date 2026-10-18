<template>
  <div class="max-w-3xl mx-auto py-8 sm:py-12">
    <h1 class="text-3xl font-bold text-slate-900">{{ t(`info.${page}.title`) }}</h1>
    <p class="mt-2 text-sm text-slate-500">{{ t('info.policy.updated', { date: updatedLabel }) }}</p>
    <p v-if="legal && locale !== 'en'" class="mt-4 rounded-xl bg-slate-100 px-4 py-2.5 text-sm text-slate-600">{{ t('info.policy.englishPrevails') }}</p>
    <!-- Trusted HTML from locales/*/info.ts; internal links are routed in-app by onClick -->
    <div class="policy mt-8 space-y-6 text-slate-700 leading-relaxed" @click="onClick">
      <p v-if="t(`info.${page}.intro`)">{{ t(`info.${page}.intro`) }}</p>
      <section v-for="section in sections" :key="section.heading">
        <h2>{{ section.heading }}</h2>
        <div class="space-y-4" v-html="section.html"></div>
      </section>
    </div>
    <p class="mt-10 text-sm text-slate-600">
      {{ t('info.policy.questions') }}
      <a v-if="supportEmail" :href="`mailto:${supportEmail}`" class="text-brand-700 hover:underline">{{ supportEmail }}</a>
      <template v-if="supportEmail"> {{ t('info.policy.or') }} </template>
      <NuxtLink to="/contact" class="text-brand-700 hover:underline">{{ t('info.policy.useForm') }}</NuxtLink>.
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  page: 'help' | 'privacy' | 'terms' | 'refund'
  /** YYYY-MM-DD */
  updated: string
  /** Legal text: translated versions say the English version applies */
  legal?: boolean
}>()

const { t, tm, locale, localeTag } = useI18n()
const supportEmail = useRuntimeConfig().public.supportEmail

const sections = computed(() => tm<{ heading: string; html: string }[]>(`info.${props.page}.sections`))
const updatedLabel = computed(() =>
  new Intl.DateTimeFormat(localeTag.value, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${props.updated}T00:00:00Z`))
)

const onClick = (event: MouseEvent) => {
  const link = (event.target as HTMLElement).closest('a')
  const href = link?.getAttribute('href')
  if (!href || !href.startsWith('/') || href.startsWith('//') || event.metaKey || event.ctrlKey || event.shiftKey) return
  event.preventDefault()
  navigateTo(href)
}
</script>

<style scoped>
.policy :deep(h2) {
  font-size: 1.25rem;
  font-weight: 700;
  color: rgb(15 23 42);
  margin-top: 2rem;
  margin-bottom: 0.75rem;
}
.policy :deep(ul) {
  list-style: disc;
  padding-left: 1.25rem;
}
.policy :deep(li) {
  margin-top: 0.25rem;
}
.policy :deep(a) {
  color: #0642d2;
}
.policy :deep(a:hover) {
  text-decoration: underline;
}
</style>
