import { IntentParseResult, LayoutPlan } from '../types';
import { parseIntentInput, buildLayoutPlan } from './intentEngine';

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
  currentPlan?: LayoutPlan
): Promise<{ intent: IntentParseResult; layout: LayoutPlan }> {
  if (USE_REAL_BACKEND) {
    try {
      const res = await fetch('/api/intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ utterance: rawInput, currentLayoutId: currentPlan?.layout_id }),
      });
      if (!res.ok) throw new Error('API server returned error');
      const data = await res.json();
      return { intent: data.intent, layout: data.layout };
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
