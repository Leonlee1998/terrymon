-- migration: 010_add_member_handle
-- created: 2026-06-15
-- description: 新增 members.handle 欄位，用於會員 ID（條碼、店內報到、@搜尋）

alter table members
  add column if not exists handle text unique;

create index if not exists members_handle_idx on members(handle);
