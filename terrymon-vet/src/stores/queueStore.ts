'use client'
import { create } from 'zustand'
import type { QueueItem, ConsultationResult } from '@/types'
import { MOCK_QUEUE, MOCK_DONE_TODAY } from '@/lib/mock'
import { posApi } from '@/services/api'

interface QueueStore {
  waiting: QueueItem[]
  inProgress: QueueItem | null
  done: QueueItem[]
  loadQueue: () => Promise<void>
  callNext: () => void
  completeCurrent: (result: ConsultationResult) => void
}

export const useQueueStore = create<QueueStore>()((set, get) => ({
  waiting: MOCK_QUEUE.filter(q => q.status === 'waiting'),
  inProgress: MOCK_QUEUE.find(q => q.status === 'in-progress') ?? null,
  done: MOCK_DONE_TODAY,

  loadQueue: async () => {
    const queue = await posApi.getQueue()
    set(queue)
  },

  callNext: () => {
    const { waiting, inProgress, done } = get()
    if (!waiting.length) return
    const [next, ...rest] = waiting
    set({
      inProgress: { ...next, status: 'in-progress' },
      waiting: rest,
      done: inProgress ? [...done, { ...inProgress, status: 'done' }] : done,
    })
  },

  completeCurrent: (result: ConsultationResult) => {
    const { inProgress, done } = get()
    if (!inProgress) return
    set({
      inProgress: null,
      done: [...done, { ...inProgress, status: 'done', consultation: result }],
    })
  },
}))
