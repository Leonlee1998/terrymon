export interface ContractService {
  name:   string
  price:  number
  qty:    number
  period: string
}

export interface ContractData {
  // 甲方（消費者）
  memberName:    string
  memberId:      string
  memberPhone:   string
  memberAddress: string
  memberBirth:   string
  memberLegal:   string

  // 乙方（業者）
  storeName:     string
  storeOwner:    string
  storePhone:    string
  storeAddress:  string
  storeTaxId:    string
  groomerName:   string
  signLocation:  string

  // 服務寵物
  petName:       string
  petBreed:      string
  petWeight:     number
  petAllergies:  string[]

  // 服務項目
  services:      ContractService[]
  totalPrice:    number

  // 付款
  paymentMethod: string
  balanceUsed:   number
  cardAmount:    number
  memberFee:     number

  // 合約設定
  cancelPct:       number
  terminatePct:    number
  refundDaysPre:   number
  refundDaysPost:  number
  court:           string

  // 其他
  specialNotes:  string
  signatureUrl:  string
  signedAt:      string
}
