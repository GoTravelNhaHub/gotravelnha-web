<template>
  <PolicyPage title="Help & FAQ" updated="12 October 2026">
    <h2>Two ways to book</h2>
    <ul>
      <li>
        <strong>Attraction tickets with a "Book now" checkout on GoTravelNha.</strong> You pay us through Stripe and we order the
        tickets from our supplier. We are your point of contact for these bookings.
      </li>
      <li>
        <strong>Flights, hotels and activities on Trip.com, Klook and other partners.</strong> These links open the partner's site,
        and the booking, payment, changes and refunds are handled by that partner under its own terms. We may earn a commission at
        no extra cost to you.
      </li>
    </ul>

    <h2>When do I get my tickets?</h2>
    <p>
      After you pay, we email a confirmation with your booking reference (GTN-…). Your booking is confirmed once our supplier issues
      the tickets; we then send them in a second email. Until then the status shows "Confirming tickets".
    </p>

    <h2>How do I check my booking?</h2>
    <p>
      Go to <NuxtLink to="/bookings" class="text-emerald-700 hover:underline">My bookings</NuxtLink> and enter your booking reference
      and the email you paid with. If you were signed in when you booked, your bookings are listed there automatically.
    </p>

    <h2>Are prices final?</h2>
    <p>
      Prices on GoTravelNha checkouts are in Singapore dollars and are the amount you pay. If a price changes between opening the page
      and paying, we ask you to review it before charging. Partner prices are set by the partner and confirmed on their site before
      you pay.
    </p>

    <h2>Can I cancel or get a refund?</h2>
    <p>
      See our <NuxtLink to="/refund-policy" class="text-emerald-700 hover:underline">refund and cancellation policy</NuxtLink>. For
      partner bookings, contact the partner directly.
    </p>

    <h2>I paid but didn't get an email</h2>
    <p>
      Check your spam folder, then look your booking up on <NuxtLink to="/bookings" class="text-emerald-700 hover:underline">My bookings</NuxtLink>.
      If you still can't find it, <NuxtLink to="/contact" class="text-emerald-700 hover:underline">contact us</NuxtLink> with the email
      you paid with.
    </p>

    <h2>How does the trip planner work?</h2>
    <p>
      The planner uses AI to suggest a day-by-day plan. Prices and availability shown next to activities come from our partners and
      are checked when you open the plan; the AI does not set prices. Check opening times and details before you go.
    </p>
  </PolicyPage>
</template>

<script setup lang="ts">
useHead({ title: 'Help & FAQ | GoTravelNha', meta: [{ name: 'description', content: 'How booking, tickets, refunds and the trip planner work on GoTravelNha.' }] })
</script>
