import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { HttpError } from './http'

let client: SupabaseClient | null = null

/** Service-role client. Server only – never import this from a client component. */
export function db(): SupabaseClient {
  if (client) return client
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new HttpError(500, 'The server is not configured (missing Supabase environment variables).')
  client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
  return client
}

/** Reads every row of a query, past PostgREST's 1000-row default limit. */
export async function fetchAll<T>(
  table: string,
  columns: string,
  apply: (q: any) => any = q => q, // eslint-disable-line @typescript-eslint/no-explicit-any
  cap = 100_000,
): Promise<T[]> {
  const out: T[] = []
  for (let from = 0; from < cap; from += 1000) {
    const { data, error } = await apply(db().from(table).select(columns)).range(from, from + 999)
    if (error) throw error
    out.push(...(data as T[]))
    if (!data || data.length < 1000) break
  }
  return out
}
