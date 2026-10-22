/**
 * When true, student names are never stored or shown: submissions are saved as
 * "Anonymous" (the student id is still kept server-side to stop duplicate submissions).
 * When false (default, matches the original behaviour) admins can see who submitted.
 */
export const ANONYMOUS_MODE = false

export const SESSION_COOKIE = 'sf_session'
export const SESSION_MAX_AGE = 60 * 60 * 12 // 12 hours

export const COMMENT_MAX = 500
export const PAGE_SIZE = 20

/** "2026–27" – academic years start in June. */
export function academicYear(d = new Date()) {
  const y = d.getFullYear()
  const start = d.getMonth() >= 5 ? y : y - 1
  return `${start}–${String(start + 1).slice(2)}`
}
