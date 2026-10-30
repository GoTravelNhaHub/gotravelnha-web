// General auth middleware - Protect user pages
export default defineNuxtRouteMiddleware(async (to) => {
  // Only run on client side
  if (process.server) return

  const { isAuthenticated, refreshUser } = useAuthState()

  // Right after a Keycloak login the session cookie is set but the localStorage cache is still empty;
  // ask the API before sending the visitor to Keycloak
  if (!isAuthenticated.value) await refreshUser()

  if (!isAuthenticated.value) {
    return goToLogin(to.fullPath, { automatic: true })
  }
})
