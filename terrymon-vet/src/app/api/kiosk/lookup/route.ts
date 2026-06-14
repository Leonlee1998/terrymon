import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

/* eslint-disable @typescript-eslint/no-explicit-any */

function mapPet(p: any) {
  return {
    id: p.id,
    memberId: p.member_id,
    name: p.name,
    species: p.species,
    breed: p.breed ?? '',
    birthDate: p.birth_date ?? '',
    weight: Number(p.weight ?? 0),
    photoUrl: p.photo_url ?? '',
    allergies: p.allergies ?? [],
    notes: p.notes ?? '',
  }
}

function mapMember(row: any) {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    qrCode: `TERRYMON-${row.id}`,
    memberSince: row.created_at,
    balance: row.platform_balance ?? 0,
    points: row.points ?? 0,
    pets: (row.pets ?? []).map(mapPet),
  }
}

// POST /api/kiosk/lookup
// Body: { q: string }  — QR Code（TERRYMON-{uuid}）或手機號碼
export async function POST(req: NextRequest) {
  const { q } = await req.json()
  if (!q) return NextResponse.json({ member: null }, { status: 400 })

  const supabase = createAdminClient()
  const input = String(q).trim()

  const isQr = input.startsWith('TERRYMON-')
  const memberId = isQr ? input.replace(/^TERRYMON-/, '').split('-').slice(0, 5).join('-') : null
  const phone = !isQr ? input.replace(/[-\s]/g, '') : null

  const base = supabase.from('members').select('*, pets(*)')
  const { data, error } = isQr
    ? await base.eq('id', memberId!).maybeSingle()
    : await base.or(`phone.eq.${phone},email.eq.${phone}`).maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ member: null })

  return NextResponse.json({ member: mapMember(data) })
}
