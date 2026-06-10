import { ContentOsAppShell } from '@/components/ContentOsAppShell';
import { ContentGeneratorStudio, type TextModelChoice } from '@/components/content-generator/ContentGeneratorStudio';
import { getTextModelOptions } from '@/lib/ai/models';
import { getActiveWorkspace } from '@/lib/auth/workspace';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Content Generator | Korvex OS',
  description: 'Answer four quick questions and let AI write your next post.'
};

type ContentGeneratorPageProps = {
  searchParams?: Promise<{ topic?: string; context?: string }>;
};

export default async function ContentGeneratorPage({ searchParams }: ContentGeneratorPageProps) {
  const resolved = await searchParams;
  const workspace = await getActiveWorkspace();
  const models: TextModelChoice[] = getTextModelOptions().map(({ id, label, note, available }) => ({ id, label, note, available }));
  return (
    <ContentOsAppShell activeLabel="Content Generator" searchPlaceholder="Search your generated content...">
      <ContentGeneratorStudio
        initialContext={resolved?.context ?? ''}
        initialTopic={resolved?.topic ?? ''}
        models={models}
        workspaceId={workspace?.workspaceId ?? null}
      />
    </ContentOsAppShell>
  );
}
