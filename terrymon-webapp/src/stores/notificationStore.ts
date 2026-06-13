'use client'
import { create } from 'zustand'
import type { Notification } from '@/types'

interface NotifStore {
  notifications: Notification[]
  unreadCount: number
  setNotifications: (n: Notification[]) => void
  markAllRead: () => void
}

export const useNotifStore = create<NotifStore>()((set) => ({
  notifications: [],
  unreadCount: 0,
  setNotifications: (n) =>
    set({ notifications: n, unreadCount: n.filter(x => !x.isRead).length }),
  markAllRead: () =>
    set(s => ({
      notifications: s.notifications.map(n => ({ ...n, isRead: true })),
      unreadCount: 0,
    })),
}))
