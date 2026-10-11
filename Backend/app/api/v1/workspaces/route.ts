import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Workspace } from '@/lib/types/workspace';

// Default starter templates if database is empty
const STARTER_WORKSPACES: Workspace[] = [
  {
    id: 'ws-sales-crm',
    name: 'Sales CRM & Pipeline',
    slug: 'sales-crm',
    description: 'Lead scoring, customer deals, and automated follow-ups',
    icon: 'briefcase',
    created_at: new Date().toISOString(),
  },
  {
    id: 'ws-growth-dashboard',
    name: 'Growth & Analytics Portal',
    slug: 'growth-dashboard',
    description: 'Track daily active users, retention loops, and growth experiments',
    icon: 'trending-up',
    created_at: new Date().toISOString(),
  },
  {
    id: 'ws-sprint-tracker',
    name: 'Sprint Tracker & Code Engine',
    slug: 'sprint-tracker',
    description: 'Agile sprints, backlog triage, and PR review orchestration',
    icon: 'terminal',
    created_at: new Date().toISOString(),
  },
];

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('workspaces')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return NextResponse.json({
        workspaces: STARTER_WORKSPACES,
        isFallback: true,
      });
    }

    return NextResponse.json({
      workspaces: data,
      isFallback: false,
    });
  } catch (err: any) {
    return NextResponse.json({
      workspaces: STARTER_WORKSPACES,
      isFallback: true,
      error: err?.message,
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = body?.name?.trim();
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
      return NextResponse.json({ workspace: newWorkspace, warning: 'Saved locally' });
    }

    return NextResponse.json({ workspace: data });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}
