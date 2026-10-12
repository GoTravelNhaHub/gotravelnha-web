/** City centres for destinations the planner already offers. Used only to frame a map, not to pin stops. */
const CITY_CENTRES: Record<string, { lat: number; lon: number }> = {
  Singapore: { lat: 1.3521, lon: 103.8198 },
  Tokyo: { lat: 35.6762, lon: 139.6503 },
  Osaka: { lat: 34.6937, lon: 135.5023 },
  Bangkok: { lat: 13.7563, lon: 100.5018 },
  Bali: { lat: -8.4095, lon: 115.1889 },
  'Hong Kong': { lat: 22.3193, lon: 114.1694 },
  Seoul: { lat: 37.5665, lon: 126.978 },
  Taipei: { lat: 25.033, lon: 121.5654 },
  Sydney: { lat: -33.8688, lon: 151.2093 },
  Phuket: { lat: 7.8804, lon: 98.3923 },
  Hanoi: { lat: 21.0278, lon: 105.8342 },
  'Ho Chi Minh City': { lat: 10.8231, lon: 106.6297 },
  'Kuala Lumpur': { lat: 3.139, lon: 101.6869 }
}

export const plannerMapFor = (destination: string) => {
  const needle = destination.trim().toLowerCase()
  const city = Object.keys(CITY_CENTRES)
    .sort((a, b) => b.length - a.length)
    .find((name) => needle.includes(name.toLowerCase()))
  if (!city) return null
  const { lat, lon } = CITY_CENTRES[city]
  const pad = 0.12
  const bbox = [lon - pad, lat - pad, lon + pad, lat + pad].join(',')
  return {
    city,
    src: `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik`
  }
}
