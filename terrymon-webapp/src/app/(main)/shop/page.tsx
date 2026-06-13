import ShopClient from '@/components/shop/ShopClient'
import { api } from '@/services/api'

export const dynamic = 'force-dynamic'

export default async function ShopPage() {
  const products = await api.getProducts()
  return <ShopClient initialProducts={products} />
}
