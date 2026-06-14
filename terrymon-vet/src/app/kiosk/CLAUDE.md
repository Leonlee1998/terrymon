# Vet Kiosk 流程

```
/kiosk          待機（進入時 reset 所有 kioskStore 狀態）
/kiosk/scan     掃碼（查 members + pets）
/kiosk/pet      選寵物（顯示上次就診 + ⚠️ 過敏史大紅框）
/kiosk/weight   體重量測
                動畫：connecting → measuring → 數字跑 → done
                量測完同時：
                  - INSERT health_data（metric: 'weight'）
                  - UPDATE pets.weight
/kiosk/waiting  候診號碼牌（監聽 appointments Realtime 狀態）
/kiosk/checkout 取件結帳（掃碼二次驗證 → 顯示診斷/藥單/費用）
```

## Guard 規則

每個頁面缺少前置 state → redirect `/kiosk`：
- `/kiosk/pet` 需要 `kioskStore.member`
- `/kiosk/weight` 需要 `kioskStore.pet`
- `/kiosk/waiting` 需要 `kioskStore.queueNum`
- `/kiosk/checkout` 需要 `kioskStore.appointmentId`

## 掛號寫入（三步都要做）

```
Step 1: INSERT appointments（type: 'vet'，status: 'checked_in'，source: 'kiosk'）
Step 2: INSERT health_data（metric: 'weight'，recorded_at: now）
Step 3: UPDATE pets.weight（最新體重同步）
```

## 過敏史顯示

`/kiosk/pet` 頁面，若 `pet.allergies.length > 0`：
→ 顯示大紅色 alert bar，清楚列出所有過敏項目
→ 飼主確認後才能繼續

## 候診等待

`/kiosk/waiting` 訂閱 appointments Realtime：
- 收到 `status: 'in_progress'` → 顯示「輪到您了」提示
- 收到 `status: 'completed'` → 引導前往 `/kiosk/checkout`
