'use client'
import { useCallback, useEffect, useState } from 'react'

export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message) }
}

export async function api<T = unknown>(url: string, body?: unknown, method?: string): Promise<T> {
  let res: Response
  try {
    res = await fetch(url, {
      method: method ?? (body === undefined ? 'GET' : 'POST'),
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError(0, 'Could not reach the server. Check your connection and try again.')
  }
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new ApiError(res.status, data?.error || 'Something went wrong. Please try again.')
  return data as T
}

/** GET hook. `loading` is derived, so the previous data stays visible while a new URL loads. */
export function useApi<T>(url: string | null) {
  const [res, setRes] = useState<{ url: string; data?: T; error?: string } | null>(null)
  const [nonce, setNonce] = useState(0)

  useEffect(() => {
    if (!url) return
    let live = true
    api<T>(url)
      .then(data => live && setRes({ url, data }))
      .catch((e: Error) => live && setRes({ url, error: e.message }))
    return () => { live = false }
  }, [url, nonce])

  const reload = useCallback(() => setNonce(n => n + 1), [])
  return {
    data: res?.data,
    error: res && res.url === url ? res.error : undefined,
    loading: !!url && (!res || res.url !== url),
    reload,
  }
}
