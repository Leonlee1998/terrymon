import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

type RegisterBody = {
  name?: string
  phone?: string
  email?: string
  password?: string
}

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(/^\uFEFF/, '')
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim().replace(/^\uFEFF/, '')

  if (!url || !serviceRoleKey) {
    throw new Error('Supabase server environment is not configured')
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as RegisterBody
    const name = body.name?.trim()
    const phone = body.phone?.trim()
    const email = body.email?.trim().toLowerCase()
    const password = body.password

    if (!name || !phone || !email || !password || password.length < 6) {
      return NextResponse.json({ error: 'Invalid registration payload' }, { status: 400 })
    }

    const supabase = getAdminClient()
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, role: 'member' },
    })

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: authError?.message ?? 'Could not create auth user' },
        { status: 400 },
      )
    }

    const { data: member, error: memberError } = await supabase
      .from('members')
      .insert({
        supabase_uid: authData.user.id,
        name,
        phone,
        email,
      })
      .select('*')
      .single()

    if (memberError) {
      await supabase.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json({ error: memberError.message }, { status: 400 })
    }

    return NextResponse.json({
      id: member.id,
      name: member.name,
      phone: member.phone,
      email: member.email,
      avatarUrl: member.avatar_url ?? undefined,
      qrCode: `TERRYMON-${member.id}`,
      memberSince: member.created_at,
      balance: member.platform_balance ?? 0,
      points: member.points ?? 0,
      tier: member.tier ?? 'basic',
      pets: [],
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Registration failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
