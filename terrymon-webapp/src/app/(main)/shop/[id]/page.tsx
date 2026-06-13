import { MOCK_PRODUCTS } from '@/lib/mock'
import { notFound } from 'next/navigation'
import ProductDetail from '@/components/shop/ProductDetail'

export default function ProductPage({ params }: { params: { id: string } }) {
  const product = MOCK_PRODUCTS.find(p => p.id === params.id)
  if (!product) notFound()
  return <ProductDetail product={product} />
}

export function generateStaticParams() {
  return MOCK_PRODUCTS.map(p => ({ id: p.id }))
}
