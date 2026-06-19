'use client'
import { useState, useRef, useCallback } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { api } from '@/services/api'
import type { Member } from '@/types'

export type CalEventType = 'appointment' | 'grooming' | 'medical' | 'birthday' | 'custom'
export type CalEventSource = 'vet' | 'grooming' | 'personal'

export interface CalEvent {
  id: string
  date: string        // YYYY-MM-DD
  type: CalEventType
  source: CalEventSource
  petId?: string
  petName: string
  title: string
  detail?: string
  status?: string
  time?: string
}

async function fetchAll(member: Member): Promise<CalEvent[]> {
  const [appointments, customEvents, petDataList] = await Promise.all([
    api.getAppointments(),
    api.getMemberEvents(),
    Promise.all(member.pets.map(async pet => ({
      pet,
      med: await api.getMedical(pet.id),
      groom: await api.getGroomingRecords(pet.id),
    }))),
  ])

  const all: CalEvent[] = []

  for (const a of appointments) {
    const pet = member.pets.find(p => p.id === a.petId)
    all.push({
      id: a.id,
      date: a.scheduledDate,
      type: 'appointment',
      source: a.type === 'vet' ? 'vet' : 'grooming',
      petId: a.petId,
      petName: pet?.name ?? '寵物',
      title: a.mainServiceName ?? (a.type === 'vet' ? '看診預約' : '美容預約'),
      detail: a.storeName ?? '',
      status: a.status,
      time: a.scheduledTime?.slice(0, 5),
    })
  }

  for (const { pet, med, groom } of petDataList) {
    for (const m of med) {
      all.push({
        id: m.id, date: m.date, type: 'medical', source: 'vet',
        petId: pet.id, petName: pet.name, title: '醫療紀錄', detail: m.clinicName,
      })
    }
    for (const g of groom) {
      all.push({
        id: g.id, date: g.date.slice(0, 10), type: 'grooming', source: 'grooming',
        petId: pet.id, petName: pet.name, title: '美容紀錄', detail: g.shopName,
      })
    }
    if (pet.birthDate) {
      const [, m, d] = pet.birthDate.split('-')
      all.push({
        id: `bday-${pet.id}`,
        date: `${new Date().getFullYear()}-${m}-${d}`,
        type: 'birthday', source: 'personal',
        petId: pet.id, petName: pet.name,
        title: `${pet.name} 的生日 🎂`,
      })
    }
  }

  for (const ev of customEvents) {
    const pet = member.pets.find(p => p.id === ev.petId)
    all.push({
      id: ev.id, date: ev.date, type: 'custom', source: 'personal',
      petId: ev.petId, petName: pet?.name ?? '',
      title: ev.title, detail: ev.notes, time: ev.time,
    })
  }

  return all
}

export function useCalendarEvents() {
  const { member } = useAuthStore()
  const [events, setEvents] = useState<CalEvent[]>([])
  const [loading, setLoading] = useState(false)
  const loadedRef = useRef(false)

  const load = useCallback(async () => {
    if (loadedRef.current || !member) return
    loadedRef.current = true
    setLoading(true)
    try {
      setEvents(await fetchAll(member))
    } catch (e) {
      console.warn('[useCalendarEvents]', e)
    } finally {
      setLoading(false)
    }
  }, [member])

  const refetch = useCallback(async () => {
    if (!member) return
    loadedRef.current = true
    setLoading(true)
    try {
      setEvents(await fetchAll(member))
    } catch (e) {
      console.warn('[useCalendarEvents:refetch]', e)
    } finally {
      setLoading(false)
    }
  }, [member])

  return { events, loading, load, refetch }
}
