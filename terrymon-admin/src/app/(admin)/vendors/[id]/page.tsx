import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getVendor } from '@/services/adminApi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import VendorEditForm from '@/components/admin/VendorEditForm'
import { formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function VendorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const vendor = await getVendor(id)
  if (!vendor) notFound()

  return (
    <div className="space-y-6">
      <div>
        <Link href="/vendors" className="text-sm text-slate-t hover:underline">← 返回商家列表</Link>
        <h1 className="mt-2 text-2xl font-bold text-ink">{vendor.storeName}</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>商家資料</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="負責人" value={vendor.ownerName} />
            <Row label="Email" value={vendor.email} />
            <Row label="電話" value={vendor.phone ?? '—'} />
            <Row label="統一編號" value={vendor.taxId ?? '—'} />
            <Row label="入駐日期" value={formatDate(vendor.createdAt)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>審核與抽成</CardTitle></CardHeader>
          <CardContent>
            <VendorEditForm vendorId={vendor.id} status={vendor.status} commissionRate={vendor.commissionRate} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-border-t/60 py-1.5">
      <span className="text-slate-t">{label}</span>
      <span className="text-ink">{value}</span>
    </div>
  )
}
