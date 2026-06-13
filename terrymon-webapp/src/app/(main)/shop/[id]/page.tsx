import { notFound } from 'next/navigation'
import ProductDetail from '@/components/shop/ProductDetail'
import { api } from '@/services/api'

export const dynamic = 'force-dynamic'

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await api.getProduct(params.id).catch(() => null)
  if (!product) notFound()
  return <ProductDetail product={product} />
}
