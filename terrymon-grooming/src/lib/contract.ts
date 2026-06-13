import { CONTRACT_TEMPLATE } from '@/lib/mock'

export function fillContract(params: {
  memberName: string
  memberPhone: string
  petName: string
  petBreed: string
  petWeight: number
  services: string[]
  totalPrice: number
}): string {
  const serviceList = params.services.map((s, i) => `${i + 1}. ${s}`).join('\n')
  const today = new Date().toLocaleDateString('zh-TW')
  return CONTRACT_TEMPLATE
    .replace('{{memberName}}', params.memberName)
    .replace('{{memberPhone}}', params.memberPhone)
    .replace('{{petName}}', params.petName)
    .replace('{{petBreed}}', params.petBreed)
    .replace('{{petWeight}}', String(params.petWeight))
    .replace('{{serviceList}}', serviceList)
    .replace('{{totalPrice}}', String(params.totalPrice))
    .replace('{{serviceDate}}', today)
    .replace('{{signDate}}', today)
}
