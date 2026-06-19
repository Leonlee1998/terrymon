import WelcomeCard from '@/components/home/WelcomeCard'
import BarcodeWidget from '@/components/home/BarcodeWidget'
import TodaySchedule from '@/components/home/TodaySchedule'
import HomeAIoT from '@/components/home/HomeAIoT'
import QuickActions from '@/components/home/QuickActions'
import { api } from '@/services/api'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [member, pets, appointments] = await Promise.all([
    api.getMe(),
    api.getPets(),
    api.getAppointments(),
  ])
  const effectivePets = pets.length > 0 ? pets : member.pets
  const todayAppt = appointments.find(a =>
    a.status === 'confirmed' && new Date(a.scheduledDate) >= new Date()
  ) ?? null

  return (
    <div className="flex flex-col animate-fade-in">
      <div className="p-4 space-y-4 max-w-2xl mx-auto w-full">
        <WelcomeCard member={member} appointment={todayAppt} />
        <BarcodeWidget member={member} />
        <TodaySchedule appointment={todayAppt} />
        <HomeAIoT pets={effectivePets} />
        <QuickActions />
      </div>
    </div>
  )
}
