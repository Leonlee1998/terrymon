import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const configuredVendorId = process.env.NEXT_PUBLIC_VENDOR_ID

// 給 vendorApi.ts fallback 函數使用（browser context，anon key）
export function getSupabase() {
  if (!supabaseUrl || !supabaseAnonKey) return null
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
