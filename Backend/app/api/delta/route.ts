import { NextRequest, NextResponse } from 'next/server';

export interface Panel {
  component_id: string;
  reason?: string;
  priority?: number;
  zone?: string;
  [key: string]: any;
}

export type LayoutPanel = Panel;

export interface DeltaRequestBody {
  currentLayout: Panel[];
  newLayout: Panel[];
  pinnedPanelIds?: string[];
}

export interface DeltaResponse {
  kept: string[];
  added: string[];
  removed: string[];
  pinned_kept: string[];
  newPlan: Panel[];
}

/**
 * Compares currentLayout and newLayout by component_id, protecting pinned panels.
 */
export function calculateDelta(
  currentLayout: Panel[],
  newLayout: Panel[],
  pinnedPanelIds: string[] = []
): DeltaResponse {
  const currentIds = new Set(currentLayout.map((p) => p.component_id));
  const newIds = new Set(newLayout.map((p) => p.component_id));
  const pinnedSet = new Set(pinnedPanelIds);

  const kept: string[] = [];
  const removed: string[] = [];
  const pinned_kept: string[] = [];
  const added: string[] = [];

  // Compare panels in currentLayout
  for (const panel of currentLayout) {
    const id = panel.component_id;
    if (newIds.has(id)) {
      if (!kept.includes(id)) {
        kept.push(id);
      }
    } else {
      // Panel is only in currentLayout
      if (pinnedSet.has(id)) {
        // Protected from removal
        if (!pinned_kept.includes(id)) {
          pinned_kept.push(id);
        }
      } else {
        if (!removed.includes(id)) {
          removed.push(id);
        }
      }
    }
  }

  // Compare panels in newLayout
  for (const panel of newLayout) {
    const id = panel.component_id;
    if (!currentIds.has(id)) {
      if (!added.includes(id)) {
        added.push(id);
      }
    }
  }

  // Build newPlan: starts with newLayout
  const newPlan: Panel[] = [...newLayout];
  const seenNewPlanIds = new Set(newPlan.map((p) => p.component_id));

  // Force any pinned panel from currentLayout that was going to be removed (pinned_kept) into newPlan
  for (const panel of currentLayout) {
    if (pinned_kept.includes(panel.component_id) && !seenNewPlanIds.has(panel.component_id)) {
      newPlan.push(panel);
      seenNewPlanIds.add(panel.component_id);
    }
  }

  return {
    kept,
    added,
    removed,
    pinned_kept,
    newPlan,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { currentLayout, newLayout, pinnedPanelIds } = (body || {}) as Partial<DeltaRequestBody>;

    if (!currentLayout || !Array.isArray(currentLayout) || !newLayout || !Array.isArray(newLayout)) {
      return NextResponse.json(
        { error: 'Missing or invalid "currentLayout" or "newLayout" in request body' },
        { status: 400 }
      );
    }

    const pinnedList = Array.isArray(pinnedPanelIds) ? pinnedPanelIds : [];
    const delta = calculateDelta(currentLayout, newLayout, pinnedList);

    return NextResponse.json(delta);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Invalid JSON request body' },
      { status: 400 }
    );
  }
}
