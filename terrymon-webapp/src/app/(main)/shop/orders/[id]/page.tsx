import { notFound } from 'next/navigation'
import OrderDetail from '@/components/shop/OrderDetail'
import { api } from '@/services/api'

export const dynamic = 'force-dynamic'

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const order = await api.getOrder(params.id).catch(() => null)
  if (!order) notFound()
  return <OrderDetail order={order} />
}
