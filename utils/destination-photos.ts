// Stock city photos already used on the Klook and Trip.com pages
const PHOTOS: Record<string, string> = {
  singapore: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd',
  bangkok: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365',
  tokyo: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf',
  bali: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4',
  'hong kong': 'https://images.unsplash.com/photo-1536599018102-9f803c140fc1',
  seoul: 'https://images.unsplash.com/photo-1517154421773-0529f29ea451'
}

export const destinationPhoto = (destination: string, width = 640) => {
  const needle = destination.toLowerCase()
  const key = Object.keys(PHOTOS).find((city) => needle.includes(city))
  return key ? `${PHOTOS[key]}?auto=format&fit=crop&w=${width}&q=80` : null
}
