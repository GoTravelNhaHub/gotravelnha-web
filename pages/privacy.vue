<template>
  <PolicyPage title="Privacy policy" updated="12 October 2026">
    <p>This explains what personal data GoTravelNha collects, why, and who we share it with.</p>

    <h2>What we collect</h2>
    <ul>
      <li><strong>Account:</strong> name, username, email and a hashed password, or your Google profile if you sign in with Google.</li>
      <li><strong>Bookings:</strong> name, email, phone, the tickets you buy and the amount paid. Card details are handled by Stripe, not us.</li>
      <li><strong>Family profiles (optional):</strong> names, birth dates and notes you add about the people you travel with.</li>
      <li><strong>Trip plans:</strong> destination, dates, travellers' ages, budget, interests and the plans you save.</li>
      <li><strong>Messages:</strong> what you send through the contact form.</li>
      <li>
        <strong>Usage:</strong> pages you visit, clicks on partner offers, device and browser type, screen size, and how you reached
        us (for example a campaign tag or the referring website).
      </li>
    </ul>

    <h2>Cookies and local storage</h2>
    <ul>
      <li><code>gotravelnha_session</code>: keeps you signed in (7 days).</li>
      <li><code>gtn_sid</code> and a matching local-storage id: a random visitor id, so we can see which pages lead to bookings (30 days).</li>
      <li><code>gtn_attr</code>: how you first and last reached us, such as campaign tags or ad click ids (30 days).</li>
      <li>Partner sites set their own cookies when you click through to them.</li>
    </ul>

    <h2>Who we share data with</h2>
    <ul>
      <li><strong>Stripe</strong>, to process payments and send receipts.</li>
      <li><strong>Our ticket supplier</strong>, with the details needed to issue your tickets.</li>
      <li><strong>Anthropic (Claude)</strong>, when you use the trip planner: your trip details, travellers' ages and any notes are sent to generate the itinerary.</li>
      <li><strong>Our email provider</strong>, to send booking and account emails.</li>
      <li><strong>Partners</strong> such as Trip.com and Klook receive a tracking reference when you click through, so they can credit the referral.</li>
    </ul>
    <p>We do not sell your personal data.</p>

    <h2>Your choices</h2>
    <p>
      You can edit or delete family profiles and saved trips in your account. To get a copy of your data, correct it or have it
      deleted, contact us. We keep booking records as long as needed for accounting and legal obligations.
    </p>
  </PolicyPage>
</template>

<script setup lang="ts">
useHead({ title: 'Privacy Policy | GoTravelNha' })
</script>
