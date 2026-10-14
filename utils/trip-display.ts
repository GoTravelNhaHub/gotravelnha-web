import type { TripPartyMember } from '~/types/trip'

// Shared formatting for saved trips (My trips list, trip page, profile)

const dayStart = (value: string) => new Date(`${value.slice(0, 10)}T00:00:00Z`).getTime()
const todayStart = () => dayStart(new Date().toISOString())
const DAY_MS = 86400000

export const tripDateRange = (start: string, end: string) => {
  const sameYear = start.slice(0, 4) === end.slice(0, 4)
  const short = new Intl.DateTimeFormat('en-SG', { day: 'numeric', month: 'short', timeZone: 'UTC' })
  const full = new Intl.DateTimeFormat('en-SG', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
  return `${(sameYear ? short : full).format(new Date(dayStart(start)))} – ${full.format(new Date(dayStart(end)))}`
}

export const tripDayCount = (start: string, end: string) => {
  const days = Math.round((dayStart(end) - dayStart(start)) / DAY_MS) + 1
  return `${days} ${days === 1 ? 'day' : 'days'}`
}

export const tripPartyLabel = (party: TripPartyMember[] = []) => {
  if (!party.length) return 'Travellers not set'
  const children = party.filter((person) => person.age < 18).length
  const adults = party.length - children
  const parts = []
  if (adults) parts.push(`${adults} ${adults === 1 ? 'adult' : 'adults'}`)
  if (children) parts.push(`${children} ${children === 1 ? 'child' : 'children'}`)
  return parts.join(', ')
}

/** Countdown badge: "In 12 days", "Happening now" or "Completed". */
export const tripStatus = (start: string, end: string) => {
  const today = todayStart()
  if (dayStart(end) < today) return { label: 'Completed', classes: 'bg-white/90 text-[#475569]' }
  const days = Math.round((dayStart(start) - today) / DAY_MS)
  if (days <= 0) return { label: 'Happening now', classes: 'bg-[#10B981] text-white' }
  if (days === 1) return { label: 'Tomorrow', classes: 'bg-[#008A9B] text-white' }
  return { label: `In ${days} days`, classes: 'bg-white/95 text-[#007789]' }
}
