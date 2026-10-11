import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { ModelTier } from '@/lib/types/workspace';

const modelTiers: ModelTier[] = ['FAST', 'STANDARD', 'REASONING'];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = typeof body?.name === 'string' ? body.name.trim() : '';
    const persona = typeof body?.persona === 'string' ? body.persona.trim() : '';
    const systemPrompt = typeof body?.system_prompt === 'string' ? body.system_prompt.trim() : '';
    const workspaceId = typeof body?.workspace_id === 'string' ? body.workspace_id : '';
    const modelTier = body?.model_tier ?? 'STANDARD';
    const toolsAssigned = body?.tools_assigned ?? [];

    if (!name || !persona || !systemPrompt || !workspaceId) {
      return NextResponse.json(
        { error: 'workspace_id, name, persona, and system_prompt are required' },
        { status: 400 }
      );
    }
    if (!modelTiers.includes(modelTier)) {
      return NextResponse.json({ error: 'model_tier must be FAST, STANDARD, or REASONING' }, { status: 400 });
    }
    if (!Array.isArray(toolsAssigned) || !toolsAssigned.every((tool) => typeof tool === 'string')) {
      return NextResponse.json({ error: 'tools_assigned must be an array of strings' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('agents')
      .insert([{
        id: crypto.randomUUID(),
        workspace_id: workspaceId,
        name,
        persona,
        system_prompt: systemPrompt,
        model_tier: modelTier,
        tools_assigned: toolsAssigned,
        avatar: body?.avatar ?? 'bot',
      }])
      .select()
      .single();

    if (error) {
      console.error('[API/V1/AGENTS] Failed to create agent:', error);
      return NextResponse.json({ error: 'Could not save the agent to the database' }, { status: 500 });
    }

    return NextResponse.json({ agent: data }, { status: 201 });
  } catch (error) {
    console.error('[API/V1/AGENTS] Invalid create-agent request:', error);
    return NextResponse.json({ error: 'Could not create agent' }, { status: 500 });
  }
}
