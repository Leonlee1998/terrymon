import OrdersClient from '@/components/shop/OrdersClient'
import { api } from '@/services/api'

export const dynamic = 'force-dynamic'

export default async function OrdersPage() {
  const orders = await api.getOrders()
  return <OrdersClient orders={orders} />
}
