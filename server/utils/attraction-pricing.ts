import type { AttractionsgEvent } from '@prisma/client'
import { eventNetMargin, sellPriceForCost, type FeeConfig } from '~/utils/pricing'

// Supplier prices (`priceAmount`, `priceText`, `resellerPriceAmount`, option `priceAmount`)
// are our cost. Public APIs and checkout must use the prices computed here, and must
// never send cost fields or `raw` to the browser.

export interface SupplierOption {
  code?: string
  name?: string
  priceText?: string
  priceAmount?: number | string
  price?: number | string
  originalPriceText?: string
  originalPriceAmount?: number | string
  validity?: string
  details?: string
}

export interface PublicTicketOption {
  code: string | null
  name: string | null
  priceAmount: number
  priceText: string
  originalPriceText: string | null
  validity: string | null
  details: string | null
}

type PriceSource = Pick<
  AttractionsgEvent,
  'publicPrice' | 'resellerPriceAmount' | 'priceAmount' | 'originalPriceAmount'
> & { raw?: unknown; options?: unknown }

const toNumber = (value: unknown) => {
  const num = typeof value === 'number' ? value : parseFloat(String(value ?? ''))
  return Number.isFinite(num) && num > 0 ? num : null
}

export const formatSgd = (amount: number) => `S$${amount.toFixed(2)}`

export const feeConfig = (): FeeConfig => {
  const config = useRuntimeConfig()
  return {
    stripePercent: Number(config.public?.stripeFeePercent ?? 0.034),
    stripeFixed: Number(config.public?.stripeFeeFixed ?? 0.5)
  }
}

export const supplierOptions = (source: PriceSource): SupplierOption[] => {
  const raw = source.raw as { options?: unknown } | null | undefined
  const options = raw?.options ?? source.options
  return Array.isArray(options) ? (options as SupplierOption[]) : []
}

/** Same order the admin pricing screen uses for an event's base cost. */
export const eventBaseCost = (source: PriceSource) =>
  toNumber(source.resellerPriceAmount) ?? toNumber(source.priceAmount) ?? toNumber(source.originalPriceAmount)

export const optionCost = (option: SupplierOption) => toNumber(option.priceAmount) ?? toNumber(option.price)

/**
 * Sell price for one ticket: the admin's public price for the base ticket, and the
 * option's cost plus the same net margin for other options. Never below break-even
 * (supplier cost + Stripe fee). Without an admin price, options sell at break-even.
 */
export function ticketPrice(source: PriceSource, option: SupplierOption | null, fees: FeeConfig) {
  const baseCost = eventBaseCost(source)
  const publicPrice = toNumber(source.publicPrice)
  const margin = eventNetMargin(publicPrice, baseCost, fees)
  // An option whose supplier price we couldn't read is not sold: guessing could undercharge
  if (option && optionCost(option) === null) return null
  const cost = option ? optionCost(option) : baseCost

  if (cost === null) {
    // No supplier cost known: only an explicit admin price can be sold
    return publicPrice !== null ? { price: publicPrice, cost: null } : null
  }

  const floor = sellPriceForCost(cost, 0, fees)
  // The admin's price applies as-is to the base ticket; other options keep its margin
  const isBaseTicket = baseCost !== null && Math.abs(cost - baseCost) < 0.005
  const price =
    publicPrice !== null && isBaseTicket ? Math.max(publicPrice, floor) : sellPriceForCost(cost, margin, fees)
  return { price, cost }
}

export function publicTicketOptions(source: PriceSource, fees: FeeConfig): PublicTicketOption[] {
  return supplierOptions(source).flatMap((option) => {
    const priced = ticketPrice(source, option, fees)
    if (!priced) return []
    const original = toNumber(option.originalPriceAmount)
    return [
      {
        code: option.code ?? null,
        name: option.name ?? null,
        priceAmount: priced.price,
        priceText: formatSgd(priced.price),
        // Only show the supplier's list price when it is above ours
        originalPriceText: original && original > priced.price ? option.originalPriceText || formatSgd(original) : null,
        validity: option.validity ?? null,
        details: option.details ?? null
      }
    ]
  })
}

/** Lowest ticket price for list cards and the page header. */
export function fromPrice(source: PriceSource, fees: FeeConfig): number | null {
  const options = publicTicketOptions(source, fees)
  if (options.length) return Math.min(...options.map((option) => option.priceAmount))
  return ticketPrice(source, null, fees)?.price ?? null
}

type PublicSource = PriceSource &
  Partial<
    Pick<
      AttractionsgEvent,
      | 'id'
      | 'slug'
      | 'title'
      | 'description'
      | 'image'
      | 'category'
      | 'location'
      | 'rating'
      | 'duration'
      | 'ageRestriction'
      | 'cancellation'
      | 'validFrom'
      | 'validTo'
      | 'isPublished'
      | 'publishedAt'
      | 'isSelfBookable'
      | 'checkoutNotes'
      | 'lastSeenAt'
    >
  >

/** The only shape of an attraction that public APIs return. */
export function toPublicAttraction(record: PublicSource, fees: FeeConfig) {
  const raw = (record.raw as Record<string, any> | null | undefined) ?? (record as Record<string, any>)
  const options = publicTicketOptions(record, fees)
  const from = fromPrice(record, fees)
  // List price shown struck through: the cheapest option's own list price, so the two
  // numbers describe the same ticket
  const cheapest = options.length
    ? options.reduce((low, option) => (option.priceAmount < low.priceAmount ? option : low))
    : null
  const original = cheapest
    ? toNumber(cheapest.originalPriceText?.replace(/[^0-9.]/g, ''))
    : toNumber(record.originalPriceAmount)
  const lastSeen = record.lastSeenAt ? new Date(record.lastSeenAt) : null

  return {
    id: record.id,
    slug: record.slug ?? raw?.slug ?? null,
    title: record.title,
    description: record.description ?? raw?.description ?? '',
    image: record.image ?? raw?.image ?? null,
    gallery: Array.isArray(raw?.gallery) ? (raw.gallery as string[]) : [],
    category: record.category ?? raw?.category ?? null,
    location: record.location ?? raw?.location ?? null,
    rating: record.rating ?? (typeof raw?.rating === 'number' ? raw.rating : null),
    duration: record.duration ?? raw?.duration ?? null,
    ageRestriction: record.ageRestriction ?? raw?.ageRestriction ?? null,
    cancellation: record.cancellation ?? raw?.cancellation ?? null,
    validFrom: record.validFrom ?? raw?.validFrom ?? null,
    validTo: record.validTo ?? raw?.validTo ?? null,
    // Lowest sell price. `price` is the display string the list cards use.
    publicPrice: from,
    price: from !== null ? formatSgd(from) : '',
    originalPrice: original && from !== null && original > from ? formatSgd(original) : '',
    originalPriceAmount: original && from !== null && original > from ? original : null,
    options,
    isPublished: record.isPublished ?? false,
    publishedAt: record.publishedAt ?? null,
    isSelfBookable: record.isSelfBookable ?? false,
    checkoutNotes: record.checkoutNotes ?? null,
    // When the supplier price was last read
    lastUpdated: lastSeen && !Number.isNaN(lastSeen.getTime()) ? lastSeen.toISOString() : null
  }
}
