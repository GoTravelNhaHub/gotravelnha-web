<template>
  <div class="pb-16 font-brand sm:pb-20">
    <PageHero
      :eyebrow="template.badge"
      :title="template.title"
      :subtitle="template.description"
      :image="template.heroImage"
      :trust="heroTrust"
      overlap
    >
      <template #badge>
        <NuxtLink
          to="/explore"
          class="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-white/10 px-3 text-[13px] font-semibold text-white ring-1 ring-white/25 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <svg class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 10H4m0 0 5-5m-5 5 5 5" />
          </svg>
          All comparisons
        </NuxtLink>
      </template>
    </PageHero>

    <section class="site-shell relative z-20 -mt-20 sm:-mt-24" aria-labelledby="compare-title">
      <div class="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-[0_24px_60px_-28px_rgba(16,29,58,0.45)] sm:p-6">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div class="min-w-0">
            <h2 id="compare-title" class="text-[20px] font-bold leading-7 tracking-[-0.02em] text-[#101D3A]">Compare and book</h2>
            <p class="mt-1 max-w-2xl text-[14px] leading-[22px] text-[#64748B]">{{ bookStripSub }}</p>
          </div>
          <div class="flex flex-wrap gap-1.5 text-[12px] font-medium text-[#475569]">
            <span class="rounded-full bg-[#F1F5F9] px-2.5 py-1">{{ template.destination }}</span>
            <span v-if="showLastUpdatedPill" class="rounded-full bg-[#F1F5F9] px-2.5 py-1">{{ template.lastUpdatedLabel }}</span>
          </div>
        </div>

        <div class="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          <article
            v-for="option in template.comparison"
            :key="option.label"
            :class="['flex flex-col rounded-2xl border p-4 transition-shadow hover:shadow-[0_16px_32px_-20px_rgba(16,29,58,0.35)] sm:p-5', partnerCardSurface(option.provider)]"
          >
            <div class="flex items-center gap-3">
              <span
                class="inline-flex h-12 min-w-12 shrink-0 items-center justify-center rounded-xl px-2.5 ring-1"
                :class="option.provider === 'trip' ? 'bg-[#EEF5FF] ring-[#1B5FD1]/15' : 'bg-[#FFF4ED] ring-[#C2410C]/15'"
                aria-hidden="true"
              >
                <TripWordmark v-if="option.provider === 'trip'" />
                <KlookIcon v-else :size="26" class="shrink-0" />
              </span>
              <div class="min-w-0">
                <h3 class="break-words text-[17px] font-bold leading-6 text-[#101D3A]">{{ option.label }}</h3>
                <p class="text-[12px] leading-[18px] text-[#64748B]">{{ option.provider === 'trip' ? 'Trip.com' : 'Klook' }} · booking partner</p>
              </div>
            </div>
            <p class="mt-4 grow text-[14px] leading-[22px] text-[#475569]">{{ option.priceNote }}</p>
            <p class="mt-3 flex items-start gap-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2.5 text-[13px] font-medium leading-5 text-[#101D3A]">
              <svg class="mt-0.5 h-4 w-4 shrink-0 text-[#008A9B]" viewBox="0 0 20 20" fill="none" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M10 2.5 12.2 7l5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5L2.8 7.7l5-.7L10 2.5Z" />
              </svg>
              {{ option.highlight }}
            </p>
            <a
              :href="partnerNavHref(option)"
              :target="isIOSSafari() ? undefined : '_blank'"
              rel="noopener noreferrer"
              :class="[
                'mt-4 inline-flex min-h-12 w-full touch-manipulation items-center justify-center gap-2 rounded-xl px-4 py-3 text-[15px] font-semibold text-white no-underline transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                partnerCtaButtonClass(option.provider)
              ]"
              @click="onPartnerTap($event, option)"
            >
              {{ partnerCtaLabel(option) }}
              <svg class="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M8 5H5.5A1.5 1.5 0 0 0 4 6.5v8A1.5 1.5 0 0 0 5.5 16h8a1.5 1.5 0 0 0 1.5-1.5V12M11 4h5m0 0v5m0-5L9 11" />
              </svg>
            </a>
            <p class="mt-2.5 px-0.5 text-center text-[12px] leading-[18px] text-[#64748B]">{{ partnerPostCtaHint(option) }}</p>
          </article>
        </div>
        <p class="mt-4 text-[12px] leading-[18px] text-[#94A3B8]">{{ partnerOpenHint }}</p>
      </div>
    </section>

    <div class="site-shell mt-12 space-y-14 sm:mt-16 sm:space-y-16">
      <div class="grid gap-4 lg:grid-cols-2">
        <section class="rounded-2xl border border-[#E2E8F0] bg-white p-5 sm:p-6" aria-labelledby="why-title">
          <p class="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#008A9B]">Why compare here</p>
          <h2 id="why-title" class="mt-1 text-[18px] font-bold leading-6 text-[#101D3A]">Two partners, one look</h2>
          <ul class="mt-4 space-y-3">
            <li v-for="bullet in template.summaryBullets" :key="bullet" class="flex items-start gap-3 text-[14px] leading-[22px] text-[#334155]">
              <span class="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#E8F7FA] text-[#008A9B]" aria-hidden="true">
                <svg class="h-3 w-3" viewBox="0 0 20 20" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.4" d="m5 10.5 3 3 7-7" /></svg>
              </span>
              {{ bullet }}
            </li>
          </ul>
        </section>
        <section class="rounded-2xl border border-[#E2E8F0] bg-white p-5 sm:p-6" aria-labelledby="tips-title">
          <p class="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#008A9B]">Quick tips</p>
          <h2 id="tips-title" class="mt-1 text-[18px] font-bold leading-6 text-[#101D3A]">Before you pay</h2>
          <ol class="mt-4 space-y-3">
            <li v-for="(tip, index) in template.tips" :key="tip" class="flex items-start gap-3 text-[14px] leading-[22px] text-[#334155]">
              <span class="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#101D3A] text-[11px] font-bold text-white" aria-hidden="true">{{ index + 1 }}</span>
              {{ tip }}
            </li>
          </ol>
        </section>
      </div>

      <section class="space-y-6">
        <SectionHeading eyebrow="Keep planning" title="More ways to plan the trip" />
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:gap-4">
          <NuxtLink
            v-for="item in relatedLinks"
            :key="item.to"
            :to="item.to"
            class="group flex items-start gap-3 rounded-2xl border p-4 transition hover:-translate-y-0.5 hover:shadow-[0_16px_32px_-20px_rgba(16,29,58,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#008A9B] sm:p-5"
            :class="item.featured ? 'border-[#101D3A] bg-[#101D3A]' : 'border-[#E2E8F0] bg-white hover:border-[#008A9B]/40'"
          >
            <span
              class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
              :class="item.featured ? 'bg-white/10 text-[#5EEAD4]' : 'bg-[#E8F7FA] text-[#008A9B]'"
              aria-hidden="true"
            >
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" :d="item.icon" />
              </svg>
            </span>
            <span class="min-w-0">
              <span class="flex items-center gap-1 text-[15px] font-semibold leading-6" :class="item.featured ? 'text-white' : 'text-[#101D3A]'">
                {{ item.label }}
                <svg class="h-3.5 w-3.5 transition group-hover:translate-x-0.5" :class="item.featured ? 'text-[#5EEAD4]' : 'text-[#94A3B8] group-hover:text-[#008A9B]'" viewBox="0 0 20 20" fill="none" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 10h12m0 0-5-5m5 5-5 5" />
                </svg>
              </span>
              <span class="mt-0.5 block text-[13px] leading-5" :class="item.featured ? 'text-white/70' : 'text-[#64748B]'">{{ item.detail }}</span>
            </span>
          </NuxtLink>
        </div>
      </section>

      <BookingNote>
        Checkout happens on Trip.com or Klook, which confirm the price and availability. GoTravelNha does not charge you for these bookings.
      </BookingNote>
    </div>
  </div>
</template>

<script setup lang="ts">
import KlookIcon from '~/components/KlookIcon.vue'
import TripWordmark from '~/components/TripWordmark.vue'
import BookingNote from '~/components/site/BookingNote.vue'
import PageHero from '~/components/site/PageHero.vue'
import SectionHeading from '~/components/site/SectionHeading.vue'
import type { DealComparisonOption, DealPageTemplate } from '~/types/deal-template'
import { appendKlookAffiliateId, appendTripAffiliateIds, openTrackedOutbound } from '~/utils/affiliate-links'
import { unwrapKlookAffiliateRedirectUrl } from '~/utils/unwrapKlookAffiliateRedirect'

const props = defineProps<{
  template: DealPageTemplate
}>()

const { shouldUseSameTabAfterAsyncClick, isIOSSafari } = useIosOutboundNavigation()
const runtimeConfig = useRuntimeConfig()

/**
 * Native `<a href>` (iOS Safari) must include affiliate IDs in the URL itself — same
 * public IDs as `nuxt.config` / server `buildAffiliateLink`. Desktop/mobile use API
 * `outboundUrl` which already applies these plus extra UTM/subid.
 */
const partnerNavHref = (option: DealComparisonOption) => {
  let url = unwrapKlookAffiliateRedirectUrl(option.baseUrl)
  const pub = runtimeConfig.public
  const p = option.provider
  if (p === 'klook') {
    url = appendKlookAffiliateId(url, String(pub.KLOOK_AD_ID || ''))
  }
  if (p === 'trip') {
    url = appendTripAffiliateIds(
      url,
      String(pub.TRIP_ALLIANCE_ID || ''),
      String(pub.TRIP_SID || '')
    )
  }
  return url
}

const partnerOpenHint = computed(() =>
  shouldUseSameTabAfterAsyncClick()
    ? 'Tap a partner to open their app or site (same tab on iPhone/iPad).'
    : 'Tap a partner to open their site in a new tab.'
)

const heroTrust = ['Trip.com and Klook side by side', 'Live prices on the partner site', 'No charge from GoTravelNha']

const COMPARISONS = [
  {
    slug: 'flights',
    label: 'Flights',
    detail: 'Compare flight search on Trip.com and Klook',
    icon: 'M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2Z'
  },
  {
    slug: 'hotels',
    label: 'Hotels',
    detail: 'Compare hotel search before you book',
    icon: 'M3 20V6a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v14M14 10h6a1 1 0 0 1 1 1v9M2 20h20M7 9h3M7 13h3M7 17h3'
  },
  {
    slug: 'attractions',
    label: 'Attractions',
    detail: 'Compare attraction tickets on Trip.com and Klook',
    icon: 'M3 9V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a3 3 0 0 0 0 6v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a3 3 0 0 0 0-6ZM13 5v2M13 17v2M13 11v2'
  }
]

// The other comparison pages, then the AI agent as the featured next step
const relatedLinks = computed(() => [
  ...COMPARISONS.filter((item) => item.slug !== props.template.slug)
    .slice(0, 2)
    .map((item) => ({ ...item, to: `/explore/${item.slug}`, featured: false })),
  {
    to: '/planner',
    label: 'AI Travel Agent',
    detail: 'Get a day-by-day plan for the family',
    icon: 'M12 3l1.9 4.8L19 9.5l-4.4 2.9L15.6 18 12 15l-3.6 3 1-5.6L5 9.5l5.1-1.7L12 3Z',
    featured: true
  }
])

const bookStripSub = computed(() => {
  const c = props.template.category
  if (c === 'flight') {
    return 'Open Trip.com or Klook to see live fares, pick your flights, and complete checkout on the partner you trust most.'
  }
  if (c === 'hotel') {
    return 'Compare room types and rates, then book the stay you want — payment and confirmation happen on the partner site.'
  }
  return 'Compare ticket options and availability, then book your visit — checkout is on Trip.com or Klook.'
})

const partnerPostCtaHint = (option: DealComparisonOption) => {
  if (option.provider === 'trip') {
    return 'Live prices, seats, and checkout are on Trip.com after you tap.'
  }
  return 'Live prices, tickets, and checkout are on Klook after you tap.'
}

const partnerCardSurface = (provider: string) => {
  if (provider === 'trip' || provider === 'trip.com') {
    return 'border-[#1B5FD1]/20 bg-gradient-to-b from-[#F5F9FF] to-white'
  }
  return 'border-[#C2410C]/20 bg-gradient-to-b from-[#FFF8F3] to-white'
}

// Darker partner shades so white button text passes contrast
const partnerCtaButtonClass = (provider: string) => {
  if (provider === 'trip' || provider === 'trip.com') {
    return 'bg-[#1B5FD1] hover:bg-[#164FB0] active:bg-[#164FB0] focus-visible:ring-[#1B5FD1]'
  }
  return 'bg-[#C2410C] hover:bg-[#9A3412] active:bg-[#9A3412] focus-visible:ring-[#C2410C]'
}

const partnerCtaLabel = (option: DealComparisonOption) => {
  const cat = props.template.category
  if (option.provider === 'trip') {
    if (cat === 'flight') return 'Search flights on Trip.com'
    if (cat === 'hotel') return 'Browse hotels on Trip.com'
    return 'Browse things to do on Trip.com'
  }
  if (option.provider === 'klook') {
    if (cat === 'flight') return 'Search transport & flights on Klook'
    if (cat === 'hotel') return 'Browse hotels on Klook'
    return 'Browse attraction tickets on Klook'
  }
  return 'Open partner'
}

/** Hub comparison pages (flight / hotel / attractions) omit the partner-source pill. */
const showLastUpdatedPill = computed(() => {
  const c = props.template.category
  if (c === 'flight' || c === 'hotel' || c === 'activity') return false
  return Boolean(props.template.lastUpdatedLabel?.trim())
})

const getSessionId = () => {
  if (typeof window === 'undefined') return 'anonymous'
  const existing = localStorage.getItem('activity_session_id')
  if (existing) return existing
  const next = `deal-${Date.now().toString(36)}`
  localStorage.setItem('activity_session_id', next)
  return next
}

/**
 * iOS Safari: same pattern as homepage `handleFunnelClick` — do not preventDefault;
 * browser follows `<a href>` (universal links). Track with sendBeacon + keepalive fetch.
 */
const onPartnerTap = (ev: MouseEvent, option: DealComparisonOption) => {
  const placementKey = `${props.template.placementKey}_comparison_${option.provider}`
  const ctaLabel = partnerCtaLabel(option)

  if (isIOSSafari()) {
    try {
      const sessionId = getSessionId()
      const payload = {
        provider: option.provider,
        baseUrl: option.baseUrl,
        placementKey,
        pagePath: `/explore/${props.template.slug}`,
        sessionId,
        metadata: {
          templateSlug: props.template.slug,
          ctaLabel
        }
      }
      const body = JSON.stringify(payload)
      if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
        navigator.sendBeacon('/api/affiliate/click', new Blob([body], { type: 'application/json' }))
      } else if (typeof fetch !== 'undefined') {
        fetch('/api/affiliate/click', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body,
          keepalive: true
        }).catch(() => {})
      }
    } catch {
      /* ignore */
    }
    return
  }

  ev.preventDefault()
  void openAffiliate(option.provider, option.baseUrl, ctaLabel, placementKey)
}

const openAffiliate = (provider: string, baseUrl: string, label: string, placementKey: string) => {
  const sessionId = getSessionId()
  void openTrackedOutbound(async () => {
    const response: any = await $fetch('/api/affiliate/click', {
      method: 'POST',
      body: {
        provider,
        baseUrl,
        placementKey,
        pagePath: `/explore/${props.template.slug}`,
        sessionId,
        metadata: {
          templateSlug: props.template.slug,
          ctaLabel: label,
          funnel: 'affiliate_outbound_clicked'
        }
      }
    })
    return response?.outboundUrl
  }, baseUrl)
}
</script>

