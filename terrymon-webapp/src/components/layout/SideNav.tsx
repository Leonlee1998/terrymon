'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Home, ShoppingCart, PawPrint, CalendarDays, User, LogOut, Bell } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useNotifStore } from '@/stores/notificationStore'
import { useCartStore } from '@/stores/cartStore'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const NAV = [
  { href: '/',             icon: Home,         label: '首頁' },
  { href: '/shop',         icon: ShoppingCart, label: '商城' },
  { href: '/pets',         icon: PawPrint,     label: '我的寵物' },
  { href: '/appointments', icon: CalendarDays, label: '預約' },
  { href: '/member',       icon: User,         label: '會員中心' },
]

export default function SideNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { member, logout } = useAuthStore()
  const unreadCount = useNotifStore(s => s.unreadCount)
  const totalItems = useCartStore(s => s.totalItems())

  function handleLogout() {
    logout()
    toast.success('已登出')
    router.replace('/login')
  }

  return (
    <aside className="flex flex-col bg-white border-r border-border-t h-full">
      {/* Logo */}
      <div className="p-6 border-b border-border-t">
        <span className="text-primary font-black text-xl tracking-tight">🐾 TerryMon</span>
        <p className="text-xs text-slate-t mt-0.5">預約怪獸</p>
      </div>

      {/* Nav items */}
      <nav className="flex-1 p-3 space-y-0.5">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href))
          const badge = href === '/shop' ? totalItems : 0
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                active ? 'bg-primary-bg text-primary' : 'text-slate-t hover:bg-surface hover:text-ink'
              )}
            >
              <Icon size={18} strokeWidth={active ? 2.5 : 2} />
              <span className="flex-1">{label}</span>
              {badge > 0 && (
                <span className="bg-accent text-white text-xs rounded-full px-1.5 py-0.5 leading-none">
                  {badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Member info */}
      {member && (
        <div className="p-3 border-t border-border-t">
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {member.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-ink truncate">{member.name}</p>
              <p className="text-xs text-slate-t truncate">{member.email}</p>
            </div>
            {unreadCount > 0 && (
              <div className="relative">
                <Bell size={16} className="text-slate-t" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] rounded-full w-3.5 h-3.5 flex items-center justify-center">
                  {unreadCount}
                </span>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 w-full rounded-xl text-sm text-slate-t hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={16} />
            登出
          </button>
        </div>
      )}
    </aside>
  )
}
