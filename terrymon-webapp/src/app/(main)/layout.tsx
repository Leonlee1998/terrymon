import type React from "react"

import { BottomNav } from "@/components/bottom-nav"

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-muted/30">
      <main className="mx-auto min-h-screen w-full max-w-md bg-background px-4 pb-24 pt-6">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
