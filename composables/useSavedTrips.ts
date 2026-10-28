import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

// Which community trips the signed-in visitor has saved, shared by every card and trip page.
// Loaded in the browser after the page renders, so cached HTML never contains viewer state.
const savedIds = ref(new Set<string>())
const counts = ref<Record<string, number>>({})
const pending = ref(new Set<string>())

export const useSavedTrips = () => {
  const { isAuthenticated } = useAuthState()
  const route = useRoute()
  const router = useRouter()
  const { track } = useFunnel()

  /** Asks the server which of these trips are saved (signed-in visitors only). */
  const loadState = async (tripIds: string[]) => {
    const ids = tripIds.filter((id) => /^[0-9a-f-]{36}$/i.test(id))
    if (!isAuthenticated.value || !ids.length) return
    try {
      const response = await $api<{ data: string[] }>(`/api/community/saved/state?ids=${ids.join(',')}`)
      const next = new Set(savedIds.value)
      for (const id of ids) next.delete(id)
      for (const id of response.data) next.add(id)
      savedIds.value = next
    } catch {
      // Bookmarks just show as not saved
    }
  }

  const isSaved = (tripId: string) => savedIds.value.has(tripId)
  const countFor = (tripId: string, fallback: number) => counts.value[tripId] ?? fallback

  /** Saves or unsaves. Signed-out visitors go to sign in and come back to this page. */
  const toggle = async (trip: { id: string; slug: string }, placement: string) => {
    if (!isAuthenticated.value) {
      router.push({ path: '/login', query: { redirect: route.fullPath } })
      return
    }
    if (pending.value.has(trip.id)) return
    const wasSaved = isSaved(trip.id)
    pending.value = new Set(pending.value).add(trip.id)
    // Optimistic: flip now, put it back if the request fails
    const flip = (saved: boolean) => {
      const next = new Set(savedIds.value)
      if (saved) next.add(trip.id)
      else next.delete(trip.id)
      savedIds.value = next
    }
    flip(!wasSaved)
    try {
      const response = await $api<{ data: { saved: boolean; saveCount: number } }>(`/api/community/trips/${encodeURIComponent(trip.slug)}/save`, {
        method: wasSaved ? 'DELETE' : 'PUT'
      })
      flip(response.data.saved)
      counts.value = { ...counts.value, [trip.id]: response.data.saveCount }
      if (response.data.saved) track('itinerary_save', { tripId: trip.id, placement })
    } catch (error: any) {
      flip(wasSaved)
      // Session expired: sign in again
      if (error?.statusCode === 401 || error?.status === 401) router.push({ path: '/login', query: { redirect: route.fullPath } })
    } finally {
      const next = new Set(pending.value)
      next.delete(trip.id)
      pending.value = next
    }
  }

  return { loadState, isSaved, countFor, toggle, isPending: (tripId: string) => pending.value.has(tripId) }
}
