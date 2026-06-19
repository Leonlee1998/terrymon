import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const authHeader = request.headers.get('Authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
  const cookieStore = await cookies()
  const allCookies = cookieStore.getAll().map(c => c.name)

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      ...(token ? { global: { headers: { Authorization: `Bearer ${token}` } } } : {}),
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll() {},
      },
    }
  )

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  let memberId = null
  let memberError = null
  if (user) {
    const { data: m, error: me } = await supabase
      .from('members').select('id').eq('supabase_uid', user.id).single()
    memberId = m?.id ?? null
    memberError = me?.message ?? null
  }

  return NextResponse.json({
    hasAuthHeader: !!authHeader,
    hasToken: !!token,
    cookieNames: allCookies,
    authUser: user ? { id: user.id, email: user.email } : null,
    userError: userError?.message ?? null,
    memberId,
    memberError,
  })
}
