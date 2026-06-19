'use client'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  LayoutDashboard, Scissors, CalendarDays, ClipboardList,
  Users, FileText, Settings, LogOut, Stethoscope, ShoppingBag, PackagePlus, Boxes, MessageSquare,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAdminStore } from '@/stores/adminStore'
import { toast } from 'sonner'

const BASE_NAV = [
  { href: '/admin',               icon: LayoutDashboard, label: '今日工作台', badge: 'dashboard' },
  { href: '/admin/appointments',  icon: ClipboardList,   label: '預約管理',   badge: 'pending' },
  { href: '/admin/schedule',      icon: CalendarDays,    label: '排班管理',   badge: null },
  { href: '/admin/services',      icon: Scissors,        label: '服務管理',   badge: null },
  { href: '/admin/shop-products', icon: ShoppingBag,     label: '現場商品',   badge: null },
  { href: '/admin/brands',        icon: Boxes,           label: '品牌管理',   badge: null },
  { href: '/admin/brand-products',icon: PackagePlus,     label: '品牌商品',   badge: null },
  { href: '/admin/messages',      icon: MessageSquare,   label: '訊息中心',   badge: null },
  { href: '/admin/members',       icon: Users,           label: '會員查詢',   badge: null },
  { href: '/admin/records',       icon: FileText,        label: '服務紀錄',   badge: null },
  { href: '/admin/settings',      icon: Settings,        label: '系統設定',   badge: null },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { shopName, logout } = useAdminStore()
  const [pendingCount, setPendingCount] = useState(0)
  const [checkedInCount, setCheckedInCount] = useState(0)

  useEffect(() => {
    async function fetchCounts() {
      try {
        const [r1, r2] = await Promise.all([
          fetch('/api/admin/appointments?status=pending'),
          fetch('/api/admin/appointments?status=checked_in'),
        ])
        const [d1, d2] = await Promise.all([r1.json(), r2.json()])
        setPendingCount(Array.isArray(d1) ? d1.length : 0)
        setCheckedInCount(Array.isArray(d2) ? d2.length : 0)
      } catch { /* silent */ }
    }
    void fetchCounts()
    const id = setInterval(fetchCounts, 60_000)
    return () => clearInterval(id)
  }, [])

  function handleLogout() {
    logout()
    toast.success('已登出')
    router.push('/admin/login')
  }

  return (
    <aside className="flex flex-col bg-gray-900 h-full">
      {/* Logo */}
      <div className="px-6 py-4 border-b border-gray-700">
        <div className="bg-white rounded-xl px-3 py-2 inline-block">
          <Image src="/assets/logo.png" alt="TerryMon 預約怪獸" width={120} height={40} className="object-contain" priority />
        </div>
        <p className="text-gray-500 text-xs mt-3 truncate">{shopName}</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5">
        {BASE_NAV.map(({ href, icon: Icon, label, badge }) => {
          const active = pathname === href || (href !== '/admin' && pathname.startsWith(href))
          const badgeCount =
            badge === 'dashboard' ? checkedInCount :
            badge === 'pending'   ? pendingCount   : 0
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
              <span className="flex-1">{label}</span>
              {badgeCount > 0 && (
                <span className={cn(
                  'text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center',
                  badge === 'dashboard' ? 'bg-emerald-400 text-white' : 'bg-yellow-400 text-gray-900'
                )}>
                  {badgeCount}
                </span>
              )}
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
