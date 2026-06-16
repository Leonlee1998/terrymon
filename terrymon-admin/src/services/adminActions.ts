'use server'
import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/server'
import { getCurrentAdmin } from '@/lib/auth'
import type { AdminRole, VendorStatus, PlacementStatus, OrgStatus } from '@/types'

type Result = { ok: boolean; error?: string }

async function requireAdmin(roles?: AdminRole[]) {
  const admin = await getCurrentAdmin()
  if (!admin) throw new Error('未登入或非後台帳號')
  if (roles && !roles.includes(admin.role)) throw new Error('權限不足')
  return admin
}

async function audit(
  adminId: string, action: string, table: string, targetId: string, payload: object
) {
  await createAdminClient().from('admin_audit_log').insert({
    admin_id: adminId, action, target_table: table, target_id: targetId, payload,
  })
}

// 調整會員餘額 / 點數（走受審計的 RPC，稽核在 RPC 內完成）
export async function adjustBalance(
  memberId: string, target: 'balance' | 'points', amount: number, reason: string
): Promise<Result> {
  try {
    const admin = await requireAdmin(['super_admin', 'finance'])
    if (!Number.isInteger(amount) || amount === 0) return { ok: false, error: '金額需為非零整數' }
    if (!reason.trim()) return { ok: false, error: '請填寫調整原因' }

    const { error } = await createAdminClient().rpc('admin_adjust_balance', {
      p_admin_id: admin.id, p_member_id: memberId,
      p_target: target, p_amount: amount, p_reason: reason.trim(),
    })
    if (error) return { ok: false, error: error.message }
    revalidatePath(`/members/${memberId}`)
    revalidatePath('/members')
    return { ok: true }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export async function setVendorStatus(vendorId: string, status: VendorStatus): Promise<Result> {
  try {
    const admin = await requireAdmin(['super_admin', 'ops'])
    const { error } = await createAdminClient().from('vendors')
      .update({ status }).eq('id', vendorId)
    if (error) return { ok: false, error: error.message }
    await audit(admin.id, `vendor_${status}`, 'vendors', vendorId, { status })
    revalidatePath('/vendors')
    revalidatePath(`/vendors/${vendorId}`)
    return { ok: true }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export async function setVendorCommission(vendorId: string, rate: number): Promise<Result> {
  try {
    const admin = await requireAdmin(['super_admin', 'ops', 'finance'])
    if (rate < 0 || rate > 100) return { ok: false, error: '抽成需介於 0–100' }
    const { error } = await createAdminClient().from('vendors')
      .update({ commission_rate: rate }).eq('id', vendorId)
    if (error) return { ok: false, error: error.message }
    await audit(admin.id, 'vendor_commission', 'vendors', vendorId, { rate })
    revalidatePath(`/vendors/${vendorId}`)
    return { ok: true }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export async function toggleStoreActive(storeId: string, isActive: boolean): Promise<Result> {
  try {
    const admin = await requireAdmin(['super_admin', 'ops'])
    const { error } = await createAdminClient().from('stores')
      .update({ is_active: isActive }).eq('id', storeId)
    if (error) return { ok: false, error: error.message }
    await audit(admin.id, isActive ? 'store_activate' : 'store_deactivate', 'stores', storeId, { isActive })
    revalidatePath('/stores')
    return { ok: true }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export async function setGroomingStoreStatus(
  storeId: string, status: 'active' | 'inactive'
): Promise<Result> {
  try {
    const admin = await requireAdmin(['super_admin', 'ops'])
    const { error } = await createAdminClient().from('grooming_stores')
      .update({ status }).eq('id', storeId)
    if (error) return { ok: false, error: error.message }
    await audit(admin.id, `grooming_store_${status}`, 'grooming_stores', storeId, { status })
    revalidatePath('/stores')
    return { ok: true }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export async function setOrgStatus(orgId: string, status: OrgStatus): Promise<Result> {
  try {
    const admin = await requireAdmin(['super_admin', 'ops'])
    const patch: Record<string, unknown> = { status }
    if (status === 'approved') patch.approved_at = new Date().toISOString()
    const { error } = await createAdminClient().from('organizations')
      .update(patch).eq('id', orgId)
    if (error) return { ok: false, error: error.message }
    await audit(admin.id, `org_${status}`, 'organizations', orgId, { status })
    revalidatePath('/organizations')
    return { ok: true }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

// 開通實體店鋪：審核品牌進駐申請
export async function decidePlacement(
  placementId: string,
  decision: Extract<PlacementStatus, 'approved' | 'rejected' | 'terminated'>,
  opts: { adminNote?: string; listingFee?: number; commissionRate?: number } = {}
): Promise<Result> {
  try {
    const admin = await requireAdmin(['super_admin', 'ops'])
    const patch: Record<string, unknown> = { status: decision, admin_note: opts.adminNote ?? null }
    if (decision === 'approved') {
      patch.approved_at = new Date().toISOString()
      if (opts.listingFee != null) patch.listing_fee = opts.listingFee
      if (opts.commissionRate != null) patch.commission_rate = opts.commissionRate
    }
    const { error } = await createAdminClient().from('store_placements')
      .update(patch).eq('id', placementId)
    if (error) return { ok: false, error: error.message }
    await audit(admin.id, `placement_${decision}`, 'store_placements', placementId, patch)
    revalidatePath('/store-placements')
    return { ok: true }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}
