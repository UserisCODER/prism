export type TaskadeStatus = 'todo' | 'in_progress' | 'review' | 'done';
export type TaskadePriority = 'low' | 'medium' | 'high' | 'critical';
export type TaskadeModelTier = 'FAST' | 'STANDARD' | 'REASONING';

export interface TaskadeWorkspaceRecord {
  id: string;
  name: string;
  slug?: string;
  domain?: string;
  description?: string;
  icon?: string;
}

export interface TaskadeProjectRecord {
  id: string;
  workspace_id: string;
  name: string;
  default_view: 'list' | 'board' | 'mindmap' | 'table' | 'calendar';
  nodes: TaskadeNodeRecord[];
}

export interface TaskadeNodeRecord {
  id: string;
  project_id: string;
  parent_id?: string | null;
  title: string;
  content?: string;
  status: TaskadeStatus;
  priority: TaskadePriority;
  order_index: number;
  assignee?: string;
  due_date?: string | null;
  tags?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface TaskadeAgentRecord {
  id: string;
  workspace_id: string;
  name: string;
  persona: string;
  system_prompt: string;
  model_tier: TaskadeModelTier;
  tools_assigned: string[];
  avatar?: string;
}

export interface TaskadeWorkflowRecord {
  id: string;
  workspace_id: string;
  name: string;
  description?: string;
  trigger_type: 'schedule' | 'webhook' | 'item_change' | 'manual';
  trigger_config?: Record<string, unknown>;
  nodes: Array<{ id: string; type: string; label: string; action?: string; config?: Record<string, unknown> }>;
  edges: Array<{ id: string; source: string; target: string; label?: string }>;
  is_active: boolean;
}

export interface TaskadeWorkspaceBundle {
  workspace: TaskadeWorkspaceRecord;
  projects: TaskadeProjectRecord[];
  agents: TaskadeAgentRecord[];
  workflows: TaskadeWorkflowRecord[];
  isFallback: boolean;
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/+$/, '');

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/api/v1${path}`, {
      ...init,
      headers: {
        ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
        ...init?.headers,
      },
    });
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'Network request failed';
    throw new Error(`Could not reach the PRISM backend: ${reason}`);
  }

  const text = await response.text();
  let payload: unknown;
  try {
    payload = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(`PRISM backend returned invalid JSON (${response.status})`);
  }

  if (!response.ok) {
    const detail =
      typeof payload === 'object' && payload !== null && 'error' in payload &&
      typeof payload.error === 'string'
        ? payload.error
        : response.statusText;
    throw new Error(`PRISM backend returned ${response.status}: ${detail}`);
  }

  return payload as T;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export async function fetchTaskadeWorkspaces(): Promise<TaskadeWorkspaceRecord[]> {
  const payload = await request<{ workspaces?: unknown }>('/workspaces');
  if (!Array.isArray(payload.workspaces)) {
    throw new Error('Workspace API returned an invalid workspace list');
  }

  const workspaces = payload.workspaces.filter(
    (workspace): workspace is TaskadeWorkspaceRecord =>
      isRecord(workspace) &&
      typeof workspace.id === 'string' &&
      typeof workspace.name === 'string'
  );

  if (workspaces.length !== payload.workspaces.length) {
    throw new Error('Workspace API returned one or more invalid workspace records');
  }

  return workspaces;
}

export async function fetchTaskadeWorkspace(
  workspaceId: string
): Promise<TaskadeWorkspaceBundle> {
  const payload = await request<{
    data?: unknown;
    isFallback?: unknown;
  }>(`/workspaces/${encodeURIComponent(workspaceId)}`);

  if (
    !isRecord(payload.data) ||
    !isRecord(payload.data.workspace) ||
    !Array.isArray(payload.data.projects) ||
    !Array.isArray(payload.data.agents) ||
    !Array.isArray(payload.data.workflows)
  ) {
    throw new Error('Workspace API returned an invalid workspace bundle');
  }

  return {
    workspace: payload.data.workspace as unknown as TaskadeWorkspaceRecord,
    projects: payload.data.projects as TaskadeProjectRecord[],
    agents: payload.data.agents as TaskadeAgentRecord[],
    workflows: payload.data.workflows as TaskadeWorkflowRecord[],
    isFallback: payload.isFallback === true,
  };
}

export async function createTaskadeNode(
  node: Omit<TaskadeNodeRecord, 'id' | 'created_at' | 'updated_at'>
): Promise<TaskadeNodeRecord> {
  const payload = await request<{ node?: TaskadeNodeRecord; warning?: string }>('/nodes', {
    method: 'POST',
    body: JSON.stringify(node),
  });

  if (payload.warning) {
    throw new Error(`Task was not saved: ${payload.warning}`);
  }
  if (!payload.node || typeof payload.node.id !== 'string') {
    throw new Error('Node API returned an invalid saved task');
  }
  return payload.node;
}

export async function updateTaskadeNode(
  id: string,
  updates: Partial<Pick<TaskadeNodeRecord, 'status' | 'title' | 'content' | 'priority' | 'assignee' | 'due_date' | 'tags'>>
): Promise<TaskadeNodeRecord> {
  const payload = await request<{ node?: TaskadeNodeRecord; warning?: string }>('/nodes', {
    method: 'PATCH',
    body: JSON.stringify({ id, ...updates }),
  });

  if (payload.warning) {
    throw new Error(`Task update was not saved: ${payload.warning}`);
  }
  if (!payload.node || typeof payload.node.id !== 'string') {
    throw new Error('Node API returned an invalid updated task');
  }
  return payload.node;
}

export async function createTaskadeAgent(
  agent: Omit<TaskadeAgentRecord, 'id'>
): Promise<TaskadeAgentRecord> {
  const payload = await request<{ agent?: TaskadeAgentRecord }>('/agents', {
    method: 'POST',
    body: JSON.stringify(agent),
  });
  if (!payload.agent || typeof payload.agent.id !== 'string') {
    throw new Error('Agent API returned an invalid saved agent');
  }
  return payload.agent;
}

export async function sendTaskadeAgentMessage(input: {
  message: string;
  agentId?: string;
  workspaceId: string;
  projectId?: string;
  history: Array<{ sender: 'user' | 'agent'; text: string }>;
  nodes: TaskadeNodeRecord[];
}): Promise<{ reply: string; agent: { id?: string; name: string; persona: string }; createdTasks: TaskadeNodeRecord[] }> {
  const payload = await request<{
    reply?: unknown;
    agent?: unknown;
    createdTasks?: unknown;
  }>('/agents/chat', {
    method: 'POST',
    body: JSON.stringify(input),
  });

  if (
    typeof payload.reply !== 'string' ||
    !isRecord(payload.agent) ||
    typeof payload.agent.name !== 'string' ||
    !Array.isArray(payload.createdTasks)
  ) {
    throw new Error('Agent API returned an invalid chat response');
  }

  return {
    reply: payload.reply,
    agent: payload.agent as { id?: string; name: string; persona: string },
    createdTasks: payload.createdTasks as TaskadeNodeRecord[],
  };
}

export async function createTaskadeWorkflow(
  workflow: Omit<TaskadeWorkflowRecord, 'id'>
): Promise<TaskadeWorkflowRecord> {
  const payload = await request<{ workflow?: TaskadeWorkflowRecord }>('/workflows', {
    method: 'POST',
    body: JSON.stringify(workflow),
  });
  if (!payload.workflow || typeof payload.workflow.id !== 'string') {
    throw new Error('Workflow API returned an invalid saved workflow');
  }
  return payload.workflow;
}

export async function updateTaskadeWorkflow(
  id: string,
  isActive: boolean
): Promise<TaskadeWorkflowRecord> {
  const payload = await request<{ workflow?: TaskadeWorkflowRecord }>(
    `/workflows/${encodeURIComponent(id)}`,
    {
      method: 'PATCH',
      body: JSON.stringify({ is_active: isActive }),
    }
  );
  if (!payload.workflow || typeof payload.workflow.id !== 'string') {
    throw new Error('Workflow API returned an invalid updated workflow');
  }
  return payload.workflow;
}
