-- Clean existing seed data
TRUNCATE TABLE usage_daily, meetings, tasks, contacts, projects, clients CASCADE;

-- ============================================================================
-- SCENARIO A: Client meeting prep
-- ============================================================================

-- 1 client: Acme Corp, SaaS industry, health_score 72, arr 120000
INSERT INTO clients (id, name, industry, health_score, arr, notes, created_at)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Acme Corp',
    'SaaS',
    72,
    120000.00,
    'Key enterprise SaaS account in annual review cycle. Monitoring SMB tier adoption and upcoming renewal.',
    NOW() - INTERVAL '120 days'
);

-- 2 contacts at Acme Corp
INSERT INTO contacts (id, client_id, name, role, email, last_contact_at, sentiment, created_at)
VALUES
(
    '00000000-0000-0000-0000-000000000101',
    '00000000-0000-0000-0000-000000000001',
    'Sarah Jenkins',
    'VP of Engineering',
    'sarah.jenkins@acmecorp.com',
    NOW() - INTERVAL '3 days',
    'positive',
    NOW() - INTERVAL '110 days'
),
(
    '00000000-0000-0000-0000-000000000102',
    '00000000-0000-0000-0000-000000000001',
    'David Chen',
    'Director of Product',
    'david.chen@acmecorp.com',
    NOW() - INTERVAL '6 days',
    'concerned',
    NOW() - INTERVAL '90 days'
);

-- 2 past meetings with Acme Corp
INSERT INTO meetings (id, client_id, title, held_at, summary, action_items, created_at)
VALUES
(
    '00000000-0000-0000-0000-000000000201',
    '00000000-0000-0000-0000-000000000001',
    'Q2 Executive Roadmap Review',
    NOW() - INTERVAL '24 days',
    'Reviewed enterprise integration progress and upcoming milestones. Sarah expressed satisfaction with API stability, while David raised questions on SMB tier telemetry.',
    '[{"task": "Deliver updated API latency benchmarks", "owner": "Alex Rivera", "completed": true}, {"task": "Share draft roadmap for Q3", "owner": "David Chen", "completed": true}]'::jsonb,
    NOW() - INTERVAL '24 days'
),
(
    '00000000-0000-0000-0000-000000000202',
    '00000000-0000-0000-0000-000000000001',
    'Q3 Check-in & Adoption Deep Dive',
    NOW() - INTERVAL '8 days',
    'Deep dive into recent SMB active user fluctuations. Agreed to analyze event telemetry and schedule a joint architecture audit before month end.',
    '[{"task": "Prepare SMB usage root cause investigation", "owner": "Antigravity Team", "completed": false}, {"task": "Provide sandbox credentials for load test", "owner": "Sarah Jenkins", "completed": false}]'::jsonb,
    NOW() - INTERVAL '8 days'
);

-- 3 open tasks for Acme Corp
INSERT INTO tasks (id, client_id, project_id, title, status, due_date, priority, assignee, created_at)
VALUES
(
    '00000000-0000-0000-0000-000000000301',
    '00000000-0000-0000-0000-000000000001',
    NULL,
    'Prepare Q3 Executive Review Slide Deck',
    'in_progress',
    CURRENT_DATE + INTERVAL '4 days',
    'high',
    'Alex Rivera',
    NOW() - INTERVAL '5 days'
),
(
    '00000000-0000-0000-0000-000000000302',
    '00000000-0000-0000-0000-000000000001',
    NULL,
    'Audit Security Compliance & SOC2 Bridge Letter',
    'todo',
    CURRENT_DATE + INTERVAL '9 days',
    'medium',
    'Jordan Lee',
    NOW() - INTERVAL '3 days'
),
(
    '00000000-0000-0000-0000-000000000303',
    '00000000-0000-0000-0000-000000000001',
    NULL,
    'Review Contract Expansion Terms with Legal',
    'in_progress',
    CURRENT_DATE + INTERVAL '12 days',
    'medium',
    'Taylor Casey',
    NOW() - INTERVAL '2 days'
);


-- ============================================================================
-- SCENARIO B: Usage drop investigation
-- ============================================================================

-- usage_daily rows for Acme Corp, SMB segment, last 8 weeks (56 days)
-- Weeks 1-5 (days 56 to 22 ago): active_users around 450-480
-- Weeks 6-8 (days 21 to 1 ago): active_users drops to 280-310 (the Q3 dip)
INSERT INTO usage_daily (client_id, segment, date, active_users, events)
SELECT
    '00000000-0000-0000-0000-000000000001'::uuid AS client_id,
    'SMB' AS segment,
    (CURRENT_DATE - (day_offset || ' days')::INTERVAL)::DATE AS date,
    CASE
        -- Weeks 6-8: drop to 280-310
        WHEN day_offset <= 21 THEN 280 + ((day_offset * 7 + 13) % 31)
        -- Weeks 1-5: baseline around 450-480
        ELSE 450 + ((day_offset * 11 + 7) % 31)
    END AS active_users,
    CASE
        WHEN day_offset <= 21 THEN 2850 + ((day_offset * 71 + 23) % 450)
        ELSE 4900 + ((day_offset * 93 + 47) % 650)
    END AS events
FROM generate_series(1, 56) AS day_offset;


-- ============================================================================
-- SCENARIO C: Overdue project work
-- ============================================================================

-- 3 projects with status 'at_risk'
INSERT INTO projects (id, client_id, name, health, status, start_date, due_date, created_at)
VALUES
(
    '00000000-0000-0000-0000-000000000401',
    '00000000-0000-0000-0000-000000000001',
    'Enterprise SSO & IAM Integration',
    'poor',
    'at_risk',
    CURRENT_DATE - INTERVAL '60 days',
    CURRENT_DATE - INTERVAL '10 days',
    NOW() - INTERVAL '60 days'
),
(
    '00000000-0000-0000-0000-000000000402',
    '00000000-0000-0000-0000-000000000001',
    'Real-Time Telemetry & Analytics Pipeline',
    'critical',
    'at_risk',
    CURRENT_DATE - INTERVAL '45 days',
    CURRENT_DATE - INTERVAL '14 days',
    NOW() - INTERVAL '45 days'
),
(
    '00000000-0000-0000-0000-000000000403',
    '00000000-0000-0000-0000-000000000001',
    'Automated Billing & Revenue Recognition Sync',
    'poor',
    'at_risk',
    CURRENT_DATE - INTERVAL '35 days',
    CURRENT_DATE - INTERVAL '5 days',
    NOW() - INTERVAL '35 days'
);

-- 7 tasks total across those projects with due_date in the past and status 'overdue'
INSERT INTO tasks (id, client_id, project_id, title, status, due_date, priority, assignee, created_at)
VALUES
-- Tasks for Project 1: Enterprise SSO & IAM Integration
(
    '00000000-0000-0000-0000-000000000501',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000401',
    'Complete Okta SAML 2.0 Identity Provider Config',
    'overdue',
    CURRENT_DATE - INTERVAL '12 days',
    'urgent',
    'Alex Rivera',
    NOW() - INTERVAL '25 days'
),
(
    '00000000-0000-0000-0000-000000000502',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000401',
    'Resolve SCIM Directory Sync Latency Issues',
    'overdue',
    CURRENT_DATE - INTERVAL '8 days',
    'high',
    'Jordan Lee',
    NOW() - INTERVAL '20 days'
),
(
    '00000000-0000-0000-0000-000000000503',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000401',
    'Security Penetration Testing Sign-off',
    'overdue',
    CURRENT_DATE - INTERVAL '5 days',
    'high',
    'Sam Miller',
    NOW() - INTERVAL '18 days'
),

-- Tasks for Project 2: Real-Time Telemetry & Analytics Pipeline
(
    '00000000-0000-0000-0000-000000000504',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000402',
    'Benchmark Kafka Event Ingestion Throughput',
    'overdue',
    CURRENT_DATE - INTERVAL '15 days',
    'high',
    'Morgan Chen',
    NOW() - INTERVAL '30 days'
),
(
    '00000000-0000-0000-0000-000000000505',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000402',
    'Fix Data Pipeline Dropouts on High-Volume SMB Nodes',
    'overdue',
    CURRENT_DATE - INTERVAL '7 days',
    'urgent',
    'Morgan Chen',
    NOW() - INTERVAL '16 days'
),

-- Tasks for Project 3: Automated Billing & Revenue Recognition Sync
(
    '00000000-0000-0000-0000-000000000506',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000403',
    'Reconcile Stripe Webhook Multi-Currency Events',
    'overdue',
    CURRENT_DATE - INTERVAL '6 days',
    'medium',
    'Taylor Casey',
    NOW() - INTERVAL '22 days'
),
(
    '00000000-0000-0000-0000-000000000507',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000403',
    'Audit NetSuite General Ledger Integration Schema',
    'overdue',
    CURRENT_DATE - INTERVAL '3 days',
    'high',
    'Taylor Casey',
    NOW() - INTERVAL '15 days'
);
