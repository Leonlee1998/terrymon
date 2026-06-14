import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

type RegisterBody = {
  name?: string
  phone?: string
  email?: string
  password?: string
  handle?: string
}

const HANDLE_RE = /^[a-z0-9][a-z0-9-]{2,18}[a-z0-9]$/

function normalizePhone(value: string) {
  return value.replace(/\D/g, '')
}

function phoneVariants(value: string) {
  const normalized = normalizePhone(value)
  const variants = new Set([value.trim(), normalized])

  if (normalized.length === 10) {
    variants.add(`${normalized.slice(0, 4)}-${normalized.slice(4, 7)}-${normalized.slice(7)}`)
  }

  return [...variants].filter(Boolean)
}

function uniqueMemberError(message: string) {
  const normalizedMessage = message.toLowerCase()

  if (normalizedMessage.includes('members_phone_key') || normalizedMessage.includes('(phone)')) {
    return '此手機號碼已註冊，請直接登入或改用另一支手機'
  }

  if (normalizedMessage.includes('members_email_key') || normalizedMessage.includes('(email)')) {
    return '此 Email 已註冊，請直接登入'
  }

  if (normalizedMessage.includes('members_handle_key') || normalizedMessage.includes('(handle)')) {
    return '此會員 ID 已被使用，請換一個'
  }

  return message
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
    const phoneInput = body.phone?.trim()
    const phone = phoneInput ? normalizePhone(phoneInput) : undefined
    const email = body.email?.trim().toLowerCase()
    const password = body.password
    const handle = body.handle?.trim().toLowerCase()

    if (!name || !phone || !email || !password || password.length < 6 || !handle) {
      return NextResponse.json({ error: 'Invalid registration payload' }, { status: 400 })
    }

    if (!HANDLE_RE.test(handle)) {
      return NextResponse.json({ error: 'Invalid member ID format' }, { status: 400 })
    }

    const supabase = getAdminClient()
    const phoneChecks = phoneVariants(phoneInput ?? '')
      .map(value => supabase.from('members').select('id').eq('phone', value).maybeSingle())

    const [
      { data: existingHandle, error: handleError },
      { data: existingEmail, error: emailError },
      ...phoneResults
    ] = await Promise.all([
      supabase.from('members').select('id').eq('handle', handle).maybeSingle(),
      supabase.from('members').select('id').eq('email', email).maybeSingle(),
      ...phoneChecks,
    ])

    const phoneError = phoneResults.find(result => result.error)?.error
    if (handleError || emailError || phoneError) {
      return NextResponse.json(
        { error: handleError?.message ?? emailError?.message ?? phoneError?.message ?? 'Could not validate registration' },
        { status: 500 },
      )
    }

    if (existingHandle) {
      return NextResponse.json({ error: '此會員 ID 已被使用，請換一個' }, { status: 409 })
    }

    if (existingEmail) {
      return NextResponse.json({ error: '此 Email 已註冊，請直接登入' }, { status: 409 })
    }

    if (phoneResults.some(result => result.data)) {
      return NextResponse.json({ error: '此手機號碼已註冊，請直接登入或改用另一支手機' }, { status: 409 })
    }

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, role: 'member' },
    })

    if (authError || !authData.user) {
      const message = authError?.message ?? 'Could not create auth user'
      return NextResponse.json(
        { error: message.toLowerCase().includes('already') ? '此 Email 已註冊，請直接登入' : message },
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
        handle,
      })
      .select('*')
      .single()

    if (memberError) {
      await supabase.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json({ error: uniqueMemberError(memberError.message) }, { status: 400 })
    }

    return NextResponse.json({
      id: member.id,
      name: member.name,
      phone: member.phone,
      email: member.email,
      avatarUrl: member.avatar_url ?? undefined,
      handle: member.handle ?? undefined,
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
