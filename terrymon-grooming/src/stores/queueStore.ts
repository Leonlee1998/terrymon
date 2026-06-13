'use client'
import { create } from 'zustand'
import type { QueueItem } from '@/types'
import { MOCK_QUEUE } from '@/lib/mock'
import { posApi } from '@/services/api'

interface QueueStore {
  queue:          QueueItem[]
  waiting:        QueueItem[]
  done:           QueueItem[]
  inProgress:     QueueItem | null
  checkoutReady:  string | null

  callNext:       () => void
  startConsult:   (item: QueueItem) => void
  completeCurrent: () => void
  clearCheckout:  () => void
  loadQueue:      () => Promise<void>
}

function derive(queue: QueueItem[]) {
  return {
    waiting: queue.filter(q => q.status === 'waiting'),
    done:    queue.filter(q => q.status === 'done'),
  }
}

export const useQueueStore = create<QueueStore>()((set) => ({
  queue:         MOCK_QUEUE,
  ...derive(MOCK_QUEUE),
  inProgress:    MOCK_QUEUE.find(q => q.status === 'in-progress') ?? null,
  checkoutReady: null,

  loadQueue: async () => {
    const queue = await posApi.getQueue()
    set({
      queue,
      inProgress: queue.find(q => q.status === 'in-progress') ?? null,
      ...derive(queue),
    })
  },

  callNext: () => set(s => {
    const next = s.waiting[0]
    if (!next) return {}
    const updated = s.queue.map(q =>
      q.queueNum === next.queueNum ? { ...q, status: 'in-progress' as const } : q
    )
    return { queue: updated, inProgress: next, ...derive(updated) }
  }),

  startConsult: (item) => set(s => {
    const updated = s.queue.map(q =>
      q.queueNum === item.queueNum ? { ...q, status: 'in-progress' as const } : q
    )
    return { queue: updated, inProgress: item, ...derive(updated) }
  }),

  completeCurrent: () => set(s => {
    if (!s.inProgress) return {}
    const queueNum = s.inProgress.queueNum
    const updated = s.queue.map(q =>
      q.queueNum === queueNum ? { ...q, status: 'done' as const } : q
    )
    return {
      queue: updated,
      inProgress: null,
      checkoutReady: queueNum,
      ...derive(updated),
    }
  }),

  clearCheckout: () => set({ checkoutReady: null }),
}))
