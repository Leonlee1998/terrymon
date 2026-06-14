import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calcAge(birthDate: string): string {
  if (!birthDate) return '年齡未填'

  const birth = new Date(birthDate)
  if (Number.isNaN(birth.getTime())) return '年齡未填'

  const now = new Date()
  let years = now.getFullYear() - birth.getFullYear()
  let months = now.getMonth() - birth.getMonth()

  if (now.getDate() < birth.getDate()) months -= 1
  if (months < 0) {
    years -= 1
    months += 12
  }

  if (years <= 0) return `${Math.max(months, 0)} 個月`
  if (months === 0) return `${years} 歲`
  return `${years} 歲 ${months} 個月`
}

export function formatDate(dateStr: string, format: 'short' | 'full' = 'short'): string {
  if (!dateStr) return '未設定'
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return dateStr

  if (format === 'full') {
    return d.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    })
  }

  return d.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

export function formatTime(dateStr: string): string {
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return '--:--'
  return d.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })
}

export function formatPrice(price: number): string {
  return `NT$ ${price.toLocaleString()}`
}

export function formatFileSize(size: string): string {
  return size
}

export function getSpeciesLabel(species: string): string {
  const map: Record<string, string> = {
    dog: '狗狗',
    cat: '貓咪',
    other: '其他',
  }
  return map[species] ?? '其他'
}

export function getSpeciesEmoji(species: string): string {
  return species === 'dog' ? '犬' : species === 'cat' ? '貓' : '寵'
}

export function getDeviceIcon(type: string): string {
  const map: Record<string, string> = {
    camera: '攝影機',
    glucose: '血糖機',
    bp_monitor: '血壓計',
    thermometer: '溫度計',
    scale: '體重計',
  }
  return map[type] ?? '裝置'
}

export function getDeviceLabel(type: string): string {
  const map: Record<string, string> = {
    camera: '攝影機',
    glucose: '血糖機',
    bp_monitor: '血壓計',
    thermometer: '溫度計',
    scale: '體重計',
  }
  return map[type] ?? '智慧裝置'
}

export function getTrend(data: { value: number }[]): '↑' | '↓' | '→' {
  if (data.length < 2) return '→'
  const last = data[data.length - 1].value
  const prev = data[data.length - 2].value
  if (last > prev + 0.1) return '↑'
  if (last < prev - 0.1) return '↓'
  return '→'
}
