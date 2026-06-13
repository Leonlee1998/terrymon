import { MOCK_MEMBER, MOCK_DOCUMENTS, MOCK_ORDERS } from '@/lib/mock'
import MemberClient from '@/components/member/MemberClient'

export default function MemberPage() {
  return (
    <MemberClient
      member={MOCK_MEMBER}
      documents={MOCK_DOCUMENTS}
      orders={MOCK_ORDERS}
    />
  )
}
