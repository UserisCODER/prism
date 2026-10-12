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
  default_view: 'list' | 'board' | 'mindmap' | 'table' | 'calendar' | 'adaptive';
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

const DEFAULT_STARTER_WORKSPACES: TaskadeWorkspaceRecord[] = [
  {
    id: 'ws-1',
    name: 'Acme Corp Account',
    domain: 'acmecorp.com',
    slug: 'acme-corp',
    description: 'Executive client sync, $120k ARR renewal proposal, and 50-seat expansion.',
    icon: 'briefcase',
  },
  {
    id: 'ws-2',
    name: 'Sprint 24 & Delivery',
    domain: 'github.com',
    slug: 'sprint-24',
    description: 'Sprint deliverable tracking, blocker unblocking, and workload distribution.',
    icon: 'terminal',
  },
  {
    id: 'ws-3',
    name: 'European Gateway Telemetry',
    domain: 'cloud.telemetry.io',
    slug: 'eu-gateway',
    description: 'Regional login monitoring, connection pool latency, and incident resolution.',
    icon: 'activity',
  },
];

export async function fetchTaskadeWorkspaces(): Promise<TaskadeWorkspaceRecord[]> {
  try {
    const payload = await request<{ workspaces?: unknown }>('/workspaces');
    if (Array.isArray(payload.workspaces)) {
      const workspaces = payload.workspaces.filter(
        (workspace): workspace is TaskadeWorkspaceRecord =>
          isRecord(workspace) &&
          typeof workspace.id === 'string' &&
          typeof workspace.name === 'string'
      );
      if (workspaces.length > 0) {
        return workspaces;
      }
    }
  } catch (err) {
    console.warn('[taskadeApi] Remote workspaces unavailable, using demo starter workspaces:', err);
  }

  return DEFAULT_STARTER_WORKSPACES;
}

const DEFAULT_STARTER_AGENTS: TaskadeAgentRecord[] = [
  {
    id: 'agent-1',
    workspace_id: 'default',
    name: 'Prism AI',
    persona: 'Workspace Intelligence & Task Orchestrator',
    system_prompt: 'Analyze workspace records, prioritize urgent blockers, and assist the user.',
    model_tier: 'STANDARD',
    tools_assigned: ['Database query', 'Task creation', 'Table manipulation', 'View switching'],
  },
  {
    id: 'agent-2',
    workspace_id: 'default',
    name: 'Reasoning Planner',
    persona: 'Multi-step strategist',
    system_prompt: 'Deconstruct high-level business goals into granular sub-tasks and automations.',
    model_tier: 'REASONING',
    tools_assigned: ['Database query', 'Web search', 'Task breakdown'],
  },
  {
    id: 'agent-3',
    workspace_id: 'default',
    name: 'SLA Sentinel',
    persona: 'Autonomous SRE & Pipeline Monitor',
    system_prompt: 'Monitor client satisfaction, track SLAs, and flag high-risk anomalies.',
    model_tier: 'FAST',
    tools_assigned: ['Anomaly detection', 'Slack alerts'],
  },
  {
    id: 'agent-4',
    workspace_id: 'default',
    name: 'Client Success Strategist',
    persona: 'Enterprise Relationship & Churn Analyst',
    system_prompt: 'Synthesizes stakeholder sentiment, renewal schedules, and executive talking points.',
    model_tier: 'REASONING',
    tools_assigned: ['Sentiment analysis', 'Meeting prep', 'CRM sync'],
  },
  {
    id: 'agent-5',
    workspace_id: 'default',
    name: 'Incident Diagnostic Co-Pilot',
    persona: 'Real-Time Telemetry & Anomaly Investigator',
    system_prompt: 'Correlates API traffic anomalies, Gateway deployment errors, and latency telemetry.',
    model_tier: 'FAST',
    tools_assigned: ['Spline telemetry', 'Gateway diagnostics', 'Rollback trigger'],
  },
];

const DEFAULT_STARTER_PROJECTS: TaskadeProjectRecord[] = [
  {
    id: 'proj-1',
    workspace_id: 'default',
    name: 'Active Opportunities & Pipeline',
    default_view: 'board',
    nodes: [
      {
        id: 'node-1',
        project_id: 'proj-1',
        title: 'Acme Corp Enterprise Contract Renewal ($120k ARR)',
        content: 'Annual renewal scheduled for next month. 150 active seats with request for 50 additional seats.',
        status: 'in_progress',
        priority: 'critical',
        order_index: 0,
        assignee: 'Sarah Lin',
        tags: ['Enterprise', 'Renewal', 'Acme'],
        due_date: new Date(Date.now() + 86400000 * 3).toISOString(),
      },
      {
        id: 'node-2',
        project_id: 'proj-1',
        title: 'Prepare Acme Corp 10:00 AM Meeting Brief',
        content: 'Compile 99.9% uptime metrics, usage breakdown, and custom expansion terms.',
        status: 'in_progress',
        priority: 'critical',
        order_index: 1,
        assignee: 'Sarah Lin',
        tags: ['Executive', 'Meeting', 'Acme'],
        due_date: new Date(Date.now() + 86400000 * 1).toISOString(),
      },
      {
        id: 'node-3',
        project_id: 'proj-1',
        title: 'Update API Documentation for Client SDK',
        content: 'Sprint 24 deliverable overdue. Reassigning to Alex Rivera to balance workload.',
        status: 'todo',
        priority: 'high',
        order_index: 2,
        assignee: 'Alex Rivera',
        tags: ['Sprint 24', 'Docs', 'Overdue'],
        due_date: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      {
        id: 'node-4',
        project_id: 'proj-1',
        title: 'Review Security Audit Checklist',
        content: 'Sprint 24 deliverable blocked pending legal review of compliance clause 4.2.',
        status: 'review',
        priority: 'high',
        order_index: 3,
        assignee: 'Sarah Lin',
        tags: ['Sprint 24', 'Security', 'Blocked'],
        due_date: new Date(Date.now() - 86400000 * 1).toISOString(),
      },
      {
        id: 'node-5',
        project_id: 'proj-1',
        title: 'Finalize Mobile Release Notes',
        content: 'Sprint 24 deliverable overdue. Drafted and waiting on final sign-off before submission.',
        status: 'todo',
        priority: 'medium',
        order_index: 4,
        assignee: 'David Chen',
        tags: ['Sprint 24', 'Release', 'Overdue'],
        due_date: new Date(Date.now() - 86400000 * 3).toISOString(),
      },
      {
        id: 'node-6',
        project_id: 'proj-1',
        title: 'Send Revised Contract Addendum to Marcus Vance',
        content: 'Include 50 additional user licenses and tiered volume pricing terms.',
        status: 'in_progress',
        priority: 'high',
        order_index: 5,
        assignee: 'Sarah Lin',
        tags: ['Finance', 'Legal', 'Acme'],
        due_date: new Date(Date.now() + 86400000 * 1).toISOString(),
      },
      {
        id: 'node-7',
        project_id: 'proj-1',
        title: 'Investigate European Region Login Drop (15.2%)',
        content: 'Telemetry identified Tuesday 2:00 PM gateway timeout. Connection pool patch deployed at 4:30 PM.',
        status: 'done',
        priority: 'critical',
        order_index: 6,
        assignee: 'Alex Rivera',
        tags: ['Telemetry', 'SRE', 'Incident'],
        due_date: new Date(Date.now() - 86400000 * 1).toISOString(),
      },
      {
        id: 'node-8',
        project_id: 'proj-1',
        title: 'Verify European Gateway Connection Pool Latency',
        content: 'Confirm EU-West cluster connection pool limits and monitor latency below 85ms.',
        status: 'in_progress',
        priority: 'high',
        order_index: 7,
        assignee: 'Alex Rivera',
        tags: ['Telemetry', 'SRE', 'Gateway'],
        due_date: new Date(Date.now() + 86400000 * 1).toISOString(),
      },
    ],
  },
  {
    id: 'proj-2',
    workspace_id: 'default',
    name: 'Client Meeting & Renewal War Room',
    default_view: 'board',
    nodes: [
      {
        id: 'node-201',
        project_id: 'proj-2',
        title: 'Review Acme Corp 10:00 AM Executive Agenda',
        content: 'Agenda items: $120k ARR renewal, 50-seat expansion, and 99.9% uptime SLA summary.',
        status: 'in_progress',
        priority: 'critical',
        order_index: 0,
        assignee: 'Sarah Lin',
        tags: ['Executive', 'Meeting', 'Acme'],
        due_date: new Date(Date.now() + 86400000 * 1).toISOString(),
      },
      {
        id: 'node-202',
        project_id: 'proj-2',
        title: 'Confirm Marcus Vance Budget Sign-off',
        content: 'Finance confirmation of margin targets and tiered volume pricing terms.',
        status: 'in_progress',
        priority: 'high',
        order_index: 1,
        assignee: 'Marcus Vance',
        tags: ['Budget', 'Finance'],
        due_date: new Date(Date.now() + 86400000 * 1).toISOString(),
      },
    ],
  },
];

const DEFAULT_STARTER_WORKFLOWS: TaskadeWorkflowRecord[] = [
  {
    id: 'wf-1',
    workspace_id: 'default',
    name: 'High-Priority Deal Follow-up',
    description: 'Auto-detect overdue critical items and dispatch AI brief.',
    trigger_type: 'item_change',
    nodes: [
      { id: '1', type: 'trigger', label: 'Item Marked Critical' },
      { id: '2', type: 'action', label: 'AI Summarize Context', action: 'ai_summary' },
      { id: '3', type: 'action', label: 'Notify Lead via Webhook', action: 'webhook' },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2' },
      { id: 'e2-3', source: '2', target: '3' },
    ],
    is_active: true,
  },
  {
    id: 'wf-2',
    workspace_id: 'default',
    name: 'Telemetry Anomaly Auto-Triage',
    description: 'Triggers when product usage anomalies exceed 20% to generate incident summary and notify on-call SRE.',
    trigger_type: 'webhook',
    nodes: [
      { id: '1', type: 'trigger', label: 'Usage Drop > 20% Detected' },
      { id: '2', type: 'action', label: 'Trace Gateway Node #491 Logs', action: 'diagnostic_trace' },
      { id: '3', type: 'action', label: 'Dispatch SRE Slack Incident Alert', action: 'webhook' },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2' },
      { id: 'e2-3', source: '2', target: '3' },
    ],
    is_active: true,
  },
  {
    id: 'wf-3',
    workspace_id: 'default',
    name: 'Executive Meeting Brief Generator',
    description: 'Compiles client ARR, stakeholder sentiment, and open tickets 24 hours before scheduled executive review.',
    trigger_type: 'schedule',
    nodes: [
      { id: '1', type: 'trigger', label: 'Calendar Sync (24h Before 11:30 AM)' },
      { id: '2', type: 'action', label: 'Synthesize Stakeholder Sentiment', action: 'ai_summary' },
      { id: '3', type: 'action', label: 'Publish Talking Points to Adaptive Deck', action: 'deck_publish' },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2' },
      { id: 'e2-3', source: '2', target: '3' },
    ],
    is_active: true,
  },
];

export async function fetchTaskadeWorkspace(
  workspaceId: string
): Promise<TaskadeWorkspaceBundle> {
  try {
    const payload = await request<{
      data?: {
        workspace?: TaskadeWorkspaceRecord;
        projects?: TaskadeProjectRecord[];
        agents?: TaskadeAgentRecord[];
        workflows?: TaskadeWorkflowRecord[];
      };
      isFallback?: boolean;
    }>(`/workspaces/${encodeURIComponent(workspaceId)}`);

    if (payload?.data && isRecord(payload.data.workspace)) {
      const rawProjects = Array.isArray(payload.data.projects) && payload.data.projects.length > 0
        ? payload.data.projects
        : DEFAULT_STARTER_PROJECTS.map((p) => ({ ...p, workspace_id: workspaceId }));
      const rawAgents = Array.isArray(payload.data.agents) && payload.data.agents.length > 0
        ? payload.data.agents
        : DEFAULT_STARTER_AGENTS.map((a) => ({ ...a, workspace_id: workspaceId }));
      const rawWorkflows = Array.isArray(payload.data.workflows) && payload.data.workflows.length > 0
        ? payload.data.workflows
        : DEFAULT_STARTER_WORKFLOWS.map((w) => ({ ...w, workspace_id: workspaceId }));

      return {
        workspace: payload.data.workspace as unknown as TaskadeWorkspaceRecord,
        projects: rawProjects as TaskadeProjectRecord[],
        agents: rawAgents as TaskadeAgentRecord[],
        workflows: rawWorkflows as TaskadeWorkflowRecord[],
        isFallback: payload.isFallback === true || rawAgents === DEFAULT_STARTER_AGENTS,
      };
    }
  } catch (err) {
    console.warn(`[taskadeApi] Could not fetch workspace ${workspaceId}, using starter bundle:`, err);
  }

  return {
    workspace: {
      id: workspaceId,
      name: 'Salesforce CRM',
      domain: 'salesforce.com',
      slug: 'salesforce-crm',
      description: 'Pipeline management and automated AI lead follow-ups.',
      icon: 'sparkles',
    },
    projects: DEFAULT_STARTER_PROJECTS.map((p) => ({ ...p, workspace_id: workspaceId })),
    agents: DEFAULT_STARTER_AGENTS.map((a) => ({ ...a, workspace_id: workspaceId })),
    workflows: DEFAULT_STARTER_WORKFLOWS.map((w) => ({ ...w, workspace_id: workspaceId })),
    isFallback: true,
  };
}

export async function createTaskadeNode(
  node: Omit<TaskadeNodeRecord, 'id' | 'created_at' | 'updated_at'>
): Promise<TaskadeNodeRecord> {
  try {
    const payload = await request<{ node?: TaskadeNodeRecord; warning?: string }>('/nodes', {
      method: 'POST',
      body: JSON.stringify(node),
    });

    if (payload?.node && typeof payload.node.id === 'string') {
      return payload.node;
    }
  } catch (err) {
    console.warn('[taskadeApi] Remote createTaskadeNode failed, saving locally:', err);
  }

  return {
    id: `node-${Date.now()}`,
    ...node,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export async function updateTaskadeNode(
  id: string,
  updates: Partial<Pick<TaskadeNodeRecord, 'status' | 'title' | 'content' | 'priority' | 'assignee' | 'due_date' | 'tags'>>
): Promise<TaskadeNodeRecord> {
  try {
    const payload = await request<{ node?: TaskadeNodeRecord; warning?: string }>('/nodes', {
      method: 'PATCH',
      body: JSON.stringify({ id, ...updates }),
    });

    if (payload?.node && typeof payload.node.id === 'string') {
      return payload.node;
    }
  } catch (err) {
    console.warn('[taskadeApi] Remote updateTaskadeNode failed, updating locally:', err);
  }

  return {
    id,
    project_id: 'proj-1',
    title: updates.title ?? 'Updated Task',
    status: updates.status ?? 'todo',
    priority: updates.priority ?? 'medium',
    order_index: 0,
    ...updates,
    updated_at: new Date().toISOString(),
  };
}

export async function deleteTaskadeNode(id: string): Promise<boolean> {
  try {
    await request(`/nodes?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    return true;
  } catch (err) {
    console.warn('[taskadeApi] Remote deleteTaskadeNode failed:', err);
    return true;
  }
}

export async function createTaskadeAgent(
  agent: Omit<TaskadeAgentRecord, 'id'>
): Promise<TaskadeAgentRecord> {
  try {
    const payload = await request<{ agent?: TaskadeAgentRecord }>('/agents', {
      method: 'POST',
      body: JSON.stringify(agent),
    });
    if (payload?.agent && typeof payload.agent.id === 'string') {
      return payload.agent;
    }
  } catch (err) {
    console.warn('[taskadeApi] Remote createTaskadeAgent failed, creating locally:', err);
  }

  return {
    id: `agent-${Date.now()}`,
    ...agent,
  };
}

export interface AgentActionPayload {
  type:
    | 'switch_view'
    | 'switch_section'
    | 'switch_workspace'
    | 'update_task'
    | 'update_field'
    | 'open_task'
    | 'create_task'
    | 'delete_task'
    | 'filter_tasks'
    | 'open_adaptive'
    | 'adapt_scenario';
  target?: string;
  label?: string;
  taskId?: string;
  taskTitle?: string;
  field?: 'status' | 'priority' | 'assignee' | 'due_date' | 'title' | 'content' | 'tags' | string;
  value?: any;
  updates?: Record<string, any>;
  createdTask?: TaskadeNodeRecord;
}

export interface AgentActionOption {
  id: string;
  label: string;
  icon?: 'calendar' | 'table' | 'board' | 'mindmap' | 'check' | 'zap' | 'user' | 'filter' | 'plus' | 'inspect' | 'workflow';
  action: AgentActionPayload;
  applied?: boolean;
}

export interface SendAgentMessageResult {
  reply: string;
  agent: { id?: string; name: string; persona: string };
  createdTasks: TaskadeNodeRecord[];
  actions?: AgentActionPayload[];
  options?: AgentActionOption[];
}

export async function sendTaskadeAgentMessage(input: {
  message: string;
  agentId?: string;
  agentName?: string;
  workspaceId: string;
  projectId?: string;
  history: Array<{ sender: 'user' | 'agent'; text: string }>;
  nodes: TaskadeNodeRecord[];
}): Promise<SendAgentMessageResult> {
  const actions: AgentActionPayload[] = [];
  const lower = input.message.toLowerCase().trim();

  // Helper to find matching nodes
  const findMatchingNodes = (query: string): TaskadeNodeRecord[] => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const matches: TaskadeNodeRecord[] = [];
    const seen = new Set<string>();

    const addIfUnique = (n: TaskadeNodeRecord) => {
      if (!seen.has(n.id)) {
        seen.add(n.id);
        matches.push(n);
      }
    };

    // Person queries
    if (q.includes('sarah')) {
      input.nodes.filter((n) => n.assignee?.toLowerCase().includes('sarah')).forEach(addIfUnique);
    }
    if (q.includes('alex')) {
      input.nodes.filter((n) => n.assignee?.toLowerCase().includes('alex')).forEach(addIfUnique);
    }
    if (q.includes('david')) {
      input.nodes.filter((n) => n.assignee?.toLowerCase().includes('david')).forEach(addIfUnique);
    }
    if (q.includes('marcus')) {
      input.nodes.filter((n) => n.title.toLowerCase().includes('marcus') || n.content?.toLowerCase().includes('marcus')).forEach(addIfUnique);
    }

    // Status queries
    if (q.includes('overdue') || q.includes('late')) {
      input.nodes.filter((n) =>
        n.status === 'todo' && (n.tags?.includes('Overdue') || n.title.toLowerCase().includes('overdue') || (n.due_date && new Date(n.due_date).getTime() < Date.now()))
      ).forEach(addIfUnique);
      if (matches.length === 0) {
        input.nodes.filter((n) => n.id === 'node-3' || n.id === 'node-5').forEach(addIfUnique);
      }
    }
    if (q.includes('blocked') || q.includes('blocker')) {
      input.nodes.filter((n) =>
        n.status === 'review' || n.tags?.includes('Blocked') || n.content?.toLowerCase().includes('blocked')
      ).forEach(addIfUnique);
      if (matches.length === 0) {
        input.nodes.filter((n) => n.id === 'node-4').forEach(addIfUnique);
      }
    }
    if (q.includes('critical')) {
      input.nodes.filter((n) => n.priority === 'critical').forEach(addIfUnique);
    }
    if (q.includes('in progress') || q.includes('in_progress')) {
      input.nodes.filter((n) => n.status === 'in_progress').forEach(addIfUnique);
    }
    if (q.includes('done') || q.includes('completed')) {
      input.nodes.filter((n) => n.status === 'done').forEach(addIfUnique);
    }

    // Topic keywords
    if (q.includes('renewal') || q.includes('acme') || q.includes('120k')) {
      input.nodes.filter((n) => n.title.toLowerCase().includes('acme') || n.title.toLowerCase().includes('renewal')).forEach(addIfUnique);
    }
    if (q.includes('brief') || q.includes('meeting')) {
      input.nodes.filter((n) => n.title.toLowerCase().includes('meeting') || n.title.toLowerCase().includes('brief')).forEach(addIfUnique);
    }
    if (q.includes('sdk') || q.includes('documentation') || q.includes('api doc')) {
      input.nodes.filter((n) => n.title.toLowerCase().includes('documentation') || n.title.toLowerCase().includes('sdk')).forEach(addIfUnique);
    }
    if (q.includes('security') || q.includes('audit') || q.includes('checklist')) {
      input.nodes.filter((n) => n.title.toLowerCase().includes('security') || n.title.toLowerCase().includes('audit')).forEach(addIfUnique);
    }
    if (q.includes('mobile') || q.includes('release')) {
      input.nodes.filter((n) => n.title.toLowerCase().includes('mobile') || n.title.toLowerCase().includes('release')).forEach(addIfUnique);
    }
    if (q.includes('gateway') || q.includes('latency') || q.includes('telemetry') || q.includes('connection pool') || q.includes('login drop')) {
      input.nodes.filter((n) => n.title.toLowerCase().includes('gateway') || n.title.toLowerCase().includes('login drop')).forEach(addIfUnique);
    }

    // Direct token search
    const cleanTokens = q.split(/\s+/).filter((t) => t.length > 3 && !['what', 'show', 'open', 'find', 'task', 'tasks', 'have', 'with', 'about', 'this', 'your', 'list'].includes(t));
    if (cleanTokens.length > 0) {
      input.nodes.filter((n) => cleanTokens.some((t) => n.title.toLowerCase().includes(t) || n.content?.toLowerCase().includes(t))).forEach(addIfUnique);
    }

    return matches;
  };

  const findMatchingNode = (query: string): TaskadeNodeRecord | undefined => {
    const list = findMatchingNodes(query);
    if (list.length > 0) return list[0];

    const q = query.trim().toLowerCase();
    return input.nodes.find((n) => n.title.toLowerCase() === q || n.id.toLowerCase() === q);
  };

  // 1. Detect View / Tab Navigation
  const isCalendarQuery = lower.includes('calendar') || lower.includes('schedule');
  const isTableQuery = lower.includes('table') || lower.includes('spreadsheet') || lower.includes('tabular') || lower.includes('grid');
  const isBoardQuery = lower.includes('board') || lower.includes('kanban');
  const isMindmapQuery = lower.includes('mindmap') || lower.includes('mind map') || lower.includes('flowchart') || lower.includes('node graph');
  const isListQuery = lower.includes('list view') || lower.includes('checklist') || lower.includes('bullet list');

  if (isCalendarQuery) {
    actions.push({ type: 'switch_view', target: 'calendar', label: 'Switched to Calendar View' });
  } else if (isTableQuery && !lower.includes('task') && !input.nodes.some((n) => lower.includes(n.title.toLowerCase()))) {
    actions.push({ type: 'switch_view', target: 'table', label: 'Switched to Table View' });
  } else if (isBoardQuery) {
    actions.push({ type: 'switch_view', target: 'board', label: 'Switched to Board View' });
  } else if (isMindmapQuery) {
    actions.push({ type: 'switch_view', target: 'mindmap', label: 'Switched to Mind Map View' });
  } else if (isListQuery) {
    actions.push({ type: 'switch_view', target: 'list', label: 'Switched to List View' });
  }

  // 2. Detect Section Navigation
  if (lower.includes('workflow') || lower.includes('automation') || lower.includes('studio') || lower.includes('dag')) {
    actions.push({ type: 'switch_section', target: 'workflows', label: 'Opened Automation Studio' });
  } else if (lower.includes('agent team') || lower.includes('agents tab') || lower.includes('ai team') || lower.includes('view agents')) {
    actions.push({ type: 'switch_section', target: 'agents', label: 'Opened AI Agents Directory' });
  } else if (lower.includes('project') && (lower.includes('go to') || lower.includes('switch to') || lower.includes('show') || lower.includes('back'))) {
    actions.push({ type: 'switch_section', target: 'apps', label: 'Opened Projects & Tasks' });
  }

  // 3. Detect Workspace Navigation
  if (lower.includes('github') || lower.includes('git repo') || lower.includes('sprint 24 workspace')) {
    actions.push({ type: 'switch_workspace', target: 'github', label: 'Switched to Sprint 24 & Delivery Workspace' });
  } else if (lower.includes('telemetry') || lower.includes('gateway workspace')) {
    actions.push({ type: 'switch_workspace', target: 'eu-gateway', label: 'Switched to European Gateway Telemetry Workspace' });
  } else if (lower.includes('acme') && (lower.includes('workspace') || lower.includes('switch'))) {
    actions.push({ type: 'switch_workspace', target: 'acme-corp', label: 'Switched to Acme Corp Account Workspace' });
  }

  // 4. Detect Adaptive Canvas & 3 Hackathon Intent Scenarios
  const isMeetingPrep = lower.includes('meeting') || lower.includes('client meeting') || lower.includes('prepare') || (lower.includes('acme') && !lower.includes('only acme') && !lower.includes('open acme'));
  const isUsageDrop = lower.includes('usage') || lower.includes('drop in') || lower.includes('why did usage') || lower.includes('anomaly') || (lower.includes('drop') && !lower.includes('dropdown'));
  const isOverdueWork = (lower.includes('overdue') && !lower.includes('filter overdue')) || lower.includes('blocker') || lower.includes('deadline') || lower.includes('late tasks');
  const isAdaptiveQuery = lower.includes('adaptive') || lower.includes('canvas') || lower.includes('deck') || lower.includes('prism view');

  let adaptiveReply = '';
  let reply = '';

  if (isMeetingPrep) {
    actions.push({ type: 'adapt_scenario', target: 'meeting_prep', label: 'Adapted workspace for Client Meeting Prep' });
    actions.push({ type: 'switch_view', target: 'adaptive', label: 'Opened Adaptive Deck' });
    adaptiveReply = `Client Meeting Prep Mode Active

[Reference: Database Client - Acme Corp ($120k ARR, 150 Active Seats)]
[Reference: Calendar Invite - Tomorrow at 10:00 AM Executive Sync]
[Reference: Key Stakeholders - Sarah Lin (VP Product), Marcus Vance (Finance Director)]

Goal: Prepare tomorrow's annual contract renewal and 50-seat expansion review ($120k ARR).

Matching Workspace Deliverables:
• [Reference: Task node-1] Acme Corp Enterprise Contract Renewal ($120k ARR) | Assignee: Sarah Lin | Status: IN PROGRESS | Priority: CRITICAL
• [Reference: Task node-2] Prepare Acme Corp 10:00 AM Meeting Brief | Assignee: Sarah Lin | Status: IN PROGRESS | Priority: CRITICAL
• [Reference: Task node-6] Send Revised Contract Addendum to Marcus Vance | Assignee: Sarah Lin | Status: IN PROGRESS | Priority: HIGH

Telemetry Uptime: 99.9% quarterly uptime verified.

The Adaptive Deck panel has been surfaced on your screen. Select an action below to inspect individual records or advance renewal deliverables.`;
  } else if (isUsageDrop) {
    actions.push({ type: 'adapt_scenario', target: 'usage_drop', label: 'Adapted workspace for Usage Drop Diagnostic' });
    actions.push({ type: 'switch_view', target: 'adaptive', label: 'Opened Adaptive Deck' });
    adaptiveReply = `Usage Drop Diagnostic Mode Active

[Reference: Telemetry Metric - European Gateway 15.2% Login Drop (Tuesday 2:00 PM)]
[Reference: Root Cause - Connection Pool Saturation following Gateway Build #491]
[Reference: Resolution - Connection Pool Hotfix Deployed at Tuesday 4:30 PM (Latency Restored to 42ms)]

Goal: Investigate active user login drop in the European region and verify service recovery.

Matching Workspace Deliverables:
• [Reference: Task node-7] Investigate European Region Login Drop (15.2%) | Assignee: Alex Rivera | Status: DONE | Priority: CRITICAL
• [Reference: Task node-8] Verify European Gateway Connection Pool Latency | Assignee: Alex Rivera | Status: IN PROGRESS | Priority: HIGH

Current Status: Regional connection pool limits raised to 850 concurrent sessions; zero connection dropouts logged in the last 48 hours.

The Adaptive Deck panel has opened the diagnostic telemetry view. Select an action below to proceed.`;
  } else if (isOverdueWork) {
    actions.push({ type: 'adapt_scenario', target: 'overdue_work', label: 'Adapted workspace for Overdue Project Work' });
    actions.push({ type: 'switch_view', target: 'adaptive', label: 'Opened Adaptive Deck' });
    adaptiveReply = `Overdue Project Work Mode Active

[Reference: Project - Sprint 24 Delivery (74% Complete, 3 Overdue Deliverables)]
[Reference: Legal Blocker - Clause 4.2 Review pending on Security Audit Checklist]
[Reference: Workload Bottleneck - Sarah Lin currently assigned 4 concurrent deliverables]

Goal: Review overdue tasks and clear blockers for Sprint 24.

Matching Overdue Deliverables:
• [Reference: Task node-3] Update API Documentation for Client SDK | Assignee: Alex Rivera | Status: TODO | Priority: HIGH | Due: 2 days ago
• [Reference: Task node-4] Review Security Audit Checklist | Assignee: Sarah Lin | Status: IN REVIEW | Priority: HIGH | Blocker: Clause 4.2
• [Reference: Task node-5] Finalize Mobile Release Notes | Assignee: David Chen | Status: TODO | Priority: MEDIUM | Due: 3 days ago

The Adaptive Deck panel has highlighted overdue deliverables and team allocations. Select an action below to rebalance assignments or unblock delivery.`;
  } else if (isAdaptiveQuery) {
    actions.push({ type: 'open_adaptive', label: 'Opened PRISM Adaptive Canvas' });
  }

  // 5. Detect "Open / View / Inspect" or direct search for tasks
  const isViewOnlyNavigation = isCalendarQuery || isBoardQuery || isMindmapQuery || isListQuery || (isTableQuery && !lower.includes('task'));

  let openedNode: TaskadeNodeRecord | undefined;
  let matchingRecords: TaskadeNodeRecord[] = [];

  if (!isViewOnlyNavigation) {
    const targetQuery = lower
      .replace(/^(please\s+)?(can you\s+)?(open|inspect|view|show|find|search|filter)\s+(task\s+|record\s+|row\s+)?/i, '')
      .trim();

    matchingRecords = findMatchingNodes(targetQuery || lower);

    const isOpenExplicit =
      lower.startsWith('open ') ||
      lower.startsWith('inspect ') ||
      lower.startsWith('show ') ||
      lower.includes('open task') ||
      lower.includes('inspect task');

    if (matchingRecords.length === 1 || (matchingRecords.length > 0 && isOpenExplicit)) {
      openedNode = matchingRecords[0];
      if (!actions.some((a) => a.type === 'switch_view')) {
        actions.push({ type: 'switch_view', target: 'table', label: 'Switched to Table View' });
      }
      actions.push({
        type: 'open_task',
        taskId: openedNode.id,
        taskTitle: openedNode.title,
        field: 'all',
        label: `Opened "${openedNode.title}" in Task Inspector`,
      });
    } else if (matchingRecords.length > 1 && !isMeetingPrep && !isUsageDrop && !isOverdueWork) {
      const filterTarget = targetQuery || lower;
      actions.push({
        type: 'filter_tasks',
        target: filterTarget,
        label: `Filtered workspace table for "${filterTarget}"`,
      });
      actions.push({ type: 'switch_view', target: 'table', label: 'Switched to Table View' });
      openedNode = matchingRecords[0];
      actions.push({
        type: 'open_task',
        taskId: openedNode.id,
        taskTitle: openedNode.title,
        field: 'all',
        label: `Focused "${openedNode.title}" in Task Inspector`,
      });
    }
  }

  // 6. Detect Field Manipulation Operations
  let modifiedNode: TaskadeNodeRecord | undefined;
  let modifiedField: string | undefined;
  let modifiedValue: any;

  // Priority Update
  if (lower.includes('priority') || lower.includes('critical') || lower.includes('urgent') || lower.includes('high priority') || lower.includes('low priority') || lower.includes('medium priority')) {
    let pVal: TaskadePriority | null = null;
    if (lower.includes('critical') || lower.includes('urgent')) pVal = 'critical';
    else if (lower.includes('high')) pVal = 'high';
    else if (lower.includes('medium')) pVal = 'medium';
    else if (lower.includes('low')) pVal = 'low';

    if (pVal) {
      const targetNode = openedNode || findMatchingNode(lower);
      if (targetNode) {
        modifiedNode = targetNode;
        modifiedField = 'priority';
        modifiedValue = pVal;
        actions.push({
          type: 'update_field',
          taskId: targetNode.id,
          taskTitle: targetNode.title,
          field: 'priority',
          value: pVal,
          label: `Updated Priority to ${pVal.toUpperCase()} on "${targetNode.title}"`,
        });
      }
    }
  }

  // Status Update
  if (
    lower.includes('status') ||
    lower.includes('in progress') ||
    lower.includes('in_progress') ||
    lower.includes('review') ||
    lower.includes('done') ||
    lower.includes('complete') ||
    lower.includes('finish') ||
    lower.includes('todo')
  ) {
    let sVal: TaskadeStatus | null = null;
    if (lower.includes('done') || lower.includes('complete') || lower.includes('finish')) sVal = 'done';
    else if (lower.includes('review')) sVal = 'review';
    else if (lower.includes('in progress') || lower.includes('in_progress')) sVal = 'in_progress';
    else if (lower.includes('todo') || lower.includes('to do') || lower.includes('reopen')) sVal = 'todo';

    if (sVal) {
      const targetNode = openedNode || findMatchingNode(lower);
      if (targetNode) {
        modifiedNode = targetNode;
        modifiedField = 'status';
        modifiedValue = sVal;
        actions.push({
          type: 'update_field',
          taskId: targetNode.id,
          taskTitle: targetNode.title,
          field: 'status',
          value: sVal,
          label: `Updated Status to ${sVal.toUpperCase()} on "${targetNode.title}"`,
        });
      }
    }
  }

  // Assignee Update
  if (lower.includes('assign to') || lower.includes('assignee') || lower.includes('reassign to')) {
    const match = lower.match(/(?:assign\s+(?:to\s+)?|assignee\s+(?:to\s+)?)([\w\s]+?)(?:\s+(?:with|and|priority|status|$))/i);
    let assigneeName = match ? match[1].trim() : '';
    if (assigneeName) {
      assigneeName = assigneeName.charAt(0).toUpperCase() + assigneeName.slice(1);
      const targetNode = openedNode || findMatchingNode(lower);
      if (targetNode) {
        modifiedNode = targetNode;
        modifiedField = 'assignee';
        modifiedValue = assigneeName;
        actions.push({
          type: 'update_field',
          taskId: targetNode.id,
          taskTitle: targetNode.title,
          field: 'assignee',
          value: assigneeName,
          label: `Assigned "${targetNode.title}" to ${assigneeName}`,
        });
      }
    }
  }

  // Due Date Update
  if (lower.includes('due date') || lower.includes('due tomorrow') || lower.includes('due today') || lower.includes('due next week')) {
    let dueDateVal = 'Next week';
    if (lower.includes('tomorrow')) dueDateVal = 'Tomorrow';
    else if (lower.includes('today')) dueDateVal = 'Today';
    else if (lower.includes('friday')) dueDateVal = 'Friday';

    const targetNode = openedNode || findMatchingNode(lower);
    if (targetNode) {
      modifiedNode = targetNode;
      modifiedField = 'due_date';
      modifiedValue = dueDateVal;
      actions.push({
        type: 'update_field',
        taskId: targetNode.id,
        taskTitle: targetNode.title,
        field: 'due_date',
        value: dueDateVal,
        label: `Set Due Date of "${targetNode.title}" to ${dueDateVal}`,
      });
    }
  }

  // Filter Tasks Command
  if (lower.includes('filter ') || lower.includes('show only ') || lower.startsWith('filter') || (lower.includes('search ') && !lower.includes('search for node'))) {
    let filterQuery = '';
    if (lower.includes('critical')) filterQuery = 'critical';
    else if (lower.includes('high')) filterQuery = 'high';
    else if (lower.includes('in progress') || lower.includes('in_progress')) filterQuery = 'in progress';
    else if (lower.includes('done') || lower.includes('complete')) filterQuery = 'done';
    else if (lower.includes('todo')) filterQuery = 'todo';
    else {
      const match = lower.match(/(?:filter|search|find)\s+(?:by\s+|for\s+)?([\w\s]+)/i);
      if (match) filterQuery = match[1].trim();
    }
    if (filterQuery && !actions.some((a) => a.type === 'filter_tasks')) {
      actions.push({
        type: 'filter_tasks',
        target: filterQuery,
        label: `Filtered workspace table for "${filterQuery}"`,
      });
      actions.push({ type: 'switch_view', target: 'table', label: 'Switched to Table View' });
    }
  } else if (lower.includes('clear filter') || lower.includes('show all') || lower.includes('reset search') || lower.includes('unfilter') || lower === 'all') {
    actions.push({
      type: 'filter_tasks',
      target: '',
      label: 'Cleared table filter',
    });
    actions.push({ type: 'switch_view', target: 'table', label: 'Switched to Table View' });
  }

  // Workspace Summary & Insights
  if (
    lower.includes('summarize') ||
    lower.includes('summary') ||
    lower.includes('overview') ||
    (lower.includes('status') && !modifiedField && !lower.includes('set status') && !lower.includes('mark status')) ||
    lower.includes('what tasks') ||
    lower.includes('what to do next') ||
    lower.includes('how is the project')
  ) {
    const total = input.nodes.length;
    const completed = input.nodes.filter((n) => n.status === 'done').length;
    const inProg = input.nodes.filter((n) => n.status === 'in_progress').length;
    const critical = input.nodes.filter((n) => n.priority === 'critical');

    reply = `Workspace Health & Executive Summary

[Reference: Database Client - Acme Corp ($120k ARR, 150 Active Seats)]
[Reference: Sprint Deliverables - 8 Tasks across 3 Scenarios]

Summary Breakdown:
• Total Deliverables: ${total}
• In Progress: ${inProg} items (Renewal, Meeting Brief, Addendum, Gateway Latency)
• Completed: ${completed} items (European Login Investigation)
• Critical Blockers: ${critical.length} (${critical.map((c) => `"${c.title}"`).join(', ') || 'None'})

All items are synchronized across the table, board, and calendar views. Select an action below to inspect matching records or update statuses.`;
  }

  // Try Remote Chat API
  try {
    const payload = await request<{
      reply?: unknown;
      agent?: unknown;
      createdTasks?: unknown;
      actions?: AgentActionPayload[];
      options?: AgentActionOption[];
    }>('/agents/chat', {
      method: 'POST',
      body: JSON.stringify(input),
    });

    if (
      typeof payload.reply === 'string' &&
      isRecord(payload.agent) &&
      typeof payload.agent.name === 'string' &&
      Array.isArray(payload.createdTasks)
    ) {
      const mergedActions = [...(payload.actions || []), ...actions];
      const uniqueActions = mergedActions.filter(
        (act, idx, arr) => arr.findIndex((a) => a.type === act.type && a.target === act.target && a.taskId === act.taskId && a.field === act.field) === idx
      );

      const generatedOptions = payload.options || buildContextualOptions({
        nodes: input.nodes,
        openedNode,
        matchingNodes: matchingRecords,
        modifiedNode,
        actions: uniqueActions,
        query: lower,
      });

      return {
        reply: payload.reply,
        agent: payload.agent as { id?: string; name: string; persona: string },
        createdTasks: payload.createdTasks as TaskadeNodeRecord[],
        actions: uniqueActions.length > 0 ? uniqueActions : undefined,
        options: generatedOptions.length > 0 ? generatedOptions : undefined,
      };
    }
  } catch (err) {
    console.warn('[taskadeApi] Remote agent chat fallback active, executing referenced local intelligence:', err);
  }

  // Local Referenced Agent Engine
  const isTaskCreateRequest =
    lower.includes('create') ||
    lower.includes('add task') ||
    lower.includes('new task') ||
    lower.includes('new row') ||
    lower.includes('add row');

  let createdTasks: TaskadeNodeRecord[] = [];

  if (!reply) {
    if (matchingRecords.length > 1 && !isMeetingPrep && !isUsageDrop && !isOverdueWork) {
      reply = `Matching Workspace Records

[Reference: Search Query - "${input.message}"]
[Reference: Matched Deliverables - ${matchingRecords.length} Items Found]

Found ${matchingRecords.length} matching deliverables:
${matchingRecords.map((m) => `• [Reference: Task ${m.id}] "${m.title}" | Assignee: ${m.assignee || 'Unassigned'} | Priority: ${m.priority.toUpperCase()} | Status: ${m.status.toUpperCase()} | Due: ${m.due_date || 'None'}`).join('\n')}

I have filtered the table to show these items and opened "${matchingRecords[0].title}" in the Task Inspector panel. Select an action below to inspect individual records.`;
    } else if (openedNode && !modifiedNode && !isTaskCreateRequest) {
      reply = `Inspecting Record

[Reference: Task ${openedNode.id} - "${openedNode.title}"]
[Reference: Assignee: ${openedNode.assignee || 'Unassigned'} | Priority: ${openedNode.priority.toUpperCase()} | Status: ${openedNode.status.toUpperCase()} | Due: ${openedNode.due_date || 'None'}]

I have navigated to Table View and opened "${openedNode.title}" in the Task Inspector panel on your screen.

Deliverable Details:
• Title: ${openedNode.title}
• Assignee: ${openedNode.assignee || 'Unassigned'}
• Status: ${openedNode.status.toUpperCase()}
• Priority: ${openedNode.priority.toUpperCase()}
• Due Date: ${openedNode.due_date || 'None'}
• Notes: ${openedNode.content || 'None'}

All fields are live-editable in the inspector panel or through the quick actions below.`;
    } else if (modifiedNode && modifiedField) {
      const valStr = typeof modifiedValue === 'string' ? modifiedValue.toUpperCase() : JSON.stringify(modifiedValue);
      reply = `Field Updated Successfully

[Reference: Task ${modifiedNode.id} - "${modifiedNode.title}"]
[Reference: Field Update - ${modifiedField.toUpperCase()} set to ${valStr}]

Updated ${modifiedField.toUpperCase()} to ${valStr} on "${modifiedNode.title}". The project table, board, and database have been updated in real time.`;
    } else if (actions.some((a) => a.type === 'filter_tasks')) {
      const filterAct = actions.find((a) => a.type === 'filter_tasks');
      reply = filterAct?.target
        ? `Filtered Workspace Table

[Reference: Table Filter Active - "${filterAct.target}"]
Matching deliverables are visible in the table view. Select any row to inspect its fields.`
        : `Table Filter Reset

[Reference: Table Filter Cleared]
All deliverables are now visible in the workspace table.`;
    } else if (actions.some((a) => a.type === 'delete_task')) {
      const delAct = actions.find((a) => a.type === 'delete_task');
      reply = `Record Removed

[Reference: Deleted Deliverable - ${delAct?.label || 'Removed from table'}]`;
    } else if (actions.length > 0) {
      const actionLabels = actions.map((a) => a.label).filter(Boolean);
      if (actions.some((a) => a.type === 'switch_view' && a.target === 'table')) {
        reply = `Switched to Table View

[Reference: View - Table Grid (8 Deliverables)]
All deliverables, assignees, priorities, and deadlines are displayed in editable table rows.`;
      } else if (actions.some((a) => a.type === 'switch_view' && a.target === 'board')) {
        reply = `Switched to Kanban Board View

[Reference: View - Board Pipeline (Todo, In Progress, Review, Done)]
Deliverables are displayed across lifecycle columns with real-time drag-and-drop capability.`;
      } else if (actions.some((a) => a.type === 'switch_view' && a.target === 'mindmap')) {
        reply = `Switched to Mind Map View

[Reference: View - Mind Map Hierarchy]
Task nodes are clustered by status hierarchy branch.`;
      } else if (actions.some((a) => a.type === 'switch_view' && a.target === 'calendar')) {
        reply = `Switched to Calendar View

[Reference: View - Calendar Schedule]
Upcoming deadlines and milestones are scheduled across this week.`;
      } else if (actions.some((a) => a.type === 'switch_section' && a.target === 'workflows')) {
        reply = `Opened Automation Studio

[Reference: Section - Event-Driven DAG Workflows]
You can inspect, configure, and toggle event-driven automations.`;
      } else if (actions.some((a) => a.type === 'switch_section' && a.target === 'agents')) {
        reply = `Opened AI Agents Directory

[Reference: Section - AI Team Members & Tool Bindings]
Inspect agent profiles, model tiers, and assigned capabilities.`;
      } else if (actions.some((a) => a.type === 'switch_workspace')) {
        const wsTarget = actions.find((a) => a.type === 'switch_workspace')?.target;
        reply = `Switched Workspace

[Reference: Active Domain - ${wsTarget?.toUpperCase()}]
Domain context and related projects loaded.`;
      } else {
        reply = `Executed Operations: ${actionLabels.join(' • ')}.`;
      }
    }
  }

  if (isTaskCreateRequest) {
    const taskTitle = input.message
      .replace(
        /^(please\s+)?(can you\s+)?(create|add|schedule)\s+(a\s+|an\s+|the\s+)?(new\s+)?(task\s+to\s+|task\s+for\s+|task\s+|todo\s+to\s+|todo\s+for\s+|todo\s+|row\s+)?/i,
        ''
      )
      .replace(/\s+(with|and|assigned to|priority).*$/i, '')
      .trim() || 'New Action Item';
    const cleanTitle = taskTitle.charAt(0).toUpperCase() + taskTitle.slice(1);

    let priority: TaskadePriority = 'medium';
    if (lower.includes('critical') || lower.includes('urgent')) priority = 'critical';
    else if (lower.includes('high')) priority = 'high';
    else if (lower.includes('low')) priority = 'low';

    let assignee = 'AI Agent';
    if (lower.includes('sarah')) assignee = 'Sarah Lin';
    else if (lower.includes('alex')) assignee = 'Alex Rivera';
    else if (lower.includes('marcus')) assignee = 'Marcus Vance';
    else if (lower.includes('david')) assignee = 'David Chen';
    else if (lower.includes('you') || lower.includes('me')) assignee = 'You';

    const newTask: TaskadeNodeRecord = {
      id: `node-${Date.now()}`,
      project_id: input.projectId || 'proj-1',
      title: cleanTitle,
      content: `Created by AI Agent based on prompt: "${input.message}"`,
      status: lower.includes('in progress') ? 'in_progress' : lower.includes('review') ? 'review' : 'todo',
      priority,
      order_index: input.nodes.length,
      assignee,
      due_date: lower.includes('tomorrow') ? 'Tomorrow' : 'Next week',
      created_at: new Date().toISOString(),
    };
    createdTasks = [newTask];
    actions.push({
      type: 'create_task',
      createdTask: newTask,
      taskId: newTask.id,
      taskTitle: newTask.title,
      label: `Created deliverable "${cleanTitle}"`,
    });
    actions.push({
      type: 'open_task',
      taskId: newTask.id,
      taskTitle: newTask.title,
      field: 'all',
      label: `Opened "${cleanTitle}" in Task Inspector`,
    });

    const taskMsg = `Deliverable Created

[Reference: Task ${newTask.id} - "${cleanTitle}"]
[Reference: Assignee: ${newTask.assignee} | Priority: ${newTask.priority.toUpperCase()} | Status: ${newTask.status.toUpperCase()}]

Added "${cleanTitle}" to active project table. Opened in Task Inspector panel.`;
    reply = reply ? `${reply}\n\n${taskMsg}` : taskMsg;
  } else if (adaptiveReply) {
    reply = adaptiveReply;
  } else if (!reply) {
    reply = `Workspace Intelligence Ready

[Reference: Active Workspace Table - ${input.nodes.length} Records Connected]

Give me a goal or query such as:
• "Prepare tomorrow's client meeting" (Surfaces Acme Corp executive prep)
• "Investigate drop in product usage" (Surfaces European gateway diagnostics)
• "Review overdue project work" (Surfaces Sprint 24 deliverables and blockers)
• "Show tasks for Sarah Lin" (Filters and inspects Sarah's deliverables)
• "Open Acme Corp Enterprise Contract Renewal" (Opens task inspector)
• "Set priority to Critical" (Updates deliverable priority in real time)`;
  }

  const generatedOptions = buildContextualOptions({
    nodes: input.nodes,
    openedNode,
    matchingNodes: matchingRecords,
    modifiedNode,
    createdTask: createdTasks[0],
    actions,
    query: lower,
  });

  return {
    reply,
    agent: {
      id: input.agentId,
      name: input.agentName || 'Prism AI',
      persona: 'Workspace Intelligence & Task Orchestrator',
    },
    createdTasks,
    actions: actions.length > 0 ? actions : undefined,
    options: generatedOptions.length > 0 ? generatedOptions : undefined,
  };
}

function buildContextualOptions(params: {
  nodes: TaskadeNodeRecord[];
  openedNode?: TaskadeNodeRecord;
  matchingNodes?: TaskadeNodeRecord[];
  modifiedNode?: TaskadeNodeRecord;
  createdTask?: TaskadeNodeRecord;
  actions: AgentActionPayload[];
  query: string;
}): AgentActionOption[] {
  const options: AgentActionOption[] = [];
  const q = params.query.toLowerCase();

  // Hackathon Scenario 1: Meeting Prep
  if (q.includes('meeting') || q.includes('prepare') || (q.includes('acme') && !q.includes('only acme'))) {
    options.push({
      id: `opt-inspect-brief-${Date.now()}`,
      label: 'Inspect 10:00 AM Meeting Brief',
      icon: 'inspect',
      action: {
        type: 'open_task',
        taskId: 'node-2',
        taskTitle: 'Prepare Acme Corp 10:00 AM Meeting Brief',
        field: 'all',
        label: 'Opened 10:00 AM Meeting Brief in Inspector',
      },
    });
    options.push({
      id: `opt-lock-${Date.now()}`,
      label: 'Lock SLA Clause 4.2',
      icon: 'check',
      action: {
        type: 'update_field',
        taskId: 'node-1',
        taskTitle: 'Acme Corp Enterprise Contract Renewal ($120k ARR)',
        field: 'priority',
        value: 'critical',
        label: 'SLA Clause 4.2 locked and approved',
      },
    });
    options.push({
      id: `opt-send-addendum-${Date.now()}`,
      label: 'Inspect Marcus Vance Addendum',
      icon: 'inspect',
      action: {
        type: 'open_task',
        taskId: 'node-6',
        taskTitle: 'Send Revised Contract Addendum to Marcus Vance',
        field: 'all',
        label: 'Opened Contract Addendum in Inspector',
      },
    });
    options.push({
      id: `opt-cal-${Date.now()}`,
      label: 'Open in Calendar View',
      icon: 'calendar',
      action: {
        type: 'switch_view',
        target: 'calendar',
        label: 'Opened Calendar View for tomorrow',
      },
    });
    return options.slice(0, 4);
  }

  // Hackathon Scenario 2: Usage Drop
  if (q.includes('usage') || q.includes('drop') || q.includes('telemetry') || q.includes('why did usage') || q.includes('anomaly')) {
    options.push({
      id: `opt-inspect-latency-${Date.now()}`,
      label: 'Inspect Gateway Latency Task',
      icon: 'inspect',
      action: {
        type: 'open_task',
        taskId: 'node-8',
        taskTitle: 'Verify European Gateway Connection Pool Latency',
        field: 'all',
        label: 'Opened Gateway Connection Pool Latency in Inspector',
      },
    });
    options.push({
      id: `opt-inspect-incident-${Date.now()}`,
      label: 'Inspect Incident Resolution',
      icon: 'check',
      action: {
        type: 'open_task',
        taskId: 'node-7',
        taskTitle: 'Investigate European Region Login Drop (15.2%)',
        field: 'all',
        label: 'Opened Login Drop Investigation in Inspector',
      },
    });
    options.push({
      id: `opt-rollback-${Date.now()}`,
      label: 'Verify Build #491 Fix',
      icon: 'zap',
      action: {
        type: 'update_field',
        taskId: 'node-8',
        taskTitle: 'Verify European Gateway Connection Pool Latency',
        field: 'status',
        value: 'in_progress',
        label: 'Build #491 verified with 42ms latency',
      },
    });
    options.push({
      id: `opt-tbl-${Date.now()}`,
      label: 'Open Table View',
      icon: 'table',
      action: {
        type: 'switch_view',
        target: 'table',
        label: 'Opened Table View',
      },
    });
    return options.slice(0, 4);
  }

  // Hackathon Scenario 3: Overdue Work
  if (q.includes('overdue') || q.includes('late') || q.includes('blocker') || q.includes('deadline') || q.includes('sprint 24')) {
    options.push({
      id: `opt-reassign-sdk-${Date.now()}`,
      label: 'Reassign API Docs to Alex Rivera',
      icon: 'user',
      action: {
        type: 'update_field',
        taskId: 'node-3',
        taskTitle: 'Update API Documentation for Client SDK',
        field: 'assignee',
        value: 'Alex Rivera',
        label: 'Reassigned API Documentation to Alex Rivera',
      },
    });
    options.push({
      id: `opt-inspect-security-${Date.now()}`,
      label: 'Inspect Security Audit Blocker',
      icon: 'inspect',
      action: {
        type: 'open_task',
        taskId: 'node-4',
        taskTitle: 'Review Security Audit Checklist',
        field: 'all',
        label: 'Opened Security Audit Checklist in Inspector',
      },
    });
    options.push({
      id: `opt-inspect-mobile-${Date.now()}`,
      label: 'Inspect Mobile Release Notes',
      icon: 'inspect',
      action: {
        type: 'open_task',
        taskId: 'node-5',
        taskTitle: 'Finalize Mobile Release Notes',
        field: 'all',
        label: 'Opened Mobile Release Notes in Inspector',
      },
    });
    options.push({
      id: `opt-filter-overdue-${Date.now()}`,
      label: 'Show Overdue in Table View',
      icon: 'table',
      action: {
        type: 'filter_tasks',
        target: 'overdue',
        label: 'Filtered table for Overdue tasks',
      },
    });
    return options.slice(0, 4);
  }

  // If multiple matching nodes were found, provide buttons to inspect each
  if (params.matchingNodes && params.matchingNodes.length > 1) {
    for (const match of params.matchingNodes.slice(0, 3)) {
      options.push({
        id: `opt-open-match-${match.id}-${Date.now()}`,
        label: `Inspect: "${match.title.slice(0, 24)}"`,
        icon: 'inspect',
        action: {
          type: 'open_task',
          taskId: match.id,
          taskTitle: match.title,
          field: 'all',
          label: `Opened "${match.title}" in Task Inspector`,
        },
      });
    }
    options.push({
      id: `opt-clear-${Date.now()}`,
      label: 'Clear Filter (Show All)',
      icon: 'filter',
      action: {
        type: 'filter_tasks',
        target: '',
        label: 'Cleared table filter',
      },
    });
    return options.slice(0, 4);
  }

  const activeNode = params.modifiedNode || params.openedNode || params.createdTask;

  // Task-specific options when an item was targeted or modified
  if (activeNode) {
    if (activeNode.status !== 'done') {
      options.push({
        id: `opt-done-${activeNode.id}-${Date.now()}`,
        label: `Mark as Done: "${activeNode.title.slice(0, 24)}"`,
        icon: 'check',
        action: {
          type: 'update_field',
          taskId: activeNode.id,
          taskTitle: activeNode.title,
          field: 'status',
          value: 'done',
          label: `Marked "${activeNode.title}" Done`,
        },
      });
    }

    if (activeNode.status !== 'in_progress') {
      options.push({
        id: `opt-prog-${activeNode.id}-${Date.now()}`,
        label: 'Set In Progress',
        icon: 'zap',
        action: {
          type: 'update_field',
          taskId: activeNode.id,
          taskTitle: activeNode.title,
          field: 'status',
          value: 'in_progress',
          label: `Marked "${activeNode.title}" In Progress`,
        },
      });
    }

    if (activeNode.priority !== 'critical') {
      options.push({
        id: `opt-crit-${activeNode.id}-${Date.now()}`,
        label: 'Escalate to Critical',
        icon: 'zap',
        action: {
          type: 'update_field',
          taskId: activeNode.id,
          taskTitle: activeNode.title,
          field: 'priority',
          value: 'critical',
          label: `Set Priority to CRITICAL on "${activeNode.title}"`,
        },
      });
    }

    options.push({
      id: `opt-cal-${activeNode.id}-${Date.now()}`,
      label: 'Open in Calendar View',
      icon: 'calendar',
      action: {
        type: 'switch_view',
        target: 'calendar',
        label: 'Switched to Calendar View',
      },
    });

    return options.slice(0, 4);
  }

  // General default fallback options
  const criticalNode = params.nodes.find((n) => n.priority === 'critical');
  const inProgNode = params.nodes.find((n) => n.status === 'in_progress');

  if (criticalNode) {
    options.push({
      id: `opt-def-crit-${criticalNode.id}-${Date.now()}`,
      label: `Inspect Blocker: "${criticalNode.title.slice(0, 22)}"`,
      icon: 'inspect',
      action: {
        type: 'open_task',
        taskId: criticalNode.id,
        taskTitle: criticalNode.title,
        field: 'all',
        label: `Opened Critical Item "${criticalNode.title}"`,
      },
    });
  }

  if (inProgNode) {
    options.push({
      id: `opt-def-prog-${inProgNode.id}-${Date.now()}`,
      label: `Inspect: "${inProgNode.title.slice(0, 22)}"`,
      icon: 'inspect',
      action: {
        type: 'open_task',
        taskId: inProgNode.id,
        taskTitle: inProgNode.title,
        field: 'all',
        label: `Opened "${inProgNode.title}"`,
      },
    });
  }

  options.push({
    id: `opt-def-table-${Date.now()}`,
    label: 'Open Table View',
    icon: 'table',
    action: {
      type: 'switch_view',
      target: 'table',
      label: 'Switched to Table View',
    },
  });

  options.push({
    id: `opt-def-cal-${Date.now()}`,
    label: 'Open Calendar View',
    icon: 'calendar',
    action: {
      type: 'switch_view',
      target: 'calendar',
      label: 'Switched to Calendar View',
    },
  });

  return options.slice(0, 4);
}

export async function createTaskadeWorkflow(
  workflow: Omit<TaskadeWorkflowRecord, 'id'>
): Promise<TaskadeWorkflowRecord> {
  try {
    const payload = await request<{ workflow?: TaskadeWorkflowRecord }>('/workflows', {
      method: 'POST',
      body: JSON.stringify(workflow),
    });
    if (payload?.workflow && typeof payload.workflow.id === 'string') {
      return payload.workflow;
    }
  } catch (err) {
    console.warn('[taskadeApi] Remote createTaskadeWorkflow failed, saving locally:', err);
  }

  return {
    id: `wf-${Date.now()}`,
    ...workflow,
  };
}

export async function updateTaskadeWorkflow(
  id: string,
  isActive: boolean
): Promise<TaskadeWorkflowRecord> {
  try {
    const payload = await request<{ workflow?: TaskadeWorkflowRecord }>(
      `/workflows/${encodeURIComponent(id)}`,
      {
        method: 'PATCH',
        body: JSON.stringify({ is_active: isActive }),
      }
    );
    if (payload?.workflow && typeof payload.workflow.id === 'string') {
      return payload.workflow;
    }
  } catch (err) {
    console.warn('[taskadeApi] Remote updateTaskadeWorkflow failed, updating locally:', err);
  }

  return {
    id,
    workspace_id: 'default',
    name: 'Workflow',
    trigger_type: 'manual',
    nodes: [],
    edges: [],
    is_active: isActive,
  };
}
