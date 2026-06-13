'use client'
import { useRouter } from 'next/navigation'
import type { Member, DocItem, Order } from '@/types'
import { useAuthStore } from '@/stores/authStore'
import MemberProfileCard from './MemberProfileCard'
import QRCodeCard from './QRCodeCard'
import BalanceCard from './BalanceCard'
import DocumentsList from './DocumentsList'
import OrderSummary from './OrderSummary'
import { LogOut } from 'lucide-react'
import { toast } from 'sonner'

interface Props { member: Member; documents: DocItem[]; orders: Order[] }

export default function MemberClient({ member, documents, orders }: Props) {
  const { logout, member: storeMember } = useAuthStore()
  const effectiveMember = storeMember ?? member
  const router = useRouter()

  function handleLogout() {
    if (!confirm('確定要登出嗎？')) return
    logout()
    toast.success('已登出')
    router.replace('/login')
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="sticky top-0 z-20 bg-white border-b border-border-t px-4 h-14 flex items-center max-w-2xl mx-auto w-full">
        <h1 className="font-bold text-lg text-ink">會員中心</h1>
      </div>

      <div className="flex-1 p-4 max-w-2xl mx-auto w-full space-y-4 pb-8">
        <MemberProfileCard member={effectiveMember} />
        <QRCodeCard member={effectiveMember} />
        <BalanceCard member={effectiveMember} />
        <OrderSummary orders={orders} />
        <DocumentsList documents={documents} />

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-3 border border-red-200 text-red-600 text-sm font-medium rounded-2xl hover:bg-red-50 transition-colors"
        >
          <LogOut size={16} />
          登出
        </button>
      </div>
    </div>
  )
}
