import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    if (typeof body?.is_active !== 'boolean') {
      return NextResponse.json({ error: 'is_active must be a boolean' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('workflows')
      .update({ is_active: body.is_active })
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) {
      console.error('[API/V1/WORKFLOWS] Failed to update workflow:', error);
      return NextResponse.json({ error: 'Could not update the workflow in the database' }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: 'Workflow was not found' }, { status: 404 });
    }

    return NextResponse.json({ workflow: data });
  } catch (error) {
    console.error('[API/V1/WORKFLOWS] Invalid update-workflow request:', error);
    return NextResponse.json({ error: 'Could not update workflow' }, { status: 500 });
  }
}
