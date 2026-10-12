export default defineEventHandler((event) => {
  const site = String(useRuntimeConfig().public.siteUrl || 'https://gotravelnha.com').replace(/\/$/, '')
  setHeader(event, 'content-type', 'text/plain; charset=utf-8')
  return [
    'User-agent: *',
    'Allow: /',
    'Disallow: /admin',
    'Disallow: /user',
    'Disallow: /login',
    'Disallow: /register',
    'Disallow: /forgot-password',
    'Disallow: /reset-password',
    'Disallow: /bookings',
    'Disallow: /trips',
    'Disallow: /api/',
    '',
    `Sitemap: ${site}/sitemap.xml`,
    ''
  ].join('\n')
})
