import MemberClient from '@/components/member/MemberClient'
import { api } from '@/services/api'

export const dynamic = 'force-dynamic'

export default async function MemberPage() {
  const [member, documents, orders] = await Promise.all([
    api.getMe(),
    api.getDocuments(),
    api.getOrders(),
  ])

  return (
    <MemberClient
      member={member}
      documents={documents}
      orders={orders}
    />
  )
}
