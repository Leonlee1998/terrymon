'use client'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Package, ShoppingBag,
  Tag, BarChart2, Settings, LogOut, Store, MapPin, MessageCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useVendorStore } from '@/stores/vendorStore'
import { toast } from 'sonner'

const NAV = [
  { href: '/dashboard',        icon: LayoutDashboard, label: '數據總覽' },
  { href: '/products',         icon: Package,         label: '商品管理' },
  { href: '/orders',           icon: ShoppingBag,     label: '訂單管理' },
  { href: '/promotions',       icon: Tag,             label: '行銷活動' },
  { href: '/store-placements', icon: MapPin,          label: '實體進駐' },
  { href: '/messages',         icon: MessageCircle,   label: '顧客訊息' },
  { href: '/reports',          icon: BarChart2,       label: '銷售報表' },
  { href: '/settings',         icon: Settings,        label: '商家設定' },
]

export default function VendorSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { vendor, logout } = useVendorStore()

  async function handleLogout() { await logout(); toast.success('已登出'); router.push('/login') }

  return (
    <aside className="flex flex-col bg-white border-r border-border-t h-full">
      <div className="px-6 py-4 border-b border-border-t">
        <Image src="/assets/logo.png" alt="TerryMon 預約怪獸" width={132} height={44} className="object-contain" priority />
        <p className="text-xs text-slate-t mt-2">{vendor?.storeName}</p>
      </div>

      <nav className="flex-1 p-3 space-y-0.5">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                active ? 'bg-primary-bg text-primary' : 'text-slate-t hover:bg-surface hover:text-ink'
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          )
        })}
      </nav>

      {vendor && (
        <div className="p-3 border-t border-border-t">
          <div className="px-3 py-2 mb-1">
            <p className="text-sm font-medium text-ink">{vendor.name}</p>
            <p className="text-xs text-slate-t truncate">{vendor.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 w-full rounded-xl text-slate-t hover:bg-red-50 hover:text-red-600 text-sm transition-colors"
          >
            <LogOut size={16} />
            登出
          </button>
        </div>
      )}
    </aside>
  )
}
