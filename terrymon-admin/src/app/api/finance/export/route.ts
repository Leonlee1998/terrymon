import { NextRequest, NextResponse } from 'next/server'
import { getCurrentAdmin } from '@/lib/auth'
import { listTransactionsAll } from '@/services/adminApi'
import { TX_TYPE_LABEL } from '@/lib/labels'
import type { TransactionType } from '@/types'

function escapeCsv(v: string | number | undefined | null): string {
  if (v == null) return ''
  const str = String(v)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export async function GET(req: NextRequest) {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sp = req.nextUrl.searchParams
  const opts = {
    type: sp.get('type') ?? undefined,
    from: sp.get('from') ?? undefined,
    to: sp.get('to') ?? undefined,
    search: sp.get('search') ?? undefined,
  }

  const rows = await listTransactionsAll(opts)

  const headers = [
    '交易ID', '時間', '會員姓名', '會員Email',
    '類型', '金額', '刷卡金額', '餘額扣抵', '點數折抵',
    '付款方式', '金流商', '金流單號', '結算時間', '備註',
  ]

  const lines = [
    headers.join(','),
    ...rows.map(r => [
      escapeCsv(r.id),
      escapeCsv(new Date(r.createdAt).toLocaleString('zh-TW', { hour12: false })),
      escapeCsv(r.memberName),
      escapeCsv(r.memberEmail),
      escapeCsv(TX_TYPE_LABEL[r.type as TransactionType] ?? r.type),
      escapeCsv(r.totalAmount),
      escapeCsv(r.cardAmount || ''),
      escapeCsv(r.balanceUsed || ''),
      escapeCsv(r.pointsUsed || ''),
      escapeCsv(r.paymentMethod),
      escapeCsv(r.paymentGateway),
      escapeCsv(r.gatewayTxId),
      escapeCsv(r.settledAt ? new Date(r.settledAt).toLocaleString('zh-TW', { hour12: false }) : ''),
      escapeCsv(r.note),
    ].join(',')),
  ]

  // BOM for Excel UTF-8 compatibility
  const csv = '﻿' + lines.join('\r\n')

  const filename = `finance_${new Date().toISOString().slice(0, 10)}.csv`
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
