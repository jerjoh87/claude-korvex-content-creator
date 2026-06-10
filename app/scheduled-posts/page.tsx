import { ContentOsAppShell } from '@/components/ContentOsAppShell';
import { ManualPostingAssistant } from '@/components/ManualPostingAssistant';
import { ScheduledPostsQueue, type QueuedPost } from '@/components/scheduled-posts/ScheduledPostsQueue';
import { SectionHeader } from '@/components/ui/kx';
import { getActiveWorkspace } from '@/lib/auth/workspace';
import { createClient } from '@/lib/supabase/server';
import { getRequestWorkspaceContext } from '@/lib/social/requestContext';
import { listSocialAccounts } from '@/lib/social/repository';
import type { SocialAccountCard } from '@/lib/social/types';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Scheduled Posts | Korvex OS',
  description: 'Your publishing queue — every upcoming post in one place.'
};

async function getAccounts(): Promise<SocialAccountCard[]> {
  try {
    const { userId, workspaceId } = await getRequestWorkspaceContext();
    return await listSocialAccounts(userId, workspaceId);
  } catch {
    return [];
  }
}

function groupFor(date: Date, now: Date): QueuedPost['group'] {
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const dayDiff = Math.round((startOfDay(date) - startOfDay(now)) / 86_400_000);
  if (dayDiff <= 0) return 'Today';
  if (dayDiff === 1) return 'Tomorrow';
  return 'This Week';
}

function relativeLabel(date: Date, now: Date): string {
  const hours = (date.getTime() - now.getTime()) / 3_600_000;
  if (hours < 0) return 'overdue';
  if (hours < 1) return `in ${Math.max(1, Math.round(hours * 60))} min`;
  if (hours < 24) return `in ${Math.round(hours)} hours`;
  return `in ${Math.round(hours / 24)} days`;
}

async function loadQueue(): Promise<{ persisted: boolean; posts: QueuedPost[] | null }> {
  const workspace = await getActiveWorkspace();
  if (!workspace) return { persisted: false, posts: null };
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('scheduled_posts')
      .select('id, scheduled_for, status, metadata')
      .eq('workspace_id', workspace.workspaceId)
      .in('status', ['scheduled', 'publishing'])
      .order('scheduled_for', { ascending: true })
      .limit(50);
    const now = new Date();
    const posts: QueuedPost[] = (data ?? []).map((row) => {
      const when = new Date(row.scheduled_for);
      const meta = (row.metadata ?? {}) as { platform?: string; title?: string; excerpt?: string };
      return {
        id: row.id,
        group: groupFor(when, now),
        time: when.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        relative: relativeLabel(when, now),
        platform: meta.platform || 'Post',
        status: row.status === 'publishing' ? 'Ready' : 'Scheduled',
        title: meta.title || 'Scheduled post',
        excerpt: meta.excerpt || ''
      };
    });
    return { persisted: true, posts };
  } catch {
    return { persisted: true, posts: [] };
  }
}

export default async function ScheduledPostsPage() {
  const [accounts, queue] = await Promise.all([getAccounts(), loadQueue()]);
  return (
    <ContentOsAppShell activeLabel="Scheduled Posts" searchPlaceholder="Search scheduled content...">
      <ScheduledPostsQueue initialPosts={queue.posts} persisted={queue.persisted} />
      <SectionHeader
        icon="checklist"
        title="Manual Posting Assistant"
        description="Some platforms require posting by hand until auto-posting is approved. Prepare everything here, then copy it straight into the app."
      />
      <ManualPostingAssistant accounts={accounts} />
    </ContentOsAppShell>
  );
}
