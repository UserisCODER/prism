-- ============================================================
-- seed-notion.sql
-- Seed data for Notion domain tables
-- ============================================================

-- ------------------------------------------------------------
-- Table: notion_pages
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notion_pages (
  id          SERIAL PRIMARY KEY,
  title       TEXT,
  status      TEXT,
  owner       TEXT,
  last_edited TIMESTAMP,
  page_type   TEXT,
  domain      TEXT DEFAULT 'notion.so'
);

-- ------------------------------------------------------------
-- Table: notion_tasks
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notion_tasks (
  id       SERIAL PRIMARY KEY,
  title    TEXT,
  assignee TEXT,
  status   TEXT,
  due_date DATE,
  priority TEXT,
  page_id  INTEGER,
  domain   TEXT DEFAULT 'notion.so'
);

-- ============================================================
-- Seed Data
-- ============================================================

-- notion_pages (5 rows)
INSERT INTO notion_pages (title, status, owner, last_edited, page_type)
VALUES
  ('Q4 Product Roadmap',          'published', 'alice', now() - INTERVAL '1 hour',    'roadmap'),
  ('Engineering Onboarding Guide','draft',     'bob',   now() - INTERVAL '2 days',    'guide'),
  ('Sprint 23 Planning',          'published', 'carol', now() - INTERVAL '3 hours',   'planning'),
  ('Customer Research Notes',     'draft',     'dave',  now() - INTERVAL '1 day',     'research'),
  ('Weekly Team Sync',            'published', 'alice', now() - INTERVAL '30 minutes','meeting');

-- notion_tasks (5 rows)
INSERT INTO notion_tasks (title, assignee, status, due_date, priority, page_id)
VALUES
  ('Finalize roadmap priorities', 'alice', 'in_progress', current_date + 1, 'high',   1),
  ('Review onboarding PR',        'bob',   'todo',        current_date + 2, 'medium', 2),
  ('Set sprint goals',            'carol', 'done',        current_date - 1, 'high',   3),
  ('Synthesize user interviews',  'dave',  'in_progress', current_date + 3, 'medium', 4),
  ('Write meeting agenda',        'alice', 'todo',        current_date,     'low',    5);
