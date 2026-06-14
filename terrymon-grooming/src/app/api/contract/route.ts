import { NextRequest, NextResponse } from 'next/server'
import { generateContractPDF } from '@/lib/contract/generator'
import { createAdminClient } from '@/lib/supabase/server'
import type { ContractData } from '@/lib/contract/types'

export async function POST(req: NextRequest) {
  try {
    const data: ContractData = await req.json()

    const pdfBuffer = await generateContractPDF(data)

    const supabase  = createAdminClient()
    const fileName  = `${data.memberId}-${Date.now()}.pdf`
    const storagePath = `contracts/${data.memberId}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('contracts')
      .upload(storagePath, pdfBuffer, {
        contentType: 'application/pdf',
        upsert:      false,
      })

    if (uploadError) throw new Error('Storage 上傳失敗：' + uploadError.message)

    const { data: urlData, error: urlError } = await supabase.storage
      .from('contracts')
      .createSignedUrl(storagePath, 60 * 60 * 24 * 7)

    if (urlError) throw new Error('URL 產生失敗：' + urlError.message)

    return NextResponse.json({
      success: true,
      url:  urlData.signedUrl,
      path: storagePath,
    })
  } catch (err) {
    console.error('[CONTRACT API]', err)
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 }
    )
  }
}
