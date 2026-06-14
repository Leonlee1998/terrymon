'use client'
import { create } from 'zustand'
import type { Notification } from '@/types'

interface NotifStore {
  notifications: Notification[]
  unreadCount: number
  setNotifications: (n: Notification[]) => void
  addNotification: (n: Notification) => void
  markAllRead: () => void
  markOneRead: (id: string) => void
}

export const useNotifStore = create<NotifStore>()((set) => ({
  notifications: [],
  unreadCount: 0,
  setNotifications: (n) =>
    set({ notifications: n, unreadCount: n.filter(x => !x.isRead).length }),
  addNotification: (n) =>
    set(s => ({
      notifications: [n, ...s.notifications],
      unreadCount: n.isRead ? s.unreadCount : s.unreadCount + 1,
    })),
  markAllRead: () =>
    set(s => ({
      notifications: s.notifications.map(n => ({ ...n, isRead: true })),
      unreadCount: 0,
    })),
  markOneRead: (id) =>
    set(s => {
      const target = s.notifications.find(n => n.id === id)
      if (!target || target.isRead) return s
      return {
        notifications: s.notifications.map(n => n.id === id ? { ...n, isRead: true } : n),
        unreadCount: Math.max(0, s.unreadCount - 1),
      }
    }),
}))
