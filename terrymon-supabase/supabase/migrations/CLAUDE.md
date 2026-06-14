# Migration 規範

命名：`NNN_描述.sql`（NNN 遞增）
每個 migration 第一行要有 comment 說明用途

禁止：
- 直接在 Dashboard SQL Editor 改 schema
- migration 裡放 secret/key
- DROP TABLE 不加 IF EXISTS
