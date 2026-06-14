# Edge Function 規範

每個 function 都要：
1. 驗證來源（Authorization header 或 webhook secret）
2. 用 service_role key 建立 client（不是 anon key）
3. 錯誤要 catch 並回傳適當 HTTP status

環境變數（在 Supabase Dashboard 設定，不進 git）：
- SUPABASE_SERVICE_ROLE_KEY
- LINE_CHANNEL_ACCESS_TOKEN
- ECPAY_MERCHANT_ID
- ECPAY_HASH_KEY
- ECPAY_HASH_IV
