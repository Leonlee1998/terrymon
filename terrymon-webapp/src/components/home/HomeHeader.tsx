'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Bell, CalendarDays, Search } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useNotifStore } from '@/stores/notificationStore'
import { formatTime } from '@/lib/utils'
import { api } from '@/services/api'
import CalendarSheet from './CalendarSheet'
import SearchSheet from './SearchSheet'

export default function HomeHeader() {
  const { notifications, unreadCount, markAllRead } = useNotifStore()
  const [calOpen, setCalOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  async function handleMarkAllRead() {
    markAllRead()
    await api.markAllRead()
  }

  return (
    <header className="sticky top-0 z-20 border-b border-[#f1deca] bg-[#fff8ed]/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 md:px-6">
        {/* Mobile only — desktop sidebar already shows the logo */}
        <div className="flex items-center md:hidden">
          <Image
            src="/assets/logo.png"
            alt="TerryMon 預約怪獸"
            width={110}
            height={37}
            className="object-contain"
            priority
          />
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          {/* Search */}
          <button
            onClick={() => setSearchOpen(true)}
            className="grid size-10 place-items-center rounded-2xl border border-[#eadfd2] bg-white text-ink shadow-sm transition hover:border-primary/40"
          >
            <Search size={18} />
          </button>

          {/* Calendar */}
          <button
            onClick={() => setCalOpen(true)}
            className="grid size-10 place-items-center rounded-2xl border border-[#eadfd2] bg-white text-ink shadow-sm transition hover:border-primary/40"
          >
            <CalendarDays size={18} />
          </button>

        <Sheet>
          <SheetTrigger asChild>
            <button className="relative grid size-10 place-items-center rounded-2xl border border-[#eadfd2] bg-white text-ink shadow-sm transition hover:border-primary/40">
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80">
            <SheetHeader className="flex-row items-center justify-between">
              <SheetTitle>通知</SheetTitle>
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={handleMarkAllRead} className="text-xs text-primary">
                  全部已讀
                </Button>
              )}
            </SheetHeader>
            <div className="mt-4 space-y-2 px-4">
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

        <CalendarSheet open={calOpen} onOpenChange={setCalOpen} />
        <SearchSheet open={searchOpen} onOpenChange={setSearchOpen} />
      </div>
    </header>
  )
}
