import 'server-only';

import { cookies } from 'next/headers';
import { DEMO_ACCESS_COOKIE, demoUser } from './demo';
import { createClient } from '@/lib/supabase/server';

export type ShellUser = {
  name: string;
  email: string | null;
  initials: string;
  plan: string;
};

function toInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'K';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Best-effort identity for the app chrome. Never throws and never redirects —
 * pages that require auth still enforce it themselves via requireUser().
 */
export async function getShellUser(): Promise<ShellUser> {
  try {
    const supabase = await createClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (user) {
      const metaName = typeof user.user_metadata?.full_name === 'string' ? user.user_metadata.full_name : '';
      const name = metaName || user.email?.split('@')[0] || 'Member';
      return { name, email: user.email ?? null, initials: toInitials(name), plan: 'Premium Tier' };
    }
  } catch {
    // Supabase not configured — fall through to demo/guest.
  }

  try {
    const cookieStore = await cookies();
    if (cookieStore.get(DEMO_ACCESS_COOKIE)?.value === '1') {
      return { name: 'Demo User', email: demoUser.email, initials: 'DU', plan: 'Demo Workspace' };
    }
  } catch {
    // cookies() unavailable (e.g. during prerender) — fall through.
  }

  return { name: 'Guest', email: null, initials: 'G', plan: 'Not signed in' };
}
