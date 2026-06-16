import { redirect } from 'next/navigation'
import { getCurrentAdmin } from '@/lib/auth'
import AdminSidebar from '@/components/admin/AdminSidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getCurrentAdmin()
  if (!admin) redirect('/login?error=unauthorized')

  return (
    <div className="min-h-screen bg-surface">
      <AdminSidebar admin={admin} />
      <main className="pt-14 md:ml-60 md:pt-0 p-4 md:p-8">{children}</main>
    </div>
  )
}
