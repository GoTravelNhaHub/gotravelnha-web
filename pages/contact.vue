<template>
  <div class="pb-16 font-brand sm:pb-20">
    <PageHero
      eyebrow="Support"
      title="How can we help?"
      subtitle="Send us a message about a booking, the AI Travel Agent or anything else. We reply by email."
      image="https://images.unsplash.com/photo-1536599018102-9f803c140fc1?auto=format&fit=crop&w=2400&q=80"
      overlap
    />

    <div class="site-shell relative z-20 -mt-20 grid items-start gap-5 sm:-mt-24 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-6">
      <ContactForm />

      <aside class="space-y-4 lg:pt-0" aria-label="Other ways to get help">
        <section class="rounded-2xl border border-[#E2E8F0] bg-white p-5">
          <div class="flex items-start gap-3">
            <span class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E8F7FA] text-[#008A9B]" aria-hidden="true">
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M3 9V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a3 3 0 0 0 0 6v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a3 3 0 0 0 0-6ZM13 5v2M13 17v2M13 11v2" />
              </svg>
            </span>
            <div class="min-w-0">
              <h2 class="text-[15px] font-bold leading-6 text-[#101D3A]">Tickets bought on GoTravelNha</h2>
              <p class="mt-1 text-[14px] leading-[22px] text-[#64748B]">For Singapore attraction tickets, add your booking reference to the form so we can find the order.</p>
              <div class="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[14px]">
                <NuxtLink to="/bookings" class="text-link">My bookings</NuxtLink>
                <NuxtLink to="/refund-policy" class="text-link">Refund policy</NuxtLink>
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
              <h2 class="text-[15px] font-bold leading-6 text-[#101D3A]">Booked on Trip.com or Klook?</h2>
              <p class="mt-1 text-[14px] leading-[22px] text-[#64748B]">Flights, hotels and activities you checked out on Trip.com or Klook are held by that partner. Contact them from your booking confirmation for changes or refunds.</p>
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
              <h2 class="text-[15px] font-bold leading-6 text-[#101D3A]">Quick answers</h2>
              <p class="mt-1 text-[14px] leading-[22px] text-[#64748B]">Common questions about bookings, partners and the AI Travel Agent.</p>
              <NuxtLink to="/help" class="text-link mt-2 inline-block text-[14px]">Visit the help centre</NuxtLink>
            </div>
          </div>
        </section>

        <section v-if="supportEmail" class="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-5">
          <h2 class="text-[13px] font-semibold uppercase tracking-[0.08em] text-[#64748B]">Prefer email?</h2>
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

  useSEO({
    title: 'Contact Us - GoTravelNha',
    description: 'Get in touch with GoTravelNha. We\'re here to help with your travel booking needs and answer any questions.',
    keywords: 'contact gotravelnha, travel support, customer service',
    url: 'https://gotravelnha.com/contact'
  })
</script>
