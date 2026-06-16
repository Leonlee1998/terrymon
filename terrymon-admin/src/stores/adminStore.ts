import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { PlatformAdmin } from '@/types'

// ⚠️ 僅供前端顯示（名稱、角色 badge）。實際權限一律由 server-side guard 判斷，
//    不可用這裡的狀態作為授權依據。
interface AdminState {
  admin: PlatformAdmin | null
  setAdmin: (admin: PlatformAdmin | null) => void
  clear: () => void
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      admin: null,
      setAdmin: (admin) => set({ admin }),
      clear: () => set({ admin: null }),
    }),
    { name: 'terrymon-admin' }
  )
)
