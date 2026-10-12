import { randomInt } from 'crypto'

// No 0/O, 1/I/L, so references can be read out over the phone
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

/** Customer-facing booking reference, e.g. GTN-7K3QX9MA. */
export function generateBookingReference() {
  let code = ''
  for (let i = 0; i < 8; i++) code += ALPHABET[randomInt(ALPHABET.length)]
  return `GTN-${code}`
}

export const normalizeReference = (value: unknown) =>
  typeof value === 'string' ? value.trim().toUpperCase().replace(/\s+/g, '') : ''
