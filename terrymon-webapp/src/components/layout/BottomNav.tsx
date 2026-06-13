'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CalendarDays, Home, PawPrint, ShoppingCart, User } from 'lucide-react'
import { useCartStore } from '@/stores/cartStore'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/', icon: Home, label: '首頁' },
  { href: '/shop', icon: ShoppingCart, label: '商城' },
  { href: '/pets', icon: PawPrint, label: '毛孩' },
  { href: '/appointments', icon: CalendarDays, label: '預約' },
  { href: '/member', icon: User, label: '會員' },
]

export default function BottomNav() {
  const pathname = usePathname()
  const totalItems = useCartStore(state => state.totalItems())

  return (
    <nav className="safe-bottom flex border-t border-[#eadfd2] bg-white/95 px-1 shadow-[0_-10px_30px_rgba(80,50,20,0.08)] backdrop-blur">
      {NAV.map(({ href, icon: Icon, label }) => {
        const active = pathname === href || (href !== '/' && pathname.startsWith(href))

        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'relative flex flex-1 flex-col items-center gap-0.5 rounded-2xl py-2 text-[11px] font-semibold transition-colors',
              active ? 'text-primary' : 'text-[#8d7f71]'
            )}
          >
            <div className={cn('relative grid size-7 place-items-center rounded-full', active && 'bg-primary-bg')}>
              <Icon size={20} strokeWidth={active ? 2.6 : 2} />
              {href === '/shop' && totalItems > 0 && (
                <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-white">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </div>
            <span>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
