'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminSidebar from '@/components/admin/AdminSidebar'
import { useAdminStore } from '@/stores/adminStore'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router  = useRouter()
  const { isLoggedIn, load } = useAdminStore()

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace('/admin/login')
      return
    }
    load()
  }, [isLoggedIn, load, router])

  if (!isLoggedIn) return null

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
