import 'server-only';

import { createClient } from '@/lib/supabase/server';

export type ActiveWorkspace = { userId: string; workspaceId: string };

/**
 * The signed-in user's first workspace (signup trigger guarantees one).
 * Returns null for guests/demo sessions or when Supabase isn't configured —
 * pages fall back to local, non-persisted mode.
 */
export async function getActiveWorkspace(): Promise<ActiveWorkspace | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data } = await supabase
      .from('workspace_members')
      .select('workspace_id')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle();
    if (!data) return null;

    return { userId: user.id, workspaceId: data.workspace_id };
  } catch {
    return null;
  }
}
