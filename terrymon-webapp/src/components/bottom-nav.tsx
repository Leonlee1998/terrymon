"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { CalendarDays, Home, PawPrint, ShoppingBag, User } from "lucide-react"

import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", label: "首頁", icon: Home },
  { href: "/shop", label: "商店", icon: ShoppingBag },
  { href: "/pets", label: "寵物", icon: PawPrint },
  { href: "/appointments", label: "預約", icon: CalendarDays },
  { href: "/member", label: "會員", icon: User },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto grid h-16 max-w-md grid-cols-5 px-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-w-0 flex-col items-center justify-center gap-1 rounded-md px-1 text-xs font-medium text-muted-foreground transition-colors",
                isActive && "text-primary"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span className="truncate">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
