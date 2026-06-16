import { notFound } from 'next/navigation'
import ProductDetail from '@/components/shop/ProductDetail'
import { api } from '@/services/api'

export const dynamic = 'force-dynamic'

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await api.getProduct(id).catch(() => null)
  if (!product) notFound()
  const vendor = await api.getVendor(product.vendorId).catch(() => null)
  return <ProductDetail product={product} vendor={vendor} />
}
