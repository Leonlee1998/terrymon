#!/bin/bash
# 從 Supabase 生成 TypeScript DB 型別
# 執行前確認已 login: supabase login
# 執行: bash supabase/scripts/gen-types.sh

set -e

PROJECT_REF="lugakfqhugqciwlskunt"
OUT="supabase/types/database.types.ts"

echo "Generating types from project $PROJECT_REF..."
supabase gen types typescript --project-id "$PROJECT_REF" > "$OUT"
echo "✓ Generated: $OUT"

# 同步到各前端（各 repo 自行 import 或 copy）
for REPO in terrymon-webapp terrymon-grooming terrymon-vet terrymon-shop-admin; do
  DEST="$REPO/src/types/database.types.ts"
  cp "$OUT" "$DEST"
  echo "✓ Copied to $DEST"
done
