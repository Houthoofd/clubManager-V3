ALTER TABLE messages ADD COLUMN IF NOT EXISTS archived TINYINT(1) NOT NULL DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_messages_archived ON messages(destinataire_id, archived);
