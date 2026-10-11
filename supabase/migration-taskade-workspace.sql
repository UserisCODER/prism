-- Migration: Taskade AI Workspace & Dynamic Node System
-- Run this in your Supabase SQL Editor

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Workspaces
CREATE TABLE IF NOT EXISTS workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    icon TEXT DEFAULT 'sparkles',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Projects within a Workspace
CREATE TABLE IF NOT EXISTS workspace_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    default_view TEXT DEFAULT 'board', -- 'list', 'board', 'mindmap', 'table', 'calendar'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Dynamic Hierarchical Node Items
-- Unified data model powering List, Kanban, Mind Map, and Action Table
CREATE TABLE IF NOT EXISTS node_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES workspace_projects(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES node_items(id) ON DELETE CASCADE, -- null for top-level nodes
    title TEXT NOT NULL,
    content TEXT,
    status TEXT DEFAULT 'todo', -- 'todo', 'in_progress', 'review', 'done'
    priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    order_index INTEGER DEFAULT 0,
    assignee TEXT,
    due_date TIMESTAMPTZ,
    tags TEXT[] DEFAULT '{}',
    custom_fields JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Custom AI Agents
CREATE TABLE IF NOT EXISTS agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    persona TEXT NOT NULL,
    system_prompt TEXT NOT NULL,
    model_tier TEXT DEFAULT 'STANDARD', -- 'FAST', 'STANDARD', 'REASONING'
    tools_assigned TEXT[] DEFAULT '{"database_query", "web_search"}',
    avatar TEXT DEFAULT 'bot',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Workflow Automation DAGs
CREATE TABLE IF NOT EXISTS workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    trigger_type TEXT NOT NULL DEFAULT 'manual', -- 'schedule', 'webhook', 'item_change', 'manual'
    trigger_config JSONB DEFAULT '{}'::jsonb,
    nodes JSONB NOT NULL DEFAULT '[]'::jsonb, -- React Flow format nodes
    edges JSONB NOT NULL DEFAULT '[]'::jsonb, -- React Flow format edges
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Workflow Execution Runs & Logs
CREATE TABLE IF NOT EXISTS workflow_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed'
    logs JSONB DEFAULT '[]'::jsonb,
    triggered_at TIMESTAMPTZ DEFAULT NOW(),
    finished_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_workspace_projects_workspace_id ON workspace_projects(workspace_id);
CREATE INDEX IF NOT EXISTS idx_node_items_project_id ON node_items(project_id);
CREATE INDEX IF NOT EXISTS idx_node_items_parent_id ON node_items(parent_id);
CREATE INDEX IF NOT EXISTS idx_agents_workspace_id ON agents(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workflows_workspace_id ON workflows(workspace_id);
