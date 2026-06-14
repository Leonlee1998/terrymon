import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyCheckMacValue } from '@/lib/ecpay'

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

// ECPay server-to-server ReturnURL — must respond with plain text "1|OK"
export async function POST(req: NextRequest) {
  const text = await req.text()
  const params = Object.fromEntries(new URLSearchParams(text))

  const hashKey = process.env.ECPAY_HASH_KEY!
  const hashIv = process.env.ECPAY_HASH_IV!

  if (!verifyCheckMacValue(params, hashKey, hashIv)) {
    return new NextResponse('0|CheckMacValue Error', {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    })
  }

  const { RtnCode, CustomField1: orderId } = params

  if (RtnCode === '1' && orderId) {
    const admin = getAdminClient()
    await admin
      .from('orders')
      .update({ status: 'paid' })
      .eq('id', orderId)
      .eq('status', 'pending')
  }

  return new NextResponse('1|OK', {
    status: 200,
    headers: { 'Content-Type': 'text/plain' },
  })
}
