import { pdf } from '@react-pdf/renderer'
import React from 'react'
import ContractPDF from './ContractPDF'
import type { ContractData } from './types'

export async function generateContractPDF(data: ContractData): Promise<Buffer> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const element = React.createElement(ContractPDF, { data }) as React.ReactElement<any>
  const pdfDoc  = pdf(element)
  const blob    = await pdfDoc.toBlob()
  const arrayBuffer = await blob.arrayBuffer()
  return Buffer.from(arrayBuffer)
}
