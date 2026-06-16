import { notFound } from 'next/navigation'
import { api } from '@/services/api'
import CheckpointReportForm from '@/components/tracking/CheckpointReportForm'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ checkpointId: string }>
}

export default async function TrackingCheckpointPage({ params }: Props) {
  const { checkpointId } = await params
  const detail = await api.getCheckpoint(checkpointId)

  if (!detail) notFound()

  return <CheckpointReportForm detail={detail} />
}
