import { ContentOsAppShell } from '@/components/ContentOsAppShell';
import { ContentGeneratorStudio } from '@/components/content-generator/ContentGeneratorStudio';
import { getActiveWorkspace } from '@/lib/auth/workspace';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Content Generator | Korvex OS',
  description: 'Answer four quick questions and let AI write your next post.'
};

type ContentGeneratorPageProps = {
  searchParams?: Promise<{ topic?: string }>;
};

export default async function ContentGeneratorPage({ searchParams }: ContentGeneratorPageProps) {
  const resolved = await searchParams;
  const workspace = await getActiveWorkspace();
  return (
    <ContentOsAppShell activeLabel="Content Generator" searchPlaceholder="Search your generated content...">
      <ContentGeneratorStudio initialTopic={resolved?.topic ?? ''} workspaceId={workspace?.workspaceId ?? null} />
    </ContentOsAppShell>
  );
}
