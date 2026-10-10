import { ClientData, ContactData, TaskData, ProjectData, UsageDataPoint, MeetingData, CommunicationData } from '../types';

export const seededClients: ClientData[] = [
  {
    id: 'c-acme',
    name: 'Meridian Labs / Acme Enterprise',
    industry: 'Financial SaaS',
    healthScore: 68,
    arr: '$1.42M',
    owner: 'Priya Sharma',
    sentiment: 'At Risk - Contract Renegotiation',
    notes: 'Token throughput increased +34% this week. Contract renegotiation threshold triggered. 4 recommended actions pending signoff.',
  },
  {
    id: 'c-vertex',
    name: 'Vertex Systems',
    industry: 'Healthcare Tech',
    healthScore: 92,
    arr: '$890K',
    owner: 'Priya Sharma',
    sentiment: 'Positive',
    notes: 'Expansion opportunity identified for Q4. User adoption up +18%.',
  },
  {
    id: 'c-northwind',
    name: 'Northwind Analytics',
    industry: 'Logistics',
    healthScore: 84,
    arr: '$650K',
    owner: 'Priya Sharma',
    sentiment: 'Neutral',
    notes: 'Standard renewal scheduled in 60 days.',
  }
];

export const seededContacts: ContactData[] = [
  {
    id: 'ct-1',
    name: 'Sarah Jenkins',
    role: 'VP of Engineering',
    email: 's.jenkins@meridianlabs.io',
    lastContact: 'Yesterday at 4:15 PM',
    sentiment: 'at_risk',
  },
  {
    id: 'ct-2',
    name: 'Marcus Vance',
    role: 'Head of Growth',
    email: 'm.vance@meridianlabs.io',
    lastContact: '3 days ago',
    sentiment: 'negative',
  },
  {
    id: 'ct-3',
    name: 'Elena Rostova',
    role: 'Lead System Architect',
    email: 'e.rostova@meridianlabs.io',
    lastContact: 'Today at 10:30 AM',
    sentiment: 'positive',
  },
];

export const seededTasks: TaskData[] = [
  {
    id: 't-101',
    title: 'Finalize Q3 enterprise contract amendment for Acme / Meridian',
    project: 'Project Meridian',
    client: 'Meridian Labs / Acme Enterprise',
    assignee: 'Priya Sharma',
    dueDate: 'Yesterday',
    status: 'overdue',
    priority: 'critical',
  },
  {
    id: 't-102',
    title: 'Audit telemetry throughput latency drop across SMB nodes',
    project: 'Project Apex',
    client: 'Meridian Labs / Acme Enterprise',
    assignee: 'Marcus Vance',
    dueDate: '3 days ago',
    status: 'overdue',
    priority: 'critical',
  },
  {
    id: 't-103',
    title: 'Resolve API rate limit escalation for Meridian batch run #491',
    project: 'Project Apex',
    client: 'Meridian Labs / Acme Enterprise',
    assignee: 'Ana Martinez',
    dueDate: '2 days ago',
    status: 'blocked',
    priority: 'high',
  },
  {
    id: 't-104',
    title: 'Draft executive briefing deck for 11:30 AM sync',
    project: 'Project Meridian',
    client: 'Meridian Labs / Acme Enterprise',
    assignee: 'Priya Sharma',
    dueDate: 'Today 11:00 AM',
    status: 'in_progress',
    priority: 'high',
  },
  {
    id: 't-105',
    title: 'Re-assign stale onboarding tickets for lagging accounts',
    project: 'Project Horizon',
    client: 'Vertex Systems',
    assignee: 'Ana Martinez',
    dueDate: 'Today 5:00 PM',
    status: 'in_progress',
    priority: 'medium',
  },
];

export const seededProjects: ProjectData[] = [
  {
    id: 'p-meridian',
    name: 'Project Meridian (Acme Sync)',
    client: 'Meridian Labs / Acme Enterprise',
    health: 'at_risk',
    overdueCount: 2,
    completionPct: 68,
  },
  {
    id: 'p-apex',
    name: 'Project Apex (Telemetry Infra)',
    client: 'Internal / Multi-tenant',
    health: 'critical',
    overdueCount: 3,
    completionPct: 45,
  },
  {
    id: 'p-horizon',
    name: 'Project Horizon (Growth Onboarding)',
    client: 'Vertex Systems',
    health: 'healthy',
    overdueCount: 0,
    completionPct: 91,
  },
];

export const seededUsageTrend: UsageDataPoint[] = [
  { date: 'Mon', activeUsers: 4800, events: 14200, segment: 'Enterprise' },
  { date: 'Tue', activeUsers: 5100, events: 15800, segment: 'Enterprise' },
  { date: 'Wed', activeUsers: 4950, events: 14900, segment: 'Enterprise' },
  { date: 'Thu', activeUsers: 3200, events: 9400, segment: 'SMB Segment' },
  { date: 'Fri', activeUsers: 2800, events: 7800, segment: 'SMB Segment' },
  { date: 'Sat', activeUsers: 1900, events: 4900, segment: 'SMB Segment' },
  { date: 'Sun', activeUsers: 2100, events: 5300, segment: 'SMB Segment' },
];

export const seededMeetings: MeetingData[] = [
  {
    id: 'm-1',
    client: 'Meridian Labs / Acme Enterprise',
    title: 'Quarterly Architecture & SLA Review',
    heldAt: 'Last Tuesday at 2:00 PM',
    summary: 'Discussed high-volume batch processing (#491). Client highlighted 34% increase in token throughput and requested customized SLA terms.',
    actionItems: [
      'Draft contract update with tier-4 pricing',
      'Benchmark peak ops on Friday (4.8k ops/sec reached)',
      'Prepare talking points on churn risk prevention'
    ]
  }
];

export const seededCommunications: CommunicationData[] = [
  {
    id: 'comm-1',
    sender: 'Sarah Jenkins (VP Ops)',
    channel: 'email',
    timestamp: '2 hours ago',
    snippet: 'We are noticing occasional 504 gateway timeouts on batch run #491. Can we clarify the support SLA before our meeting tomorrow?',
    urgencyTag: 'High Urgency',
  },
  {
    id: 'comm-2',
    sender: 'Elena Rostova (Architect)',
    channel: 'slack',
    timestamp: '4 hours ago',
    snippet: 'Pushed the telemetry audit log to CRM. Waiting for Priya sign-off on 4 auto-queued actions.',
    urgencyTag: 'Action Pending',
  },
  {
    id: 'comm-3',
    sender: 'Marcus Vance (Growth)',
    channel: 'call',
    timestamp: 'Yesterday',
    snippet: 'Confirmed SMB tier drop is isolated to sub-accounts without automated retry webhooks.',
  }
];
