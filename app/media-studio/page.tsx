import { ContentOsAppShell } from '@/components/ContentOsAppShell';
import { MediaStudio } from '@/components/media-studio/MediaStudio';

export const metadata = {
  title: 'AI Media Studio | Korvex OS',
  description: 'Describe it, and the AI creates your images and videos.'
};

export default function MediaStudioPage() {
  return (
    <ContentOsAppShell activeLabel="AI Media Studio" searchPlaceholder="Search assets, prompts, campaigns...">
      <MediaStudio />
    </ContentOsAppShell>
  );
}
