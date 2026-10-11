import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Workflow } from '@/lib/types/workspace';

const triggerTypes: Workflow['trigger_type'][] = ['schedule', 'webhook', 'item_change', 'manual'];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = typeof body?.name === 'string' ? body.name.trim() : '';
    const workspaceId = typeof body?.workspace_id === 'string' ? body.workspace_id : '';
    const triggerType = body?.trigger_type ?? 'manual';
    const nodes = body?.nodes ?? [];
    const edges = body?.edges ?? [];

    if (!name || !workspaceId) {
      return NextResponse.json({ error: 'workspace_id and name are required' }, { status: 400 });
    }
    if (!triggerTypes.includes(triggerType)) {
      return NextResponse.json({ error: 'trigger_type is invalid' }, { status: 400 });
    }
    if (!Array.isArray(nodes) || !Array.isArray(edges)) {
      return NextResponse.json({ error: 'nodes and edges must be arrays' }, { status: 400 });
    }

    const workflow: Workflow = {
      id: crypto.randomUUID(),
      workspace_id: workspaceId,
      name,
      description: typeof body?.description === 'string' ? body.description : '',
      trigger_type: triggerType,
      trigger_config: body?.trigger_config ?? {},
      nodes,
      edges,
      is_active: body?.is_active === true,
      created_at: new Date().toISOString(),
    };
    const { data, error } = await supabase
      .from('workflows')
      .insert([workflow])
      .select()
      .single();

    if (error) {
      console.error('[API/V1/WORKFLOWS] Failed to create workflow:', error);
      return NextResponse.json({ error: 'Could not save the workflow to the database' }, { status: 500 });
    }

    return NextResponse.json({ workflow: data }, { status: 201 });
  } catch (error) {
    console.error('[API/V1/WORKFLOWS] Invalid create-workflow request:', error);
    return NextResponse.json({ error: 'Could not create workflow' }, { status: 500 });
  }
}
