import { ContentOsAppShell } from '@/components/ContentOsAppShell';
import { MediaStudio, type MediaModelChoice } from '@/components/media-studio/MediaStudio';
import { getMediaModelOptions } from '@/lib/ai/models';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'AI Media Studio | Korvex OS',
  description: 'Describe it, and the AI creates your images and videos.'
};

export default function MediaStudioPage() {
  const mediaModels: MediaModelChoice[] = getMediaModelOptions().map(({ id, label, note, available }) => ({ id, label, note, available }));
  return (
    <ContentOsAppShell activeLabel="AI Media Studio" searchPlaceholder="Search assets, prompts, campaigns...">
      <MediaStudio mediaModels={mediaModels} />
    </ContentOsAppShell>
  );
}
