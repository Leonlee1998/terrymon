import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type PetBody = {
  name?: string
  species?: 'dog' | 'cat' | 'other'
  breed_id?: string | null
  breed?: string
  birth_date?: string | null
  weight?: number | null
  photo_url?: string
  allergies?: string[]
  chip_id?: string | null
  gender?: 'male' | 'female' | null
  is_neutered?: boolean | null
  blood_type?: string | null
  caregiver?: string | null
  notes?: string
}

function toPet(row: Record<string, unknown>) {
  return {
    id: String(row.id),
    memberId: String(row.member_id),
    name: String(row.name ?? ''),
    species: String(row.species ?? 'other'),
    breedId: typeof row.breed_id === 'string' ? row.breed_id : undefined,
    breed: String(row.breed ?? ''),
    birthDate: String(row.birth_date ?? ''),
    weight: Number(row.weight ?? 0),
    photoUrl: String(row.photo_url ?? ''),
    allergies: Array.isArray(row.allergies) ? row.allergies : [],
    chipId: typeof row.chip_id === 'string' ? row.chip_id : undefined,
    primaryCaregiverId: typeof row.primary_caregiver_id === 'string' ? row.primary_caregiver_id : undefined,
    gender: (row.gender === 'male' || row.gender === 'female') ? row.gender : undefined,
    isNeutered: typeof row.is_neutered === 'boolean' ? row.is_neutered : undefined,
    bloodType: typeof row.blood_type === 'string' ? row.blood_type : undefined,
    caregiver: typeof row.caregiver === 'string' ? row.caregiver : undefined,
    notes: String(row.notes ?? ''),
    isActive: Boolean(row.is_active ?? true),
  }
}

async function getMemberId(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null

  const { data: member } = await supabase
    .from('members')
    .select('id')
    .eq('supabase_uid', user.id)
    .single()

  return member ? String(member.id) : null
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const memberId = await getMemberId(supabase)
    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json() as PetBody
    const name = body.name?.trim()
    const species = body.species ?? 'other'

    if (!name || !['dog', 'cat', 'other'].includes(species)) {
      return NextResponse.json({ error: 'Invalid pet payload' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('pets')
      .update({
        name,
        species,
        breed_id: body.breed_id || null,
        breed: body.breed?.trim() ?? '',
        birth_date: body.birth_date || null,
        weight: body.weight ?? null,
        photo_url: body.photo_url?.trim() ?? '',
        allergies: body.allergies ?? [],
        chip_id: body.chip_id || null,
        gender: body.gender ?? null,
        is_neutered: body.is_neutered ?? null,
        blood_type: body.blood_type?.trim() || null,
        caregiver: body.caregiver?.trim() || null,
        notes: body.notes?.trim() ?? '',
      })
      .eq('id', id)
      .eq('member_id', memberId)
      .select('*')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(toPet(data))
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Update pet failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const memberId = await getMemberId(supabase)
    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await supabase
      .from('pets')
      .update({ is_active: false })
      .eq('id', id)
      .eq('member_id', memberId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Archive pet failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
