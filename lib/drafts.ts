'use client'
import { useSyncExternalStore } from 'react'

export interface FactorDraft { rating: number | null; comment: string }
export interface Drafts {
  academic: Record<string, Record<string, FactorDraft>> // item -> factor -> draft
  nonAcademic: Record<string, FactorDraft> // category -> draft
}
const EMPTY: Drafts = { academic: {}, nonAcademic: {} }
const EVT = 'sf-drafts'
const keyOf = (uid: string) => `sf-drafts:${uid}`

let lastRaw: string | null = null
let lastVal: Drafts = EMPTY

function read(uid: string): Drafts {
  try {
    const raw = localStorage.getItem(keyOf(uid))
    if (raw === lastRaw) return lastVal
    lastRaw = raw
    lastVal = raw ? { ...EMPTY, ...JSON.parse(raw) } : EMPTY
  } catch {
    lastVal = EMPTY
  }
  return lastVal
}

function write(uid: string, d: Drafts) {
  try { localStorage.setItem(keyOf(uid), JSON.stringify(d)) } catch { /* storage full/blocked */ }
  window.dispatchEvent(new Event(EVT))
}

const subscribe = (cb: () => void) => {
  window.addEventListener(EVT, cb)
  window.addEventListener('storage', cb)
  return () => { window.removeEventListener(EVT, cb); window.removeEventListener('storage', cb) }
}

export function useDrafts(uid: string | undefined): Drafts {
  return useSyncExternalStore(
    subscribe,
    () => (uid ? read(uid) : EMPTY),
    () => EMPTY,
  )
}

const hasRating = (m: Record<string, FactorDraft>) => Object.values(m).some(f => f.rating != null)

export function saveAcademicDraft(uid: string, item: string, factors: Record<string, FactorDraft>) {
  const d = read(uid)
  const academic = { ...d.academic }
  if (hasRating(factors)) academic[item] = factors
  else delete academic[item]
  write(uid, { ...d, academic })
}

export function saveNonAcademicDraft(uid: string, category: string, v: FactorDraft) {
  const d = read(uid)
  const nonAcademic = { ...d.nonAcademic }
  if (v.rating != null) nonAcademic[category] = v
  else delete nonAcademic[category]
  write(uid, { ...d, nonAcademic })
}

export function clearDrafts(uid: string, kind: 'academic' | 'nonAcademic', keys: string[]) {
  const d = read(uid)
  const next = { ...d[kind] }
  keys.forEach(k => delete next[k])
  write(uid, { ...d, [kind]: next })
}
