import { MOCK_ORDERS } from '@/lib/mock'
import { notFound } from 'next/navigation'
import OrderDetail from '@/components/shop/OrderDetail'

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const order = MOCK_ORDERS.find(o => o.id === params.id)
  if (!order) notFound()
  return <OrderDetail order={order} />
}
