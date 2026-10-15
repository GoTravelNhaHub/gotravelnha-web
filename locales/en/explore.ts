export default {
  meta: {
    title: 'AI Family Trip Planner | GoTravelNha',
    description: 'Plan a family holiday day by day with an AI travel agent, then compare flights, hotels and activities on Trip.com and Klook before you book.'
  },
  hero: {
    eyebrow: 'AI trip planner for families',
    title: 'Your family holiday, planned in minutes.',
    subtitle: "Tell us where you're going and who's coming. Get a day-by-day itinerary, then find flights, hotels and activities on Trip.com and Klook.",
    trust: ['Personalised day-by-day plan', 'Share it with the family', 'Compare booking options before you pay']
  },
  prompt: {
    label: 'Describe your trip',
    placeholderPrefix: 'e.g.',
    examples: [
      '5 days in Tokyo with 2 adults and 2 kids aged 4 and 9, relaxed pace',
      '4 days in Seoul with a toddler',
      'Weekend in Bangkok with teens',
      'A week in Bali for the school holidays'
    ],
    try: 'Try:',
    submit: 'Plan my trip',
    secondary: 'Or find travel deals',
    needsText: 'Describe your trip, or pick an example below.'
  },
  sample: {
    eyebrow: 'What you get',
    title: 'A plan you can actually follow',
    introBefore: 'Here is the shape of a plan for',
    brief: '3 days in Tokyo with kids aged 4 and 9',
    introAfter: '. One area per day, short hops between stops, and rest built in for younger kids.',
    points: ['Sights matched to each child’s age', 'Travel time between stops', 'Booking links for flights, hotels and tickets'],
    cta: 'Customize this trip',
    prompt: '3 days in Tokyo with 2 adults and 2 kids aged 4 and 9, relaxed pace',
    tabsLabel: 'Sample days',
    day: 'Day {n}',
    note: 'Sample plan. Times and travel are approximate; check opening days before you go.',
    days: [
      {
        title: 'Asakusa and Skytree',
        stops: [
          { time: '9:00', name: 'Senso-ji temple', note: 'Go early, before the crowds. Snacks on Nakamise street.', next: 'About 20 min walk or one train stop' },
          { time: '11:30', name: 'Sumida Aquarium', note: 'Indoor and calm, good for the 4-year-old.', next: 'Same building' },
          { time: '13:00', name: 'Lunch and Skytree deck', note: 'Book a time slot for the deck in busy seasons.', next: '' },
          { time: '15:00', name: 'Rest at the hotel', note: 'Nap time for the younger one.', next: '' }
        ]
      },
      {
        title: 'Ueno park',
        stops: [
          { time: '9:30', name: 'Ueno Zoo', note: 'Pandas first, queues grow fast. Usually closed on Mondays.', next: 'About 10 min walk through the park' },
          { time: '12:30', name: 'Picnic lunch in the park', note: 'Convenience-store lunch works well here.', next: 'About 5 min walk' },
          { time: '13:30', name: 'Nature and Science Museum', note: 'Dinosaurs and hands-on rooms for the 9-year-old.', next: '' }
        ]
      },
      {
        title: 'Odaiba and Toyosu',
        stops: [
          { time: '9:30', name: 'teamLab Planets', note: 'Book a time slot. Water rooms: wear shorts.', next: 'About 15 min on the Yurikamome line' },
          { time: '12:30', name: 'Lunch in an Odaiba mall', note: 'Family restaurants and indoor play areas.', next: '' },
          { time: '14:00', name: 'Miraikan science museum', note: 'Robots and space. Usually closed on Tuesdays.', next: '' }
        ]
      }
    ]
  },
  destinations: {
    eyebrow: 'Popular with families',
    title: 'Where to next?',
    subtitle: 'Pick a city and the AI agent starts a plan for it.',
    all: 'All {count} destinations →',
    cta: 'Plan a trip'
  },
  deals: {
    title: 'Find flights, hotels and activities'
  },
  compare: {
    eyebrow: 'Compare booking options',
    title: 'Check Trip.com and Klook before you book',
    text: "Prices, room types and what's included differ between partners. Each guide links to both, so you can check the live price on each site and book where the total works best for your family.",
    flights: 'Flights',
    hotels: 'Hotels',
    attractions: 'Attractions',
    tripPoints: ['Wide choice of flights and hotels', 'Quick fare and room checks', 'Flexible routes and dates'],
    klookPoints: ['Tours, attractions and transport', 'Bundle a stay with activities', 'Handy for things to do on arrival']
  },
  guides: {
    eyebrow: 'Booking guides',
    title: 'What to check on each partner',
    subtitle: 'Each guide links to Trip.com and Klook, with tips on what to check before you pay.',
    count: '{count} guides',
    emptyTitle: 'No booking guides yet',
    emptyText: 'Flight, hotel, and attraction guides will show up here when they are published.',
    fallbackOutcome: 'Open both partners from one place.',
    /** Built-in guide cards (server/utils/builtinDealTemplates.ts) */
    items: {
      flights: { title: 'Find your best flight booking option', outcome: 'Open flight search on Trip.com and Klook from one page, then book where the total works best for you.', destination: 'Worldwide', category: 'Flights' },
      hotels: { title: 'Find your best hotel booking option', outcome: 'Open hotel search on Trip.com and Klook and check room types and totals on each.', destination: 'Worldwide', category: 'Hotels' },
      attractions: { title: 'Find your best attraction ticket option', outcome: 'Open Singapore ticket pages on Trip.com and Klook and check what each one includes.', destination: 'Singapore', category: 'Attractions' }
    }
  },
  how: {
    eyebrow: 'How it works',
    title: 'Plan, adjust, then book',
    steps: [
      { title: 'Describe the trip', text: 'Where you are going, when, and the ages of everyone coming.' },
      { title: 'Adjust the plan', text: 'Ask for a cheaper day, less walking or more for the kids. The agent edits it.' },
      { title: 'Save, share and book', text: 'Keep the plan, send it to family, then book on Trip.com or Klook.' }
    ]
  },
  newsletter: {
    title: 'Plan the next school holiday early',
    text: 'Get family trip ideas, ready-made itineraries and the occasional partner offer from Trip.com or Klook, straight to your inbox.',
    button: 'Send me ideas'
  },
  bookingNote: {
    text: 'Flight and hotel checkout opens on Trip.com or Klook. Singapore attraction tickets that we sell are paid for on GoTravelNha. Questions go through Help or Contact.',
    help: 'Help',
    contact: 'Contact'
  }
}
