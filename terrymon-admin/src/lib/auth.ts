import { createSupabaseClient, createAdminClient } from '@/lib/supabase/server'
import type { PlatformAdmin } from '@/types'

// 伺服器端唯一的權限判斷入口：
// 1. 用 anon session 確認登入者是誰（getUser 會驗 JWT）
// 2. 用 service_role 查 platform_admins，確認是「啟用中的後台帳號」
// 回傳 null 代表未登入或非後台帳號 → caller 應 redirect /login
export async function getCurrentAdmin(): Promise<PlatformAdmin | null> {
  const supabase = await createSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const admin = createAdminClient()
  const { data } = await admin
    .from('platform_admins')
    .select('*')
    .eq('supabase_uid', user.id)
    .eq('is_active', true)
    .maybeSingle()

  if (!data) return null

  return {
    id: data.id,
    supabaseUid: data.supabase_uid,
    name: data.name,
    email: data.email,
    role: data.role,
    isActive: data.is_active,
  }
}
