import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

// POST /api/storage/upload
// FormData: signature (File, image/png) + contract? (File, application/pdf)
// Returns: { signatureUrl: string, contractUrl: string | null }
export async function POST(req: NextRequest) {
  const form = await req.formData()
  const signatureFile = form.get('signature') as File | null
  const contractFile  = form.get('contract')  as File | null

  if (!signatureFile) {
    return NextResponse.json({ error: 'signature file required' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const id = crypto.randomUUID()

  // Upload signature PNG
  const sigBytes = await signatureFile.arrayBuffer()
  const { error: sigErr } = await supabase.storage
    .from('signatures')
    .upload(`${id}.png`, sigBytes, { contentType: 'image/png', upsert: false })
  if (sigErr) return NextResponse.json({ error: sigErr.message }, { status: 500 })

  const { data: sigData } = supabase.storage.from('signatures').getPublicUrl(`${id}.png`)

  // Upload contract PDF (optional — silently skip on error)
  let contractUrl: string | null = null
  if (contractFile) {
    const pdfBytes = await contractFile.arrayBuffer()
    const { error: pdfErr } = await supabase.storage
      .from('contracts')
      .upload(`${id}.pdf`, pdfBytes, { contentType: 'application/pdf', upsert: false })
    if (!pdfErr) {
      const { data: pdfData } = supabase.storage.from('contracts').getPublicUrl(`${id}.pdf`)
      contractUrl = pdfData.publicUrl
    }
  }

  return NextResponse.json({ signatureUrl: sigData.publicUrl, contractUrl })
}
