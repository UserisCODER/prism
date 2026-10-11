import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from '@/lib/supabase';
import { setLastEntry } from '@/lib/store';

export interface Intent {
  goal: string;
  domain: string;
  entities: string[];
  urgency: string;
  deadline?: string;
  confidence: number;
}

export interface LayoutRequestBody {
  intent: Intent;
}

export const VALID_PANEL_ZONES = ['hero', 'primary', 'secondary', 'rail'] as const;
export type PanelZone = (typeof VALID_PANEL_ZONES)[number];

export const KNOWN_COMPONENT_IDS = [
  'client_overview',
  'contact_card',
  'recent_communications',
  'kpi_row',
  'trend_chart',
  'task_list',
  'project_health_card',
  'meeting_prep_brief',
  'talking_points',
  'suggested_actions',
  'insight_card',
  'anomaly_callout',
] as const;

export type ComponentId = (typeof KNOWN_COMPONENT_IDS)[number];

export interface Panel {
  component_id: ComponentId;
  reason: string;
  priority: number;
  zone: PanelZone;
}

export interface LayoutResponse {
  panels: Panel[];
  data?: Record<string, any>;
}

export const FALLBACK_LAYOUT: LayoutResponse = {
  panels: [
    {
      component_id: 'kpi_row',
      zone: 'hero',
      priority: 1,
      reason: 'AI layout unavailable',
    },
    {
      component_id: 'task_list',
      zone: 'primary',
      priority: 2,
      reason: 'AI layout unavailable',
    },
    {
      component_id: 'suggested_actions',
      zone: 'secondary',
      priority: 3,
      reason: 'AI layout unavailable',
    },
  ],
};

export function validateLayoutResponse(data: unknown): asserts data is LayoutResponse {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid layout: response must be a JSON object.');
  }

  const { panels } = data as Record<string, unknown>;

  if (!Array.isArray(panels)) {
    throw new Error('Invalid layout: "panels" must be an array.');
  }

  if (panels.length < 1 || panels.length > 7) {
    throw new Error(
      `Invalid layout: "panels" array must contain between 1 and 7 items (received ${panels.length}).`
    );
  }

  let heroCount = 0;

  for (let i = 0; i < panels.length; i++) {
    const panel = panels[i];

    if (!panel || typeof panel !== 'object') {
      throw new Error(`Invalid layout panel at index ${i}: panel must be an object.`);
    }

    const { component_id, zone, priority, reason } = panel as Record<string, unknown>;

    if (
      typeof component_id !== 'string' ||
      !(KNOWN_COMPONENT_IDS as readonly string[]).includes(component_id)
    ) {
      throw new Error(
        `Invalid layout panel at index ${i}: component_id "${component_id}" is not recognized in the component registry.`
      );
    }

    if (
      typeof zone !== 'string' ||
      !(VALID_PANEL_ZONES as readonly string[]).includes(zone)
    ) {
      throw new Error(
        `Invalid layout panel at index ${i}: zone "${zone}" is invalid. Must be one of: hero, primary, secondary, rail.`
      );
    }

    if (zone === 'hero') {
      heroCount++;
    }

    if (typeof priority !== 'number' || !Number.isFinite(priority)) {
      throw new Error(
        `Invalid layout panel at index ${i}: "priority" must be a valid number (received ${typeof priority}).`
      );
    }

    if (typeof reason !== 'string' || reason.trim() === '') {
      throw new Error(
        `Invalid layout panel at index ${i}: "reason" must be a non-empty string.`
      );
    }
  }

  if (heroCount !== 1) {
    throw new Error(
      `Invalid layout: exactly one panel must have zone "hero" (found ${heroCount}).`
    );
  }
}

export const validateLayout = validateLayoutResponse;

export async function POST(req: NextRequest) {
  let intent: Intent | undefined;
  try {
    const body = await req.json();
    intent = ((body || {}) as Partial<LayoutRequestBody>).intent;

    if (!intent || typeof intent !== 'object') {
      return NextResponse.json(
        { error: 'Missing or invalid "intent" in request body' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('[API/LAYOUT] GEMINI_API_KEY environment variable is missing, returning fallback layout');
      return NextResponse.json({ ...FALLBACK_LAYOUT, data: {} });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-3.5-flash-lite',
      generationConfig: {
        temperature: 0.2,
        responseMimeType: 'application/json',
      },
    });

    let contextFacts = '';
    let contextData: Record<string, any> = {};

    try {
      if (intent.domain === 'meetings') {
        const { data: meetings, error: meetingsError } = await supabase
          .from('meetings').select('*').limit(5);
        if (meetingsError) console.error('meetings error:', meetingsError);

        const { data: clients, error: clientsError } = await supabase
          .from('clients').select('*').limit(5);
        if (clientsError) console.error('clients error:', clientsError);

        const { data: contacts, error: contactsError } = await supabase
          .from('contacts').select('*').limit(5);
        if (contactsError) console.error('contacts error:', contactsError);

        contextData = {
          meetings: meetings ?? [],
          clients: clients ?? [],
          contacts: contacts ?? [],
        };

        const parts: string[] = [];
        if (meetings && meetings.length > 0) {
          parts.push('Upcoming meetings from database:\n' + JSON.stringify(meetings, null, 2));
        }
        if (clients && clients.length > 0) {
          parts.push('Clients from database:\n' + JSON.stringify(clients, null, 2));
        }
        if (contacts && contacts.length > 0) {
          parts.push('Contacts from database:\n' + JSON.stringify(contacts, null, 2));
        }
        contextFacts = parts.join('\n\n');
      } else if (intent.domain === 'analytics') {
        const { data } = await supabase
          .from('usage_daily')
          .select('date, metric_name, value, segment')
          .order('date', { ascending: false })
          .limit(10);

        contextData = {
          usage: data ?? [],
        };

        if (data && data.length > 0) {
          contextFacts = 'Recent usage data from database:\n' + JSON.stringify(data, null, 2);
        }
      } else if (intent.domain === 'tasks' || intent.domain === 'projects') {
        const [tasksResult, projectsResult] = await Promise.all([
          supabase
            .from('tasks')
            .select('title, status, due_date, priority, client_id')
            .eq('status', 'overdue')
            .limit(10),
          supabase
            .from('projects')
            .select('name, status, due_date, client_id')
            .eq('status', 'active')
            .limit(5),
        ]);

        contextData = {
          tasks: tasksResult.data ?? [],
          projects: projectsResult.data ?? [],
        };

        const parts: string[] = [];
        if (tasksResult.data && tasksResult.data.length > 0) {
          parts.push('Overdue tasks from database:\n' + JSON.stringify(tasksResult.data, null, 2));
        }
        if (projectsResult.data && projectsResult.data.length > 0) {
          parts.push('Active projects from database:\n' + JSON.stringify(projectsResult.data, null, 2));
        }
        contextFacts = parts.join('\n\n');
      } else if (intent.domain === 'github' || intent.domain === 'code' || intent.domain === 'engineering') {
        const [prsResult, issuesResult, ciResult] = await Promise.all([
          supabase
            .from('github_prs')
            .select('title, author, status, branch, review_count, created_at')
            .order('created_at', { ascending: false })
            .limit(5),
          supabase
            .from('github_issues')
            .select('title, label, assignee, status, priority, created_at')
            .eq('status', 'open')
            .order('created_at', { ascending: false })
            .limit(5),
          supabase
            .from('github_ci_runs')
            .select('branch, status, duration_seconds, triggered_by, ran_at')
            .order('ran_at', { ascending: false })
            .limit(5),
        ]);

        if (prsResult.error) console.error('github_prs error:', prsResult.error);
        if (issuesResult.error) console.error('github_issues error:', issuesResult.error);
        if (ciResult.error) console.error('github_ci_runs error:', ciResult.error);

        contextData = {
          prs: prsResult.data ?? [],
          issues: issuesResult.data ?? [],
          ci_runs: ciResult.data ?? [],
        };

        const parts: string[] = [];
        if (prsResult.data && prsResult.data.length > 0) {
          parts.push('Open pull requests:\n' + JSON.stringify(prsResult.data, null, 2));
        }
        if (issuesResult.data && issuesResult.data.length > 0) {
          parts.push('Open issues:\n' + JSON.stringify(issuesResult.data, null, 2));
        }
        if (ciResult.data && ciResult.data.length > 0) {
          parts.push('Recent CI runs:\n' + JSON.stringify(ciResult.data, null, 2));
        }
        contextFacts = parts.join('\n\n');
      }
    } catch (dbError) {
      console.error('[API/LAYOUT] Supabase pre-query failed (non-fatal):', dbError);
      contextFacts = '';
      contextData = {};
    }

    const prompt = `You are an adaptive workspace layout engine. Given the user's intent, select the most relevant panels to construct an optimal workspace dashboard.

User Intent:
${JSON.stringify(intent, null, 2)}
${contextFacts ? `\nREAL DATA FROM DATABASE (use this to write specific, accurate panel reasons):\n${contextFacts}\n` : ''}
Available component IDs:
- client_overview
- contact_card
- recent_communications
- kpi_row
- trend_chart
- task_list
- project_health_card
- meeting_prep_brief
- talking_points
- suggested_actions
- insight_card
- anomaly_callout

Rules:
1. Return a JSON object with a "panels" array.
2. Each panel in the array must contain:
   - "component_id": one of the available component IDs listed above
   - "reason": one sentence explaining why this component is included
   - "priority": integer ranking (1 is highest priority)
   - "zone": one of "hero", "primary", "secondary", "rail"
3. Maximum 7 panels in total.
4. Exactly one panel must have zone = "hero".
5. Return ONLY valid JSON, with no markdown formatting or extra text.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let rawText = response.text().trim();

    // Strip markdown formatting if present
    if (rawText.startsWith('```json')) {
      rawText = rawText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (rawText.startsWith('```')) {
      rawText = rawText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const parsed = JSON.parse(rawText);
    validateLayoutResponse(parsed);

    if (!parsed.panels || parsed.panels.length === 0) {
      return NextResponse.json({ ...FALLBACK_LAYOUT, data: {} });
    }

    await setLastEntry(intent, parsed.panels, contextData);
    return NextResponse.json({ panels: parsed.panels, data: contextData });
  } catch (error: any) {
    console.error('[API/LAYOUT] Error generating layout, returning fallback:', error);
    await setLastEntry(intent, FALLBACK_LAYOUT.panels, {});
    return NextResponse.json({ ...FALLBACK_LAYOUT, data: {} });
  }
}
