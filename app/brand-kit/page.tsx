import { ContentOsAppShell } from '@/components/ContentOsAppShell';
import { BrandKitBoard, type SavedBrandKit } from '@/components/brand-kit/BrandKitBoard';
import { getActiveWorkspace } from '@/lib/auth/workspace';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Brand Kit | Korvex OS',
  description: 'Your logo, colors, fonts, and voice — so every post looks and sounds like you.'
};

async function loadBrandKit(): Promise<{ workspaceId: string | null; kit: SavedBrandKit | null }> {
  const workspace = await getActiveWorkspace();
  if (!workspace) return { workspaceId: null, kit: null };
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('brand_kits')
      .select('id, colors, fonts, guidelines')
      .eq('workspace_id', workspace.workspaceId)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();
    if (!data) return { workspaceId: workspace.workspaceId, kit: null };

    // Voice settings are stored as JSON inside the `guidelines` text column
    // (the table has no dedicated voice column).
    let voice: SavedBrandKit['voice'] = {};
    try {
      voice = data.guidelines ? (JSON.parse(data.guidelines) as SavedBrandKit['voice']) : {};
    } catch {
      voice = {};
    }
    return {
      workspaceId: workspace.workspaceId,
      kit: { id: data.id, voice }
    };
  } catch {
    return { workspaceId: workspace.workspaceId, kit: null };
  }
}

export default async function BrandKitPage() {
  const { workspaceId, kit } = await loadBrandKit();
  return (
    <ContentOsAppShell activeLabel="Brand Kit" searchPlaceholder="Search brand assets...">
      <BrandKitBoard initialKit={kit} workspaceId={workspaceId} />
    </ContentOsAppShell>
  );
}
