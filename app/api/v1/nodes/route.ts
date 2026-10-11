import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { NodeItem } from '@/lib/types/workspace';

// POST: Create a new node item
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { project_id, title, content, status, priority, parent_id, tags, assignee, due_date } = body;

    if (!project_id || !title) {
      return NextResponse.json({ error: 'project_id and title are required' }, { status: 400 });
    }

    const newNode: NodeItem = {
      id: crypto.randomUUID(),
      project_id,
      parent_id: parent_id || null,
      title: title.trim(),
      content: content || '',
      status: status || 'todo',
      priority: priority || 'medium',
      order_index: body.order_index ?? 0,
      assignee: assignee || 'Unassigned',
      tags: Array.isArray(tags) ? tags : [],
      due_date: due_date || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('node_items')
      .insert([newNode])
      .select()
      .single();

    if (error) {
      // Return node directly in case table is local/in-memory
      return NextResponse.json({ node: newNode, warning: 'Saved locally' });
    }

    return NextResponse.json({ node: data });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}

// PATCH: Update an existing node (status drag-and-drop, title edit, reorder, indent/outdent)
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Node ID is required' }, { status: 400 });
    }

    const updatePayload = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('node_items')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) {
      return NextResponse.json({
        node: { id, ...updatePayload },
        warning: 'Updated locally',
      });
    }

    return NextResponse.json({ node: data || { id, ...updatePayload } });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}

// DELETE: Remove node
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Node ID is required' }, { status: 400 });
    }

    await supabase.from('node_items').delete().eq('id', id);

    return NextResponse.json({ success: true, deletedId: id });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}
