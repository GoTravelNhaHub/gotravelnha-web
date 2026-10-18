// Stock photos (Unsplash) for the community pages. Each was checked to show the named place.
const unsplash = (id: string, width: number, height?: number) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}${height ? `&h=${height}` : ''}&q=80`

// Oia, Santorini at dusk: open sea on the left, cliffside village on the right, as in the approved hero
export const communityHeroPhoto = (width = 2000) => unsplash('1580502304784-8985b7eb7260', width)

// Country tiles in "Popular destinations"
const COUNTRY_PHOTOS: Record<string, string> = {
  japan: '1490806843957-31f4c9a91c65', // Mount Fuji with cherry blossom
  vietnam: '1528127269322-539801943592', // Ha Long Bay
  thailand: '1528181304800-259b08848526', // Temple, Chiang Mai
  singapore: '1525625293386-3f8f99389edd', // Marina Bay
  'south korea': '1517154421773-0529f29ea451', // Seoul
  malaysia: '1596422846543-75c6fc197f07', // Kuala Lumpur
  indonesia: '1537996194471-e657df975ab4', // Bali
  taiwan: '1470004914212-05527e49370b', // Taipei
  'hong kong': '1536599018102-9f803c140fc1',
  australia: '1524293581917-878a6d017c71' // Sydney
}

export const countryPhoto = (country: string, width = 400) => {
  const id = COUNTRY_PHOTOS[country.trim().toLowerCase()]
  return id ? unsplash(id, width, Math.round(width * 0.93)) : null
}

/** Countries shown as shortcuts when the community has fewer with trips. Navigation only, no counts. */
export const FEATURED_COUNTRIES = ['Japan', 'Vietnam', 'Thailand', 'Singapore']

// Card photos for the demo trips
export const DEMO_PHOTOS = {
  japan: '1528164344705-47542687000d', // Chureito Pagoda and Mount Fuji
  thailand: '1552465011-b4e21bf6e79a', // Railay beach, Krabi
  singapore: '1565967511849-76a60a516170' // Marina Bay Sands at night
}

export const demoPhoto = (key: keyof typeof DEMO_PHOTOS, width = 720) => unsplash(DEMO_PHOTOS[key], width, Math.round(width * 0.6))
