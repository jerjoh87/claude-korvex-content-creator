import { ContentOsAppShell } from '@/components/ContentOsAppShell';
import { BusinessProfileEditor, type SavedBusinessProfile } from '@/components/business-profile/BusinessProfileEditor';
import { getActiveWorkspace } from '@/lib/auth/workspace';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Business Profile | Korvex OS',
  description: 'Tell Korvex about your business so every AI post sounds like you.'
};

async function loadProfile(): Promise<{ workspaceId: string | null; profile: SavedBusinessProfile | null }> {
  const workspace = await getActiveWorkspace();
  if (!workspace) return { workspaceId: null, profile: null };
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('business_profiles')
      .select('id, name, industry, audience, voice')
      .eq('workspace_id', workspace.workspaceId)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();
    return {
      workspaceId: workspace.workspaceId,
      profile: data
        ? {
            id: data.id,
            name: data.name,
            industry: data.industry,
            audience: (data.audience ?? {}) as SavedBusinessProfile['audience'],
            voice: (data.voice ?? {}) as SavedBusinessProfile['voice']
          }
        : null
    };
  } catch {
    return { workspaceId: workspace.workspaceId, profile: null };
  }
}

export default async function BusinessProfilePage() {
  const { workspaceId, profile } = await loadProfile();
  return (
    <ContentOsAppShell activeLabel="Business Profile" searchPlaceholder="Search profiles, campaigns...">
      <BusinessProfileEditor initialProfile={profile} workspaceId={workspaceId} />
    </ContentOsAppShell>
  );
}
