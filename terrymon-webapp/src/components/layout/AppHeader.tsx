'use client'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell, MessageCircle } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { useNotifStore } from '@/stores/notificationStore'
import { formatTime } from '@/lib/utils'
import { api } from '@/services/api'
import { toast } from 'sonner'

export default function AppHeader() {
  const pathname = usePathname()
  const { notifications, unreadCount, markAllRead } = useNotifStore()

  // 有自己 header 的頁面，不顯示全域 AppHeader
  const hide =
    pathname.startsWith('/appointments/new') ||
    pathname.startsWith('/messages')  // 訊息所有頁面都有自己的 header

  if (hide) return null

  async function handleMarkAllRead() {
    markAllRead()
    await api.markAllRead()
  }

  return (
    <header className="sticky top-0 z-30 border-b border-[#f1deca] bg-[#fff8ed]/95 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 md:px-6">
        {/* Logo — 手機顯示，桌機由 SideNav 顯示 */}
        <div className="md:hidden">
          <Image src="/assets/logo.png" alt="TerryMon 預約怪獸" width={100} height={34} className="object-contain" priority />
        </div>
        <div className="hidden md:block" />

        {/* 右側：聊天 + 通知 */}
        <div className="flex items-center gap-1.5">
          {/* 聊天室 */}
          <Link
            href="/messages"
            className="grid size-10 place-items-center rounded-2xl border border-[#eadfd2] bg-white text-ink shadow-sm transition hover:border-primary/40"
            aria-label="訊息"
          >
            <MessageCircle size={18} />
          </Link>

          {/* 通知 */}
          <Sheet>
            <SheetTrigger asChild>
              <button
                className="relative grid size-10 place-items-center rounded-2xl border border-[#eadfd2] bg-white text-ink shadow-sm transition hover:border-primary/40"
                aria-label="通知"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader className="flex-row items-center justify-between pb-2">
                <SheetTitle>通知</SheetTitle>
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={handleMarkAllRead} className="text-xs text-primary">
                    全部已讀
                  </Button>
                )}
              </SheetHeader>
              <div className="mt-2 space-y-2 overflow-y-auto px-1">
                {notifications.length === 0 ? (
                  <p className="py-8 text-center text-sm text-slate-t">目前沒有通知</p>
                ) : (
                  notifications.map(item => (
                    <button
                      key={item.id}
                      type="button"
                      className={`w-full rounded-2xl border p-3 text-left transition-colors ${
                        item.isRead ? 'border-[#eadfd2] bg-white' : 'border-primary/30 bg-primary-bg'
                      }`}
                      onClick={() => toast.info(item.body)}
                    >
                      <p className="text-sm font-bold text-ink">{item.title}</p>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-t">{item.body}</p>
                      <p className="mt-2 text-xs text-[#9b8f82]">{formatTime(item.createdAt)}</p>
                    </button>
                  ))
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
