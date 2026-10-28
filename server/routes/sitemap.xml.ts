// The sitemap needs the database, so api.gotravelnha.com builds it (with www URLs) and the site serves it here
export default defineEventHandler(async (event) => {
  const apiBase = String(useRuntimeConfig().public.apiBase).replace(/\/$/, '')
  const xml = await $fetch<string>(`${apiBase}/sitemap.xml`, { responseType: 'text' })
  setHeader(event, 'content-type', 'application/xml; charset=utf-8')
  setHeader(event, 'cache-control', 'public, max-age=3600, s-maxage=3600')
  return xml
})
