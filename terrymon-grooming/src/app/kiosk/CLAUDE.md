# Kiosk 流程順序

```
/kiosk            待機（進入時 reset 所有 kioskStore 狀態）
/kiosk/scan       掃碼 → 查 members + pets → 顯示餘額/點數 → 選模式
  ├── /kiosk/appointment  有預約 → 確認預約（appointments table）
  └── /kiosk/schedule     無預約 → 選美容師 + 時段（groomers）
/kiosk/pet        選寵物（顯示過敏史）
/kiosk/services   選服務（price_matrix 依品種/毛長/體型自動帶入）
/kiosk/payment    選付款方式（全刷卡/全折抵/混合 slider）
/kiosk/contract   合約確認（動態填入會員/寵物/服務資料）
/kiosk/signature  電子簽名（react-signature-canvas）
/kiosk/complete   完成（15秒倒數自動回待機）
/kiosk/topup      現場儲值（從 scan 頁進入 → 呼叫 process_topup RPC）
```

## Guard 規則

每個頁面都要檢查前置 state，缺少則 redirect `/kiosk`：
- `/kiosk/pet` 需要 `kioskStore.member`
- `/kiosk/services` 需要 `kioskStore.pet`
- `/kiosk/payment` 需要 `kioskStore.selectedServices`
- `/kiosk/contract` 需要 `kioskStore.paymentMode`
- `/kiosk/signature` 需要 `kioskStore.contractText`
- `/kiosk/complete` 需要 `kioskStore.isCompleted`

## Supabase 呼叫

- 掃碼：`members + pets`（read，anon key 可）
- walk-in 新增預約：`appointments` INSERT
- 完成服務：見 `posApi.ts` `completeGroomingService()`（依序寫入多個 table）
- 儲值：`process_topup` RPC

## 離線

所有 Supabase 寫入都要 try/catch，失敗時 toast.warning() 提示，不卡死流程。
