import { ref } from 'vue'

export interface OwnProfile {
  handle: string
  displayName: string
  bio: string | null
  avatarUrl: string | null
  status: string
}

// The signed-in visitor's traveler profile (null: none yet). Loaded once per session in the browser.
const profile = ref<OwnProfile | null>(null)
const suggestion = ref<{ handle: string; displayName: string } | null>(null)
const loaded = ref(false)
let pending: Promise<void> | null = null

export const useOwnProfile = () => {
  const { isAuthenticated } = useAuthState()

  const load = (force = false) => {
    if (!isAuthenticated.value) {
      profile.value = null
      loaded.value = true
      return Promise.resolve()
    }
    if (loaded.value && !force) return Promise.resolve()
    if (pending && !force) return pending
    pending = $fetch<{ data: OwnProfile | null; suggestion: { handle: string; displayName: string } | null }>('/api/community/profile')
      .then((response) => {
        profile.value = response.data
        suggestion.value = response.suggestion
      })
      .catch(() => {
        profile.value = null
      })
      .finally(() => {
        loaded.value = true
        pending = null
      })
    return pending
  }

  /** Creates or updates the profile. Throws the server message on a taken or invalid handle. */
  const save = async (input: { handle: string; displayName: string; bio?: string | null }) => {
    const response = await $fetch<{ data: OwnProfile }>('/api/community/profile', { method: 'PUT', body: input })
    profile.value = response.data
    return response.data
  }

  return { profile, suggestion, loaded, load, save }
}
