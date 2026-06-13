export interface PushDocumentPayload {
  memberId: string
  petId: string
  type: 'prescription' | 'receipt' | 'contract'
  title: string
  content: string
}

export async function pushDocumentToMember(payload: PushDocumentPayload): Promise<void> {
  console.log('[PUSH DOCUMENT]', payload)
  // 後期換成：await api.post('/api/documents', payload)
  //           await api.post('/api/notifications/send', { memberId, type: 'doc_received', ... })
}

export async function pushAppointmentToMember(params: {
  memberId: string
  petId: string
  type: 'vet' | 'grooming'
  date: string
  time: string
  location: string
  notes: string
}): Promise<void> {
  console.log('[PUSH APPOINTMENT]', params)
}
