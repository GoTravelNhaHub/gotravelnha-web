import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

// Which travelers the signed-in visitor follows, shared by every Follow button on the page.
// Loaded in the browser after render, so cached HTML never contains viewer state.
const following = ref(new Set<string>())
const followerCounts = ref<Record<string, number>>({})
const pending = ref(new Set<string>())

export const useFollows = () => {
  const { isAuthenticated } = useAuthState()
  const route = useRoute()
  const router = useRouter()
  const { track } = useFunnel()

  const loadState = async (handles: string[]) => {
    const list = [...new Set(handles)].filter((handle) => /^[a-z0-9_]{3,30}$/.test(handle))
    if (!isAuthenticated.value || !list.length) return
    try {
      const response = await $api<{ data: string[] }>(`/api/community/follow-state?handles=${list.join(',')}`)
      const next = new Set(following.value)
      for (const handle of list) next.delete(handle)
      for (const handle of response.data) next.add(handle)
      following.value = next
    } catch {
      // Buttons just show "Follow"
    }
  }

  const isFollowing = (handle: string) => following.value.has(handle)
  const followersOf = (handle: string, fallback: number) => followerCounts.value[handle] ?? fallback

  const toggle = async (handle: string, placement: string) => {
    if (!isAuthenticated.value) {
      router.push({ path: '/login', query: { redirect: route.fullPath } })
      return
    }
    if (pending.value.has(handle)) return
    const was = isFollowing(handle)
    pending.value = new Set(pending.value).add(handle)
    const flip = (value: boolean) => {
      const next = new Set(following.value)
      if (value) next.add(handle)
      else next.delete(handle)
      following.value = next
    }
    flip(!was)
    try {
      const response = await $api<{ data: { following: boolean; followers: number } }>(`/api/community/profiles/${handle}/follow`, {
        method: was ? 'DELETE' : 'PUT'
      })
      flip(response.data.following)
      followerCounts.value = { ...followerCounts.value, [handle]: response.data.followers }
      if (response.data.following) track('creator_follow', { handle, placement })
    } catch (error: any) {
      flip(was)
      if (error?.statusCode === 401 || error?.status === 401) router.push({ path: '/login', query: { redirect: route.fullPath } })
    } finally {
      const next = new Set(pending.value)
      next.delete(handle)
      pending.value = next
    }
  }

  return { loadState, isFollowing, followersOf, toggle, isPending: (handle: string) => pending.value.has(handle) }
}
