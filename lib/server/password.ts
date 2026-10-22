import bcrypt from 'bcryptjs'
import { randomInt, timingSafeEqual } from 'node:crypto'

export const hashPassword = (pw: string) => bcrypt.hash(pw, 10)
const DUMMY = '$2b$10$CwTycUXWue0Thq9StjUM0uJ8.Qm5Z3Gd0Vq1m7Q0b0Y5mQ1lQ1q8K'

/** Accepts bcrypt hashes and legacy plaintext values (which get upgraded after a successful login). */
export async function verifyPassword(input: string, stored: string | null | undefined) {
  if (!stored) { await bcrypt.compare(input, DUMMY).catch(() => false); return { ok: false, legacy: false } }
  if (stored.startsWith('$2')) return { ok: await bcrypt.compare(input, stored), legacy: false }
  const a = Buffer.from(input), b = Buffer.from(stored)
  const ok = a.length === b.length && timingSafeEqual(a, b)
  return { ok, legacy: ok }
}

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
export const tempPassword = (len = 10) => Array.from({ length: len }, () => ALPHABET[randomInt(ALPHABET.length)]).join('')
