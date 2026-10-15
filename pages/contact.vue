<template>
  <div class="pb-16 font-brand sm:pb-20">
    <PageHero
      :eyebrow="t('info.contact.eyebrow')"
      :title="t('info.contact.title')"
      :subtitle="t('info.contact.subtitle')"
      image="https://images.unsplash.com/photo-1536599018102-9f803c140fc1?auto=format&fit=crop&w=2400&q=80"
      overlap
    />

    <div class="site-shell relative z-20 -mt-20 grid items-start gap-5 sm:-mt-24 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-6">
      <ContactForm />

      <aside class="space-y-4 lg:pt-0" :aria-label="t('info.contact.asideLabel')">
        <section class="rounded-2xl border border-[#E2E8F0] bg-white p-5">
          <div class="flex items-start gap-3">
            <span class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E8F7FA] text-[#008A9B]" aria-hidden="true">
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M3 9V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a3 3 0 0 0 0 6v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a3 3 0 0 0 0-6ZM13 5v2M13 17v2M13 11v2" />
              </svg>
            </span>
            <div class="min-w-0">
              <h2 class="text-[15px] font-bold leading-6 text-[#101D3A]">{{ t('info.contact.ticketsTitle') }}</h2>
              <p class="mt-1 text-[14px] leading-[22px] text-[#64748B]">{{ t('info.contact.ticketsText') }}</p>
              <div class="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[14px]">
                <NuxtLink to="/bookings" class="text-link">{{ t('info.contact.myBookings') }}</NuxtLink>
                <NuxtLink to="/refund-policy" class="text-link">{{ t('info.contact.refund') }}</NuxtLink>
              </div>
            </div>
          </div>
        </section>

        <section class="rounded-2xl border border-[#E2E8F0] bg-white p-5">
          <div class="flex items-start gap-3">
            <span class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F1F5F9] text-[#334155]" aria-hidden="true">
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M14 4h6v6M20 4l-9 9M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4" />
              </svg>
            </span>
            <div class="min-w-0">
              <h2 class="text-[15px] font-bold leading-6 text-[#101D3A]">{{ t('info.contact.partnerTitle') }}</h2>
              <p class="mt-1 text-[14px] leading-[22px] text-[#64748B]">{{ t('info.contact.partnerText') }}</p>
            </div>
          </div>
        </section>

        <section class="rounded-2xl border border-[#E2E8F0] bg-white p-5">
          <div class="flex items-start gap-3">
            <span class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F1F5F9] text-[#334155]" aria-hidden="true">
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6M12 17h.01" />
              </svg>
            </span>
            <div class="min-w-0">
              <h2 class="text-[15px] font-bold leading-6 text-[#101D3A]">{{ t('info.contact.quickTitle') }}</h2>
              <p class="mt-1 text-[14px] leading-[22px] text-[#64748B]">{{ t('info.contact.quickText') }}</p>
              <NuxtLink to="/help" class="text-link mt-2 inline-block text-[14px]">{{ t('info.contact.helpCentre') }}</NuxtLink>
            </div>
          </div>
        </section>

        <section v-if="supportEmail" class="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-5">
          <h2 class="text-[13px] font-semibold uppercase tracking-[0.08em] text-[#64748B]">{{ t('info.contact.preferEmail') }}</h2>
          <a :href="`mailto:${supportEmail}`" class="text-link mt-1 inline-block break-all text-[15px]">{{ supportEmail }}</a>
        </section>
      </aside>
    </div>
  </div>
</template>

<script setup>
  import ContactForm from '~/components/ContactForm.vue'
  import PageHero from '~/components/site/PageHero.vue'

  definePageMeta({ bleed: true })

  const supportEmail = useRuntimeConfig().public.supportEmail
  const { t } = useI18n()

  // Search engines index the English title (the server renders English)
  useSEO({
    title: t('info.contact.metaTitle'),
    description: t('info.contact.metaDescription'),
    keywords: 'contact gotravelnha, travel support, customer service',
    url: 'https://gotravelnha.com/contact'
  })
</script>
