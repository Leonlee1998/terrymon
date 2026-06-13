'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Scissors, CalendarDays,
  Users, FileText, Settings, LogOut, Stethoscope, ShoppingBag
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAdminStore } from '@/stores/adminStore'
import { toast } from 'sonner'

const NAV = [
  { href: '/admin',               icon: LayoutDashboard, label: '儀表板' },
  { href: '/admin/services',      icon: Scissors,        label: '服務管理' },
  { href: '/admin/shop-products', icon: ShoppingBag,     label: '現場商品' },
  { href: '/admin/schedule',      icon: CalendarDays,    label: '排班管理' },
  { href: '/admin/members',       icon: Users,           label: '會員查詢' },
  { href: '/admin/records',       icon: FileText,        label: '服務紀錄' },
  { href: '/admin/settings',      icon: Settings,        label: '系統設定' },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { shopName, logout } = useAdminStore()

  function handleLogout() {
    logout()
    toast.success('已登出')
    router.push('/admin/login')
  }

  return (
    <aside className="flex flex-col bg-gray-900 h-full">
      {/* Logo */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Scissors size={20} className="text-primary" />
          <div>
            <p className="text-white font-black text-base leading-tight">TerryMon</p>
            <p className="text-gray-400 text-xs">美容管理系統</p>
          </div>
        </div>
        <p className="text-gray-500 text-xs mt-3 truncate">{shopName}</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== '/admin' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                active
                  ? 'bg-primary text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-gray-700">
        <Link
          href="/kiosk"
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-gray-400 hover:bg-gray-800 hover:text-white text-sm transition-colors"
        >
          <Stethoscope size={16} />
          切換至前台 Kiosk
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-xl text-gray-400 hover:bg-red-900/30 hover:text-red-400 text-sm transition-colors mt-1"
        >
          <LogOut size={16} />
          登出
        </button>
      </div>
    </aside>
  )
}
