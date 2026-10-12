export interface PricingInput {
  resellerPrice: number
  margin?: number
  stripePercent?: number
  stripeFixed?: number
}

export interface PricingBreakdown {
  endUserPrice: number
  stripeFee: number
  netRevenue: number
}

const DEFAULT_STRIPE_PERCENT = 0.034
const DEFAULT_STRIPE_FIXED = 0.5

export function computeEndUserPrice({
  resellerPrice,
  margin = 0,
  stripePercent = DEFAULT_STRIPE_PERCENT,
  stripeFixed = DEFAULT_STRIPE_FIXED
}: PricingInput): PricingBreakdown {
  const desiredGross = resellerPrice + margin + stripeFixed
  const endUserPrice = Math.ceil((desiredGross / (1 - stripePercent)) * 100) / 100
  const stripeFee = endUserPrice * stripePercent + stripeFixed
  const netRevenue = endUserPrice - stripeFee
  return {
    endUserPrice,
    stripeFee: Math.round(stripeFee * 100) / 100,
    netRevenue: Math.round(netRevenue * 100) / 100
  }
}

export function estimateStripeFee(amount: number, stripePercent = DEFAULT_STRIPE_PERCENT, stripeFixed = DEFAULT_STRIPE_FIXED): number {
  const fee = amount * stripePercent + stripeFixed
  return Math.round(fee * 100) / 100
}

export interface FeeConfig {
  stripePercent?: number
  stripeFixed?: number
}

/**
 * Net margin per ticket the admin chose by setting the event's public price against
 * its base supplier cost. Never negative, so prices derived from it at least cover
 * the supplier cost and the Stripe fee.
 */
export function eventNetMargin(publicPrice: number | null, baseCost: number | null, fees: FeeConfig = {}): number {
  if (publicPrice === null || baseCost === null || publicPrice <= 0) return 0
  const margin = publicPrice - estimateStripeFee(publicPrice, fees.stripePercent, fees.stripeFixed) - baseCost
  return Math.max(0, Math.round(margin * 100) / 100)
}

/** Customer price for a supplier cost that keeps the given net margin after the Stripe fee. */
export function sellPriceForCost(cost: number, margin: number, fees: FeeConfig = {}): number {
  return computeEndUserPrice({ resellerPrice: cost, margin, ...fees }).endUserPrice
}
