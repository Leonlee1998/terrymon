'use client'

import { useEffect } from 'react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import { useAdminStore } from '@/stores/adminStore'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const load = useAdminStore(s => s.load)

  useEffect(() => {
    load()
  }, [load])

  return (
    <div className="flex min-h-screen bg-surface">
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-30">
        <AdminSidebar />
      </div>
      <main className="flex-1 md:ml-64">
        {children}
      </main>
    </div>
  )
}
