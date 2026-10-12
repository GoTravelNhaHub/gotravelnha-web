// One visitor session id shared by the activity tracker, affiliate clicks and
// checkout, so a page view can be joined to the booking it led to. Mirrored into
// the gtn_sid cookie so the server can read it at checkout.

const STORAGE_KEY = 'activity_session_id'
const COOKIE = 'gtn_sid'
const MAX_AGE_DAYS = 30

const isValid = (value: string | null): value is string => !!value && /^[A-Za-z0-9_-]{8,64}$/.test(value)

export function getVisitorSessionId(): string {
  if (typeof window === 'undefined') return 'server'
  let id = localStorage.getItem(STORAGE_KEY)
  if (!isValid(id)) {
    id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`
    localStorage.setItem(STORAGE_KEY, id)
  }
  document.cookie = `${COOKIE}=${id}; Max-Age=${MAX_AGE_DAYS * 86400}; Path=/; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`
  return id
}
