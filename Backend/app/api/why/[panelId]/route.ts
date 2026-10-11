import { NextRequest, NextResponse } from 'next/server';
import { getLastEntry } from '@/lib/store';

export const PANEL_REASONS: Record<string, string> = {
  client_overview:
    'Displays high-level client background, key account details, and organizational status at a glance.',
  contact_card:
    'Provides quick access to primary stakeholder contact information, roles, and preferred communication channels.',
  recent_communications:
    'Surfaces recent emails, messages, meeting logs, and interactions to ensure continuous conversational context.',
  kpi_row:
    'Highlights critical performance metrics, benchmarks, and high-level health indicators for rapid assessment.',
  trend_chart:
    'Visualizes historical trajectories, metric patterns, and longitudinal changes over time.',
  task_list:
    'Tracks outstanding action items, operational deliverables, assignees, and upcoming deadlines.',
  project_health_card:
    'Monitors overall project health status, milestone pacing, risk indicators, and delivery blockers.',
  meeting_prep_brief:
    'Summarizes strategic objectives, context, and attendee intelligence to prepare for upcoming conversations.',
  talking_points:
    'Outlines recommended discussion topics, negotiation themes, and key alignment items.',
  suggested_actions:
    'Recommends proactive next steps, automated interventions, and prioritized workflows based on recent activities.',
  insight_card:
    'Highlights key analytical findings, emergent patterns, and contextual takeaways from client data.',
  anomaly_callout:
    'Flags critical metric drops, sudden spikes, or unusual deviations requiring immediate investigation.',
};

export async function GET(
  _request: NextRequest | Request,
  { params }: { params: Promise<{ panelId: string }> | { panelId: string } }
) {
  try {
    const resolvedParams = await params;
    const panelId = resolvedParams?.panelId;

    if (!panelId || panelId.trim() === '') {
      return NextResponse.json(
        { error: 'Missing panelId' },
        { status: 400 }
      );
    }

    const entry = getLastEntry();
    if (entry) {
      const panels = Array.isArray(entry.panels)
        ? entry.panels
        : Array.isArray((entry as any).layout)
        ? (entry as any).layout
        : Array.isArray((entry as any).layout?.panels)
        ? (entry as any).layout.panels
        : [];

      const panel = panels.find((p: any) => p && p.component_id === panelId);

      if (panel) {
        const goal =
          entry.intent && typeof entry.intent === 'object' && 'goal' in entry.intent
            ? entry.intent.goal
            : typeof entry.intent === 'string'
            ? entry.intent
            : undefined;

        return NextResponse.json({
          panelId,
          reason: panel.reason,
          intent: goal,
        });
      }
    }

    if (panelId in PANEL_REASONS) {
      return NextResponse.json({
        panelId,
        reason: PANEL_REASONS[panelId],
      });
    }

    return NextResponse.json(
      { error: 'Unknown panel' },
      { status: 404 }
    );
  } catch (err: unknown) {
    console.error('[why]', err);
    return NextResponse.json(
      { panelId: 'unknown', reason: 'Explanation unavailable' },
      { status: 500 }
    );
  }
}

