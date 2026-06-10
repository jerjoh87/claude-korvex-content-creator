import { NextResponse } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import { requireUser, requireWorkspaceAccess } from '@/lib/auth/guards';
import { getOwnedResource, sanitizeOwnedPayload, workspacePayloadSchema } from '@/lib/auth/owned-resources';

export async function GET(_request: Request, { params }: { params: Promise<{ resource: string; id: string }> }) {
  const { resource, id } = await params;
  const config = getOwnedResource(resource);
  if (!config) {
    return NextResponse.json({ error: 'Unknown owned resource' }, { status: 404 });
  }

  try {
    const { supabase, user } = await requireWorkspaceAccessFromRow(config.table, id);
    const { data, error } = await supabase.from(config.table).select('*').eq('id', id).eq('user_id', user.id).single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Resource access denied';
    return NextResponse.json({ error: message }, { status: 403 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ resource: string; id: string }> }) {
  const { resource, id } = await params;
  const config = getOwnedResource(resource);
  if (!config) {
    return NextResponse.json({ error: 'Unknown owned resource' }, { status: 404 });
  }

  try {
    const body = await request.json();
    const parsed = workspacePayloadSchema.parse(body);
    const { supabase, user } = await requireWorkspaceAccess(parsed.workspace_id);
    const payload = sanitizeOwnedPayload(body, user.id);

    // Dynamic table names fall outside the generated Database type; use the untyped client.
    const db = supabase as unknown as SupabaseClient;
    const { data, error } = await db
      .from(config.table)
      .update(payload)
      .eq('id', id)
      .eq('workspace_id', parsed.workspace_id)
      .eq('user_id', user.id)
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid request';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ resource: string; id: string }> }) {
  const { resource, id } = await params;
  const config = getOwnedResource(resource);
  if (!config) {
    return NextResponse.json({ error: 'Unknown owned resource' }, { status: 404 });
  }

  try {
    const { supabase, user, workspaceId } = await requireWorkspaceAccessFromRow(config.table, id);
    const { error } = await supabase.from(config.table).delete().eq('id', id).eq('workspace_id', workspaceId).eq('user_id', user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Resource access denied';
    return NextResponse.json({ error: message }, { status: 403 });
  }
}

async function requireWorkspaceAccessFromRow(table: string, id: string) {
  const { supabase, user } = await requireUser();
  // Dynamic table names fall outside the generated Database type; use the untyped client.
  const db = supabase as unknown as SupabaseClient;
  const { data, error } = await db.from(table).select('workspace_id, user_id').eq('id', id).eq('user_id', user.id).maybeSingle();

  if (error || !data) {
    throw new Error('Resource access denied');
  }

  const workspaceId = data.workspace_id as string;
  await requireWorkspaceAccess(workspaceId);
  return { supabase, user, workspaceId };
}
