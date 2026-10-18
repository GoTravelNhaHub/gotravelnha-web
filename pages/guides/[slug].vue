<template>
  <div v-if="guide" class="pb-16 font-brand sm:pb-20">
    <div v-if="guide.draft" class="bg-amber-100 px-4 py-2 text-center text-[13px] font-semibold text-amber-900" role="status">
      {{ t('places.guides.draft') }}
    </div>

    <PageHero
      :eyebrow="t('places.guides.eyebrow', { destination: placeName(guide.destination) })"
      :title="guide.title"
      :subtitle="guide.description"
      :image="heroImage"
      :trust="[guide.suits, t('places.guides.updated', { date: updatedLabel })]"
    />

    <div class="site-shell mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-12">
      <article class="min-w-0 space-y-12">
        <p v-if="locale !== 'en'" class="rounded-xl bg-[#F1F5F9] px-4 py-2.5 text-[14px] text-[#475569]">{{ t('places.guides.englishOnly') }}</p>
        <section class="space-y-4 text-[16px] leading-7 text-[#334155]">
          <p v-for="paragraph in guide.intro" :key="paragraph">{{ paragraph }}</p>
        </section>

        <section aria-labelledby="itinerary-title" class="space-y-5">
          <h2 id="itinerary-title" class="text-[24px] font-bold leading-8 tracking-[-0.025em] text-[#0A1024] sm:text-[28px]">{{ t('places.guides.dayByDay') }}</h2>
          <ol class="space-y-4">
            <li v-for="(day, index) in guide.itinerary" :key="day.title" class="rounded-2xl border border-[#E2E8F0] bg-white p-5 sm:p-6">
              <p class="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#0066E4]">{{ t('places.guides.day', { n: index + 1 }) }}</p>
              <h3 class="mt-1 text-[19px] font-bold leading-7 text-[#0A1024]">{{ day.title }}</h3>
              <dl class="mt-3 grid gap-3 text-[15px] leading-6 text-[#475569] sm:grid-cols-3">
                <div v-for="part in dayParts(day)" :key="part.label">
                  <dt class="text-[13px] font-semibold text-[#0A1024]">{{ part.label }}</dt>
                  <dd class="mt-0.5">{{ part.text }}</dd>
                </div>
              </dl>
              <p v-if="day.tip" class="mt-4 rounded-xl bg-[#EAF2FC] px-4 py-2.5 text-[14px] leading-[22px] text-[#0F4C55]">
                <span class="font-semibold">{{ t('places.guides.tip') }}</span> {{ day.tip }}
              </p>
            </li>
          </ol>
        </section>

        <section v-if="guide.costs" aria-labelledby="costs-title" class="space-y-4">
          <h2 id="costs-title" class="text-[24px] font-bold leading-8 tracking-[-0.025em] text-[#0A1024] sm:text-[28px]">{{ t('places.guides.costs') }}</h2>
          <div class="overflow-x-auto rounded-2xl border border-[#E2E8F0] bg-white">
            <table class="w-full text-left text-[15px]">
              <thead class="bg-[#F8FAFC] text-[13px] text-[#64748B]">
                <tr>
                  <th scope="col" class="px-4 py-3 font-semibold">{{ t('places.guides.item') }}</th>
                  <th scope="col" class="px-4 py-3 font-semibold">{{ t('places.guides.estimate', { currency: guide.costs.currency }) }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="line in guide.costs.lines" :key="line.item" class="border-t border-[#E2E8F0]">
                  <td class="px-4 py-3 text-[#0A1024]">
                    {{ line.item }}
                    <span v-if="line.note" class="block text-[13px] text-[#64748B]">{{ line.note }}</span>
                  </td>
                  <td class="px-4 py-3 font-semibold text-[#0A1024]">{{ line.estimate }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <!-- Estimates are ours; live prices only come from partners -->
          <p class="text-[13px] leading-5 text-[#64748B]">{{ guide.costs.note }} {{ t('places.guides.costsNote') }}</p>
        </section>

        <section aria-labelledby="tips-title" class="space-y-4">
          <h2 id="tips-title" class="text-[24px] font-bold leading-8 tracking-[-0.025em] text-[#0A1024] sm:text-[28px]">{{ t('places.guides.tips') }}</h2>
          <ul class="space-y-2.5">
            <li v-for="tip in guide.tips" :key="tip" class="flex items-start gap-2.5 text-[15px] leading-6 text-[#475569]">
              <svg class="mt-1 h-4 w-4 shrink-0 text-[#0066E4]" viewBox="0 0 20 20" fill="none" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m5 10.5 3 3 7-7" /></svg>
              {{ tip }}
            </li>
          </ul>
        </section>

        <section aria-labelledby="faq-title" class="space-y-4">
          <h2 id="faq-title" class="text-[24px] font-bold leading-8 tracking-[-0.025em] text-[#0A1024] sm:text-[28px]">{{ t('places.guides.questions') }}</h2>
          <div class="divide-y divide-[#E2E8F0] rounded-2xl border border-[#E2E8F0] bg-white">
            <details v-for="faq in guide.faqs" :key="faq.question" class="group px-5 py-4">
              <summary class="flex cursor-pointer list-none items-center justify-between gap-4 text-[16px] font-semibold text-[#0A1024]">
                {{ faq.question }}
                <svg class="h-4 w-4 shrink-0 text-[#64748B] transition group-open:rotate-180" viewBox="0 0 20 20" fill="none" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m5 8 5 5 5-5" /></svg>
              </summary>
              <p class="mt-2 text-[15px] leading-6 text-[#475569]">{{ faq.answer }}</p>
            </details>
          </div>
        </section>
      </article>

      <aside class="lg:sticky lg:top-24 lg:self-start">
        <div class="rounded-2xl bg-[#0A1024] p-6 text-white">
          <p class="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#7DB4FF]">{{ t('places.guides.makeYours') }}</p>
          <h2 class="mt-1 text-[20px] font-bold leading-7">{{ t('places.guides.customiseTitle') }}</h2>
          <p class="mt-2 text-[14px] leading-[22px] text-white/75">{{ t('places.guides.customiseText') }}</p>
          <NuxtLink
            :to="{ path: '/planner', query: { prompt: guide.plannerPrompt } }"
            class="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0066E4] px-5 text-[15px] font-semibold text-white hover:bg-[#0057C8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A1024]"
            @click="track('guide_customise_clicked', { guide: guide.slug })"
          >
            {{ t('places.guides.planMine') }}
          </NuxtLink>
        </div>
        <NuxtLink
          :to="`/destinations/${destinationSlug(guide.destination)}`"
          class="mt-4 flex min-h-12 items-center justify-between rounded-2xl border border-[#E2E8F0] bg-white px-5 text-[14px] font-semibold text-[#0A1024] hover:border-[#0066E4]"
        >
          {{ t('places.guides.activitiesIn', { destination: placeName(guide.destination) }) }}
          <span aria-hidden="true">→</span>
        </NuxtLink>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import PageHero from '~/components/site/PageHero.vue'
import { GUIDES, findGuide, type GuideDay } from '~/utils/destination-guides'
import { destinationPhoto } from '~/utils/destination-photos'
import { destinationSlug } from '~/utils/destination-slug'

definePageMeta({ layout: 'default', bleed: true })

const route = useRoute()
const found = findGuide(String(route.params.slug || ''))
if (!found) throw createError({ statusCode: 404, statusMessage: 'Guide not found', fatal: true })
// Placeholder only so the setup below never reads undefined; the 404 above stops rendering
const guide = found ?? GUIDES[0]

const { track } = useFunnel()
const { t, locale, localeTag, placeName } = useI18n()
const heroImage = destinationPhoto(guide.destination, 2400) as string
const updatedLabel = computed(() => new Intl.DateTimeFormat(localeTag.value, { dateStyle: 'medium' }).format(new Date(`${guide.updated}T00:00:00`)))

const dayParts = (day: GuideDay) => [
  { label: t('planner.slots.morning'), text: day.morning },
  { label: t('planner.slots.afternoon'), text: day.afternoon },
  { label: t('planner.slots.evening'), text: day.evening }
]

useHead({
  title: guide.metaTitle,
  meta: [
    { name: 'description', content: guide.description, key: 'description' },
    { property: 'og:title', content: guide.metaTitle, key: 'og-title' },
    { property: 'og:description', content: guide.description, key: 'og-description' },
    { property: 'og:image', content: heroImage, key: 'og-image' },
    ...(guide.draft ? [{ name: 'robots', content: 'noindex, nofollow', key: 'robots' }] : [])
  ],
  script: [
    {
      type: 'application/ld+json',
      key: 'guide-faq',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: guide.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: { '@type': 'Answer', text: faq.answer }
        }))
      })
    }
  ]
})
</script>
