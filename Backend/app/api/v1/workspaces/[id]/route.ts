import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { FullWorkspaceBundle, NodeItem, WorkspaceProject, Agent, Workflow } from '@/lib/types/workspace';

// Rich fallback workspace bundle for instant demo / starter templates
function getStarterBundle(id: string): FullWorkspaceBundle {
  const isCrm = id.includes('crm') || id.includes('sales');
  const wsName = isCrm ? 'Sales CRM & Deals Pipeline' : 'Sprint Tracker & Code Engine';

  const projectId = 'proj-1';
  const nodes: NodeItem[] = isCrm
    ? [
        {
          id: 'node-1',
          project_id: projectId,
          parent_id: null,
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
          project_id: projectId,
          parent_id: null,
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
          project_id: projectId,
          parent_id: null,
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
          project_id: projectId,
          parent_id: null,
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
          project_id: projectId,
          parent_id: 'node-1',
          title: 'Send Revised MSA to Acme Legal',
          content: 'Include updated compliance clause 4.2.',
          status: 'in_progress',
          priority: 'high',
          order_index: 4,
          assignee: 'Sarah Lin',
          tags: ['Legal'],
          due_date: new Date(Date.now() + 86400000 * 2).toISOString(),
        },
      ]
    : [
        {
          id: 'node-eng-1',
          project_id: projectId,
          parent_id: null,
          title: 'Refactor Authentication Middleware to Edge',
          content: 'Reduce cold-start latency from 450ms to 80ms on JWT validation.',
          status: 'in_progress',
          priority: 'critical',
          order_index: 0,
          assignee: 'Dev Lead',
          tags: ['Edge', 'Performance'],
        },
        {
          id: 'node-eng-2',
          project_id: projectId,
          parent_id: null,
          title: 'Add React Flow Mind Map View Canvas',
          content: 'Hierarchical node graphing for visual doc tree.',
          status: 'review',
          priority: 'high',
          order_index: 1,
          assignee: 'Frontend Engineer',
          tags: ['UI/UX', 'Canvas'],
        },
      ];

  const agents: Agent[] = [
    {
      id: 'agent-1',
      workspace_id: id,
      name: isCrm ? 'Deal Concierge' : 'DevOps Sentinel',
      persona: isCrm ? 'Expert Sales Analyst & Lead Closer' : 'Autonomous SRE & Code Reviewer',
      system_prompt: 'Analyze workspace records, prioritize urgent blockers, and assist the user.',
      model_tier: 'STANDARD',
      tools_assigned: ['database_query', 'task_creation', 'email_drafting'],
      avatar: 'sparkles',
    },
    {
      id: 'agent-2',
      workspace_id: id,
      name: 'Reasoning Planner',
      persona: 'Multi-step strategist',
      system_prompt: 'Deconstruct high-level business goals into granular sub-tasks and automations.',
      model_tier: 'REASONING',
      tools_assigned: ['database_query', 'web_search'],
      avatar: 'brain',
    },
  ];

  const workflows: Workflow[] = [
    {
      id: 'wf-1',
      workspace_id: id,
      name: isCrm ? 'High-Priority Deal Follow-up' : 'CI Failure Triage',
      description: 'Auto-detect overdue critical items and dispatch AI brief.',
      trigger_type: 'item_change',
      nodes: [
        { id: '1', type: 'trigger', label: 'Item Marked Critical', position: { x: 50, y: 100 } },
        { id: '2', type: 'action', label: 'AI Summarize Context', position: { x: 300, y: 100 } },
        { id: '3', type: 'action', label: 'Notify Lead via Webhook', position: { x: 550, y: 100 } },
      ],
      edges: [
        { id: 'e1-2', source: '1', target: '2' },
        { id: 'e2-3', source: '2', target: '3' },
      ],
      is_active: true,
    },
  ];

  return {
    workspace: {
      id,
      name: wsName,
      slug: isCrm ? 'sales-crm' : 'sprint-tracker',
      description: isCrm ? 'Pipeline management and automated AI lead follow-ups.' : 'Sprints and PR triage.',
      icon: isCrm ? 'briefcase' : 'terminal',
    },
    projects: [
      {
        id: projectId,
        workspace_id: id,
        name: isCrm ? 'Active Opportunities' : 'Sprint Backlog',
        default_view: 'board',
        nodes,
      },
    ],
    agents,
    workflows,
  };
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ error: 'Workspace ID required' }, { status: 400 });
    }

    let ws: Record<string, unknown> | null = null;
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (uuidPattern.test(id)) {
      const { data, error } = await supabase
        .from('workspaces')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error) {
        console.error('[API/V1/WORKSPACES] Failed to load workspace by id:', error);
        return NextResponse.json({ error: 'Could not load workspace from the database' }, { status: 500 });
      }
      ws = data;
    }

    if (!ws) {
      const { data, error } = await supabase
        .from('workspaces')
        .select('*')
        .eq('slug', id)
        .maybeSingle();
      if (error && error.code !== '42703') {
        console.error('[API/V1/WORKSPACES] Failed to load workspace by slug:', error);
        return NextResponse.json({ error: 'Could not load workspace from the database' }, { status: 500 });
      }
      ws = data;
    }

    if (!ws) {
      return NextResponse.json({ error: 'Workspace was not found' }, { status: 404 });
    }

    // Fetch projects
    const { data: projects, error: projectsError } = await supabase
      .from('workspace_projects')
      .select('*')
      .eq('workspace_id', ws.id);
    if (projectsError) {
      console.error('[API/V1/WORKSPACES] Failed to load projects:', projectsError);
      return NextResponse.json({ error: 'Could not load workspace projects from the database' }, { status: 500 });
    }

    const projectIds = (projects || []).map((p) => p.id);

    // Fetch nodes
    let nodes: NodeItem[] = [];
    if (projectIds.length > 0) {
      const { data: nodeData, error: nodesError } = await supabase
        .from('node_items')
        .select('*')
        .in('project_id', projectIds)
        .order('order_index', { ascending: true });
      if (nodesError) {
        console.error('[API/V1/WORKSPACES] Failed to load project items:', nodesError);
        return NextResponse.json({ error: 'Could not load project items from the database' }, { status: 500 });
      }
      nodes = nodeData || [];
    }

    // Fetch agents & workflows
    const [
      { data: agents, error: agentsError },
      { data: workflows, error: workflowsError },
    ] = await Promise.all([
      supabase.from('agents').select('*').eq('workspace_id', ws.id),
      supabase.from('workflows').select('*').eq('workspace_id', ws.id),
    ]);
    if (agentsError || workflowsError) {
      console.error('[API/V1/WORKSPACES] Failed to load workspace agents or workflows:', {
        agentsError,
        workflowsError,
      });
      return NextResponse.json({ error: 'Could not load workspace agents and workflows from the database' }, { status: 500 });
    }

    const hydratedProjects = (projects || []).map((p) => ({
      ...p,
      nodes: nodes.filter((n) => n.project_id === p.id),
    }));

    const bundle: FullWorkspaceBundle = {
      workspace: ws,
      projects: hydratedProjects,
      agents: agents || [],
      workflows: workflows || [],
    };

    return NextResponse.json({ data: bundle, isFallback: false });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}
