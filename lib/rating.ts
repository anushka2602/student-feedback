export interface Band { n: 1 | 2 | 3 | 4 | 5; label: string }

export function ratingBand(v: number): Band {
  if (v <= 2) return { n: 1, label: 'Poor' }
  if (v <= 4) return { n: 2, label: 'Below average' }
  if (v <= 6) return { n: 3, label: 'Average' }
  if (v <= 8) return { n: 4, label: 'Good' }
  return { n: 5, label: 'Excellent' }
}

/** CSS colour (fill / text) for a rating value, usable in inline styles. */
export const fillVar = (v: number) => `var(--r${ratingBand(v).n})`
export const textVar = (v: number) => `var(--rt${ratingBand(v).n})`

export const avg = (nums: number[]) => (nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : null)
export const plural = (n: number, one: string, many = one + 's') => `${n} ${n === 1 ? one : many}`
export const fmt1 = (n: number | null | undefined) => (n == null ? '–' : n.toFixed(1))
