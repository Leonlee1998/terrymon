'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Users, Store, Building2, ClipboardCheck,
  Receipt, BarChart3, LogOut, ShieldCheck, Menu, X, ShieldAlert,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import type { PlatformAdmin } from '@/types'

const NAV = [
  { href: '/dashboard',       label: '總覽',   icon: LayoutDashboard },
  { href: '/members',         label: '會員管理', icon: Users },
  { href: '/vendors',         label: '商家管理', icon: Store },
  { href: '/organizations',   label: '機構審核', icon: ShieldCheck },
  { href: '/stores',          label: '店鋪管理', icon: Building2 },
  { href: '/store-placements', label: '進駐審核', icon: ClipboardCheck },
  { href: '/finance',         label: '金流對帳', icon: Receipt },
  { href: '/reports',         label: '報表',   icon: BarChart3 },
]

const ROLE_LABEL: Record<string, string> = {
  super_admin: '超級管理員', ops: '營運', finance: '財務', support: '客服',
}

export default function AdminSidebar({ admin }: { admin: PlatformAdmin }) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  async function logout() {
    await createClient().auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const sidebarContent = (
    <>
      <div className="flex items-center justify-between px-5 py-5">
        <div>
          <p className="text-lg font-bold text-primary">TerryMon 後台</p>
          <p className="mt-0.5 text-xs text-slate-t">平台營運管理</p>
        </div>
        <button
          onClick={() => setMobileOpen(false)}
          className="rounded-md p-1 text-slate-t hover:bg-muted md:hidden"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-primary-bg text-primary'
                  : 'text-slate-t hover:bg-primary-bg/60 hover:text-ink'
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-border-t px-5 py-4">
        <div className="flex items-center gap-2">
          <ShieldAlert size={14} className="text-primary" />
          <p className="truncate text-sm font-medium text-ink">{admin.name}</p>
        </div>
        <p className="mt-0.5 text-xs text-slate-t">{ROLE_LABEL[admin.role] ?? admin.role}</p>
        <button
          onClick={logout}
          className="mt-3 flex items-center gap-2 text-sm text-slate-t hover:text-error"
        >
          <LogOut size={16} /> 登出
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* ── 手機頂部 header ── */}
      <header className="fixed left-0 right-0 top-0 z-30 flex h-14 items-center border-b border-border-t bg-white px-4 md:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="rounded-md p-1.5 text-slate-t hover:bg-muted"
        >
          <Menu size={22} />
        </button>
        <p className="ml-3 font-bold text-primary">TerryMon 後台</p>
      </header>

      {/* ── 手機 overlay ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── 手機 slide-in sidebar ── */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border-t bg-white transition-transform duration-200 md:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {sidebarContent}
      </aside>

      {/* ── 桌機固定 sidebar ── */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-border-t bg-white md:flex">
        {sidebarContent}
      </aside>
    </>
  )
}
