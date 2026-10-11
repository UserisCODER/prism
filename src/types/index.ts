export type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical';

export interface EntityTag {
  type: 'client' | 'date' | 'metric' | 'project' | 'segment' | 'status';
  value: string;
}

export interface IntentParseResult {
  id: string;
  rawText: string;
  goal: string;
  domain: string;
  entities: EntityTag[];
  urgency: UrgencyLevel;
  deadline?: string;
  confidence: number;
  missing_info: string[];
  clarifying_question?: string;
  clarifying_options?: string[];
  timestamp: string;
}

export type ComponentCategory = 'people' | 'business' | 'work' | 'meetings' | 'insight';
export type LayoutZone = 'hero' | 'primary' | 'secondary' | 'rail';

export interface ComponentMetadata {
  id: string;
  name: string;
  description: string;
  category: ComponentCategory;
  defaultColSpan: number; // out of 12 for grid
  defaultZone: LayoutZone;
  priorityWeight: number;
  dataSources: string[];
}

export interface WorkspaceDefinition {
  name: string;
  domain: string;
  icon: string;
}

export interface PanelPlan {
  instanceId: string;
  component_id: string;
  zone: LayoutZone;
  colSpan: number;
  reason: string;
  priority: number;
  params: Record<string, any>;
  isPinned?: boolean;
}

export interface LayoutPlan {
  layout_id: string;
  intent_id: string;
  scenarioName: string;
  hero?: PanelPlan;
  primary: PanelPlan[];
  secondary: PanelPlan[];
  rail: PanelPlan[];
  summaryReason: string;
  alignmentScore: number;
  freshnessScore: number;
  hallucinationRisk: number;
  pinnedIds: string[];
}

export interface ClientData {
  id: string;
  name: string;
  industry: string;
  healthScore: number;
  arr: string;
  owner: string;
  sentiment: string;
  notes: string;
}

export interface ContactData {
  id: string;
  name: string;
  role: string;
  email: string;
  lastContact: string;
  sentiment: 'positive' | 'neutral' | 'negative' | 'at_risk';
}

export interface TaskData {
  id: string;
  title: string;
  project: string;
  client: string;
  assignee: string;
  dueDate: string;
  status: 'overdue' | 'in_progress' | 'blocked' | 'completed';
  priority: 'high' | 'critical' | 'medium';
}

export interface ProjectData {
  id: string;
  name: string;
  client: string;
  health: 'healthy' | 'at_risk' | 'critical';
  overdueCount: number;
  completionPct: number;
}

export interface UsageDataPoint {
  date: string;
  activeUsers: number;
  events: number;
  segment: string;
}

export interface MeetingData {
  id: string;
  client: string;
  title: string;
  heldAt: string;
  summary: string;
  actionItems: string[];
}

export interface CommunicationData {
  id: string;
  sender: string;
  channel: 'email' | 'slack' | 'call';
  timestamp: string;
  snippet: string;
  urgencyTag?: string;
}
