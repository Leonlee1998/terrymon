import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { buildEcpayParams, getTaiwanTradeDate } from '@/lib/ecpay'

const ECPAY_URL = (process.env.ECPAY_BASE_URL ?? 'https://payment-stage.ecpay.com.tw') + '/Cashier/AioCheckOut/V5'
const APP_HOST = process.env.NEXT_PUBLIC_APP_URL ?? ''

const PAYMENT_MAP: Record<string, string> = {
  credit: 'Credit',
  atm: 'ATM',
  cvs: 'CVS',
}

export async function POST(req: NextRequest) {
  const { orderId, paymentMethod } = (await req.json()) as {
    orderId: string
    paymentMethod: string
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: member } = await supabase
    .from('members')
    .select('id')
    .eq('supabase_uid', user.id)
    .single()
  if (!member) return NextResponse.json({ error: 'Member not found' }, { status: 404 })

  const { data: order } = await supabase
    .from('orders')
    .select('id, total_price')
    .eq('id', orderId)
    .eq('member_id', member.id)
    .single()
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

  const { data: orderItems } = await supabase
    .from('order_items')
    .select('quantity, product_name')
    .eq('order_id', orderId)

  type ItemRow = { quantity: number; product_name: string | null }
  const itemName = ((orderItems as ItemRow[] | null) ?? [])
    .map(i => `${i.product_name ?? '商品'} x${i.quantity}`)
    .join('#')
    .slice(0, 200) || 'TerryMon 寵物商品'

  const tradeNo = ('TM' + Date.now().toString(36).toUpperCase()).slice(0, 20)

  const params = buildEcpayParams({
    MerchantID: process.env.ECPAY_MERCHANT_ID!,
    MerchantTradeNo: tradeNo,
    MerchantTradeDate: getTaiwanTradeDate(),
    PaymentType: 'aio',
    TotalAmount: String(Math.round(order.total_price)),
    TradeDesc: 'TerryMon 商城',
    ItemName: itemName,
    ReturnURL: `${APP_HOST}/api/ecpay/notify`,
    ChoosePayment: PAYMENT_MAP[paymentMethod] ?? 'Credit',
    EncryptType: '1',
    ClientBackURL: `${APP_HOST}/shop/orders/${orderId}`,
    OrderResultURL: `${APP_HOST}/api/ecpay/result`,
    CustomField1: orderId,
  })

  return NextResponse.json({ actionUrl: ECPAY_URL, params })
}
