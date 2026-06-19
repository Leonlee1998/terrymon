export type AdminRole = 'super_admin' | 'ops' | 'finance' | 'support'

export interface PlatformAdmin {
  id: string
  supabaseUid: string
  name: string
  email: string
  role: AdminRole
  isActive: boolean
}

export type MemberTier = 'basic' | 'silver' | 'gold'

export interface MemberRow {
  id: string
  name: string
  phone: string
  email: string
  avatarUrl?: string
  platformBalance: number
  points: number
  tier: MemberTier
  petCount: number
  createdAt: string
}

export interface PetRow {
  id: string
  name: string
  species: 'dog' | 'cat' | 'other'
  breed: string
  isActive: boolean
}

export type VendorStatus = 'pending' | 'approved' | 'suspended'

export interface VendorRow {
  id: string
  storeName: string
  ownerName: string
  email: string
  phone?: string
  status: VendorStatus
  commissionRate: number
  taxId?: string
  createdAt: string
}

export type StoreType = 'grooming' | 'vet' | 'shop'

export interface StoreRow {
  id: string
  type: StoreType
  ownerType: 'platform' | 'franchise'
  name: string
  address?: string
  phone?: string
  isActive: boolean
  createdAt: string
}

export interface GroomingStoreRow {
  id: string
  name: string
  address?: string
  city?: string
  status: 'active' | 'inactive'
  createdAt: string
}

export type PlacementStatus = 'pending' | 'approved' | 'rejected' | 'terminated'

export interface StorePlacementRow {
  id: string
  vendorId: string
  vendorName?: string
  storeId: string
  storeName?: string
  status: PlacementStatus
  note?: string
  adminNote?: string
  listingFee: number
  commissionRate: number
  approvedAt?: string
  createdAt: string
}

export type TransactionType =
  | 'topup' | 'topup_bonus' | 'service_payment' | 'order_payment'
  | 'refund' | 'points_redemption' | 'points_earn' | 'balance_adjustment'

export interface TransactionRow {
  id: string
  memberId: string
  memberName?: string
  memberEmail?: string
  storeId?: string
  type: TransactionType
  totalAmount: number
  balanceUsed: number
  pointsUsed: number
  cardAmount: number
  cashAmount: number
  balanceAfter: number
  paymentMethod?: string
  paymentGateway?: string
  gatewayTxId?: string
  note?: string
  settledAt?: string
  originalTxId?: string
  createdAt: string
}

export interface FinanceSummary {
  totalIn: number
  totalRefund: number
  pendingSettlement: number
  txCount: number
}

export interface DashboardStats {
  memberCount: number
  vendorPendingCount: number
  storeCount: number
  revenue30d: number
  topupCount30d: number
}

export interface DashboardMetrics {
  memberCount: number
  newMembersThisMonth: number
  activeMembersThisWeek: number
  vendorPendingCount: number
  orgPendingCount: number
  placementPendingCount: number
  gmv30d: number
  netRevenue30d: number
  refundRate30d: number
  refundAmount30d: number
  topupAmount30d: number
  topupCount30d: number
  totalPlatformBalance: number
  storeCount: number
}

export interface RevenueBreakdownDay {
  date: string
  service: number
  order: number
  topup: number
  refund: number
}

export interface TopStoreRow {
  storeName: string
  revenue: number
  txCount: number
}

export type OrgType   = 'individual' | 'shelter' | 'rescue'
export type OrgStatus = 'pending' | 'approved' | 'suspended'

export interface OrgRow {
  id: string
  memberName: string
  memberEmail: string
  memberPhone: string
  name: string
  type: OrgType
  description?: string
  phone?: string
  address?: string
  logoUrl?: string
  certUrl?: string
  status: OrgStatus
  appliedAt: string
  approvedAt?: string
}

export interface AuditLogRow {
  id: string
  adminId: string | null
  adminName?: string
  adminEmail?: string
  action: string
  targetTable: string | null
  targetId: string | null
  payload: Record<string, unknown>
  createdAt: string
}

export interface AdminAccountRow {
  id: string
  supabaseUid: string | null
  name: string
  email: string
  role: AdminRole
  isActive: boolean
  createdAt: string
}
