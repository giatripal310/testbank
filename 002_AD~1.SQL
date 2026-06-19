-- ─────────────────────────────────────────────
-- Migration 002 — Add tests table
-- Run this in Supabase → SQL Editor → New query
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS tests (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  test_code     TEXT        UNIQUE NOT NULL,
  title         TEXT        NOT NULL,
  description   TEXT,
  instructions  TEXT,
  subject       TEXT,
  grade_level   TEXT,
  question_ids  UUID[]      DEFAULT '{}',
  created_by    UUID        REFERENCES profiles(id),
  updated_by    UUID        REFERENCES profiles(id),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  is_active     BOOLEAN     DEFAULT TRUE
);

-- Enable RLS
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read tests
CREATE POLICY "auth_read_tests"
  ON tests FOR SELECT
  TO authenticated
  USING (true);

-- Users can insert their own tests
CREATE POLICY "auth_insert_tests"
  ON tests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Any authenticated user can update tests (collaborative editing)
CREATE POLICY "auth_update_tests"
  ON tests FOR UPDATE
  TO authenticated
  USING (true);

-- Auto-update updated_at on change
CREATE OR REPLACE FUNCTION update_tests_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_tests_timestamp ON tests;
CREATE TRIGGER set_tests_timestamp
  BEFORE UPDATE ON tests
  FOR EACH ROW EXECUTE FUNCTION update_tests_timestamp();
