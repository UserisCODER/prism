import { ComponentMetadata, IntentParseResult, LayoutPlan, WorkspaceDefinition } from '../types';
import { COMPONENT_REGISTRY } from '../data/componentCatalog';
import { parseIntentInput, buildLayoutPlan } from './intentEngine';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/+$/, '');

interface BackendIntent {
  goal: string;
  domain: string;
  entities: string[];
  urgency: IntentParseResult['urgency'];
  deadline?: string;
  confidence: number;
}

interface BackendPanel {
  component_id: string;
  reason: string;
  priority: number;
  zone: 'hero' | 'primary' | 'secondary' | 'rail';
}

export type IntentProcessResult =
  | { clarification: { question: string; options: string[] } }
  | { intent: IntentParseResult; layout: LayoutPlan; backendData: Record<string, any> };

async function requestApi(path: string, init?: RequestInit): Promise<unknown> {
  const response = await fetch(`${API_BASE_URL}/api${path}`, init);
  const text = await response.text();
  let payload: unknown;

  try {
    payload = JSON.parse(text);
  } catch {
    if (!response.ok) {
      throw new Error(`PRISM API returned ${response.status}: ${text || response.statusText}`);
    }
    throw new Error(`PRISM API returned invalid JSON for ${path}`);
  }

  if (!response.ok) {
    const message =
      typeof payload === 'object' && payload !== null && 'error' in payload &&
      typeof payload.error === 'string'
        ? payload.error
        : response.statusText;
    throw new Error(`PRISM API returned ${response.status}: ${message}`);
  }

  return payload;
}

function postJson(body: unknown): RequestInit {
  return {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}

function isBackendPanel(value: unknown): value is BackendPanel {
  if (typeof value !== 'object' || value === null) return false;
  const panel = value as Record<string, unknown>;
  return (
    typeof panel.component_id === 'string' &&
    typeof panel.reason === 'string' &&
    typeof panel.priority === 'number' &&
    ['hero', 'primary', 'secondary', 'rail'].includes(String(panel.zone))
  );
}

function parseBackendIntent(value: unknown): BackendIntent {
  if (typeof value !== 'object' || value === null) {
    throw new Error('Intent API returned an invalid intent');
  }
  const intent = value as Record<string, unknown>;
  const urgency = intent.urgency;
  if (
    typeof intent.goal !== 'string' ||
    typeof intent.domain !== 'string' ||
    !Array.isArray(intent.entities) ||
    !intent.entities.every((entity) => typeof entity === 'string') ||
    !['low', 'medium', 'high', 'critical'].includes(String(urgency)) ||
    typeof intent.confidence !== 'number' ||
    !Number.isFinite(intent.confidence)
  ) {
    throw new Error('Intent API returned an invalid intent shape');
  }

  return {
    goal: intent.goal,
    domain: intent.domain,
    entities: intent.entities,
    urgency: urgency as BackendIntent['urgency'],
    deadline: typeof intent.deadline === 'string' ? intent.deadline : undefined,
    confidence: intent.confidence,
  };
}

function normalizeIntent(rawText: string, intent: BackendIntent): IntentParseResult {
  return {
    id: `intent-${Date.now()}`,
    rawText,
    goal: intent.goal,
    domain: intent.domain,
    entities: intent.entities.map((value) => ({ type: getEntityType(value), value })),
    urgency: intent.urgency,
    deadline: intent.deadline,
    confidence: intent.confidence,
    missing_info: [],
    timestamp: new Date().toISOString(),
  };
}

function getEntityType(value: string): IntentParseResult['entities'][number]['type'] {
  const normalized = value.toLowerCase();
  if (/\b(today|tomorrow|yesterday|q[1-4]|20\d{2})\b/.test(normalized)) return 'date';
  if (/\b(acme|corp|client|customer|company|labs|inc)\b/.test(normalized)) return 'client';
  if (/\b(usage|revenue|arr|metric|drop|growth|rate|percentage)\b/.test(normalized)) return 'metric';
  if (/\b(project|task|milestone|delivery)\b/.test(normalized)) return 'project';
  if (/\b(smb|enterprise|segment)\b/.test(normalized)) return 'segment';
  return 'status';
}

function createLayoutPlan(
  panels: BackendPanel[],
  intent: IntentParseResult,
  pinnedIds: string[] = []
): LayoutPlan {
  if (panels.length === 0 || panels.filter((panel) => panel.zone === 'hero').length !== 1) {
    throw new Error('Layout API must return panels with exactly one hero zone');
  }

  const toPanel = (panel: BackendPanel) => ({
    instanceId: panel.component_id,
    component_id: panel.component_id,
    zone: panel.zone,
    colSpan:
      panel.zone === 'hero'
        ? 12
        : panel.zone === 'primary'
          ? 8
          : panel.zone === 'secondary'
            ? 6
            : 4,
    reason: panel.reason,
    priority: panel.priority,
    params: {},
    isPinned: pinnedIds.includes(panel.component_id),
  });
  const mapped = panels.map(toPanel);
  const hero = mapped.find((panel) => panel.zone === 'hero');

  return {
    layout_id: `layout-${Date.now()}`,
    intent_id: intent.id,
    scenarioName: intent.goal,
    hero,
    primary: mapped.filter((panel) => panel.zone === 'primary'),
    secondary: mapped.filter((panel) => panel.zone === 'secondary'),
    rail: mapped.filter((panel) => panel.zone === 'rail'),
    summaryReason: hero?.reason ?? intent.goal,
    alignmentScore: Math.round(intent.confidence * 100),
    freshnessScore: 98,
    hallucinationRisk: Math.max(1, 100 - Math.round(intent.confidence * 100)),
    pinnedIds: mapped.filter((panel) => panel.isPinned).map((panel) => panel.instanceId),
  };
}

function flattenLayout(plan: LayoutPlan): BackendPanel[] {
  return [plan.hero, ...plan.primary, ...plan.secondary, ...plan.rail]
    .filter((panel): panel is NonNullable<typeof panel> => panel !== undefined)
    .map((panel) => ({
      component_id: panel.component_id,
      reason: panel.reason,
      priority: panel.priority,
      zone: panel.zone,
    }));
}

export async function fetchWorkspaceComponents(
  domain: string
): Promise<Record<string, ComponentMetadata>> {
  try {
    const data = await requestApi(`/workspace?domain=${encodeURIComponent(domain)}`);
    if (isWorkspaceResponse(data)) {
      return data.components;
    }
  } catch (err) {
    console.warn('[apiClient] Remote workspace catalog unavailable, using local registry:', err);
  }

  return COMPONENT_REGISTRY;
}

function isWorkspaceResponse(
  value: unknown
): value is { components: Record<string, ComponentMetadata> } {
  if (typeof value !== 'object' || value === null || !('components' in value)) return false;
  const components = value.components;
  if (typeof components !== 'object' || components === null || Array.isArray(components)) return false;

  return Object.values(components).every((component) =>
    typeof component === 'object' &&
    component !== null &&
    'id' in component &&
    typeof component.id === 'string' &&
    'name' in component &&
    typeof component.name === 'string' &&
    'description' in component &&
    typeof component.description === 'string' &&
    'category' in component &&
    typeof component.category === 'string' &&
    'defaultColSpan' in component &&
    typeof component.defaultColSpan === 'number' &&
    'defaultZone' in component &&
    typeof component.defaultZone === 'string' &&
    'priorityWeight' in component &&
    typeof component.priorityWeight === 'number' &&
    'dataSources' in component &&
    Array.isArray(component.dataSources) &&
    component.dataSources.every((source) => typeof source === 'string')
  );
}

function fallbackToLocalIntent(
  rawInput: string,
  currentPlan?: LayoutPlan
): IntentProcessResult {
  const localIntent = parseIntentInput(rawInput);
  if (localIntent.clarifying_question && localIntent.clarifying_options && localIntent.clarifying_options.length > 0) {
    return {
      clarification: {
        question: localIntent.clarifying_question,
        options: localIntent.clarifying_options,
      },
    };
  }

  const localLayout = buildLayoutPlan(localIntent, currentPlan);
  return {
    intent: localIntent,
    layout: localLayout,
    backendData: {},
  };
}

export async function processUserIntent(
  rawInput: string,
  currentPlan: LayoutPlan | undefined,
  workspace: WorkspaceDefinition
): Promise<IntentProcessResult> {
  try {
    const intentResponse = await requestApi(
      '/intent',
      postJson({
        utterance: rawInput,
        context: {
          domain: workspace.domain,
          suggestedDomain: workspace.domain.includes('github') ? 'github'
            : workspace.domain.includes('notion') ? 'notion'
            : workspace.domain.includes('salesforce') ? 'salesforce'
            : 'general',
          pageType: 'dashboard',
          pageTitle: workspace.name,
          metaDescription: 'PRISM adaptive workspace demo dashboard',
        },
      })
    );
    if (typeof intentResponse !== 'object' || intentResponse === null) {
      return fallbackToLocalIntent(rawInput, currentPlan);
    }

    const intentPayload = intentResponse as Record<string, unknown>;
    if (intentPayload.clarify === true) {
      if (
        typeof intentPayload.question !== 'string' ||
        !Array.isArray(intentPayload.options) ||
        !intentPayload.options.every((option) => typeof option === 'string')
      ) {
        return fallbackToLocalIntent(rawInput, currentPlan);
      }
      return {
        clarification: {
          question: intentPayload.question,
          options: intentPayload.options,
        },
      };
    }

    const intent = parseBackendIntent(intentPayload.intent);
    const normalizedIntent = normalizeIntent(rawInput, intent);
    const layoutResponse = await requestApi('/layout', postJson({ intent }));
    if (
      typeof layoutResponse !== 'object' ||
      layoutResponse === null ||
      !('panels' in layoutResponse) ||
      !Array.isArray(layoutResponse.panels) ||
      !layoutResponse.panels.every(isBackendPanel)
    ) {
      return fallbackToLocalIntent(rawInput, currentPlan);
    }

    // If backend returned generic fallback without real layout inference, use local intelligence
    if (layoutResponse.panels.some((panel) => panel.reason.trim().toLowerCase() === 'ai layout unavailable')) {
      console.info('[apiClient] Remote layout returned fallback placeholder; engaging local adaptive intelligence.');
      return fallbackToLocalIntent(rawInput, currentPlan);
    }

    const backendData: Record<string, any> = 
      (typeof layoutResponse === 'object' && layoutResponse !== null && 'data' in layoutResponse)
        ? (layoutResponse.data as Record<string, any>) ?? {}
        : {};

    let finalPanels = layoutResponse.panels;
    let pinnedComponentIds = currentPlan?.pinnedIds ?? [];
    if (currentPlan) {
      const currentEntries = [currentPlan.hero, ...currentPlan.primary, ...currentPlan.secondary, ...currentPlan.rail]
        .filter((panel): panel is NonNullable<typeof panel> => panel !== undefined);
      const currentPanels = flattenLayout(currentPlan);
      pinnedComponentIds = currentPlan.pinnedIds.map(
        (id) => currentEntries.find((panel) => panel.instanceId === id)?.component_id ?? id
      );
      try {
        const deltaResponse = await requestApi(
          '/delta',
          postJson({
            currentLayout: currentPanels,
            newLayout: layoutResponse.panels,
            pinnedPanelIds: pinnedComponentIds,
          })
        );
        if (
          typeof deltaResponse === 'object' &&
          deltaResponse !== null &&
          'newPlan' in deltaResponse &&
          Array.isArray(deltaResponse.newPlan) &&
          deltaResponse.newPlan.every(isBackendPanel)
        ) {
          finalPanels = deltaResponse.newPlan;
        }
      } catch (deltaErr) {
        console.warn('[apiClient] Delta API call failed, using layout plan directly:', deltaErr);
      }
    }

    return {
      intent: normalizedIntent,
      layout: createLayoutPlan(finalPanels, normalizedIntent, pinnedComponentIds),
      backendData,
    };
  } catch (err) {
    console.warn('[apiClient] Error during remote intent processing, falling back to local intent engine:', err);
    return fallbackToLocalIntent(rawInput, currentPlan);
  }
}

export async function fetchPanelReason(panelId: string): Promise<string> {
  try {
    const response = await requestApi(`/why/${encodeURIComponent(panelId)}`);
    if (
      typeof response === 'object' &&
      response !== null &&
      'reason' in response &&
      typeof response.reason === 'string'
    ) {
      return response.reason;
    }
  } catch (err) {
    console.warn(`[apiClient] Why API unavailable for panel ${panelId}:`, err);
  }

  const meta = COMPONENT_REGISTRY[panelId];
  return meta?.description ?? `This panel was dynamically selected by PRISM to optimize focus and workflow for "${panelId}".`;
}

export async function executePanelAction(
  actionType: string,
  payload: Record<string, any>
): Promise<{ success: boolean; message: string }> {
  await new Promise((res) => setTimeout(res, 150));
  return {
    success: true,
    message: `"${actionType}" was staged as a demo action. This backend does not expose an action endpoint.`,
  };
}
