import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { message } = await req.json() as { message: string }
  const token = process.env.LINE_NOTIFY_TOKEN

  if (!token) {
    console.log('[LINE Notify] token not set — mock send:', message.slice(0, 80))
    return NextResponse.json({ ok: true, mock: true })
  }

  const res = await fetch('https://notify-api.line.me/api/notify', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ message }).toString(),
  })

  const status = res.status
  return NextResponse.json({ ok: status === 200, status })
}
