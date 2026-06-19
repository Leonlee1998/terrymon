import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

/* eslint-disable @typescript-eslint/no-explicit-any */

function mapPet(p: any) {
  return {
    id: p.id,
    memberId: p.member_id,
    primaryCaregiverId: p.primary_caregiver_id ?? undefined,
    name: p.name,
    species: p.species,
    breedId: p.breed_id ?? undefined,
    breed: p.breed ?? '',
    birthDate: p.birth_date ?? '',
    weight: Number(p.weight ?? 0),
    photoUrl: p.photo_url ?? '',
    allergies: p.allergies ?? [],
    chipId: p.chip_id ?? undefined,
    gender: p.gender ?? undefined,
    isNeutered: p.is_neutered ?? undefined,
    bloodType: p.blood_type ?? undefined,
    caregiver: p.caregiver ?? undefined,
    notes: p.notes ?? '',
    isActive: p.is_active ?? true,
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
    tier: row.tier ?? 'basic',
    pets: (row.pets ?? []).map(mapPet),
  }
}

const STORE_ID = process.env.NEXT_PUBLIC_STORE_ID!

async function getTodayAppointment(supabase: ReturnType<typeof createAdminClient>, memberId: string) {
  const today = new Date().toISOString().split('T')[0]
  const { data } = await supabase
    .from('appointments')
    .select('id, scheduled_time, pet_id, notes, pets!pet_id(name)')
    .eq('member_id', memberId)
    .eq('store_id', STORE_ID)
    .eq('type', 'grooming')
    .eq('scheduled_date', today)
    .in('status', ['pending', 'confirmed'])
    .order('scheduled_time', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (!data) return null
  const petRow = (data as any).pets
  const pet = petRow && typeof petRow === 'object' && !Array.isArray(petRow) ? petRow : {}
  return {
    id:      String(data.id),
    time:    String((data as any).scheduled_time ?? '').slice(0, 5),
    petName: String(pet.name ?? ''),
    petId:   String((data as any).pet_id ?? ''),
    notes:   String((data as any).notes ?? ''),
  }
}

// POST /api/kiosk/lookup
// Body: { q: string }  — Pet QR（TERRYMON-PET-{uuid}）、Member QR（TERRYMON-{uuid}）或手機號碼
export async function POST(req: NextRequest) {
  const { q } = await req.json()
  if (!q) return NextResponse.json({ member: null }, { status: 400 })

  const supabase = createAdminClient()
  const input = String(q).trim()

  // Pet QR Code: TERRYMON-PET-{uuid}
  if (input.startsWith('TERRYMON-PET-')) {
    const petId = input.replace('TERRYMON-PET-', '')
    const { data: petRow, error } = await supabase
      .from('pets')
      .select('*, member:members!member_id(*, pets(*))')
      .eq('id', petId)
      .maybeSingle()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (!petRow) return NextResponse.json({ member: null })

    const member = petRow.member ? mapMember(petRow.member) : null
    const preSelectedPet = mapPet(petRow)
    const todayAppointment = member ? await getTodayAppointment(supabase, member.id) : null
    return NextResponse.json({ member, preSelectedPet, todayAppointment })
  }

  // 條碼格式：TM-{handle}
  if (input.startsWith('TM-')) {
    const handle = input.replace(/^TM-/, '')
    const { data, error } = await supabase
      .from('members')
      .select('*, pets(*)')
      .eq('handle', handle)
      .maybeSingle()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (!data) return NextResponse.json({ member: null })
    const member = mapMember(data)
    const todayAppointment = await getTodayAppointment(supabase, member.id)
    return NextResponse.json({ member, todayAppointment })
  }

  // Member QR Code: TERRYMON-{uuid} or phone/email
  const isQr = input.startsWith('TERRYMON-')
  const memberId = isQr ? input.replace(/^TERRYMON-/, '').split('-').slice(0, 5).join('-') : null
  const phone = !isQr ? input.replace(/[-\s]/g, '') : null

  const base = supabase.from('members').select('*, pets(*)')
  const { data, error } = isQr
    ? await base.eq('id', memberId!).maybeSingle()
    : await base.or(`phone.eq.${phone},email.eq.${phone}`).maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ member: null })

  const member = mapMember(data)
  const todayAppointment = await getTodayAppointment(supabase, member.id)
  return NextResponse.json({ member, todayAppointment })
}
