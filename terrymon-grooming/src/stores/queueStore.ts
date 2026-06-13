'use client'
import { create } from 'zustand'
import type { QueueItem } from '@/types'
import { MOCK_QUEUE } from '@/lib/mock'

interface QueueStore {
  queue: QueueItem[]
  inProgress: QueueItem | null
  startConsult: (item: QueueItem) => void
  completeCurrent: () => void
}

export const useQueueStore = create<QueueStore>()((set) => ({
  queue: MOCK_QUEUE,
  inProgress: MOCK_QUEUE.find((q) => q.status === 'in-progress') ?? null,
  startConsult: (item) => set({ inProgress: item }),
  completeCurrent: () =>
    set((s) => ({
      inProgress: null,
      queue: s.queue.map((q) =>
        q.queueNum === s.inProgress?.queueNum
          ? { ...q, status: 'done' as const }
          : q
      ),
    })),
}))
