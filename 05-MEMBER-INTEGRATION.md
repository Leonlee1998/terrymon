# 05-MEMBER-INTEGRATION.md
# 統一會員系統整合規格
# ⚠️ 所有系統開發前必須先閱讀這份，理解會員識別邏輯

---

## 會員識別核心設計

```
Firebase Auth UID
      │
      ↓
Member Record (memberId = "M001")
      │
      ├── QR Code: "TERRYMON-M001-{timestamp}"
      ├── Pets: [P001, P002, ...]
      ├── Documents: [處方、收據、合約...]
      ├── Appointments: [預約紀錄...]
      └── Balance / Points
```

## QR Code 格式（MVP 靜態，後期動態）

```
格式：TERRYMON-{memberId}-{timestamp}
範例：TERRYMON-M001-1718123456789

解析方式：
  const parts = qrValue.split('-')
  const memberId = parts[1]   // "M001"

MVP 驗證：只取 memberId，不驗 timestamp
後期升級：
  - timestamp 有效期 300 秒
  - HMAC 簽名防偽造
  - Server 端驗證
```

## 三個 POS 系統的共用報到流程

```
掃描/輸入 QR Code 或手機號碼
         ↓
解析 memberId / 查詢手機號碼
         ↓
從 API 取得 Member + Pets 資料
（MVP 階段：從 Mock Data 模擬）
         ↓
顯示會員姓名 + 寵物列表
         ↓
選擇本次服務的寵物
         ↓
進行服務流程（各系統不同）
         ↓
服務完成 → 寫入 Document
（MVP：console.log，後期接 API）
         ↓
推送通知至客戶 App
（MVP：toast 模擬，後期接 Firebase FCM）
```

## Mock 資料共用規範

所有 POS 系統的 `src/lib/mock/index.ts` 必須包含以下相同的基礎資料：

```typescript
// 可以被 QR Code 或手機號碼查詢到的會員
export const SCANNABLE_MEMBER = {
  id: 'M001',
  name: '林小華',
  phone: '0912-345-678',
  qrPrefix: 'TERRYMON-M001',  // QR 前綴（不含 timestamp）
}

// 這個函數模擬「掃碼後查詢會員」的 API
export function lookupMember(input: string): Member | null {
  // 支援三種輸入：
  // 1. QR Code 完整值：TERRYMON-M001-1718000000
  // 2. QR 前綴：TERRYMON-M001
  // 3. 手機號碼：0912-345-678 或 0912345678
  const cleaned = input.replace(/-/g, '').replace(/\s/g, '')

  if (input.startsWith('TERRYMON-')) {
    const parts = input.split('-')
    if (parts[1] === 'M001') return { ...MOCK_MEMBER, pets: MOCK_PETS }
  }
  if (cleaned.includes('0912345678') || cleaned.includes('912345678')) {
    return { ...MOCK_MEMBER, pets: MOCK_PETS }
  }
  // MVP：任何輸入都回傳 mock 會員（方便 Demo）
  if (input.trim().length > 0) return { ...MOCK_MEMBER, pets: MOCK_PETS }
  return null
}
```

## 服務完成後的文件推送（MVP 模擬）

```typescript
// src/lib/push.ts（所有 POS 系統共用此邏輯）

export interface PushDocumentPayload {
  memberId: string
  petId: string
  type: 'prescription' | 'receipt' | 'contract'
  title: string
  content: string  // HTML 或 PDF URL
}

// MVP：只做 console.log + toast
// 後期：呼叫後端 API，觸發 Firebase FCM
export async function pushDocumentToMember(payload: PushDocumentPayload): Promise<void> {
  console.log('[PUSH DOCUMENT]', payload)
  // 後期換成：
  // await api.post('/api/documents', payload)
  // await api.post('/api/notifications/send', { memberId, type: 'doc_received', ... })
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
```

## 各系統服務完成後寫入的文件類型

| 系統 | 文件類型 | 文件內容 |
|------|---------|---------|
| 獸醫 POS | prescription | 藥單（HTML 格式） |
| 獸醫 POS | receipt | 診療收據 |
| 美容 POS | contract | 定型化合約（含電子簽名） |
| 美容 POS | receipt | 美容收據 |

## 後期 API 對接的替換點

所有 POS 系統的 `src/services/api.ts` 都有這個函數，MVP 回傳 Mock，後期換真實：

```typescript
// MVP 版本
export const posApi = {
  lookupMember: async (input: string) => {
    await delay(600)
    return lookupMember(input)  // 從 mock 查詢
  },
  completeService: async (payload: CompleteServicePayload) => {
    await delay(800)
    console.log('[COMPLETE SERVICE]', payload)
    return { success: true, documentId: 'DOC_MOCK_001' }
  },
}

// 後期換成：
// lookupMember: async (input) => await fetch('/api/members/lookup?q=' + input)
// completeService: async (payload) => await fetch('/api/services/complete', { method: 'POST', body: JSON.stringify(payload) })
```
