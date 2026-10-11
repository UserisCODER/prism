import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Workspace } from '@/lib/types/workspace';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('workspaces')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[API/V1/WORKSPACES] Failed to load workspaces:', error);
      return NextResponse.json({ error: 'Could not load workspaces from the database' }, { status: 500 });
    }

    return NextResponse.json({
      workspaces: data ?? [],
      isFallback: false,
    });
  } catch (error) {
    console.error('[API/V1/WORKSPACES] Unexpected workspace-list error:', error);
    return NextResponse.json({ error: 'Could not load workspaces' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = typeof body?.name === 'string' ? body.name.trim() : '';
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const slug = (body?.slug || name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const newWorkspace: Workspace = {
      id: crypto.randomUUID(),
      name,
      slug: `${slug}-${Date.now().toString().slice(-4)}`,
      description: body?.description || '',
      icon: body?.icon || 'sparkles',
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('workspaces')
      .insert([newWorkspace])
      .select()
      .single();

    if (error) {
      console.error('[API/V1/WORKSPACES] Failed to create workspace:', error);
      return NextResponse.json({ error: 'Could not save the workspace to the database' }, { status: 500 });
    }

    return NextResponse.json({ workspace: data });
  } catch (error) {
    console.error('[API/V1/WORKSPACES] Invalid create-workspace request:', error);
    return NextResponse.json({ error: 'Could not create workspace' }, { status: 500 });
  }
}
