import type { TripPartyMember } from '~/types/trip'

// Shared formatting for saved trips (My trips list, trip page, shared trip), in the site language

const dayStart = (value: string) => new Date(`${value.slice(0, 10)}T00:00:00Z`).getTime()
const todayStart = () => dayStart(new Date().toISOString())
const DAY_MS = 86400000

export const useTripDisplay = () => {
  const { t, localeTag } = useI18n()

  const tripDateRange = (start: string, end: string) => {
    const sameYear = start.slice(0, 4) === end.slice(0, 4)
    const short = new Intl.DateTimeFormat(localeTag.value, { day: 'numeric', month: 'short', timeZone: 'UTC' })
    const full = new Intl.DateTimeFormat(localeTag.value, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
    return `${(sameYear ? short : full).format(new Date(dayStart(start)))} – ${full.format(new Date(dayStart(end)))}`
  }

  const tripDayCount = (start: string, end: string) =>
    t('trips.display.days', { count: Math.round((dayStart(end) - dayStart(start)) / DAY_MS) + 1 })

  const tripPartyLabel = (party: TripPartyMember[] = []) => {
    if (!party.length) return t('trips.display.noTravellers')
    const children = party.filter((person) => person.age < 18).length
    const adults = party.length - children
    const parts = []
    if (adults) parts.push(t('trips.display.adults', { count: adults }))
    if (children) parts.push(t('trips.display.children', { count: children }))
    return parts.join(', ')
  }

  /** Countdown badge: "In 12 days", "Happening now" or "Completed". */
  const tripStatus = (start: string, end: string) => {
    const today = todayStart()
    if (dayStart(end) < today) return { label: t('trips.display.completed'), classes: 'bg-white/90 text-[#475569]' }
    const days = Math.round((dayStart(start) - today) / DAY_MS)
    if (days <= 0) return { label: t('trips.display.now'), classes: 'bg-[#10B981] text-white' }
    if (days === 1) return { label: t('trips.display.tomorrow'), classes: 'bg-[#008A9B] text-white' }
    return { label: t('trips.display.inDays', { count: days }), classes: 'bg-white/95 text-[#007789]' }
  }

  return { tripDateRange, tripDayCount, tripPartyLabel, tripStatus }
}
