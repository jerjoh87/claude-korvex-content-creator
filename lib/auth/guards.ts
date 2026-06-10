import 'server-only';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { DEMO_ACCESS_COOKIE, demoUser } from '@/lib/auth/demo';
import { createClient } from '@/lib/supabase/server';

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

function demoSession() {
  return { supabase: null as unknown as SupabaseServerClient, user: demoUser };
}

export async function requireUser() {
  const cookieStore = await cookies();
  const hasDemoAccess = cookieStore.get(DEMO_ACCESS_COOKIE)?.value === '1';

  let supabase;
  try {
    supabase = await createClient();
  } catch {
    if (hasDemoAccess) {
      return demoSession();
    }
    redirect('/auth/login?error=Supabase%20is%20not%20configured.');
  }

  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    if (hasDemoAccess) {
      return demoSession();
    }
    redirect('/auth/login');
  }

  return { supabase, user };
}

export async function requireWorkspaceAccess(workspaceId: string) {
  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from('workspace_members')
    .select('workspace_id, role')
    .eq('workspace_id', workspaceId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (error || !data) {
    throw new Error('Workspace access denied');
  }

  return { supabase, user, membership: data };
}
