# 醫師介面

```
/doctor/login   醫師登入（Supabase Auth）
/doctor         候診看板（三欄 Kanban）
/doctor/consult 看診作業
```

## Header 格式

左上角：`[PawPrint] 預約怪獸  |  [Stethoscope] {CLINIC_INFO.name}・{CLINIC_INFO.doctor}`

## 候診看板三欄

```
WaitingColumn     候診中（queueStore.waiting[]）
                  顯示：號碼、寵物名、品種、體重
                  ⚠️ 有過敏史 → 紅色 badge
InProgressColumn  看診中（queueStore.inProgress）
                  ⚠️ 過敏史大紅框 + ⚠️ 符號
DoneColumn        今日完成（queueStore.done[]）
```

## Realtime 訂閱

在 `/doctor/page.tsx` 訂閱 appointments（store_id + status = checked_in）：
- INSERT → `queueStore.addToWaiting(payload.new)`
- UPDATE → `queueStore.updateStatus(id, status)`
cleanup：`supabase.removeChannel(channel)`

## 看診完成寫入（不能亂順序）

```
Step 1: INSERT medical_records（nxvet_record_id: null）
Step 2: RPC process_service_payment
Step 3: UPDATE appointments.status = 'completed'
Step 4: INSERT documents（藥單 + 收據）
Step 5: INSERT notifications（看診完成）
Step 6: INSERT notifications（回診提醒，若有 follow_up_date）
```

## medical_records 的 NxVet 欄位

```typescript
nxvet_record_id: null   // MVP 先 null，橋接後填入
nxvet_synced_at: null   // MVP 先 null
```

看診結果的 prescriptions 欄位是 JSONB array：
```typescript
[{ name: '藥名', dosage: '劑量', frequency: '頻率', duration: '天數' }]
```
