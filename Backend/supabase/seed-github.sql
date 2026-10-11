-- ============================================================
-- seed-github.sql
-- Seed data for GitHub domain tables
-- ============================================================

-- ------------------------------------------------------------
-- Table: github_prs
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS github_prs (
  id           SERIAL PRIMARY KEY,
  title        TEXT,
  author       TEXT,
  status       TEXT,
  branch       TEXT,
  base_branch  TEXT,
  created_at   TIMESTAMP,
  review_count INTEGER,
  domain       TEXT DEFAULT 'github.com'
);

-- ------------------------------------------------------------
-- Table: github_issues
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS github_issues (
  id         SERIAL PRIMARY KEY,
  title      TEXT,
  label      TEXT,
  assignee   TEXT,
  status     TEXT,
  priority   TEXT,
  created_at TIMESTAMP,
  domain     TEXT DEFAULT 'github.com'
);

-- ------------------------------------------------------------
-- Table: github_ci_runs
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS github_ci_runs (
  id               SERIAL PRIMARY KEY,
  branch           TEXT,
  status           TEXT,
  duration_seconds INTEGER,
  triggered_by     TEXT,
  ran_at           TIMESTAMP,
  domain           TEXT DEFAULT 'github.com'
);

-- ============================================================
-- Seed Data
-- ============================================================

-- github_prs (5 rows)
INSERT INTO github_prs (title, author, status, branch, base_branch, created_at, review_count)
VALUES
  ('Fix authentication token refresh',   'alice', 'open',   'fix/auth-refresh',  'main', now() - INTERVAL '2 hours',    2),
  ('Add rate limiting middleware',        'bob',   'open',   'feat/rate-limit',   'main', now() - INTERVAL '1 day',      1),
  ('Update README and docs',             'carol', 'merged', 'docs/update',       'main', now() - INTERVAL '3 days',     3),
  ('Refactor database connection pool',  'alice', 'draft',  'refactor/db-pool',  'main', now() - INTERVAL '5 hours',    0),
  ('Fix CI pipeline for Node 20',        'dave',  'open',   'fix/ci-node20',     'main', now() - INTERVAL '30 minutes', 1);

-- github_issues (5 rows)
INSERT INTO github_issues (title, label, assignee, status, priority, created_at)
VALUES
  ('API response time exceeds 2s on /search', 'bug',         'alice', 'open', 'high',   now() - INTERVAL '1 day'),
  ('Add dark mode support',                   'enhancement', 'bob',   'open', 'medium', now() - INTERVAL '3 days'),
  ('Memory leak in websocket handler',         'bug',         'carol', 'open', 'high',   now() - INTERVAL '6 hours'),
  ('Improve error messages for auth failures', 'enhancement', 'dave',  'open', 'low',    now() - INTERVAL '2 days'),
  ('Add pagination to /users endpoint',        'feature',     'alice', 'open', 'medium', now() - INTERVAL '4 days');

-- github_ci_runs (5 rows)
INSERT INTO github_ci_runs (branch, status, duration_seconds, triggered_by, ran_at)
VALUES
  ('main',             'passing', 142, 'alice', now() - INTERVAL '1 hour'),
  ('fix/auth-refresh', 'failing',  87, 'alice', now() - INTERVAL '2 hours'),
  ('feat/rate-limit',  'passing', 201, 'bob',   now() - INTERVAL '3 hours'),
  ('refactor/db-pool', 'running',  45, 'alice', now() - INTERVAL '10 minutes'),
  ('main',             'passing', 138, 'dave',  now() - INTERVAL '5 hours');
