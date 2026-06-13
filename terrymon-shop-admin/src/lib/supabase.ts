import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export const configuredVendorId = process.env.NEXT_PUBLIC_VENDOR_ID

export function getSupabase() {
  if (!supabaseUrl) return null
  const key = typeof window === 'undefined'
    ? supabaseServiceRoleKey ?? supabaseAnonKey
    : supabaseAnonKey
  if (!key) return null

  return createClient(supabaseUrl, key, {
    auth: {
      persistSession: typeof window !== 'undefined',
      autoRefreshToken: typeof window !== 'undefined',
    },
  })
}
