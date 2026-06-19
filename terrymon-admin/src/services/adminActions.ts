'use server'
import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/server'
import { getCurrentAdmin } from '@/lib/auth'
import type { AdminRole, VendorStatus, PlacementStatus, OrgStatus } from '@/types'

type Result = { ok: boolean; error?: string; data?: unknown }

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

// ---------- 金流操作 ----------

export async function issueRefund(
  originalTxId: string, amount: number, reason: string
): Promise<Result> {
  try {
    const admin = await requireAdmin(['super_admin', 'finance'])
    if (!Number.isInteger(amount) || amount <= 0) return { ok: false, error: '退款金額必須為正整數' }
    if (!reason.trim()) return { ok: false, error: '請填寫退款原因' }

    const { data, error } = await createAdminClient().rpc('admin_issue_refund', {
      p_admin_id: admin.id,
      p_original_tx_id: originalTxId,
      p_amount: amount,
      p_reason: reason.trim(),
    })
    if (error) return { ok: false, error: error.message }
    revalidatePath('/finance')
    return { ok: true, data }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export async function settleTransaction(txId: string): Promise<Result> {
  try {
    const admin = await requireAdmin(['super_admin', 'finance'])
    const { error } = await createAdminClient().from('transactions')
      .update({ settled_at: new Date().toISOString() }).eq('id', txId).is('settled_at', null)
    if (error) return { ok: false, error: error.message }
    await audit(admin.id, 'tx_settle', 'transactions', txId, {})
    revalidatePath('/finance')
    return { ok: true }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

// ---------- 管理員帳號管理（super_admin 專屬）----------

export async function inviteAdmin(
  name: string, email: string, role: AdminRole
): Promise<Result> {
  try {
    const admin = await requireAdmin(['super_admin'])
    if (!name.trim() || !email.trim()) return { ok: false, error: '請填寫姓名與 Email' }

    const sb = createAdminClient()
    const { data: existing } = await sb.from('platform_admins')
      .select('id').eq('email', email.trim().toLowerCase()).maybeSingle()
    if (existing) return { ok: false, error: '此 Email 已建立後台帳號' }

    const { data: authData, error: inviteErr } = await sb.auth.admin.inviteUserByEmail(
      email.trim().toLowerCase(),
      { data: { is_platform_admin: true } }
    )
    if (inviteErr) return { ok: false, error: inviteErr.message }

    const { error: dbErr } = await sb.from('platform_admins').insert({
      supabase_uid: authData.user.id,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role,
      is_active: true,
    })
    if (dbErr) return { ok: false, error: dbErr.message }

    await audit(admin.id, 'admin_invite', 'platform_admins', authData.user.id, { name, email, role })
    revalidatePath('/admins')
    return { ok: true }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export async function updateAdminRole(adminId: string, role: AdminRole): Promise<Result> {
  try {
    const admin = await requireAdmin(['super_admin'])
    if (adminId === admin.id) return { ok: false, error: '無法修改自己的角色' }
    const { error } = await createAdminClient().from('platform_admins')
      .update({ role }).eq('id', adminId)
    if (error) return { ok: false, error: error.message }
    await audit(admin.id, 'admin_role_change', 'platform_admins', adminId, { role })
    revalidatePath('/admins')
    return { ok: true }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export async function setAdminActive(adminId: string, isActive: boolean): Promise<Result> {
  try {
    const admin = await requireAdmin(['super_admin'])
    if (adminId === admin.id) return { ok: false, error: '無法停用自己的帳號' }
    const { error } = await createAdminClient().from('platform_admins')
      .update({ is_active: isActive }).eq('id', adminId)
    if (error) return { ok: false, error: error.message }
    await audit(admin.id, isActive ? 'admin_activate' : 'admin_deactivate', 'platform_admins', adminId, { isActive })
    revalidatePath('/admins')
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
