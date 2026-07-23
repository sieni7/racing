-- Audit log table
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  record_id TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'DELETE', 'RESTORE')),
  changed_fields JSONB,
  performed_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_table ON audit_log(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_log_record ON audit_log(record_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON audit_log(created_at DESC);

-- Add deleted_at to all entity tables for soft-delete
ALTER TABLE players ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE news ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE staff ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE gallery ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE standings ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_players_deleted ON players(deleted_at);
CREATE INDEX IF NOT EXISTS idx_matches_deleted ON matches(deleted_at);
CREATE INDEX IF NOT EXISTS idx_news_deleted ON news(deleted_at);
CREATE INDEX IF NOT EXISTS idx_staff_deleted ON staff(deleted_at);
CREATE INDEX IF NOT EXISTS idx_gallery_deleted ON gallery(deleted_at);
CREATE INDEX IF NOT EXISTS idx_standings_deleted ON standings(deleted_at);
