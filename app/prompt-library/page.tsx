import { ContentOsAppShell } from '@/components/ContentOsAppShell';
import { PromptLibraryDashboard } from '@/components/prompt-library/PromptLibraryDashboard';
import { loadContentGeneratorData } from '@/lib/prompt-library/supabase';

export const metadata = {
  title: 'Prompt Library | Content OS',
  description: 'Create, preview, approve, and save reusable AI prompts with required visual result cards.'
};

export default async function PromptLibraryPage() {
  const contentGeneratorData = await loadContentGeneratorData();

  return (
    <ContentOsAppShell activeLabel="AI Campaigns">
      <div className="content-os-page prompt-library-page" style={{ display: 'grid', gap: 24 }}>
        <PromptLibraryDashboard initialData={contentGeneratorData} />
      </div>
    </ContentOsAppShell>
  );
}
