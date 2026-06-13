import { MOCK_ORDERS } from '@/lib/mock'
import OrdersClient from '@/components/shop/OrdersClient'
export default function OrdersPage() {
  return <OrdersClient orders={MOCK_ORDERS} />
}
