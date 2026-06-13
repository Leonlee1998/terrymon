import type { PetHealthData, AIoTDevice } from '@/types'

export const MOCK_HEALTH_DATA: PetHealthData = {
  petId: 'P001',
  weight: [
    { timestamp: '2026-01-15T08:00:00', value: 8.8, unit: 'kg' },
    { timestamp: '2026-02-15T08:00:00', value: 8.9, unit: 'kg' },
    { timestamp: '2026-03-15T08:00:00', value: 9.0, unit: 'kg' },
    { timestamp: '2026-04-15T08:00:00', value: 9.1, unit: 'kg' },
    { timestamp: '2026-05-15T08:00:00', value: 9.3, unit: 'kg' },
    { timestamp: '2026-06-10T08:00:00', value: 9.2, unit: 'kg' },
  ],
  bloodSugar: [
    { timestamp: '2026-04-01T07:30:00', value: 5.2, unit: 'mmol/L' },
    { timestamp: '2026-04-15T07:30:00', value: 5.0, unit: 'mmol/L' },
    { timestamp: '2026-05-01T07:30:00', value: 5.1, unit: 'mmol/L' },
    { timestamp: '2026-05-15T07:30:00', value: 4.9, unit: 'mmol/L' },
    { timestamp: '2026-06-01T07:30:00', value: 5.3, unit: 'mmol/L' },
  ],
  bloodPressureSys: [
    { timestamp: '2026-04-01T07:30:00', value: 128, unit: 'mmHg' },
    { timestamp: '2026-05-01T07:30:00', value: 125, unit: 'mmHg' },
    { timestamp: '2026-06-01T07:30:00', value: 130, unit: 'mmHg' },
  ],
  bloodPressureDia: [
    { timestamp: '2026-04-01T07:30:00', value: 82, unit: 'mmHg' },
    { timestamp: '2026-05-01T07:30:00', value: 80, unit: 'mmHg' },
    { timestamp: '2026-06-01T07:30:00', value: 85, unit: 'mmHg' },
  ],
  heartRate: [
    { timestamp: '2026-06-10T08:00:00', value: 88, unit: 'bpm' },
    { timestamp: '2026-06-11T08:00:00', value: 92, unit: 'bpm' },
    { timestamp: '2026-06-12T08:00:00', value: 86, unit: 'bpm' },
  ],
  temperature: [
    { timestamp: '2026-06-10T08:00:00', value: 38.5, unit: '°C' },
    { timestamp: '2026-06-11T08:00:00', value: 38.3, unit: '°C' },
    { timestamp: '2026-06-12T08:00:00', value: 38.6, unit: '°C' },
  ],
}

export const MOCK_DEVICES: AIoTDevice[] = [
  {
    id: 'DEV001', petId: 'P001', name: '客廳攝影機',
    type: 'camera', status: 'online', lastSeen: '2026-06-13T10:00:00',
    batteryLevel: undefined, streamUrl: 'https://placehold.co/640x360/1a1d1a/ffffff?text=Camera+Live',
  },
  {
    id: 'DEV002', petId: 'P001', name: '血糖機',
    type: 'glucose', status: 'online', lastSeen: '2026-06-13T08:30:00',
    batteryLevel: 78,
  },
  {
    id: 'DEV003', petId: 'P001', name: '血壓計',
    type: 'bp_monitor', status: 'offline', lastSeen: '2026-06-12T20:00:00',
    batteryLevel: 12,
  },
  {
    id: 'DEV004', petId: 'P001', name: '智慧體重秤',
    type: 'scale', status: 'online', lastSeen: '2026-06-13T07:00:00',
    batteryLevel: 95,
  },
]
