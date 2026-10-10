-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. clients
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    industry TEXT,
    health_score INTEGER,
    arr NUMERIC(12, 2),
    owner_id UUID,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. projects (created before tasks so tasks can reference project_id)
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    health TEXT,
    status TEXT,
    start_date DATE,
    due_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. contacts
CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role TEXT,
    email TEXT,
    last_contact_at TIMESTAMPTZ,
    sentiment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. tasks
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    status TEXT,
    due_date DATE,
    priority TEXT,
    assignee TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. meetings
CREATE TABLE IF NOT EXISTS meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    held_at TIMESTAMPTZ,
    summary TEXT,
    action_items JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. usage_daily
CREATE TABLE IF NOT EXISTS usage_daily (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    segment TEXT,
    date DATE NOT NULL,
    active_users INTEGER DEFAULT 0,
    events INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
