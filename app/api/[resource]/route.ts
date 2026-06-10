import { NextResponse } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import { requireWorkspaceAccess } from '@/lib/auth/guards';
import { getOwnedResource, sanitizeOwnedPayload, workspacePayloadSchema } from '@/lib/auth/owned-resources';

export async function GET(request: Request, { params }: { params: Promise<{ resource: string }> }) {
  const { resource } = await params;
  const config = getOwnedResource(resource);
  if (!config) {
    return NextResponse.json({ error: 'Unknown owned resource' }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const workspace_id = searchParams.get('workspace_id');
  const parsed = workspacePayloadSchema.safeParse({ workspace_id });
  if (!parsed.success) {
    return NextResponse.json({ error: 'workspace_id query parameter is required' }, { status: 400 });
  }

  const { supabase, user } = await requireWorkspaceAccess(parsed.data.workspace_id);
  const { data, error } = await supabase
    .from(config.table)
    .select('*')
    .eq('workspace_id', parsed.data.workspace_id)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ data });
}

export async function POST(request: Request, { params }: { params: Promise<{ resource: string }> }) {
  const { resource } = await params;
  const config = getOwnedResource(resource);
  if (!config) {
    return NextResponse.json({ error: 'Unknown owned resource' }, { status: 404 });
  }

  try {
    const body = await request.json();
    const workspace_id = workspacePayloadSchema.parse(body).workspace_id;
    const { supabase, user } = await requireWorkspaceAccess(workspace_id);
    const payload = sanitizeOwnedPayload(body, user.id);

    // Dynamic table names fall outside the generated Database type; use the untyped client.
    const db = supabase as unknown as SupabaseClient;
    const { data, error } = await db.from(config.table).insert(payload).select('*').single();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid request';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
