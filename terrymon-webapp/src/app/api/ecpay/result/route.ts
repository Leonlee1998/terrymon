import { NextRequest, NextResponse } from 'next/server'

// ECPay OrderResultURL — receives browser POST after payment, redirects to order page
export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const orderId = (formData.get('CustomField1') as string) ?? ''
  const rtnCode = (formData.get('RtnCode') as string) ?? '0'
  const appHost = process.env.NEXT_PUBLIC_APP_URL ?? `${req.nextUrl.protocol}//${req.nextUrl.host}`

  const path = orderId
    ? `/shop/orders/${orderId}?payment=${rtnCode === '1' ? 'success' : 'fail'}`
    : '/shop'

  return NextResponse.redirect(new URL(path, appHost), { status: 303 })
}
