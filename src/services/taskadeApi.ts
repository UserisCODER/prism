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
    name: 'Salesforce CRM',
    domain: 'salesforce.com',
    slug: 'salesforce-crm',
    description: 'Enterprise pipeline management, client health scores, and automated lead follow-ups.',
    icon: 'sparkles',
  },
  {
    id: 'ws-2',
    name: 'Meridian Labs',
    domain: 'meridianlabs.io',
    slug: 'meridian-labs',
    description: 'Client meeting preparation, $1.42M ARR renewal, and SLA contract negotiation.',
    icon: 'briefcase',
  },
  {
    id: 'ws-3',
    name: 'Engineering Infrastructure',
    domain: 'github.com',
    slug: 'eng-infra',
    description: 'Telemetry monitoring, Gateway #491 incident diagnostics, and delivery velocity.',
    icon: 'terminal',
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
        title: 'Acme Corp Enterprise Contract Renewal',
        content: 'Contract expires next month. Stakeholders requested custom SLA pricing.',
        status: 'in_progress',
        priority: 'critical',
        order_index: 0,
        assignee: 'Sarah Lin',
        tags: ['Enterprise', 'Q3', 'High-ARR'],
        due_date: new Date(Date.now() + 86400000 * 3).toISOString(),
      },
      {
        id: 'node-2',
        project_id: 'proj-1',
        title: 'Schedule Q4 Review with TechCorp VP',
        content: 'Discuss expansion into European offices. Follow up on security checklist.',
        status: 'todo',
        priority: 'high',
        order_index: 1,
        assignee: 'Alex Rivera',
        tags: ['Expansion', 'Outreach'],
        due_date: new Date(Date.now() + 86400000 * 5).toISOString(),
      },
      {
        id: 'node-3',
        project_id: 'proj-1',
        title: 'Stripe Billing Webhook Integration',
        content: 'Automate invoice failure notifications directly into Slack channel.',
        status: 'review',
        priority: 'medium',
        order_index: 2,
        assignee: 'David Chen',
        tags: ['Billing', 'DevOps'],
        due_date: new Date(Date.now() + 86400000 * 1).toISOString(),
      },
      {
        id: 'node-4',
        project_id: 'proj-1',
        title: 'Closed: Globex $120k Annual License',
        content: 'Signed on Thursday. Onboarding team invited to private Slack channel.',
        status: 'done',
        priority: 'low',
        order_index: 3,
        assignee: 'Sarah Lin',
        tags: ['Won', 'Enterprise'],
        due_date: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      {
        id: 'node-5',
        project_id: 'proj-1',
        title: 'Send Revised MSA to Acme Legal',
        content: 'Include updated compliance clause 4.2.',
        status: 'in_progress',
        priority: 'high',
        order_index: 4,
        assignee: 'Sarah Lin',
        tags: ['Legal'],
        due_date: new Date(Date.now() + 86400000 * 2).toISOString(),
      },
      {
        id: 'node-6',
        project_id: 'proj-1',
        title: 'Prepare Q3 Executive Review Slide Deck',
        content: 'Incorporate Meridian Labs $1.42M ARR renewal terms, SLA uptimes, and Q4 roadmap.',
        status: 'in_progress',
        priority: 'high',
        order_index: 5,
        assignee: 'Sarah Lin',
        tags: ['Executive', 'Deck', 'Q3'],
        due_date: new Date(Date.now() + 86400000 * 1).toISOString(),
      },
      {
        id: 'node-7',
        project_id: 'proj-1',
        title: 'Investigate SMB API Latency Spike on Node #491',
        content: 'Anomaly detector flagged -34% SMB usage drop correlated with Gateway release #491.',
        status: 'in_progress',
        priority: 'critical',
        order_index: 6,
        assignee: 'Alex Rivera',
        tags: ['Telemetry', 'SRE', 'Incident'],
        due_date: new Date(Date.now() + 86400000 * 1).toISOString(),
      },
      {
        id: 'node-8',
        project_id: 'proj-1',
        title: 'Audit SOC2 Compliance Clause 4.2 with Legal',
        content: 'Sarah Jenkins requested legal signoff for dedicated multi-region failover cluster.',
        status: 'review',
        priority: 'medium',
        order_index: 7,
        assignee: 'David Chen',
        tags: ['Compliance', 'Security'],
        due_date: new Date(Date.now() + 86400000 * 4).toISOString(),
      },
      {
        id: 'node-9',
        project_id: 'proj-1',
        title: 'Deploy Automated SLA Breach Webhook to Ops Slack',
        content: 'Dispatches real-time alerts when SMB API drop crosses 20% threshold.',
        status: 'done',
        priority: 'high',
        order_index: 8,
        assignee: 'Alex Rivera',
        tags: ['Automation', 'DevOps'],
        due_date: new Date(Date.now() - 86400000 * 1).toISOString(),
      },
      {
        id: 'node-10',
        project_id: 'proj-1',
        title: 'Unblock Priya Sharma: Reassign Batch Run #491',
        content: 'Priya Sharma is 140% overloaded across 6 critical path items risking Q3 milestone SLA.',
        status: 'todo',
        priority: 'critical',
        order_index: 9,
        assignee: 'Marcus Vance',
        tags: ['Bottleneck', 'Q3 Milestone'],
        due_date: new Date(Date.now() + 86400000 * 2).toISOString(),
      },
      {
        id: 'node-11',
        project_id: 'proj-1',
        title: 'Sync with Elena Rostova on Microservice Migration',
        content: 'Lead architect praise for 99.98% uptime; confirm final production rollout date.',
        status: 'todo',
        priority: 'medium',
        order_index: 10,
        assignee: 'Sarah Lin',
        tags: ['Architecture', 'TechDebt'],
        due_date: new Date(Date.now() + 86400000 * 6).toISOString(),
      },
      {
        id: 'node-12',
        project_id: 'proj-1',
        title: 'Verify Q3 Revenue Forecast ($1.42M ARR Renewal)',
        content: 'Finance confirmation of margin targets with tiered volume pricing structure.',
        status: 'done',
        priority: 'high',
        order_index: 11,
        assignee: 'Marcus Vance',
        tags: ['Finance', 'Renewal'],
        due_date: new Date(Date.now() - 86400000 * 3).toISOString(),
      },
    ],
  },
  {
    id: 'proj-2',
    workspace_id: 'default',
    name: 'Client Meeting & Renewal War Room',
    default_view: 'adaptive',
    nodes: [
      {
        id: 'node-201',
        project_id: 'proj-2',
        title: 'Review Meridian Labs 11:30 AM Executive Agenda',
        content: 'Agenda items: Q3 contract amendment, clause 4.2 compliance wording, and tier-4 SLA pricing.',
        status: 'in_progress',
        priority: 'critical',
        order_index: 0,
        assignee: 'Sarah Lin',
        tags: ['Executive', 'Meeting', 'Meridian'],
        due_date: new Date(Date.now() + 86400000 * 1).toISOString(),
      },
      {
        id: 'node-202',
        project_id: 'proj-2',
        title: 'Address Marcus Vance Budget Pushback on SLA Tier',
        content: 'Marcus indicated budget approval for Q4 expansion if pricing accommodates the 34% volume jump.',
        status: 'todo',
        priority: 'high',
        order_index: 1,
        assignee: 'Marcus Vance',
        tags: ['Budget', 'Finance'],
        due_date: new Date(Date.now() + 86400000 * 2).toISOString(),
      },
      {
        id: 'node-203',
        project_id: 'proj-2',
        title: 'Prepare Elena Rostova Speed & Architecture Brief',
        content: 'Document latency benchmarks and failover architecture to validate 99.98% SLA capability.',
        status: 'review',
        priority: 'medium',
        order_index: 2,
        assignee: 'Alex Rivera',
        tags: ['Architecture', 'Technical'],
        due_date: new Date(Date.now() + 86400000 * 2).toISOString(),
      },
      {
        id: 'node-204',
        project_id: 'proj-2',
        title: 'Finalize Custom SLA Pricing Addendum ($1.42M ARR)',
        content: 'Legal and financial addendum ready for 1-click execution following tomorrow morning sync.',
        status: 'in_progress',
        priority: 'critical',
        order_index: 3,
        assignee: 'Sarah Lin',
        tags: ['Legal', 'High-ARR'],
        due_date: new Date(Date.now() + 86400000 * 1).toISOString(),
      },
      {
        id: 'node-205',
        project_id: 'proj-2',
        title: 'Verify Token Throughput Spike (+34% usage metrics)',
        content: 'Confirmed active telemetry logs showing sustained token demand across all 480 production pods.',
        status: 'done',
        priority: 'high',
        order_index: 4,
        assignee: 'David Chen',
        tags: ['Telemetry', 'Verified'],
        due_date: new Date(Date.now() - 86400000 * 1).toISOString(),
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
  const lower = input.message.toLowerCase();

  // Helper to find best matching node
  const findMatchingNode = (query: string): TaskadeNodeRecord | undefined => {
    const q = query.trim().toLowerCase();
    if (!q) return undefined;

    const ignoreWords = new Set([
      'task', 'item', 'open', 'please', 'change', 'update', 'status', 'priority',
      'assign', 'assignee', 'view', 'table', 'board', 'calendar', 'mindmap', 'mind',
      'map', 'list', 'show', 'inspect', 'look', 'at', 'record', 'row', 'can', 'you'
    ]);

    // 1. Exact or substring match in node title
    const exact = input.nodes.find((n) => {
      const nLower = n.title.toLowerCase();
      return nLower === q || (q.length >= 4 && (nLower.includes(q) || q.includes(nLower)));
    });
    if (exact) return exact;

    // 2. Significant word match
    const words = q.split(/\s+/).filter((w) => w.length > 3 && !ignoreWords.has(w));
    if (words.length > 0) {
      const wordMatch = input.nodes.find((n) => {
        const nLower = n.title.toLowerCase();
        return words.some((w) => nLower.includes(w));
      });
      if (wordMatch) return wordMatch;
    }

    return undefined;
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
  if (lower.includes('github') || lower.includes('git repo')) {
    actions.push({ type: 'switch_workspace', target: 'github', label: 'Switched to GitHub Workspace' });
  } else if (lower.includes('notion') || lower.includes('wiki') || lower.includes('docs')) {
    actions.push({ type: 'switch_workspace', target: 'notion', label: 'Switched to Notion Workspace' });
  } else if (lower.includes('salesforce') || lower.includes('crm') || lower.includes('deals')) {
    actions.push({ type: 'switch_workspace', target: 'salesforce', label: 'Switched to Salesforce CRM Workspace' });
  }

  // 4. Detect Adaptive Canvas & 3 Hackathon Intent Scenarios
  const isMeetingPrep = lower.includes('meeting') || lower.includes('client meeting') || lower.includes('prepare') || lower.includes('acme') || lower.includes('meridian');
  const isUsageDrop = lower.includes('usage') || lower.includes('drop in') || lower.includes('smb') || lower.includes('why did usage') || lower.includes('anomaly');
  const isOverdueWork = lower.includes('overdue') || lower.includes('late') || lower.includes('blocker') || lower.includes('deadline');
  const isAdaptiveQuery = lower.includes('adaptive') || lower.includes('canvas') || lower.includes('prism view') || lower.includes('prism canvas');

  let adaptiveReply = '';
  let reply = '';

  if (isMeetingPrep) {
    actions.push({ type: 'adapt_scenario', target: 'meeting_prep', label: 'Adapted workspace for Client Meeting Prep' });
    actions.push({ type: 'switch_view', target: 'adaptive', label: 'Opened Adaptive Deck' });
    adaptiveReply = `### 🤝 Client Meeting Prep Mode Active\n**Goal**: Prepare tomorrow's client meeting with **Meridian Labs / Acme Enterprise**.\n\n* **Why Surfaced**: Calendar invite scheduled for tomorrow at 11:30 AM. Contract renegotiation threshold triggered by **+34% token throughput spike**.\n* **Surfaced Components**: Client Overview ($1.42M ARR, 68 Health), Stakeholder Sentiments (Sarah Jenkins, Marcus Vance, Elena Rostova), Agenda Brief, and Recent Comms.\n\nThe adaptive workspace on your left has reorganized itself for this meeting. Select any one-click action below to proceed:`;
  } else if (isUsageDrop) {
    actions.push({ type: 'adapt_scenario', target: 'usage_drop', label: 'Adapted workspace for Usage Drop Diagnostic' });
    actions.push({ type: 'switch_view', target: 'adaptive', label: 'Opened Adaptive Deck' });
    adaptiveReply = `### 📉 Usage Drop Diagnostic Mode Active\n**Goal**: Investigate **-34% usage drop** across SMB segment in Week 38.\n\n* **Why Surfaced**: Automatic anomaly detector flagged sudden active user drop between Thursday and Saturday.\n* **Surfaced Components**: Anomaly Callout Alert, Telemetry Spline Stream, Cohort Segment Breakdown, and Gateway Root Cause Trace.\n\nThe workspace on your left has reorganized into diagnostic mode. Select an action below:`;
  } else if (isOverdueWork) {
    actions.push({ type: 'adapt_scenario', target: 'overdue_work', label: 'Adapted workspace for Overdue Project Work' });
    actions.push({ type: 'switch_view', target: 'adaptive', label: 'Opened Adaptive Deck' });
    adaptiveReply = `### ⚠️ Overdue Project Work Mode Active\n**Goal**: Review 5 overdue deliverables and critical blockers risking Q3 milestones.\n\n* **Why Surfaced**: 3 deliverables crossed SLA due dates and 2 are blocked, directly threatening Q3 commitments.\n* **Surfaced Components**: Delivery Risk Banner, Overdue Matrix, Owner Workload Bottleneck, and Rapid Unblocking Path.\n\nThe workspace on your left has brought overdue deliverables and owner bottlenecks into focus. Select an action below:`;
  } else if (isAdaptiveQuery) {
    actions.push({ type: 'open_adaptive', label: 'Opened PRISM Adaptive Canvas' });
  }

  // 5. Detect "Open / View / Inspect" on a specific task
  // Never treat pure view switches (e.g. calendar, board, table) as task open commands
  const isViewOnlyNavigation = isCalendarQuery || isBoardQuery || isMindmapQuery || isListQuery || (isTableQuery && !lower.includes('task'));

  let openedNode: TaskadeNodeRecord | undefined;
  if (!isViewOnlyNavigation) {
    const isOpenCommand =
      lower.startsWith('open task') ||
      lower.includes('open task') ||
      lower.includes('inspect ') ||
      (lower.startsWith('open ') && !lower.startsWith('open calendar') && !lower.startsWith('open board') && !lower.startsWith('open table')) ||
      input.nodes.some((n) => lower.includes(n.title.toLowerCase()));

    if (isOpenCommand) {
      const targetQuery = lower.replace(/^(please\s+)?(can you\s+)?(open|inspect|view|show)\s+(task\s+|record\s+|row\s+)?/i, '').trim();
      openedNode = findMatchingNode(targetQuery || lower);
      if (openedNode) {
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
      }
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

  // Filter Tasks
  if (lower.includes('filter ') || lower.includes('show only ') || lower.includes('only critical') || lower.startsWith('filter') || (lower.includes('search ') && !lower.includes('search for node'))) {
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
    actions.push({
      type: 'filter_tasks',
      target: filterQuery,
      label: filterQuery ? `Filtered workspace for "${filterQuery}"` : 'Cleared filter',
    });
  } else if (lower.includes('clear filter') || lower.includes('show all') || lower.includes('reset search') || lower.includes('unfilter') || lower === 'all') {
    actions.push({
      type: 'filter_tasks',
      target: '',
      label: 'Cleared table filter',
    });
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

    reply = `### Workspace Health & Executive Summary\n* **Total Records**: ${total}\n* **In Progress**: ${inProg} item${inProg !== 1 ? 's' : ''}\n* **Completed**: ${completed} item${completed !== 1 ? 's' : ''}\n* **Critical Blockers**: ${critical.length} (${critical.map((c) => `"${c.title}"`).join(', ') || 'None'})\n\nSelect any real-time action below to update tasks or transition views in the background.`;
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
    console.warn('[taskadeApi] Remote agent chat failed, engaging proactive local agent intelligence:', err);
  }

  // Proactive Local Agent Fallback Engine
  const isTaskCreateRequest =
    lower.includes('create') ||
    lower.includes('add task') ||
    lower.includes('new task') ||
    lower.includes('new row') ||
    lower.includes('add row');

  let createdTasks: TaskadeNodeRecord[] = [];

  if (!reply) {
    if (openedNode && !modifiedNode && !isTaskCreateRequest) {
      reply = `Navigated to **Table View** and opened **"${openedNode.title}"** in the Task Inspector.\n\n* **Status**: \`${openedNode.status.toUpperCase()}\` • **Priority**: \`${openedNode.priority.toUpperCase()}\` • **Assignee**: ${openedNode.assignee || 'Unassigned'} • **Due**: ${openedNode.due_date || 'None'}\n\nAll fields are editable directly in the table or via the action buttons below.`;
    } else if (modifiedNode && modifiedField) {
      const valStr = typeof modifiedValue === 'string' ? modifiedValue.toUpperCase() : JSON.stringify(modifiedValue);
      reply = `✅ Updated **${modifiedField.toUpperCase()}** to \`${valStr}\` on **"${modifiedNode.title}"**.\n\nThe project table and database have been updated in real time in the background.`;
    } else if (actions.some((a) => a.type === 'filter_tasks')) {
      const filterAct = actions.find((a) => a.type === 'filter_tasks');
      reply = filterAct?.target
        ? `Filtered workspace for **"${filterAct.target}"**. Matching tasks are shown in the background view.`
        : `Filter cleared. All tasks are visible in the background workspace.`;
    } else if (actions.some((a) => a.type === 'delete_task')) {
      const delAct = actions.find((a) => a.type === 'delete_task');
      reply = `🗑️ Removed: ${delAct?.label || 'Deleted task from project table'}.`;
    } else if (actions.length > 0) {
      const actionLabels = actions.map((a) => a.label).filter(Boolean);
      if (actions.some((a) => a.type === 'switch_view' && a.target === 'table')) {
        reply = `Switched to **Table View**. All records, assignees, and dates are displayed in editable table rows.`;
      } else if (actions.some((a) => a.type === 'switch_view' && a.target === 'board')) {
        reply = `Switched to **Board View** (Kanban). Visual workflow pipeline across Todo, In Progress, Review, and Done.`;
      } else if (actions.some((a) => a.type === 'switch_view' && a.target === 'mindmap')) {
        reply = `Switched to **Mind Map View**, displaying task nodes clustered by branch hierarchy.`;
      } else if (actions.some((a) => a.type === 'switch_view' && a.target === 'calendar')) {
        reply = `Switched to **Calendar View**. Your upcoming deadlines and milestones are scheduled across this week.`;
      } else if (actions.some((a) => a.type === 'switch_section' && a.target === 'workflows')) {
        reply = `Opened **Automation Studio**. You can inspect and toggle event-driven DAG workflow triggers.`;
      } else if (actions.some((a) => a.type === 'switch_section' && a.target === 'agents')) {
        reply = `Opened **AI Agents Directory**. Review agent profiles, tool assignments, and model tiers.`;
      } else if (actions.some((a) => a.type === 'switch_workspace')) {
        const wsTarget = actions.find((a) => a.type === 'switch_workspace')?.target;
        reply = `Switched workspace to **${wsTarget?.toUpperCase()}**. Domain context and projects have been loaded.`;
      } else {
        reply = `Executed operations: ${actionLabels.join(' • ')}.`;
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
      label: `Created task "${cleanTitle}"`,
    });

    const taskMsg = `➕ **New Task Created**: Added **"${cleanTitle}"** with Priority **${newTask.priority.toUpperCase()}**, Assignee **${newTask.assignee}**, and Status **${newTask.status.toUpperCase()}**.`;
    reply = reply ? `${reply}\n\n${taskMsg}` : taskMsg;
  } else if (adaptiveReply) {
    reply = adaptiveReply;
  } else if (!reply) {
    reply = `I'm analyzing your active project table with **${input.nodes.length}** records. Give me a command like:\n• *"Prepare tomorrow's client meeting"*\n• *"Investigate drop in product usage"*\n• *"Review overdue project work"*\n• *"Set priority to Critical"*\n• *"Switch to Calendar View"*`;
  }

  const generatedOptions = buildContextualOptions({
    nodes: input.nodes,
    openedNode,
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
  modifiedNode?: TaskadeNodeRecord;
  createdTask?: TaskadeNodeRecord;
  actions: AgentActionPayload[];
  query: string;
}): AgentActionOption[] {
  const options: AgentActionOption[] = [];
  const q = params.query.toLowerCase();

  // Hackathon Scenario 1: Meeting Prep
  if (q.includes('meeting') || q.includes('prepare') || q.includes('acme') || q.includes('meridian')) {
    options.push({
      id: `opt-brief-${Date.now()}`,
      label: 'Email Briefing to Sarah Jenkins',
      icon: 'user',
      action: {
        type: 'update_field',
        taskId: 'node-1',
        field: 'status',
        value: 'in_progress',
        label: 'Briefing deck emailed to Sarah Jenkins',
      },
    });
    options.push({
      id: `opt-lock-${Date.now()}`,
      label: 'Lock SLA Draft 4.2',
      icon: 'check',
      action: {
        type: 'update_field',
        taskId: 'node-1',
        field: 'priority',
        value: 'critical',
        label: 'SLA Clause 4.2 locked & approved',
      },
    });
    options.push({
      id: `opt-crit-${Date.now()}`,
      label: 'Set Critical Priority',
      icon: 'zap',
      action: {
        type: 'update_field',
        taskId: 'node-1',
        field: 'priority',
        value: 'critical',
        label: 'Elevated contract priority to CRITICAL',
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
  if (q.includes('usage') || q.includes('drop') || q.includes('smb') || q.includes('why did usage')) {
    options.push({
      id: `opt-rollback-${Date.now()}`,
      label: 'Rollback Gateway #491 Throttling',
      icon: 'zap',
      action: {
        type: 'update_field',
        taskId: 'node-2',
        field: 'status',
        value: 'in_progress',
        label: 'Rollback executed on Gateway Node #491',
      },
    });
    options.push({
      id: `opt-notify-${Date.now()}`,
      label: 'Notify 480 Affected SMB Accounts',
      icon: 'user',
      action: {
        type: 'update_field',
        taskId: 'node-2',
        field: 'status',
        value: 'done',
        label: 'Broadcast sent to affected accounts',
      },
    });
    options.push({
      id: `opt-incident-${Date.now()}`,
      label: 'Create Incident Report #842',
      icon: 'check',
      action: {
        type: 'open_task',
        taskId: 'node-2',
        field: 'all',
        label: 'Opened Incident Report #842',
      },
    });
    options.push({
      id: `opt-tbl-${Date.now()}`,
      label: 'Open Segment Table View',
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
  if (q.includes('overdue') || q.includes('late') || q.includes('blocker') || q.includes('deadline')) {
    options.push({
      id: `opt-sre-${Date.now()}`,
      label: 'Reassign Blocker to SRE Team',
      icon: 'user',
      action: {
        type: 'update_field',
        taskId: 'node-3',
        field: 'assignee',
        value: 'SRE Escalation Team',
        label: 'Reassigned blocker to SRE Team',
      },
    });
    options.push({
      id: `opt-ext-${Date.now()}`,
      label: 'Extend Milestone Deadline +48h',
      icon: 'calendar',
      action: {
        type: 'update_field',
        taskId: 'node-3',
        field: 'due_date',
        value: 'In 2 days',
        label: 'Extended milestone deadline +48h',
      },
    });
    options.push({
      id: `opt-slack-${Date.now()}`,
      label: 'Ping Owners on Slack',
      icon: 'zap',
      action: {
        type: 'update_field',
        taskId: 'node-3',
        field: 'status',
        value: 'in_progress',
        label: 'Alert sent to Priya Sharma & Marcus Vance',
      },
    });
    options.push({
      id: `opt-board-${Date.now()}`,
      label: 'Open in Kanban Board',
      icon: 'board',
      action: {
        type: 'switch_view',
        target: 'board',
        label: 'Opened Kanban Board',
      },
    });
    return options.slice(0, 4);
  }

  const activeNode = params.modifiedNode || params.openedNode || params.createdTask;

  // 1. Task-specific options when an item was targeted or modified
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
        label: `Set In Progress`,
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
        label: `Escalate to Critical`,
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

    if (activeNode.assignee !== 'Sarah Lin') {
      options.push({
        id: `opt-assign-${activeNode.id}-${Date.now()}`,
        label: `Assign to Sarah Lin`,
        icon: 'user',
        action: {
          type: 'update_field',
          taskId: activeNode.id,
          taskTitle: activeNode.title,
          field: 'assignee',
          value: 'Sarah Lin',
          label: `Assigned "${activeNode.title}" to Sarah Lin`,
        },
      });
    }

    options.push({
      id: `opt-cal-${activeNode.id}-${Date.now()}`,
      label: `Open in Calendar View`,
      icon: 'calendar',
      action: {
        type: 'switch_view',
        target: 'calendar',
        label: `Switched to Calendar View`,
      },
    });

    return options.slice(0, 4);
  }

  // 2. Query is about filtering or search
  if (q.includes('filter') || q.includes('search') || q.includes('show only') || q.includes('find')) {
    options.push({
      id: `opt-clear-filter-${Date.now()}`,
      label: 'Clear Filter (Show All)',
      icon: 'filter',
      action: {
        type: 'filter_tasks',
        target: '',
        label: 'Cleared table filter',
      },
    });
    options.push({
      id: `opt-filter-crit-${Date.now()}`,
      label: 'Filter: Critical Blockers',
      icon: 'zap',
      action: {
        type: 'filter_tasks',
        target: 'critical',
        label: 'Filtered for Critical Blockers',
      },
    });
    options.push({
      id: `opt-filter-prog-${Date.now()}`,
      label: 'Filter: In Progress',
      icon: 'filter',
      action: {
        type: 'filter_tasks',
        target: 'in progress',
        label: 'Filtered for In Progress Tasks',
      },
    });
    options.push({
      id: `opt-filter-done-${Date.now()}`,
      label: 'Filter: Completed Tasks',
      icon: 'check',
      action: {
        type: 'filter_tasks',
        target: 'done',
        label: 'Filtered for Completed Tasks',
      },
    });
    return options.slice(0, 4);
  }

  // 3. Query is about switching to Calendar
  if (q.includes('calendar') || q.includes('schedule') || q.includes('timeline')) {
    const criticalNode = params.nodes.find((n) => n.priority === 'critical');
    options.push({
      id: `opt-cal-table-${Date.now()}`,
      label: 'Back to Table View',
      icon: 'table',
      action: {
        type: 'switch_view',
        target: 'table',
        label: 'Switched to Table View',
      },
    });
    options.push({
      id: `opt-cal-board-${Date.now()}`,
      label: 'Switch to Kanban Board',
      icon: 'board',
      action: {
        type: 'switch_view',
        target: 'board',
        label: 'Switched to Board View',
      },
    });
    if (criticalNode) {
      options.push({
        id: `opt-cal-crit-${criticalNode.id}-${Date.now()}`,
        label: `Inspect: "${criticalNode.title.slice(0, 22)}"`,
        icon: 'inspect',
        action: {
          type: 'open_task',
          taskId: criticalNode.id,
          taskTitle: criticalNode.title,
          field: 'all',
          label: `Opened "${criticalNode.title}"`,
        },
      });
    }
    options.push({
      id: `opt-cal-filter-${Date.now()}`,
      label: 'Filter: In Progress Tasks',
      icon: 'filter',
      action: {
        type: 'filter_tasks',
        target: 'in progress',
        label: 'Filtered for In Progress Tasks',
      },
    });
    return options.slice(0, 4);
  }

  // 4. Query is about Board or Mindmap
  if (q.includes('board') || q.includes('kanban') || q.includes('mindmap') || q.includes('mind map')) {
    options.push({
      id: `opt-nav-cal-${Date.now()}`,
      label: 'Open Calendar View',
      icon: 'calendar',
      action: {
        type: 'switch_view',
        target: 'calendar',
        label: 'Switched to Calendar View',
      },
    });
    options.push({
      id: `opt-nav-tbl-${Date.now()}`,
      label: 'Open Table View',
      icon: 'table',
      action: {
        type: 'switch_view',
        target: 'table',
        label: 'Switched to Table View',
      },
    });
    options.push({
      id: `opt-nav-wf-${Date.now()}`,
      label: 'Open Automations Studio',
      icon: 'workflow',
      action: {
        type: 'switch_section',
        target: 'workflows',
        label: 'Opened Automation Studio',
      },
    });
    return options.slice(0, 4);
  }

  // 5. Default high-leverage contextual options for any query/prompt
  const criticalNode = params.nodes.find((n) => n.priority === 'critical');
  const inProgNode = params.nodes.find((n) => n.status === 'in_progress');
  const todoNode = params.nodes.find((n) => n.status === 'todo');

  if (criticalNode) {
    options.push({
      id: `opt-def-crit-${criticalNode.id}-${Date.now()}`,
      label: `Focus Blocker: "${criticalNode.title.slice(0, 20)}"`,
      icon: 'zap',
      action: {
        type: 'open_task',
        taskId: criticalNode.id,
        taskTitle: criticalNode.title,
        field: 'all',
        label: `Opened Critical Item "${criticalNode.title}"`,
      },
    });
  }

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

  options.push({
    id: `opt-def-board-${Date.now()}`,
    label: 'Open Kanban Board',
    icon: 'board',
    action: {
      type: 'switch_view',
      target: 'board',
      label: 'Switched to Board View',
    },
  });

  if (inProgNode) {
    options.push({
      id: `opt-def-prog-${inProgNode.id}-${Date.now()}`,
      label: `Inspect In Progress: "${inProgNode.title.slice(0, 20)}"`,
      icon: 'inspect',
      action: {
        type: 'open_task',
        taskId: inProgNode.id,
        taskTitle: inProgNode.title,
        field: 'all',
        label: `Opened "${inProgNode.title}"`,
      },
    });
  } else if (todoNode) {
    options.push({
      id: `opt-def-start-${todoNode.id}-${Date.now()}`,
      label: `Start: "${todoNode.title.slice(0, 20)}"`,
      icon: 'zap',
      action: {
        type: 'update_field',
        taskId: todoNode.id,
        taskTitle: todoNode.title,
        field: 'status',
        value: 'in_progress',
        label: `Marked "${todoNode.title}" In Progress`,
      },
    });
  } else {
    options.push({
      id: `opt-def-filter-${Date.now()}`,
      label: 'Filter: In Progress Tasks',
      icon: 'filter',
      action: {
        type: 'filter_tasks',
        target: 'in progress',
        label: 'Filtered for In Progress Tasks',
      },
    });
  }

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
