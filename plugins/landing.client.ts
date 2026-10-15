// First step of the funnel: one `landing_viewed` row per full page load (in-app
// navigation does not re-run plugins), with the source so drop-off can be split by channel.

export default defineNuxtPlugin(() => {
  const params = new URLSearchParams(window.location.search)
  let referrer: string | null = null
  try {
    const ref = document.referrer ? new URL(document.referrer) : null
    if (ref && ref.hostname !== window.location.hostname) referrer = ref.hostname
  } catch {
    referrer = null
  }

  useFunnel().track('landing_viewed', {
    utmSource: params.get('utm_source')?.slice(0, 100) ?? null,
    utmMedium: params.get('utm_medium')?.slice(0, 100) ?? null,
    utmCampaign: params.get('utm_campaign')?.slice(0, 100) ?? null,
    referrer
  })
})
