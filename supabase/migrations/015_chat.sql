-- migration: 015_chat
-- created: 2026-06-15
-- description: 聊天室基礎 schema（conversations / conversation_members / messages）
--              UI Phase 3 實作；此 migration 先建表 + RLS + Realtime

-- ============================================================
-- conversations：對話頻道
-- ============================================================
CREATE TABLE IF NOT EXISTS conversations (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  type        text        NOT NULL DEFAULT 'direct'
                CHECK (type IN ('direct', 'group')),
  ref_type    text        CHECK (ref_type IN ('appointment', 'adoption', 'care')),
  ref_id      uuid,
  created_at  timestamptz NOT NULL DEFAULT now_utc()
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- service_role 先設（不依賴其他 table）
CREATE POLICY "conversations_service_all" ON conversations
  USING (auth.role() = 'service_role');

-- ============================================================
-- conversation_members：頻道成員名單（必須先建，conversations policy 才能引用它）
-- ============================================================
CREATE TABLE IF NOT EXISTS conversation_members (
  conversation_id uuid        NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  member_id       uuid        NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  last_read_at    timestamptz,
  joined_at       timestamptz NOT NULL DEFAULT now_utc(),
  PRIMARY KEY (conversation_id, member_id)
);

CREATE INDEX IF NOT EXISTS cm_member_idx ON conversation_members(member_id);

ALTER TABLE conversation_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cm_participant_select" ON conversation_members
  FOR SELECT USING (
    conversation_id IN (
      SELECT conversation_id FROM conversation_members cm2
      WHERE cm2.member_id IN (SELECT id FROM members WHERE supabase_uid = auth.uid())
    )
  );

CREATE POLICY "cm_service_all" ON conversation_members
  USING (auth.role() = 'service_role');

-- 延後建立：需要 conversation_members 存在
CREATE POLICY "conversations_member_select" ON conversations
  FOR SELECT USING (
    id IN (
      SELECT conversation_id FROM conversation_members
      WHERE member_id IN (SELECT id FROM members WHERE supabase_uid = auth.uid())
    )
  );

-- ============================================================
-- messages：訊息本體
-- ============================================================
CREATE TABLE IF NOT EXISTS messages (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid        NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id       uuid        NOT NULL REFERENCES members(id),
  content_type    text        NOT NULL DEFAULT 'text'
                    CHECK (content_type IN ('text', 'image')),
  content         text        NOT NULL,
  is_deleted      boolean     NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now_utc()
);

CREATE INDEX IF NOT EXISTS messages_conv_idx    ON messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS messages_sender_idx  ON messages(sender_id);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "messages_participant_select" ON messages
  FOR SELECT USING (
    conversation_id IN (
      SELECT conversation_id FROM conversation_members
      WHERE member_id IN (SELECT id FROM members WHERE supabase_uid = auth.uid())
    )
  );

CREATE POLICY "messages_participant_insert" ON messages
  FOR INSERT WITH CHECK (
    sender_id IN (SELECT id FROM members WHERE supabase_uid = auth.uid()) AND
    conversation_id IN (
      SELECT conversation_id FROM conversation_members
      WHERE member_id IN (SELECT id FROM members WHERE supabase_uid = auth.uid())
    )
  );

CREATE POLICY "messages_service_all" ON messages
  USING (auth.role() = 'service_role');

-- Realtime：訊息即時推送
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE conversation_members;
