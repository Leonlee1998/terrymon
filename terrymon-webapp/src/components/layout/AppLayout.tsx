'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/layout/BottomNav'
import SideNav from '@/components/layout/SideNav'
import { useAuthStore } from '@/stores/authStore'
import { useNotifStore } from '@/stores/notificationStore'
import { api } from '@/services/api'
import { createClient } from '@/lib/supabase/client'
import type { Notification } from '@/types'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, member, _hydrated } = useAuthStore()
  const { setNotifications, addNotification } = useNotifStore()
  const router = useRouter()

  useEffect(() => {
    if (!_hydrated) return
    if (!isLoggedIn) { router.replace('/login'); return }
    api.getNotifications().then(setNotifications)
  }, [_hydrated, isLoggedIn, member, router, setNotifications])

  useEffect(() => {
    if (!isLoggedIn || !member?.id) return
    const supabase = createClient()
    const channel = supabase
      .channel(`notifications:${member.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `member_id=eq.${member.id}`,
      }, (payload) => {
        const row = payload.new as Record<string, unknown>
        addNotification({
          id:        String(row.id ?? ''),
          memberId:  String(row.member_id ?? ''),
          type:      String(row.type ?? 'info') as Notification['type'],
          title:     String(row.title ?? ''),
          body:      String(row.body ?? ''),
          isRead:    Boolean(row.is_read),
          createdAt: String(row.created_at ?? ''),
          actionUrl: typeof row.action_url === 'string' ? row.action_url : undefined,
        })
        // Refresh page data when grooming/vet service completion docs arrive
        if (row.type === 'doc_received') router.refresh()
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [isLoggedIn, member?.id, addNotification])

  if (!_hydrated || !isLoggedIn) return null

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
