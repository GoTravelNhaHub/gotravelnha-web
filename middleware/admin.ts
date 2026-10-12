// Admin route middleware - Protect admin pages
let adminSessionVerified = false

export default defineNuxtRouteMiddleware(async (to, from) => {
  // Only run on client side
  if (process.server) return

  // Import composable to check auth
  const { isAuthenticated, isAdmin } = useAuthState()

  // If user is not authenticated, redirect to login
  if (!isAuthenticated.value) {
    return navigateTo('/login')
  }

  // If user is not admin, redirect to user portal
  if (!isAdmin.value) {
    return navigateTo('/user')
  }

  // Confirm the server session once per visit. Users who signed in before
  // server sessions existed only have localStorage state and must sign in again.
  if (!adminSessionVerified) {
    try {
      const response = await $fetch<{ role: string }>('/api/auth/me')
      if (response.role !== 'ADMIN') {
        return navigateTo('/user')
      }
      adminSessionVerified = true
    } catch {
      const { clearUser } = useAuthState()
      clearUser()
      return navigateTo('/login')
    }
  }
})

