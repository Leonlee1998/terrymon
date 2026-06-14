# Store 架構

## kioskStore — Kiosk 流程狀態

```
member      查到的會員資料
pet         選擇的寵物
weight      量測到的體重（kg）
queueNum    本次候診號碼（如 'A006'，本地生成）
appointmentId  掛號後的 appointment UUID
```

只在這個 session 存在，`reset()` 後清空所有欄位。
Guard：每個 kiosk 頁面進入時檢查前置 state，缺少就 redirect `/kiosk`。

## queueStore — 候診隊列

```
waiting[]     候診中的病患
inProgress    看診中的病患（null or QueueItem）
done[]        今日已完成
```

**存記憶體，不存 Supabase。** 從 Supabase Realtime 更新。
POS 重開機後 → 從 `appointments` table 查 `status=checked_in` 重建。

## 規則

- Store 不可直接呼叫 supabase
- Store 只管 UI 狀態，API 呼叫在 `posApi.ts`
- `queueStore.addToWaiting()` 由 Realtime callback 呼叫，不由 component 直接呼叫
