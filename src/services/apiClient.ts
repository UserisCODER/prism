import { ComponentMetadata, IntentParseResult, LayoutPlan, WorkspaceDefinition } from '../types';
import { parseIntentInput, buildLayoutPlan } from './intentEngine';

export async function fetchWorkspaceComponents(
  domain: string
): Promise<Record<string, ComponentMetadata>> {
  const res = await fetch(`/api/workspace?domain=${encodeURIComponent(domain)}`);
  if (!res.ok) throw new Error(`Workspace API returned ${res.status}`);

  const data: unknown = await res.json();
  if (!isWorkspaceResponse(data)) {
    throw new Error('Workspace API returned an invalid component registry');
  }

  return data.components;
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

/**
 * PRISM API Integration Service Layer
 * 
 * BACKEND TEAM NOTE:
 * When your team creates real API routes (e.g. Next.js / Supabase / Gemini server endpoints),
 * simply set USE_REAL_BACKEND = true and update the fetch URLs below!
 */
export const USE_REAL_BACKEND = false; // Set to true when backend API is live

export async function processUserIntent(
  rawInput: string,
  currentPlan: LayoutPlan | undefined,
  workspace: WorkspaceDefinition,
  registry: Record<string, ComponentMetadata>
): Promise<{ intent: IntentParseResult; layout: LayoutPlan }> {
  if (USE_REAL_BACKEND) {
    try {
      const intentResponse = await fetch('/api/intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          utterance: rawInput,
          currentLayoutId: currentPlan?.layout_id,
          workspace: workspace.domain,
        }),
      });
      if (!intentResponse.ok) throw new Error('Intent API returned an error');
      const { intent } = await intentResponse.json();

      const layoutResponse = await fetch('/api/layout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intent,
          workspace: workspace.domain,
          registry,
        }),
      });
      if (!layoutResponse.ok) throw new Error('Layout API returned an error');
      const { layout } = await layoutResponse.json();

      return { intent, layout };
    } catch (err) {
      console.warn('Backend unavailable, utilizing client-side fallback engine:', err);
    }
  }

  // Simulate network latency (200ms) matching streaming RSC response timing
  await new Promise((res) => setTimeout(res, 200));

  const intent = parseIntentInput(rawInput);
  const layout = buildLayoutPlan(intent, currentPlan);

  return { intent, layout };
}

export async function executePanelAction(
  actionType: string,
  payload: Record<string, any>
): Promise<{ success: boolean; message: string }> {
  if (USE_REAL_BACKEND) {
    const res = await fetch('/api/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actionType, payload }),
    });
    return res.json();
  }

  await new Promise((res) => setTimeout(res, 150));
  return {
    success: true,
    message: `Action "${actionType}" committed successfully to Postgres mock DB.`,
  };
}
