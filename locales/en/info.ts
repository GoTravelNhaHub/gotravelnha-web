// Help and policy pages are stored as HTML sections (trusted, static) so links and bold text
// survive translation. Internal links are plain <a href="/…">; PolicyPage routes them in-app.

export default {
  policy: {
    updated: 'Last updated {date}',
    questions: 'Questions?',
    or: 'or',
    useForm: 'use our contact form',
    englishPrevails: 'This translation is provided for convenience. If it differs from the English version, the English version applies.'
  },
  help: {
    title: 'Help & FAQ',
    metaDescription: 'How booking, tickets, refunds and the trip planner work on GoTravelNha.',
    intro: '',
    sections: [
      {
        heading: 'Two ways to book',
        html: '<ul><li><strong>Attraction tickets with a "Book now" checkout on GoTravelNha.</strong> You pay us through Stripe and we order the tickets from our supplier. We are your point of contact for these bookings.</li><li><strong>Flights, hotels and activities on Trip.com, Klook and other partners.</strong> These links open the partner\'s site, and the booking, payment, changes and refunds are handled by that partner under its own terms. We may earn a commission at no extra cost to you.</li></ul>'
      },
      {
        heading: 'When do I get my tickets?',
        html: '<p>After you pay, we email a confirmation with your booking reference (GTN-…). Your booking is confirmed once our supplier issues the tickets; we then send them in a second email. Until then the status shows "Confirming tickets".</p>'
      },
      {
        heading: 'How do I check my booking?',
        html: '<p>Go to <a href="/bookings">My bookings</a> and enter your booking reference and the email you paid with. If you were signed in when you booked, your bookings are listed there automatically.</p>'
      },
      {
        heading: 'Are prices final?',
        html: '<p>Prices on GoTravelNha checkouts are in Singapore dollars and are the amount you pay. If a price changes between opening the page and paying, we ask you to review it before charging. Partner prices are set by the partner and confirmed on their site before you pay.</p>'
      },
      {
        heading: 'Can I cancel or get a refund?',
        html: '<p>See our <a href="/refund-policy">refund and cancellation policy</a>. For partner bookings, contact the partner directly.</p>'
      },
      {
        heading: "I paid but didn't get an email",
        html: '<p>Check your spam folder, then look your booking up on <a href="/bookings">My bookings</a>. If you still can\'t find it, <a href="/contact">contact us</a> with the email you paid with.</p>'
      },
      {
        heading: 'How does the trip planner work?',
        html: '<p>The planner uses AI to suggest a day-by-day plan. Prices and availability shown next to activities come from our partners and are checked when you open the plan; the AI does not set prices. Check opening times and details before you go.</p>'
      }
    ]
  },
  privacy: {
    title: 'Privacy policy',
    metaTitle: 'Privacy Policy | GoTravelNha',
    intro: 'This explains what personal data GoTravelNha collects, why, and who we share it with.',
    sections: [
      {
        heading: 'What we collect',
        html: '<ul><li><strong>Account:</strong> name, username, email and a hashed password, or your Google profile if you sign in with Google.</li><li><strong>Bookings:</strong> name, email, phone, the tickets you buy and the amount paid. Card details are handled by Stripe, not us.</li><li><strong>Family profiles (optional):</strong> names, birth dates and notes you add about the people you travel with.</li><li><strong>Trip plans:</strong> destination, dates, travellers\' ages, budget, interests and the plans you save.</li><li><strong>Messages:</strong> what you send through the contact form.</li><li><strong>Usage:</strong> pages you visit, clicks on partner offers, device and browser type, screen size, your chosen site language, and how you reached us (for example a campaign tag or the referring website).</li></ul>'
      },
      {
        heading: 'Cookies and local storage',
        html: '<ul><li><code>gotravelnha_session</code>: keeps you signed in (7 days).</li><li><code>gtn_sid</code> and a matching local-storage id: a random visitor id, so we can see which pages lead to bookings (30 days).</li><li><code>gtn_attr</code>: how you first and last reached us, such as campaign tags or ad click ids (30 days).</li><li><code>gotravelnha_lang</code> (local storage): the site language you chose.</li><li>Partner sites set their own cookies when you click through to them.</li></ul>'
      },
      {
        heading: 'Who we share data with',
        html: '<ul><li><strong>Stripe</strong>, to process payments and send receipts.</li><li><strong>Our ticket supplier</strong>, with the details needed to issue your tickets.</li><li><strong>Anthropic (Claude)</strong>, when you use the trip planner: your trip details, travellers\' ages and any notes are sent to generate the itinerary.</li><li><strong>Our email provider</strong>, to send booking and account emails.</li><li><strong>Partners</strong> such as Trip.com and Klook receive a tracking reference when you click through, so they can credit the referral.</li></ul><p>We do not sell your personal data.</p>'
      },
      {
        heading: 'Your choices',
        html: '<p>You can edit or delete family profiles and saved trips in your account. To get a copy of your data, correct it or have it deleted, contact us. We keep booking records as long as needed for accounting and legal obligations.</p>'
      }
    ]
  },
  terms: {
    title: 'Terms of service',
    metaTitle: 'Terms of Service | GoTravelNha',
    intro: 'By using GoTravelNha you agree to these terms.',
    sections: [
      {
        heading: 'What GoTravelNha does',
        html: '<ul><li><strong>Attraction tickets sold through our checkout.</strong> We take your payment and order the tickets from our supplier on your behalf. Your contract for these tickets is with GoTravelNha.</li><li><strong>Partner links.</strong> Links to Trip.com, Klook and other partners take you to their sites. Bookings made there are contracts between you and that partner, under the partner\'s terms. We may receive a commission.</li></ul>'
      },
      {
        heading: 'Prices and payment',
        html: '<ul><li>Checkout prices are in Singapore dollars and are confirmed on the Stripe payment page before you pay.</li><li>Payments are processed by Stripe. We do not see or store your full card details.</li><li>A booking is confirmed when our supplier issues the tickets. We email them to you and show them on your booking page.</li><li>Promotion codes are applied at payment and cannot be added afterwards.</li></ul>'
      },
      {
        heading: 'Cancellations and refunds',
        html: '<p>See our <a href="/refund-policy">refund and cancellation policy</a>.</p>'
      },
      {
        heading: 'Trip planner and recommendations',
        html: '<p>Itineraries and recommendations are suggestions, partly generated by AI. They may be incomplete or out of date. Check opening times, age limits and travel details yourself. Prices and availability shown come from our suppliers and partners, not from the AI.</p>'
      },
      {
        heading: 'Your account',
        html: '<p>Keep your password private. You are responsible for activity on your account. We may suspend accounts used for fraud or abuse.</p>'
      }
    ]
  },
  refund: {
    title: 'Refund and cancellation policy',
    metaTitle: 'Refund & Cancellation Policy | GoTravelNha',
    intro: "This policy covers attraction tickets bought through the GoTravelNha checkout. Bookings made on partner sites (such as Trip.com or Klook) follow that partner's policy.",
    sections: [
      {
        heading: 'Cancellation terms per attraction',
        html: '<p>Each attraction shows its cancellation terms on its page before you pay. Those terms come from the attraction or our supplier and apply to your booking. Many tickets cannot be cancelled once issued.</p>'
      },
      {
        heading: "If we can't issue your tickets",
        html: '<p>If our supplier cannot issue your tickets after you have paid, we will contact you and refund the amount you paid.</p>'
      },
      {
        heading: 'Requesting a cancellation or refund',
        html: '<p><a href="/contact">Contact us</a> with your booking reference (GTN-…). We check the attraction\'s terms with our supplier and tell you whether a refund is possible.</p>'
      },
      {
        heading: 'How refunds are paid',
        html: '<p>Refunds go back to the card or payment method you used, through Stripe. We email you when the refund is issued. Your bank may take 5–10 business days to show it.</p>'
      }
    ]
  },
  contact: {
    eyebrow: 'Support',
    title: 'How can we help?',
    subtitle: 'Send us a message about a booking, the AI Travel Agent or anything else. We reply by email.',
    asideLabel: 'Other ways to get help',
    ticketsTitle: 'Tickets bought on GoTravelNha',
    ticketsText: 'For Singapore attraction tickets, add your booking reference to the form so we can find the order.',
    myBookings: 'My bookings',
    refund: 'Refund policy',
    partnerTitle: 'Booked on Trip.com or Klook?',
    partnerText: 'Flights, hotels and activities you checked out on Trip.com or Klook are held by that partner. Contact them from your booking confirmation for changes or refunds.',
    quickTitle: 'Quick answers',
    quickText: 'Common questions about bookings, partners and the AI Travel Agent.',
    helpCentre: 'Visit the help centre',
    preferEmail: 'Prefer email?',
    metaTitle: 'Contact Us - GoTravelNha',
    metaDescription: "Get in touch with GoTravelNha. We're here to help with your travel booking needs and answer any questions."
  },
  form: {
    sentTitle: 'Message sent',
    sentText: "Thanks for getting in touch. We'll reply to the email address you gave us.",
    another: 'Send another message',
    title: 'Send us a message',
    requiredBefore: 'Fields marked',
    requiredAfter: 'are required.',
    withAsterisk: 'with an asterisk',
    name: 'Name',
    namePlaceholder: 'Your full name',
    email: 'Email',
    reference: 'Booking reference',
    optional: '(optional)',
    referenceHint: "For Singapore attraction tickets bought on GoTravelNha. It's in your confirmation email.",
    message: 'Message',
    messagePlaceholder: 'Tell us what you need help with',
    privacyBefore: 'We use your details only to reply. See our',
    privacy: 'Privacy Policy',
    sending: 'Sending…',
    send: 'Send message',
    failed: 'Your message could not be sent. Please try again later.'
  },
  unsubscribe: {
    doneTitle: "You're unsubscribed",
    title: 'Unsubscribe from emails',
    doneText: "We won't send newsletter emails to {email} any more.",
    confirm: 'Stop newsletter emails to {email}?',
    thisAddress: 'this address',
    unsubscribing: 'Unsubscribing…',
    unsubscribe: 'Unsubscribe',
    back: 'Back to GoTravelNha',
    failed: 'Could not unsubscribe. Please try again.',
    metaTitle: 'Unsubscribe | GoTravelNha'
  },
  exchange: {
    title: 'Currency Exchange',
    powered: 'Exchange powered by exchangerate.host',
    name: 'Your Name',
    email: 'Your Email',
    sgdAmount: 'SGD Amount',
    vndAmount: 'VND Amount',
    amountPlaceholder: 'Enter amount',
    submit: 'Submit',
    unavailable: 'API limit reached or unavailable. Try again later.',
    sent: '✅ Your exchange request has been sent!',
    failed: '❌ Failed to send. Please try again.'
  }
}
