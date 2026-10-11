export type ViewType = 'list' | 'board' | 'mindmap' | 'table' | 'calendar';
export type NodeStatus = 'todo' | 'in_progress' | 'review' | 'done';
export type NodePriority = 'low' | 'medium' | 'high' | 'critical';
export type ModelTier = 'FAST' | 'STANDARD' | 'REASONING';

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  created_at?: string;
  updated_at?: string;
}

export interface WorkspaceProject {
  id: string;
  workspace_id: string;
  name: string;
  default_view: ViewType;
  created_at?: string;
}

export interface NodeItem {
  id: string;
  project_id: string;
  parent_id?: string | null;
  title: string;
  content?: string;
  status: NodeStatus;
  priority: NodePriority;
  order_index: number;
  assignee?: string;
  due_date?: string | null;
  tags?: string[];
  custom_fields?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface Agent {
  id: string;
  workspace_id: string;
  name: string;
  persona: string;
  system_prompt: string;
  model_tier: ModelTier;
  tools_assigned: string[];
  avatar?: string;
  created_at?: string;
}

export interface WorkflowNode {
  id: string;
  type: string;
  label: string;
  action?: string;
  config?: Record<string, any>;
  position?: { x: number; y: number };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface Workflow {
  id: string;
  workspace_id: string;
  name: string;
  description?: string;
  trigger_type: 'schedule' | 'webhook' | 'item_change' | 'manual';
  trigger_config?: Record<string, any>;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  is_active: boolean;
  created_at?: string;
}

export interface WorkflowRun {
  id: string;
  workflow_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  logs: Array<{ step: string; timestamp: string; status: string; detail?: string }>;
  triggered_at?: string;
  finished_at?: string;
}

export interface FullWorkspaceBundle {
  workspace: Workspace;
  projects: Array<WorkspaceProject & { nodes: NodeItem[] }>;
  agents: Agent[];
  workflows: Workflow[];
}
