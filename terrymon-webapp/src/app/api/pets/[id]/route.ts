import { NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { createClient as createRouteClient } from '@/lib/supabase/server'

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

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(/^\uFEFF/, '')
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim().replace(/^\uFEFF/, '')

  if (!url || !serviceRoleKey) {
    throw new Error('Supabase server environment is not configured')
  }

  return createAdminClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
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
    gender: (row.gender === 'male' || row.gender === 'female') ? row.gender : undefined,
    isNeutered: typeof row.is_neutered === 'boolean' ? row.is_neutered : undefined,
    bloodType: typeof row.blood_type === 'string' ? row.blood_type : undefined,
    caregiver: typeof row.caregiver === 'string' ? row.caregiver : undefined,
    notes: String(row.notes ?? ''),
    isActive: Boolean(row.is_active ?? true),
  }
}

async function getMemberIdForSession() {
  const routeClient = await createRouteClient()
  const { data: userData, error: userError } = await routeClient.auth.getUser()

  if (userError || !userData.user) {
    return null
  }

  const admin = getAdminClient()
  const { data: member, error } = await admin
    .from('members')
    .select('id')
    .eq('supabase_uid', userData.user.id)
    .single()

  if (error || !member) {
    return null
  }

  return String(member.id)
}

async function assertPetOwner(petId: string, memberId: string) {
  const admin = getAdminClient()
  const { data, error } = await admin
    .from('pets')
    .select('id')
    .eq('id', petId)
    .eq('member_id', memberId)
    .single()

  return !error && Boolean(data)
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const memberId = await getMemberIdForSession()
    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!(await assertPetOwner(id, memberId))) {
      return NextResponse.json({ error: 'Pet not found' }, { status: 404 })
    }

    const body = await request.json() as PetBody
    const name = body.name?.trim()
    const species = body.species ?? 'other'

    if (!name || !['dog', 'cat', 'other'].includes(species)) {
      return NextResponse.json({ error: 'Invalid pet payload' }, { status: 400 })
    }

    const admin = getAdminClient()
    const { data, error } = await admin
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
    const memberId = await getMemberIdForSession()
    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!(await assertPetOwner(id, memberId))) {
      return NextResponse.json({ error: 'Pet not found' }, { status: 404 })
    }

    const admin = getAdminClient()
    const { error } = await admin
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
