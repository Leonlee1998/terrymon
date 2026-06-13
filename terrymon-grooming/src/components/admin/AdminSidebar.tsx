'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  ListOrdered,
  CalendarDays,
  Scissors,
  Package,
  Users,
  BarChart2,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/admin', label: '儀表板', icon: LayoutDashboard, exact: true },
  { href: '/admin/queue', label: '候診隊列', icon: ListOrdered },
  { href: '/admin/schedule', label: '排班預約', icon: CalendarDays },
  { href: '/admin/services', label: '服務項目', icon: Scissors },
  { href: '/admin/products', label: '商品管理', icon: Package },
  { href: '/admin/members', label: '會員管理', icon: Users },
  { href: '/admin/records', label: '美容紀錄', icon: BarChart2 },
  { href: '/admin/settings', label: '設定', icon: Settings },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-surface border-r border-border-t flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-border-t shrink-0">
        <span className="text-primary font-bold text-lg tracking-tight">
          TerryMon 美容院
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href)
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                    active
                      ? 'bg-primary-bg text-primary'
                      : 'text-slate-t hover:bg-primary-bg/50 hover:text-ink'
                  )}
                >
                  <Icon size={18} strokeWidth={active ? 2.5 : 2} />
                  {label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="px-4 py-4 border-t border-border-t text-xs text-slate-t">
        TerryMon POS v1.0
      </div>
    </aside>
  )
}
