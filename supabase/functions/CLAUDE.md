# Edge Function 規範

每個 function 都要：
1. 驗證來源（Authorization header 或 webhook secret）
2. 用 `service_role key` 建立 Supabase client
3. 錯誤要 catch 並回傳適當 HTTP status

## 標準模板

```typescript
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  // 1. 驗證來源
  const authHeader = req.headers.get('Authorization')
  if (authHeader !== `Bearer ${Deno.env.get('FUNCTION_SECRET')}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    // 2. 建立 admin client（service_role）
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // 3. 執行操作
    const body = await req.json()
    // ...

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
```

## 規劃中的 Functions

```
line-notify/     → 服務完成後推播 LINE 通知
                    觸發：美容/看診完成，由 POS 呼叫
                    動作：呼叫 LINE Messaging API 傳訊息給飼主

ecpay-webhook/   → 綠界金流 webhook 處理
                    觸發：綠界金流回傳付款結果
                    動作：驗證 CheckMacValue，更新 orders.status

nxvet-sync/      → 定時從 NxVet 同步醫療紀錄
                    觸發：Cron（每小時）
                    動作：查詢 NxVet API，upsert medical_records

generate-pdf/    → 產生合約/藥單 PDF，上傳到 Storage
                    觸發：服務完成後由 POS 呼叫
                    動作：生成 PDF，上傳至 contracts/receipts bucket，回傳 URL
```

## 環境變數（在 Supabase Dashboard 的 Edge Functions Secrets 設定）

```
SUPABASE_SERVICE_ROLE_KEY   ← 自動注入，不需手動設
LINE_CHANNEL_ACCESS_TOKEN
ECPAY_MERCHANT_ID
ECPAY_HASH_KEY
ECPAY_HASH_IV
NXVET_API_KEY
NXVET_API_URL
FUNCTION_SECRET             ← 各 function 共用的驗證 token
```

## 部署

```bash
supabase functions deploy line-notify
supabase functions deploy ecpay-webhook
supabase functions deploy nxvet-sync
supabase functions deploy generate-pdf
```
