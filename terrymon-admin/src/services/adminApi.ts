import { createAdminClient } from '@/lib/supabase/server'
import type {
  DashboardStats, MemberRow, PetRow, VendorRow, VendorStatus,
  StoreRow, GroomingStoreRow, StorePlacementRow, TransactionRow,
  OrgRow, OrgStatus,
} from '@/types'

// 所有讀取一律走 service_role（繞 RLS，跨租戶）。只在 Server Component 內呼叫。
const db = () => createAdminClient()

const REVENUE_TYPES = ['service_payment', 'order_payment']
const daysAgoISO = (days: number) =>
  new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

// ---------- mappers ----------
type Row = Record<string, unknown>
const s = (v: unknown, d = '') => (v == null ? d : String(v))
const n = (v: unknown) => (v == null ? 0 : Number(v))

function toMember(r: Row): MemberRow {
  const pets = r.pets as Array<{ count: number }> | undefined
  return {
    id: s(r.id), name: s(r.name), phone: s(r.phone), email: s(r.email),
    avatarUrl: r.avatar_url ? s(r.avatar_url) : undefined,
    platformBalance: n(r.platform_balance), points: n(r.points),
    tier: s(r.tier, 'basic') as MemberRow['tier'],
    petCount: pets?.[0]?.count ?? 0,
    createdAt: s(r.created_at),
  }
}

function toVendor(r: Row): VendorRow {
  return {
    id: s(r.id), storeName: s(r.store_name), ownerName: s(r.owner_name),
    email: s(r.email), phone: r.phone ? s(r.phone) : undefined,
    status: s(r.status, 'pending') as VendorStatus,
    commissionRate: n(r.commission_rate), taxId: r.tax_id ? s(r.tax_id) : undefined,
    createdAt: s(r.created_at),
  }
}

function toTransaction(r: Row): TransactionRow {
  const m = r.members as Row | null
  return {
    id: s(r.id), memberId: s(r.member_id), memberName: m ? s(m.name) : undefined,
    storeId: r.store_id ? s(r.store_id) : undefined,
    type: s(r.type) as TransactionRow['type'],
    totalAmount: n(r.total_amount), balanceUsed: n(r.balance_used),
    pointsUsed: n(r.points_used), cardAmount: n(r.card_amount), cashAmount: n(r.cash_amount),
    paymentMethod: r.payment_method ? s(r.payment_method) : undefined,
    paymentGateway: r.payment_gateway ? s(r.payment_gateway) : undefined,
    gatewayTxId: r.gateway_tx_id ? s(r.gateway_tx_id) : undefined,
    note: r.note ? s(r.note) : undefined,
    createdAt: s(r.created_at),
  }
}

// ---------- dashboard ----------
export async function getDashboardStats(): Promise<DashboardStats> {
  const sb = db()
  const [members, vendorsPending, stores, tx] = await Promise.all([
    sb.from('members').select('*', { count: 'exact', head: true }),
    sb.from('vendors').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    sb.from('stores').select('*', { count: 'exact', head: true }),
    sb.from('transactions').select('type, total_amount').gte('created_at', daysAgoISO(30)),
  ])
  const rows = (tx.data ?? []) as Row[]
  const revenue30d = rows
    .filter(r => REVENUE_TYPES.includes(s(r.type)))
    .reduce((sum, r) => sum + n(r.total_amount), 0)
  const topupCount30d = rows.filter(r => s(r.type) === 'topup').length

  return {
    memberCount: members.count ?? 0,
    vendorPendingCount: vendorsPending.count ?? 0,
    storeCount: stores.count ?? 0,
    revenue30d,
    topupCount30d,
  }
}

// ---------- members ----------
export async function listMembers(search?: string): Promise<MemberRow[]> {
  let q = db().from('members').select('*, pets(count)').order('created_at', { ascending: false }).limit(100)
  if (search?.trim()) {
    const term = `%${search.trim()}%`
    q = q.or(`name.ilike.${term},phone.ilike.${term},email.ilike.${term}`)
  }
  const { data, error } = await q
  if (error) throw error
  return (data ?? []).map(toMember)
}

export async function getMemberDetail(id: string): Promise<{
  member: MemberRow; pets: PetRow[]; recentTx: TransactionRow[]
} | null> {
  const sb = db()
  const { data: m } = await sb.from('members').select('*, pets(count)').eq('id', id).maybeSingle()
  if (!m) return null
  const [{ data: pets }, { data: tx }] = await Promise.all([
    sb.from('pets').select('id, name, species, breed, is_active').eq('member_id', id),
    sb.from('transactions').select('*, members(name)').eq('member_id', id)
      .order('created_at', { ascending: false }).limit(20),
  ])
  return {
    member: toMember(m as Row),
    pets: (pets ?? []).map((p: Row) => ({
      id: s(p.id), name: s(p.name), species: s(p.species) as PetRow['species'],
      breed: s(p.breed), isActive: Boolean(p.is_active),
    })),
    recentTx: (tx ?? []).map(toTransaction),
  }
}

// ---------- vendors ----------
export async function listVendors(status?: VendorStatus): Promise<VendorRow[]> {
  let q = db().from('vendors').select('*').order('created_at', { ascending: false })
  if (status) q = q.eq('status', status)
  const { data, error } = await q
  if (error) throw error
  return (data ?? []).map(toVendor)
}

export async function getVendor(id: string): Promise<VendorRow | null> {
  const { data } = await db().from('vendors').select('*').eq('id', id).maybeSingle()
  return data ? toVendor(data as Row) : null
}

// ---------- stores（stores + grooming_stores 並存）----------
export async function listStores(): Promise<{
  stores: StoreRow[]; groomingStores: GroomingStoreRow[]
}> {
  const sb = db()
  const [{ data: stores }, { data: gstores }] = await Promise.all([
    sb.from('stores').select('*').order('created_at', { ascending: false }),
    sb.from('grooming_stores').select('*').order('created_at', { ascending: false }),
  ])
  return {
    stores: (stores ?? []).map((r: Row) => ({
      id: s(r.id), type: s(r.type) as StoreRow['type'],
      ownerType: s(r.owner_type, 'platform') as StoreRow['ownerType'],
      name: s(r.name), address: r.address ? s(r.address) : undefined,
      phone: r.phone ? s(r.phone) : undefined, isActive: Boolean(r.is_active),
      createdAt: s(r.created_at),
    })),
    groomingStores: (gstores ?? []).map((r: Row) => ({
      id: s(r.id), name: s(r.name), address: r.address ? s(r.address) : undefined,
      city: r.city ? s(r.city) : undefined,
      status: s(r.status, 'active') as GroomingStoreRow['status'],
      createdAt: s(r.created_at),
    })),
  }
}

// ---------- store placements（開通實體店鋪）----------
export async function listPlacements(): Promise<StorePlacementRow[]> {
  const { data, error } = await db()
    .from('store_placements')
    .select('*, vendors(store_name), grooming_stores(name)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map((r: Row) => {
    const v = r.vendors as Row | null
    const g = r.grooming_stores as Row | null
    return {
      id: s(r.id), vendorId: s(r.vendor_id), vendorName: v ? s(v.store_name) : undefined,
      storeId: s(r.store_id), storeName: g ? s(g.name) : undefined,
      status: s(r.status, 'pending') as StorePlacementRow['status'],
      note: r.note ? s(r.note) : undefined, adminNote: r.admin_note ? s(r.admin_note) : undefined,
      listingFee: n(r.listing_fee), commissionRate: n(r.commission_rate),
      approvedAt: r.approved_at ? s(r.approved_at) : undefined,
      createdAt: s(r.created_at),
    }
  })
}

// ---------- finance / transactions ----------
export async function listTransactions(opts: {
  type?: string; from?: string; to?: string
} = {}): Promise<TransactionRow[]> {
  let q = db().from('transactions').select('*, members(name)')
    .order('created_at', { ascending: false }).limit(200)
  if (opts.type) q = q.eq('type', opts.type)
  if (opts.from) q = q.gte('created_at', opts.from)
  if (opts.to) q = q.lte('created_at', opts.to)
  const { data, error } = await q
  if (error) throw error
  return (data ?? []).map(toTransaction)
}

// ---------- organizations（機構 / 中途審核）----------
function toOrg(r: Row): OrgRow {
  const m = r.members as Row | null
  return {
    id: s(r.id),
    memberName: m ? s(m.name) : '',
    memberEmail: m ? s(m.email) : '',
    memberPhone: m ? s(m.phone) : '',
    name: s(r.name),
    type: s(r.type, 'individual') as OrgRow['type'],
    description: r.description ? s(r.description) : undefined,
    phone: r.phone ? s(r.phone) : undefined,
    address: r.address ? s(r.address) : undefined,
    logoUrl: r.logo_url ? s(r.logo_url) : undefined,
    certUrl: r.cert_url ? s(r.cert_url) : undefined,
    status: s(r.status, 'pending') as OrgStatus,
    appliedAt: s(r.applied_at),
    approvedAt: r.approved_at ? s(r.approved_at) : undefined,
  }
}

export async function listOrganizations(status?: OrgStatus): Promise<OrgRow[]> {
  let q = db().from('organizations')
    .select('*, members(name, email, phone)')
    .order('applied_at', { ascending: false })
  if (status) q = q.eq('status', status)
  const { data, error } = await q
  if (error) throw error
  return (data ?? []).map(toOrg)
}

// ---------- reports：近 N 天每日營收 ----------
export async function getRevenueByDay(days = 30): Promise<{ date: string; amount: number }[]> {
  const { data } = await db().from('transactions')
    .select('type, total_amount, created_at').gte('created_at', daysAgoISO(days))
  const buckets = new Map<string, number>()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10)
    buckets.set(d, 0)
  }
  for (const r of (data ?? []) as Row[]) {
    if (!REVENUE_TYPES.includes(s(r.type))) continue
    const d = s(r.created_at).slice(0, 10)
    if (buckets.has(d)) buckets.set(d, (buckets.get(d) ?? 0) + n(r.total_amount))
  }
  return [...buckets.entries()].map(([date, amount]) => ({ date, amount }))
}
