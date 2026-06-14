# NxVet API 整合待開發事項

> 狀態：**待開發（Pending）**  
> 負責人：TBD  
> 相關系統：terrymon-vet / terrymon-webapp

---

## 背景說明

NxVet 是台灣獸醫院常用的診療管理系統（POS）。
部分合作獸醫院使用 NxVet 管理預約與病歷，而非直接使用 TerryMon 的自建 POS。

整合目標：
1. 合作醫院在 NxVet 建立預約後，飼主 App 能同步收到預約通知
2. 飼主持有 TerryMon 會員資格時，可以在現場 Kiosk 快速報到（掃 QR Code）
3. NxVet 看診完成後，醫療紀錄可同步進 TerryMon `medical_records`（選配）

---

## 功能範圍

### P0：預約同步（必做）

- [ ] 研究 NxVet 是否提供 Webhook 或 API callback（推送預約異動）
- [ ] 若有 Webhook：建立 Edge Function `supabase/functions/nxvet-webhook/` 接收
  - 驗證 NxVet 的簽名 / Bearer token
  - 將預約寫入 `appointments` table（`source: 'nxvet'`）
  - 觸發 `notifications` 推播給飼主
- [ ] 若無 Webhook：改用 polling（每 N 分鐘 cron 拉取 NxVet API）
  - 建立 Edge Function `supabase/functions/nxvet-sync/` + Supabase Cron Job

### P0：飼主 QR 報到（必做）

當飼主到診，Kiosk 掃描會員 QR Code：
- [ ] Kiosk `/kiosk` 掃碼後，判斷當日是否有 NxVet 預約（`source: 'nxvet'`）
- [ ] 若有，顯示「NxVet 預約報到」提示，更新 `appointments.status = 'checked_in'`
- [ ] 通知 Doctor 介面候診看板（已透過 Realtime 監聽）

### P1：醫療紀錄同步（選配）

- [ ] NxVet 看診結束後，透過 API/Webhook 取得診療摘要
- [ ] 寫入 `medical_records`，欄位對應：

  | NxVet 欄位 | TerryMon 欄位 |
  |-----------|--------------|
  | `record_id` | `nxvet_record_id` |
  | `pet_chip_id` 或 `member_id` | 查詢 `pets.chip_id` 或 `members` 對應 |
  | `visit_date` | `date` |
  | `diagnosis` | `diagnosis` |
  | `treatment` | `treatment` |
  | `prescriptions[]` | `prescription` (JSON) |
  | `follow_up_date` | `next_visit_date` |

- [ ] 處理 upsert（同一筆 NxVet 紀錄不重複寫入）：
  ```sql
  -- medical_records 需加欄位（migration）
  alter table medical_records
    add column if not exists nxvet_record_id text unique,
    add column if not exists nxvet_synced_at timestamptz;
  ```

---

## 需要確認的事項（與 NxVet 商務對接）

1. NxVet 是否提供第三方 API 存取（需申請合作）？
2. API 認證方式（OAuth2 / API Key）？
3. 是否支援 Webhook 推播，或只有 REST 拉取？
4. 資料格式（JSON schema）？
5. 合作費用 / 授權條件？

---

## 現有預留欄位（已在 schema 準備）

```sql
-- appointments table（已存在）
source text  -- 'webapp' | 'grooming_pos' | 'vet_pos' | 'nxvet'

-- medical_records table（待加入 migration）
nxvet_record_id text unique
nxvet_synced_at timestamptz
```

---

## 暫時方案（NxVet 整合完成前）

- 合作醫院改用 TerryMon 自建 vet-POS（`terrymon-vet`）管理預約與看診
- 飼主仍可透過 TerryMon App 預約，POS 端收到預約通知
- NxVet 整合完成後，兩套系統並行，以 `source` 欄位區分來源

---

## 相關檔案

| 檔案 | 說明 |
|------|------|
| `supabase/migrations/001_initial_schema.sql` | appointments / medical_records 定義 |
| `terrymon-vet/src/services/posApi.ts` | 獸醫 POS API（自建路徑） |
| `terrymon-webapp/src/services/api.ts` | 飼主 App API |
| `supabase/functions/` | Edge Functions 部署位置 |
