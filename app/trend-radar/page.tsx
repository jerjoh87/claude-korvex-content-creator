import { ContentOsAppShell } from '@/components/ContentOsAppShell';
import { TrendRadar } from '@/components/trend-radar/TrendRadar';

export const metadata = {
  title: 'AI Trend Radar | Korvex OS',
  description: 'Spot what is trending and turn it into content before everyone else.'
};

export default function TrendRadarPage() {
  return (
    <ContentOsAppShell activeLabel="AI Trend Radar" searchPlaceholder="Search trends...">
      <TrendRadar />
    </ContentOsAppShell>
  );
}
