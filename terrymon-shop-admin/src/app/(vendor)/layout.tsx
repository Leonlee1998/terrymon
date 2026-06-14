'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useVendorStore } from '@/stores/vendorStore'
import VendorSidebar from '@/components/vendor/VendorSidebar'

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, vendor, load } = useVendorStore()
  const router = useRouter()

  useEffect(() => {
    if (!isLoggedIn) { router.replace('/login'); return }
    if (vendor?.status === 'pending') { router.replace('/pending'); return }
    if (vendor?.status === 'suspended') { router.replace('/login?error=suspended'); return }
    load()
  }, [isLoggedIn, vendor?.status, load, router])

  if (!isLoggedIn || vendor?.status !== 'approved') return null

  return (
    <div className="flex min-h-screen bg-surface">
      <div className="hidden md:flex md:w-60 md:flex-col md:fixed md:inset-y-0 z-30">
        <VendorSidebar />
      </div>
      <main className="flex-1 md:ml-60">{children}</main>
    </div>
  )
}
