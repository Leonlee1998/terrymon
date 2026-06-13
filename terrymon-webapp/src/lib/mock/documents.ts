import type { DocItem, Notification } from '@/types'

export const MOCK_DOCUMENTS: DocItem[] = [
  { id: 'D001', memberId: 'M001', petId: 'P001', type: 'prescription',
    title: '小怪獸｜藥單 2026-05-20', url: '#', size: '124 KB',
    createdAt: '2026-05-20T10:30:00', isRead: true },
  { id: 'D002', memberId: 'M001', petId: 'P001', type: 'receipt',
    title: '小怪獸｜診療收據 2026-05-20', url: '#', size: '89 KB',
    createdAt: '2026-05-20T10:32:00', isRead: true },
  { id: 'D003', memberId: 'M001', petId: 'P001', type: 'contract',
    title: '小怪獸｜美容合約 2026-06-01', url: '#', size: '215 KB',
    createdAt: '2026-06-01T14:00:00', isRead: false },
  { id: 'D004', memberId: 'M001', petId: 'P001', type: 'receipt',
    title: '小怪獸｜美容收據 2026-06-01', url: '#', size: '78 KB',
    createdAt: '2026-06-01T16:30:00', isRead: false },
  { id: 'D005', memberId: 'M001', petId: 'P002', type: 'report',
    title: '咪咪｜血液檢查報告 2026-04-15', url: '#', size: '342 KB',
    createdAt: '2026-04-15T11:00:00', isRead: true },
]

export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 'N001', memberId: 'M001',
    type: 'appointment_reminder',
    title: '明天有回診提醒', body: '小怪獸明天 10:30 在布恩動物醫院有回診，記得準時到哦！',
    isRead: false, createdAt: '2026-06-14T09:00:00', actionUrl: '/appointments' },
  { id: 'N002', memberId: 'M001',
    type: 'doc_received',
    title: '收到新文件', body: '小怪獸的美容合約已簽署完成，可在文件收件匣查看。',
    isRead: false, createdAt: '2026-06-01T14:05:00', actionUrl: '/member' },
  { id: 'N003', memberId: 'M001',
    type: 'health_alert',
    title: '健康數據異常', body: '小怪獸今日血糖偏高（5.3 mmol/L），建議諮詢獸醫。',
    isRead: true, createdAt: '2026-06-01T08:35:00', actionUrl: '/pets' },
]
