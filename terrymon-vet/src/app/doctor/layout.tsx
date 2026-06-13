import DoctorHeader from '@/components/doctor/DoctorHeader'

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <DoctorHeader />
      <main className="flex-1">{children}</main>
    </div>
  )
}
