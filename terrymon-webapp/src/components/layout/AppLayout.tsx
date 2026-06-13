'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/layout/BottomNav'
import SideNav from '@/components/layout/SideNav'
import { useAuthStore } from '@/stores/authStore'
import { useNotifStore } from '@/stores/notificationStore'
import { api } from '@/services/api'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useAuthStore()
  const { setNotifications } = useNotifStore()
  const router = useRouter()

  useEffect(() => {
    if (!isLoggedIn) { router.replace('/login'); return }
    api.getNotifications().then(setNotifications)
  }, [isLoggedIn, router, setNotifications])

  if (!isLoggedIn) return null

  return (
    <div className="flex min-h-screen bg-[#fff8ed]">
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-60 md:flex-col md:fixed md:inset-y-0 z-30">
        <SideNav />
      </div>
      {/* Main content */}
      <main className="min-h-screen flex-1 pb-20 md:ml-60 md:pb-6">
        {children}
      </main>
      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-50">
        <BottomNav />
      </div>
    </div>
  )
}
