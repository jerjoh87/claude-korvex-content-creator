import { ContentOsAppShell } from '@/components/ContentOsAppShell';
import { ContentCalendar, type CalendarPost } from '@/components/calendar/ContentCalendar';
import { getActiveWorkspace } from '@/lib/auth/workspace';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Content Calendar | Korvex OS',
  description: 'See every post at a glance and plan your week in minutes.'
};

const statusMap: Record<string, CalendarPost['status']> = {
  scheduled: 'Scheduled',
  publishing: 'Ready',
  published: 'Posted',
  failed: 'Draft',
  cancelled: 'Draft'
};

async function loadMonth(): Promise<{ persisted: boolean; posts: CalendarPost[] | null }> {
  const workspace = await getActiveWorkspace();
  if (!workspace) return { persisted: false, posts: null };
  try {
    const supabase = await createClient();
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();
    const { data } = await supabase
      .from('scheduled_posts')
      .select('id, scheduled_for, status, metadata')
      .eq('workspace_id', workspace.workspaceId)
      .gte('scheduled_for', monthStart)
      .lt('scheduled_for', monthEnd)
      .order('scheduled_for', { ascending: true })
      .limit(200);
    const posts: CalendarPost[] = (data ?? []).map((row, index) => {
      const when = new Date(row.scheduled_for);
      const meta = (row.metadata ?? {}) as { platform?: string; title?: string };
      return {
        id: index + 1,
        day: when.getDate(),
        time: when.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        title: meta.title || 'Scheduled post',
        platform: meta.platform || 'Post',
        status: statusMap[row.status] ?? 'Scheduled'
      };
    });
    return { persisted: true, posts };
  } catch {
    return { persisted: true, posts: [] };
  }
}

export default async function CalendarPage() {
  const { persisted, posts } = await loadMonth();
  return (
    <ContentOsAppShell activeLabel="Content Calendar" searchPlaceholder="Search planned content...">
      <ContentCalendar initialPosts={posts} persisted={persisted} />
    </ContentOsAppShell>
  );
}
