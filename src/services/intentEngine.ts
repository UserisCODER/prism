import { IntentParseResult, LayoutPlan, PanelPlan } from '../types';

/**
 * Intelligent Intent Parser Simulator
 * Evaluates free text or voice inputs and parses goal, entities, domain, and confidence.
 */
export function parseIntentInput(rawInput: string): IntentParseResult {
  const normalized = rawInput.toLowerCase().trim();

  // Ambiguity check: if intent is too brief or ambiguous (e.g., "meeting prep" without specifying client)
  if (normalized === 'meeting' || normalized === 'prepare meeting' || normalized === 'check clients') {
    return {
      id: `intent-${Date.now()}`,
      rawText: rawInput,
      goal: 'Prepare client meeting',
      domain: 'sales',
      entities: [{ type: 'status', value: 'Ambiguous Client' }],
      urgency: 'medium',
      confidence: 0.65, // < 0.85 triggers clarifying question!
      missing_info: ['client_name'],
      clarifying_question: 'Which client meeting would you like to prepare for?',
      clarifying_options: [
        'Meridian Labs / Acme Enterprise',
        'Vertex Systems',
        'Northwind Analytics'
      ],
      timestamp: new Date().toLocaleTimeString(),
    };
  }

  // Scenario A: Client Meeting Prep
  if (normalized.includes('meeting') || normalized.includes('acme') || normalized.includes('meridian') || normalized.includes('prepare')) {
    return {
      id: `intent-${Date.now()}`,
      rawText: rawInput,
      goal: "Prepare tomorrow's client meeting with Meridian Labs",
      domain: 'sales',
      entities: [
        { type: 'client', value: 'Meridian Labs / Acme' },
        { type: 'date', value: 'Tomorrow 11:30 AM' },
        { type: 'status', value: '92% Confidence' }
      ],
      urgency: 'high',
      deadline: 'Tomorrow 11:30 AM',
      confidence: 0.95,
      missing_info: [],
      timestamp: new Date().toLocaleTimeString(),
    };
  }

  // Scenario B: Usage Drop Investigation
  if (normalized.includes('usage') || normalized.includes('drop') || normalized.includes('smb') || normalized.includes('investigate') || normalized.includes('anomaly')) {
    return {
      id: `intent-${Date.now()}`,
      rawText: rawInput,
      goal: 'Investigate -34% usage drop across SMB segment',
      domain: 'growth',
      entities: [
        { type: 'segment', value: 'SMB Cluster' },
        { type: 'metric', value: '-34% Active Users' },
        { type: 'status', value: '96% Confidence' }
      ],
      urgency: 'critical',
      deadline: 'Immediate Action Needed',
      confidence: 0.96,
      missing_info: [],
      timestamp: new Date().toLocaleTimeString(),
    };
  }

  // Scenario C: Overdue Project Work
  if (normalized.includes('overdue') || normalized.includes('project') || normalized.includes('milestones') || normalized.includes('review') || normalized.includes('blockers')) {
    return {
      id: `intent-${Date.now()}`,
      rawText: rawInput,
      goal: 'Review 5 overdue project tasks & critical blockers',
      domain: 'delivery',
      entities: [
        { type: 'project', value: 'Project Meridian & Apex' },
        { type: 'status', value: '3 Overdue / 2 Blocked' },
        { type: 'status', value: '94% Confidence' }
      ],
      urgency: 'critical',
      deadline: 'Q3 Milestone Risk',
      confidence: 0.94,
      missing_info: [],
      timestamp: new Date().toLocaleTimeString(),
    };
  }

  // Pivot intent: Mid-task refocus
  if (normalized.includes('churn') || normalized.includes('pivot') || normalized.includes('risk of churn')) {
    return {
      id: `intent-${Date.now()}`,
      rawText: rawInput,
      goal: 'Pivot focus to high churn-risk client Meridian Labs',
      domain: 'sales',
      entities: [
        { type: 'client', value: 'Meridian Labs' },
        { type: 'status', value: 'Churn Risk 88%' },
        { type: 'status', value: 'Mid-task Pivot' }
      ],
      urgency: 'critical',
      confidence: 0.98,
      missing_info: [],
      timestamp: new Date().toLocaleTimeString(),
    };
  }

  // Default Generic Dashboard fallback
  return {
    id: `intent-${Date.now()}`,
    rawText: rawInput,
    goal: 'Overview of enterprise workspace telemetry & active pipelines',
    domain: 'general',
    entities: [
      { type: 'status', value: 'Generic Dashboard' },
      { type: 'status', value: 'Autonomous Orchestration' }
    ],
    urgency: 'medium',
    confidence: 0.90,
    missing_info: [],
    timestamp: new Date().toLocaleTimeString(),
  };
}

/**
 * Layout Planner Engine
 * Orchestrates panels into 12-col grid zones, respecting pinned panels and generating explainability metadata.
 */
export function buildLayoutPlan(intent: IntentParseResult, existingPlan?: LayoutPlan): LayoutPlan {
  const pinnedSet = new Set(existingPlan?.pinnedIds || []);

  let hero: PanelPlan | undefined;
  let primary: PanelPlan[] = [];
  let secondary: PanelPlan[] = [];
  let rail: PanelPlan[] = [];
  let scenarioName = 'Executive Review Mode';
  let summaryReason = '';

  if (intent.goal.includes("client meeting")) {
    scenarioName = 'Meeting Prep & Client Context Mode';
    summaryReason = 'Synthesized from Salesforce CRM client tier records and Datadog telemetry spikes. Correlated with calendar invite: "Meridian Labs Quarterly Architecture Review" at 11:30 AM today.';
    
    hero = {
      instanceId: 'p-client-hero',
      component_id: 'client_overview',
      zone: 'hero',
      colSpan: 8,
      reason: 'Surfaced as Hero because meeting is scheduled today at 11:30 AM and token throughput increased +34%.',
      priority: 98,
      params: { clientId: 'c-acme' },
      isPinned: pinnedSet.has('p-client-hero'),
    };

    primary = [
      {
        instanceId: 'p-kpi',
        component_id: 'kpi_row',
        zone: 'primary',
        colSpan: 8,
        reason: 'Displays active ARR ($1.42M) and pending signoffs relevant to contract renegotiation.',
        priority: 90,
        params: {},
        isPinned: pinnedSet.has('p-kpi'),
      },
      {
        instanceId: 'p-telemetry',
        component_id: 'trend_chart',
        zone: 'primary',
        colSpan: 8,
        reason: 'Surfaced to evidence peak 4.8k ops/sec on Friday during batch processing.',
        priority: 85,
        params: {},
        isPinned: pinnedSet.has('p-telemetry'),
      },
    ];

    secondary = [
      {
        instanceId: 'p-comms',
        component_id: 'recent_communications',
        zone: 'secondary',
        colSpan: 6,
        reason: 'Surfaced Sarah Jenkins email regarding 504 gateway timeouts on batch run #491.',
        priority: 82,
        params: {},
        isPinned: pinnedSet.has('p-comms'),
      },
      {
        instanceId: 'p-talking-points',
        component_id: 'talking_points',
        zone: 'secondary',
        colSpan: 6,
        reason: 'Generated custom talking points addressing support SLA and tier-4 pricing options.',
        priority: 80,
        params: {},
        isPinned: pinnedSet.has('p-talking-points'),
      },
    ];

  } else if (intent.goal.includes("usage drop")) {
    scenarioName = 'Usage Anomaly & Churn Audit Mode';
    summaryReason = 'Triggered by automatic anomaly detection daemon scanning daily SMB active users. Detected 34% drop between Thursday and Saturday.';
    
    hero = {
      instanceId: 'p-anomaly-hero',
      component_id: 'anomaly_callout',
      zone: 'hero',
      colSpan: 8,
      reason: 'Surfaced as Hero due to statistically significant -34% active user drop in SMB cluster.',
      priority: 99,
      params: {},
      isPinned: pinnedSet.has('p-anomaly-hero'),
    };

    primary = [
      {
        instanceId: 'p-segment-table',
        component_id: 'segment_usage_table',
        zone: 'primary',
        colSpan: 8,
        reason: 'Breaks down active users across Enterprise vs SMB sub-accounts.',
        priority: 88,
        params: {},
        isPinned: pinnedSet.has('p-segment-table'),
      },
      {
        instanceId: 'p-telemetry-drop',
        component_id: 'trend_chart',
        zone: 'primary',
        colSpan: 8,
        reason: 'Visualizes daily event drop off from Mon to Sun.',
        priority: 85,
        params: {},
        isPinned: pinnedSet.has('p-telemetry-drop'),
      },
    ];

    secondary = [
      {
        instanceId: 'p-insight-churn',
        component_id: 'insight_card',
        zone: 'secondary',
        colSpan: 6,
        reason: 'AI root cause analysis identifying missing webhook retry logic in SMB sub-accounts.',
        priority: 86,
        params: {},
        isPinned: pinnedSet.has('p-insight-churn'),
      },
      {
        instanceId: 'p-contacts-risk',
        component_id: 'contact_card',
        zone: 'secondary',
        colSpan: 6,
        reason: 'Ranks Marcus Vance and Sarah Jenkins as primary contacts to engage.',
        priority: 75,
        params: {},
        isPinned: pinnedSet.has('p-contacts-risk'),
      },
    ];

  } else if (intent.goal.includes("overdue")) {
    scenarioName = 'Project Delivery & Risk Remediation Mode';
    summaryReason = 'Compiled from Jira/Postgres tasks database. 3 tasks crossed critical SLA due dates and 2 tasks are currently marked as blocked.';
    
    hero = {
      instanceId: 'p-deadline-hero',
      component_id: 'deadline_banner',
      zone: 'hero',
      colSpan: 8,
      reason: 'Surfaced as Hero to highlight 5 overdue and blocked tasks impacting Q3 milestones.',
      priority: 99,
      params: {},
      isPinned: pinnedSet.has('p-deadline-hero'),
    };

    primary = [
      {
        instanceId: 'p-overdue-tasks',
        component_id: 'task_list',
        zone: 'primary',
        colSpan: 8,
        reason: 'Lists actionable overdue items ranked by assignee and urgency.',
        priority: 92,
        params: {},
        isPinned: pinnedSet.has('p-overdue-tasks'),
      },
      {
        instanceId: 'p-risk-matrix',
        component_id: 'risk_matrix',
        zone: 'primary',
        colSpan: 8,
        reason: 'Plots high impact vs high likelihood delivery bottlenecks.',
        priority: 86,
        params: {},
        isPinned: pinnedSet.has('p-risk-matrix'),
      },
    ];

    secondary = [
      {
        instanceId: 'p-project-cards',
        component_id: 'project_health_card',
        zone: 'secondary',
        colSpan: 12,
        reason: 'Summarizes Project Meridian (at risk) and Project Apex (critical).',
        priority: 82,
        params: {},
        isPinned: pinnedSet.has('p-project-cards'),
      },
    ];

  } else {
    // Default Generic Dashboard matching the visual reference image
    scenarioName = 'Executive Review Mode';
    summaryReason = 'Default workspace showing active synthesized agenda, ARR revenue telemetry, operations pulse, and autonomous logs.';
    
    hero = {
      instanceId: 'p-client-hero',
      component_id: 'client_overview',
      zone: 'hero',
      colSpan: 8,
      reason: 'Surfaced as central context dispatch based on priority agenda sync.',
      priority: 95,
      params: { clientId: 'c-acme' },
      isPinned: pinnedSet.has('p-client-hero'),
    };

    primary = [
      {
        instanceId: 'p-kpi',
        component_id: 'kpi_row',
        zone: 'primary',
        colSpan: 8,
        reason: 'Core metric row tracking ARR Revenue, Active Accounts, and Tasks.',
        priority: 90,
        params: {},
        isPinned: pinnedSet.has('p-kpi'),
      },
      {
        instanceId: 'p-telemetry',
        component_id: 'trend_chart',
        zone: 'primary',
        colSpan: 8,
        reason: 'Live telemetry stream showing peak ops/sec.',
        priority: 85,
        params: {},
        isPinned: pinnedSet.has('p-telemetry'),
      },
    ];

    secondary = [];
  }

  // Carry over any pinned panel from previous layout that wasn't already included!
  if (existingPlan) {
    const currentInstanceIds = new Set([
      hero?.instanceId,
      ...primary.map(p => p.instanceId),
      ...secondary.map(p => p.instanceId),
    ].filter(Boolean));

    const allOldPanels = [
      existingPlan.hero,
      ...existingPlan.primary,
      ...existingPlan.secondary,
      ...existingPlan.rail
    ].filter(Boolean) as PanelPlan[];

    for (const oldPanel of allOldPanels) {
      if (oldPanel.isPinned && !currentInstanceIds.has(oldPanel.instanceId)) {
        secondary.push({
          ...oldPanel,
          reason: `Kept in workspace because user pinned this panel.`,
        });
      }
    }
  }

  return {
    layout_id: `layout-${Date.now()}`,
    intent_id: intent.id,
    scenarioName,
    hero,
    primary,
    secondary,
    rail: [], // Handled by standard right rail (Explainability + Active Agents)
    summaryReason,
    alignmentScore: 95.2,
    freshnessScore: 99.0,
    hallucinationRisk: 0.02,
    pinnedIds: Array.from(pinnedSet),
  };
}
