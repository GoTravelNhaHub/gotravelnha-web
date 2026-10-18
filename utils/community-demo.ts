// Sample trips and creators for /community while there are few real ones. Shown only with
// NUXT_PUBLIC_COMMUNITY_DEMO on, always after real content, and every one carries a "Demo"
// label in the UI. The names and numbers are invented: they are not people or statistics.
import type { CommunityCreator, CommunityTripCard } from '~/types/community'
import { demoPhoto } from '~/utils/community-photos'

const daysAgo = (days: number) => new Date(Date.UTC(2026, 9, 18) - days * 86_400_000).toISOString()

const author = (handle: string, displayName: string) => ({ handle, displayName, avatarUrl: null })

export const DEMO_TRIPS: CommunityTripCard[] = [
  {
    id: 'demo-japan',
    slug: 'demo-7-days-japan-with-kids',
    title: '7 Days in Japan with Kids — Tokyo to Kyoto',
    destination: 'Tokyo',
    country: 'Japan',
    durationDays: 7,
    travelStyle: 'balanced',
    budgetLevel: 'mid',
    familyFriendly: true,
    childAgeBands: [],
    coverImage: null,
    highlights: [],
    description: 'A perfect family itinerary with kid-friendly attractions, scenic spots and travel tips.',
    saveCount: 64,
    commentCount: 18,
    adaptCount: 0,
    publishedAt: daysAgo(2),
    author: author('demo_sarah', 'Sarah Chen'),
    demo: true,
    demoLikes: 248,
    demoFeatured: true,
    demoImage: demoPhoto('japan')
  },
  {
    id: 'demo-thailand',
    slug: 'demo-5-days-thailand-beaches',
    title: '5 Days in Thailand: Beaches & Markets',
    destination: 'Krabi',
    country: 'Thailand',
    durationDays: 5,
    travelStyle: 'relaxed',
    budgetLevel: 'budget',
    familyFriendly: false,
    childAgeBands: [],
    coverImage: null,
    highlights: [],
    description: 'Relax on stunning beaches, explore vibrant markets, and enjoy amazing Thai food.',
    saveCount: 42,
    commentCount: 12,
    adaptCount: 0,
    publishedAt: daysAgo(3),
    author: author('demo_david', 'David Ng'),
    demo: true,
    demoLikes: 176,
    demoImage: demoPhoto('thailand')
  },
  {
    id: 'demo-singapore',
    slug: 'demo-singapore-family-adventure',
    title: 'Singapore Family Adventure: 4 Days',
    destination: 'Singapore',
    country: 'Singapore',
    durationDays: 4,
    travelStyle: 'balanced',
    budgetLevel: 'mid',
    familyFriendly: true,
    childAgeBands: [],
    coverImage: null,
    highlights: [],
    description: 'Fun for the whole family — Gardens by the Bay, Sentosa and more!',
    saveCount: 37,
    commentCount: 9,
    adaptCount: 0,
    publishedAt: daysAgo(7),
    author: author('demo_travelwithkids', 'TravelWithKids'),
    demo: true,
    demoLikes: 132,
    demoImage: demoPhoto('singapore')
  }
]

export const DEMO_CREATORS: CommunityCreator[] = [
  { handle: 'demo_sarah', displayName: 'Sarah Chen', avatarUrl: null, tripCount: 42, followerCount: 8200, demo: true },
  { handle: 'demo_david', displayName: 'David Ng', avatarUrl: null, tripCount: 38, followerCount: 6700, demo: true },
  { handle: 'demo_travelwithkids', displayName: 'TravelWithKids', avatarUrl: null, tripCount: 35, followerCount: 5400, demo: true }
]

/** Real items first, then demo items to reach `size`. */
export const padWithDemo = <T extends { id?: string; handle?: string }>(real: T[], demo: T[], size: number) =>
  [...real, ...demo].slice(0, Math.max(size, real.length))
