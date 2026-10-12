<template>
  <PolicyPage title="Refund and cancellation policy" updated="12 October 2026">
    <p>This policy covers attraction tickets bought through the GoTravelNha checkout. Bookings made on partner sites (such as Trip.com or Klook) follow that partner's policy.</p>

    <h2>Cancellation terms per attraction</h2>
    <p>
      Each attraction shows its cancellation terms on its page before you pay. Those terms come from the attraction or our supplier
      and apply to your booking. Many tickets cannot be cancelled once issued.
    </p>

    <h2>If we can't issue your tickets</h2>
    <p>If our supplier cannot issue your tickets after you have paid, we will contact you and refund the amount you paid.</p>

    <h2>Requesting a cancellation or refund</h2>
    <p>
      <NuxtLink to="/contact" class="text-emerald-700 hover:underline">Contact us</NuxtLink> with your booking reference (GTN-…). We
      check the attraction's terms with our supplier and tell you whether a refund is possible.
    </p>

    <h2>How refunds are paid</h2>
    <p>
      Refunds go back to the card or payment method you used, through Stripe. We email you when the refund is issued. Your bank may
      take 5–10 business days to show it.
    </p>
  </PolicyPage>
</template>

<script setup lang="ts">
useHead({ title: 'Refund & Cancellation Policy | GoTravelNha' })
</script>
