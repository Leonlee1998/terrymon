import crypto from 'crypto'

// ECPay AIO CheckMacValue (SHA256) — server-only
// Ref: ECPay-API-Skill/guides/13-checkmacvalue.md §TypeScript

function ecpayUrlEncode(source: string): string {
  let encoded = encodeURIComponent(source)
    .replace(/%20/g, '+')
    .replace(/~/g, '%7e')
    .replace(/'/g, '%27')
  encoded = encoded.toLowerCase()
  const map: Record<string, string> = {
    '%2d': '-', '%5f': '_', '%2e': '.', '%21': '!',
    '%2a': '*', '%28': '(', '%29': ')',
  }
  for (const [old, ch] of Object.entries(map)) {
    encoded = encoded.split(old).join(ch)
  }
  return encoded
}

export function generateCheckMacValue(
  params: Record<string, string>,
  hashKey: string,
  hashIv: string,
): string {
  const filtered = Object.fromEntries(
    Object.entries(params).filter(([k]) => k !== 'CheckMacValue')
  )
  const sorted = Object.keys(filtered)
    .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
  const paramStr = sorted.map(k => `${k}=${filtered[k]}`).join('&')
  const raw = `HashKey=${hashKey}&${paramStr}&HashIV=${hashIv}`
  return crypto.createHash('sha256').update(ecpayUrlEncode(raw), 'utf8').digest('hex').toUpperCase()
}

export function verifyCheckMacValue(
  params: Record<string, string>,
  hashKey: string,
  hashIv: string,
): boolean {
  const received = params.CheckMacValue ?? ''
  const calculated = generateCheckMacValue(params, hashKey, hashIv)
  const a = Buffer.from(received)
  const b = Buffer.from(calculated)
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(a, b)
}

export function buildEcpayParams(params: Record<string, string>): Record<string, string> {
  const hashKey = process.env.ECPAY_HASH_KEY!
  const hashIv = process.env.ECPAY_HASH_IV!
  return { ...params, CheckMacValue: generateCheckMacValue(params, hashKey, hashIv) }
}

export function getTaiwanTradeDate(): string {
  const tw = new Date(Date.now() + 8 * 3600 * 1000)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${tw.getUTCFullYear()}/${pad(tw.getUTCMonth() + 1)}/${pad(tw.getUTCDate())} ${pad(tw.getUTCHours())}:${pad(tw.getUTCMinutes())}:${pad(tw.getUTCSeconds())}`
}
