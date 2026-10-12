import Stripe from 'stripe'
import { createError } from 'h3'

let client: Stripe | null = null

/** Shared Stripe client. Throws a 500 if STRIPE_SECRET_KEY is not set. */
export function getStripe() {
  const secretKey = useRuntimeConfig().STRIPE_SECRET_KEY
  if (!secretKey) {
    throw createError({ statusCode: 500, message: 'Stripe is not configured.' })
  }
  if (!client) {
    client = new Stripe(secretKey, { apiVersion: '2024-06-20' })
  }
  return client
}
