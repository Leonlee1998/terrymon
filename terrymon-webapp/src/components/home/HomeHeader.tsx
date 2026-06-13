'use client'

import Image from 'next/image'
import { Bell } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useNotifStore } from '@/stores/notificationStore'
import { formatTime } from '@/lib/utils'

export default function HomeHeader() {
  const { notifications, unreadCount, markAllRead } = useNotifStore()

  return (
    <header className="sticky top-0 z-20 border-b border-[#f1deca] bg-[#fff8ed]/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
          <Image
            src="/assets/terrymon-mascot.png"
            alt="TerryMon mascot"
            width={40}
            height={40}
            className="size-10 rounded-2xl object-cover"
            priority
          />
          <div>
            <p className="text-lg font-black leading-none text-primary">TerryMon</p>
            <p className="text-[11px] font-medium text-[#8d7f71]">一起健康，長久陪伴</p>
          </div>
        </div>

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
                <Button variant="ghost" size="sm" onClick={markAllRead} className="text-xs text-primary">
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
    </header>
  )
}
