import { MOCK_PRODUCTS } from "@/lib/mock"
import ShopClient from "@/components/shop/ShopClient"

export default function ShopPage() {
  return <ShopClient products={MOCK_PRODUCTS} />
}
