import { notFound } from 'next/navigation'
import VendorStorePage from '@/components/shop/VendorStorePage'
import { api } from '@/services/api'

export const dynamic = 'force-dynamic'

export default async function VendorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [vendor, products] = await Promise.all([
    api.getVendor(id).catch(() => null),
    api.getVendorProducts(id).catch(() => []),
  ])
  if (!vendor) notFound()
  return <VendorStorePage vendor={vendor} products={products} />
}
