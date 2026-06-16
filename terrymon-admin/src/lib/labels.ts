import type { TransactionType } from '@/types'

export const TX_TYPE_LABEL: Record<TransactionType, string> = {
  topup: '儲值',
  topup_bonus: '儲值贈送',
  service_payment: '服務消費',
  order_payment: '商城消費',
  refund: '退款',
  points_redemption: '點數折抵',
  points_earn: '點數回饋',
  balance_adjustment: '人工調整',
}
