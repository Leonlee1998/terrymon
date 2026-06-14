import { NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

const HANDLE_RE = /^[a-z0-9][a-z0-9-]{2,18}[a-z0-9]$/

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(/^\uFEFF/, '')
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim().replace(/^\uFEFF/, '')
  if (!url || !key) return null
  return createAdminClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.toLowerCase().trim() ?? ''

  if (!HANDLE_RE.test(q)) {
    return NextResponse.json({ available: false, error: 'invalid_format' })
  }

  try {
    const admin = getAdminClient()
    if (!admin) {
      return NextResponse.json({ available: true, mode: 'mock' })
    }

    const { data } = await admin
      .from('members')
      .select('id')
      .eq('handle', q)
      .maybeSingle()

    return NextResponse.json({ available: data === null })
  } catch {
    return NextResponse.json({ available: false, error: 'server_error' }, { status: 500 })
  }
}
