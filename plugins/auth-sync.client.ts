// After a Keycloak login the API redirects back here with only the session cookie set, and a
// logout elsewhere (admin, Family Hub) can end the session. Sync the cached user with the API once
// per page load, and drop the `auth_error` flag the callback adds when a login fails or is cancelled.
export default defineNuxtPlugin(() => {
  const { refreshUser } = useAuthState()
  refreshUser()

  const url = new URL(window.location.href)
  if (url.searchParams.has('auth_error')) {
    url.searchParams.delete('auth_error')
    window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash)
  }
})
