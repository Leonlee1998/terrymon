import { createAdminClient } from '@/lib/supabase/server'
import type {
  DashboardStats, DashboardMetrics, RevenueBreakdownDay, TopStoreRow,
  MemberRow, PetRow, VendorRow, VendorStatus,
  StoreRow, GroomingStoreRow, StorePlacementRow, PlacementStatus, TransactionRow,
  OrgRow, OrgStatus, AuditLogRow, AdminAccountRow, AdminRole,
  FinanceSummary,
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
    id: s(r.id), memberId: s(r.member_id),
    memberName: m ? s(m.name) : undefined,
    memberEmail: m ? s(m.email) : undefined,
    storeId: r.store_id ? s(r.store_id) : undefined,
    type: s(r.type) as TransactionRow['type'],
    totalAmount: n(r.total_amount), balanceUsed: n(r.balance_used),
    pointsUsed: n(r.points_used), cardAmount: n(r.card_amount), cashAmount: n(r.cash_amount),
    balanceAfter: n(r.balance_after),
    paymentMethod: r.payment_method ? s(r.payment_method) : undefined,
    paymentGateway: r.payment_gateway ? s(r.payment_gateway) : undefined,
    gatewayTxId: r.gateway_tx_id ? s(r.gateway_tx_id) : undefined,
    note: r.note ? s(r.note) : undefined,
    settledAt: r.settled_at ? s(r.settled_at) : undefined,
    originalTxId: r.original_tx_id ? s(r.original_tx_id) : undefined,
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

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const sb = db()
  const firstOfMonth = new Date()
  firstOfMonth.setDate(1); firstOfMonth.setHours(0, 0, 0, 0)

  const [
    allMembers, vendorPending, orgPending, placementPending, stores,
    newThisMonth, activeTxs, balances, txs30d,
  ] = await Promise.all([
    sb.from('members').select('*', { count: 'exact', head: true }),
    sb.from('vendors').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    sb.from('organizations').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    sb.from('store_placements').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    sb.from('stores').select('*', { count: 'exact', head: true }),
    sb.from('members').select('*', { count: 'exact', head: true }).gte('created_at', firstOfMonth.toISOString()),
    sb.from('transactions').select('member_id').gte('created_at', daysAgoISO(7)).in('type', REVENUE_TYPES),
    sb.from('members').select('platform_balance'),
    sb.from('transactions').select('type, total_amount').gte('created_at', daysAgoISO(30)),
  ])

  const activeMembersThisWeek = new Set((activeTxs.data ?? []).map((t: Row) => s(t.member_id))).size
  const totalPlatformBalance = ((balances.data ?? []) as Row[]).reduce((sum, m) => sum + n(m.platform_balance), 0)

  let gmv30d = 0, refundAmount30d = 0, topupAmount30d = 0
  let topupCount30d = 0, revenueCount = 0, refundCount30d = 0
  for (const r of (txs30d.data ?? []) as Row[]) {
    const t = s(r.type); const amt = n(r.total_amount)
    if (t === 'service_payment' || t === 'order_payment') { gmv30d += amt; revenueCount++ }
    else if (t === 'refund') { refundAmount30d += amt; refundCount30d++ }
    else if (t === 'topup') { topupAmount30d += amt; topupCount30d++ }
  }

  return {
    memberCount: allMembers.count ?? 0,
    newMembersThisMonth: newThisMonth.count ?? 0,
    activeMembersThisWeek,
    vendorPendingCount: vendorPending.count ?? 0,
    orgPendingCount: orgPending.count ?? 0,
    placementPendingCount: placementPending.count ?? 0,
    gmv30d,
    netRevenue30d: gmv30d - refundAmount30d,
    refundRate30d: revenueCount > 0 ? (refundCount30d / revenueCount) * 100 : 0,
    refundAmount30d,
    topupAmount30d,
    topupCount30d,
    totalPlatformBalance,
    storeCount: stores.count ?? 0,
  }
}

export async function getRevenueBreakdown(days = 30): Promise<RevenueBreakdownDay[]> {
  const { data } = await db().from('transactions')
    .select('type, total_amount, created_at').gte('created_at', daysAgoISO(days))

  const buckets = new Map<string, RevenueBreakdownDay>()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10)
    buckets.set(d, { date: d, service: 0, order: 0, topup: 0, refund: 0 })
  }
  for (const r of (data ?? []) as Row[]) {
    const d = s(r.created_at).slice(0, 10)
    if (!buckets.has(d)) continue
    const b = buckets.get(d)!; const amt = n(r.total_amount)
    const t = s(r.type)
    if (t === 'service_payment') b.service += amt
    else if (t === 'order_payment') b.order += amt
    else if (t === 'topup') b.topup += amt
    else if (t === 'refund') b.refund += amt
  }
  return [...buckets.values()]
}

export async function getMemberGrowth(days = 30): Promise<{ date: string; count: number }[]> {
  const { data } = await db().from('members')
    .select('created_at').gte('created_at', daysAgoISO(days))

  const buckets = new Map<string, number>()
  for (let i = days - 1; i >= 0; i--) {
    buckets.set(new Date(Date.now() - i * 86400000).toISOString().slice(0, 10), 0)
  }
  for (const r of (data ?? []) as Row[]) {
    const d = s(r.created_at).slice(0, 10)
    if (buckets.has(d)) buckets.set(d, (buckets.get(d) ?? 0) + 1)
  }
  return [...buckets.entries()].map(([date, count]) => ({ date, count }))
}

export async function getTopStores(days = 30, limit = 10): Promise<TopStoreRow[]> {
  const { data: txs } = await db().from('transactions')
    .select('store_id, total_amount').gte('created_at', daysAgoISO(days))
    .in('type', REVENUE_TYPES).not('store_id', 'is', null)

  const map = new Map<string, { revenue: number; txCount: number }>()
  for (const r of (txs ?? []) as Row[]) {
    const id = s(r.store_id)
    const cur = map.get(id) ?? { revenue: 0, txCount: 0 }
    map.set(id, { revenue: cur.revenue + n(r.total_amount), txCount: cur.txCount + 1 })
  }
  const sorted = [...map.entries()].sort((a, b) => b[1].revenue - a[1].revenue).slice(0, limit)
  if (!sorted.length) return []

  const { data: stores } = await db().from('stores').select('id, name').in('id', sorted.map(([id]) => id))
  const nameMap = new Map((stores ?? []).map((st: Row) => [s(st.id), s(st.name)]))

  return sorted.map(([id, stat]) => ({
    storeName: nameMap.get(id) ?? `店鋪 ${id.slice(0, 6)}`,
    revenue: stat.revenue,
    txCount: stat.txCount,
  }))
}

export async function getMemberTierDist(): Promise<{ tier: string; count: number }[]> {
  const { data } = await db().from('members').select('tier')
  const counts: Record<string, number> = {}
  for (const r of (data ?? []) as Row[]) {
    const t = s(r.tier, 'basic'); counts[t] = (counts[t] ?? 0) + 1
  }
  return Object.entries(counts).map(([tier, count]) => ({ tier, count }))
}

// ---------- members ----------
const MEMBER_SORT_COLS = ['created_at', 'name', 'platform_balance', 'points', 'tier'] as const
type MemberSortCol = typeof MEMBER_SORT_COLS[number]

export async function listMembers(opts: {
  q?: string
  sort?: string
  order?: string
  limit?: number
  offset?: number
} = {}): Promise<{ rows: MemberRow[]; total: number }> {
  const col: MemberSortCol = (MEMBER_SORT_COLS as readonly string[]).includes(opts.sort ?? '')
    ? (opts.sort as MemberSortCol) : 'created_at'
  const asc = opts.order === 'asc'
  const limit = opts.limit ?? 50
  const offset = opts.offset ?? 0

  let q = db().from('members')
    .select('*, pets!member_id(count)', { count: 'exact' })
    .order(col, { ascending: asc })
    .range(offset, offset + limit - 1)

  if (opts.q?.trim()) {
    const term = `%${opts.q.trim()}%`
    q = q.or(`name.ilike.${term},phone.ilike.${term},email.ilike.${term}`)
  }
  const { data, error, count } = await q
  if (error) throw error
  return { rows: (data ?? []).map(toMember), total: count ?? 0 }
}

export async function getMemberDetail(id: string): Promise<{
  member: MemberRow; pets: PetRow[]; recentTx: TransactionRow[]
} | null> {
  const sb = db()
  const { data: m } = await sb.from('members').select('*, pets!member_id(count)').eq('id', id).maybeSingle()
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
const VENDOR_SORT_COLS = ['created_at', 'store_name', 'commission_rate', 'status'] as const
type VendorSortCol = typeof VENDOR_SORT_COLS[number]

export async function listVendors(opts: {
  status?: VendorStatus
  q?: string
  sort?: string
  order?: string
  limit?: number
  offset?: number
} = {}): Promise<{ rows: VendorRow[]; total: number }> {
  const col: VendorSortCol = (VENDOR_SORT_COLS as readonly string[]).includes(opts.sort ?? '')
    ? (opts.sort as VendorSortCol) : 'created_at'
  const asc = opts.order === 'asc'
  const limit = opts.limit ?? 50
  const offset = opts.offset ?? 0

  let q = db().from('vendors')
    .select('*', { count: 'exact' })
    .order(col, { ascending: asc })
    .range(offset, offset + limit - 1)

  if (opts.status) q = q.eq('status', opts.status)
  if (opts.q?.trim()) {
    const term = `%${opts.q.trim()}%`
    q = q.or(`store_name.ilike.${term},owner_name.ilike.${term},email.ilike.${term},tax_id.ilike.${term}`)
  }
  const { data, error, count } = await q
  if (error) throw error
  return { rows: (data ?? []).map(toVendor), total: count ?? 0 }
}

export async function getVendor(id: string): Promise<VendorRow | null> {
  const { data } = await db().from('vendors').select('*').eq('id', id).maybeSingle()
  return data ? toVendor(data as Row) : null
}

// ---------- stores（stores + grooming_stores 並存）----------
export async function listStores(q?: string): Promise<{
  stores: StoreRow[]; groomingStores: GroomingStoreRow[]
}> {
  const sb = db()
  let storeQ = sb.from('stores').select('*').order('created_at', { ascending: false })
  let gstoreQ = sb.from('grooming_stores').select('*').order('created_at', { ascending: false })
  if (q?.trim()) {
    const term = `%${q.trim()}%`
    storeQ = storeQ.or(`name.ilike.${term},address.ilike.${term}`)
    gstoreQ = gstoreQ.or(`name.ilike.${term},city.ilike.${term},address.ilike.${term}`)
  }
  const [{ data: stores }, { data: gstores }] = await Promise.all([storeQ, gstoreQ])
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
const PLACEMENT_SORT_COLS = ['created_at', 'status', 'listing_fee', 'commission_rate'] as const
type PlacementSortCol = typeof PLACEMENT_SORT_COLS[number]

export async function listPlacements(opts: {
  status?: PlacementStatus
  sort?: string
  order?: string
  limit?: number
  offset?: number
} = {}): Promise<{ rows: StorePlacementRow[]; total: number }> {
  const col: PlacementSortCol = (PLACEMENT_SORT_COLS as readonly string[]).includes(opts.sort ?? '')
    ? (opts.sort as PlacementSortCol) : 'created_at'
  const asc = opts.order === 'asc'
  const limit = opts.limit ?? 50
  const offset = opts.offset ?? 0

  let q = db().from('store_placements')
    .select('*, vendors(store_name), grooming_stores(name)', { count: 'exact' })
    .order(col, { ascending: asc })
    .range(offset, offset + limit - 1)

  if (opts.status) q = q.eq('status', opts.status)

  const { data, error, count } = await q
  if (error) throw error
  return {
    rows: (data ?? []).map((r: Row) => {
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
    }),
    total: count ?? 0,
  }
}

// ---------- finance / transactions ----------
export type TxFilter = {
  type?: string
  from?: string
  to?: string
  search?: string   // member name/email or gateway_tx_id
  limit?: number
  offset?: number
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyTxFilters<T>(q: T, opts: TxFilter): T {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = q as any
  if (opts.type) query = query.eq('type', opts.type)
  if (opts.from) query = query.gte('created_at', opts.from)
  if (opts.to)   query = query.lte('created_at', opts.to + 'T23:59:59')
  if (opts.search?.trim()) {
    const t = `%${opts.search.trim()}%`
    query = query.or(`gateway_tx_id.ilike.${t},members.name.ilike.${t},members.email.ilike.${t}`)
  }
  return query as T
}

export async function listTransactions(opts: TxFilter = {}): Promise<{
  rows: TransactionRow[]
  total: number
}> {
  const limit  = opts.limit  ?? 50
  const offset = opts.offset ?? 0

  let q = db().from('transactions')
    .select('*, members(name, email)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  q = applyTxFilters(q, opts)

  const { data, error, count } = await q
  if (error) throw error
  return { rows: (data ?? []).map(toTransaction), total: count ?? 0 }
}

export async function listTransactionsAll(opts: Omit<TxFilter, 'limit' | 'offset'> = {}): Promise<TransactionRow[]> {
  let q = db().from('transactions')
    .select('*, members(name, email)')
    .order('created_at', { ascending: false })
  q = applyTxFilters(q, opts)
  const { data, error } = await q
  if (error) throw error
  return (data ?? []).map(toTransaction)
}

const REVENUE_TYPES_SET = new Set(REVENUE_TYPES)

export async function getFinanceSummary(opts: Omit<TxFilter, 'limit' | 'offset'> = {}): Promise<FinanceSummary> {
  let q = db().from('transactions')
    .select('type, total_amount, card_amount, settled_at')
  q = applyTxFilters(q, opts)
  const { data } = await q
  const rows = (data ?? []) as Row[]

  let totalIn = 0, totalRefund = 0, pendingSettlement = 0
  for (const r of rows) {
    const t = s(r.type)
    const amt = n(r.total_amount)
    if (REVENUE_TYPES_SET.has(t)) totalIn += amt
    if (t === 'refund') totalRefund += amt
    if (n(r.card_amount) > 0 && !r.settled_at) pendingSettlement += n(r.card_amount)
  }
  return { totalIn, totalRefund, pendingSettlement, txCount: rows.length }
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

const ORG_SORT_COLS = ['applied_at', 'name', 'status', 'type'] as const
type OrgSortCol = typeof ORG_SORT_COLS[number]

export async function listOrganizations(opts: {
  status?: OrgStatus
  q?: string
  sort?: string
  order?: string
  limit?: number
  offset?: number
} = {}): Promise<{ rows: OrgRow[]; total: number }> {
  const col: OrgSortCol = (ORG_SORT_COLS as readonly string[]).includes(opts.sort ?? '')
    ? (opts.sort as OrgSortCol) : 'applied_at'
  const asc = opts.order === 'asc'
  const limit = opts.limit ?? 50
  const offset = opts.offset ?? 0

  let q = db().from('organizations')
    .select('*, members(name, email, phone)', { count: 'exact' })
    .order(col, { ascending: asc })
    .range(offset, offset + limit - 1)

  if (opts.status) q = q.eq('status', opts.status)
  if (opts.q?.trim()) {
    const term = `%${opts.q.trim()}%`
    q = q.or(`name.ilike.${term},phone.ilike.${term},address.ilike.${term}`)
  }
  const { data, error, count } = await q
  if (error) throw error
  return { rows: (data ?? []).map(toOrg), total: count ?? 0 }
}

// ---------- audit log ----------
export async function listAuditLogs(opts: {
  adminId?: string
  action?: string
  from?: string
  to?: string
  limit?: number
  offset?: number
} = {}): Promise<{ rows: AuditLogRow[]; total: number }> {
  let q = db().from('admin_audit_log')
    .select('*, platform_admins(name, email)', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (opts.adminId) q = q.eq('admin_id', opts.adminId)
  if (opts.action) q = q.eq('action', opts.action)
  if (opts.from) q = q.gte('created_at', opts.from)
  if (opts.to) q = q.lte('created_at', opts.to)

  const limit = opts.limit ?? 50
  const offset = opts.offset ?? 0
  q = q.range(offset, offset + limit - 1)

  const { data, error, count } = await q
  if (error) throw error

  return {
    rows: (data ?? []).map((r: Row) => {
      const a = r.platform_admins as Row | null
      return {
        id: s(r.id),
        adminId: r.admin_id ? s(r.admin_id) : null,
        adminName: a ? s(a.name) : undefined,
        adminEmail: a ? s(a.email) : undefined,
        action: s(r.action),
        targetTable: r.target_table ? s(r.target_table) : null,
        targetId: r.target_id ? s(r.target_id) : null,
        payload: (r.payload ?? {}) as Record<string, unknown>,
        createdAt: s(r.created_at),
      }
    }),
    total: count ?? 0,
  }
}

// ---------- platform_admins ----------
export async function listAdmins(): Promise<AdminAccountRow[]> {
  const { data, error } = await db().from('platform_admins')
    .select('*').order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map((r: Row) => ({
    id: s(r.id),
    supabaseUid: r.supabase_uid ? s(r.supabase_uid) : null,
    name: s(r.name),
    email: s(r.email),
    role: s(r.role) as AdminRole,
    isActive: Boolean(r.is_active),
    createdAt: s(r.created_at),
  }))
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
