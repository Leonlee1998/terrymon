import { NextResponse } from 'next/server'
import { generateContractPDF } from '@/lib/contract/generator'
import type { ContractData } from '@/lib/contract/types'

export async function GET() {
  const testData: ContractData = {
    memberName:    '林小華',
    memberId:      'M001',
    memberPhone:   '0912-345-678',
    memberAddress: '台中市西區精誠路100號',
    memberBirth:   '民國75年3月15日',
    memberLegal:   '',
    storeName:     'TerryMon 寵物美容',
    storeOwner:    'TerryMon 有限公司',
    storePhone:    '04-2345-6789',
    storeAddress:  '台中市西區精誠路 88 號',
    storeTaxId:    '12345678',
    groomerName:   '王美玲',
    signLocation:  'TerryMon 台中店',
    petName:       '小怪獸',
    petBreed:      '柯基犬',
    petWeight:     9.2,
    petAllergies:  ['雞肉蛋白'],
    services: [
      { name: '洗澡＋剪毛（M型·中毛）', price: 1200, qty: 1, period: '當日' },
      { name: '香氛深層護毛', price: 200, qty: 1, period: '當日' },
    ],
    totalPrice:     1400,
    paymentMethod:  '儲值折抵 + 信用卡',
    balanceUsed:    1000,
    cardAmount:     400,
    memberFee:      0,
    cancelPct:      5,
    terminatePct:   10,
    refundDaysPre:  15,
    refundDaysPost: 30,
    court:          '台中',
    specialNotes:   '客人要求保留耳毛。',
    signatureUrl:   '',
    signedAt:       new Date().toISOString(),
  }

  const buffer = await generateContractPDF(testData)

  return new Response(new Uint8Array(buffer), {
    headers: {
      'Content-Type':        'application/pdf',
      'Content-Disposition': 'inline; filename="contract_test.pdf"',
    },
  })
}
