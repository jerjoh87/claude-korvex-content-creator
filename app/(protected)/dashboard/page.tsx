import { requireUser } from '@/lib/auth/guards';
import { getShellUser } from '@/lib/auth/currentUser';
import { ContentOsAppShell } from '@/components/ContentOsAppShell';
import { Badge, Card, Icon, PageHeader, ProgressBar, Ring, SectionHeader, StatCard } from '@/components/ui/kx';

export const metadata = {
  title: 'Dashboard | Korvex OS',
  description: 'Your content marketing at a glance.'
};

const commands = [
  { label: 'Generate New Post', href: '/content-generator', icon: 'auto_awesome' },
  { label: 'Create AI Media', href: '/media-studio', icon: 'perm_media' },
  { label: 'Plan a Campaign', href: '/prompt-library', icon: 'campaign' },
  { label: 'Review Analytics', href: '/analytics', icon: 'monitoring' }
];

const recentContent = [
  { title: 'The Future of AI Architecture', status: 'Live', meta: '12.4k views • 2h ago', tone: 'green' as const, art: 1 },
  { title: 'Visual Storytelling Masterclass', status: 'Scheduled', meta: 'Goes out Oct 22', tone: 'purple' as const, art: 2 },
  { title: 'Growth Metrics Deep Dive', status: 'Draft', meta: 'Last edited yesterday', tone: 'gold' as const, art: 3 }
];

const trends = [
  { topic: '#NeuromorphicUX', note: 'Engagement up +45%', badge: 'HOT', tone: 'red' as const },
  { topic: '#EthicalAI', note: 'Sentiment shift detected', badge: 'RISING', tone: 'gold' as const },
  { topic: '#GlassmorphismV3', note: 'Design trend alert', badge: 'NEW', tone: 'cyan' as const },
  { topic: '#SyntheticMedia', note: 'Ad spend shifting', badge: 'HOT', tone: 'red' as const }
];

const chartBars = [38, 52, 47, 66, 58, 84, 72, 92, 78, 96, 88, 99];

export default async function DashboardPage() {
  await requireUser();
  const user = await getShellUser();

  return (
    <ContentOsAppShell activeLabel="Dashboard" searchPlaceholder="Search analytics, campaigns, or AI insights...">
      <PageHeader
        title={`Welcome back, ${user.name.split(' ')[0]}`}
        description="Your marketing ecosystem is performing at peak efficiency. Here's what's happening today."
        badge={<Badge tone="green" dot pulsing>All systems live</Badge>}
        actions={
          <a className="kx-btn" href="/content-generator">
            <Icon name="auto_awesome" filled /> Generate Content
          </a>
        }
      />

      <div className="kx-stat-grid">
        <StatCard delta="+12%" icon="visibility" label="Total Reach" note="across all platforms" value="2.4M" />
        <StatCard delta="+0.6%" icon="favorite" label="Engagement Rate" note="above sector average" value="5.82%" />
        <StatCard icon="campaign" label="Active Campaigns" note="3 launching this week" value="14" />
        <StatCard icon="bolt" label="AI Tokens" note="820k of 1M used this cycle" value={<>820k <small>/ 1M</small></>} />
      </div>

      <div className="kx-split">
        <Card
          icon="monitoring"
          title="Performance Analytics"
          subtitle="Content efficiency across all active channels — last 12 weeks."
          headActions={
            <div className="kx-segmented">
              <button type="button">7D</button>
              <button className="is-active" type="button">30D</button>
              <button type="button">90D</button>
            </div>
          }
        >
          <div aria-label="Performance chart" role="img" style={{ alignItems: 'end', display: 'grid', gap: 10, gridTemplateColumns: 'repeat(12, 1fr)', height: 240 }}>
            {chartBars.map((height, index) => (
              <div
                key={index}
                style={{
                  background: index === chartBars.length - 1 ? 'linear-gradient(180deg, #00f2fe, #7900cd)' : 'linear-gradient(180deg, rgb(0 220 230 / 60%), rgb(0 220 230 / 12%))',
                  borderRadius: '8px 8px 3px 3px',
                  height: `${height}%`
                }}
              />
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
            <small style={{ color: 'var(--kx-text-faint)', fontSize: 11.5, fontWeight: 700 }}>12 WEEKS AGO</small>
            <small style={{ color: 'var(--kx-primary)', fontSize: 11.5, fontWeight: 700 }}>PEAK: 124.2K</small>
          </div>
        </Card>

        <div style={{ display: 'grid', gap: 'var(--kx-gutter)' }}>
          <Card icon="terminal" title="Quick Actions" compact>
            <div style={{ display: 'grid', gap: 10 }}>
              {commands.map((command) => (
                <a className="kx-row" href={command.href} key={command.label} style={{ padding: '13px 15px' }}>
                  <span className="kx-platform"><Icon name={command.icon} /></span>
                  <div className="kx-row-main">
                    <h4>{command.label}</h4>
                  </div>
                  <Icon name="chevron_right" className="kx-icon" />
                </a>
              ))}
            </div>
          </Card>

          <Card icon="speed" title="Engagement Quality" compact>
            <div style={{ alignItems: 'center', display: 'flex', gap: 18 }}>
              <Ring label="quality" size={84} value={78} />
              <div style={{ display: 'grid', flex: 1, gap: 10 }}>
                <div>
                  <div className="kx-meter-row"><span>Hook strength</span><b>High</b></div>
                  <ProgressBar value={86} />
                </div>
                <div>
                  <div className="kx-meter-row"><span>Consistency</span><b>Good</b></div>
                  <ProgressBar value={72} />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="kx-split">
        <div style={{ display: 'grid', gap: 'var(--kx-gutter)' }}>
          <SectionHeader
            icon="history"
            title="Recent Content"
            actions={<a className="kx-btn is-ghost is-sm" href="/scheduled-posts">View All <Icon name="arrow_forward" /></a>}
          />
          <div className="kx-grid-3">
            {recentContent.map((item) => (
              <div className="kx-media-tile" key={item.title}>
                <div className={`kx-media-art is-${item.art}`}>
                  <Badge tone={item.tone}>{item.status}</Badge>
                </div>
                <div className="kx-media-meta">
                  <div>
                    <strong>{item.title}</strong>
                    <small>{item.meta}</small>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Card icon="radar" title="AI Trend Radar" compact headActions={<Badge tone="green" dot pulsing>Live</Badge>}>
          <div style={{ display: 'grid', gap: 4 }}>
            {trends.map((trend) => (
              <div className="kx-meter-row" key={trend.topic} style={{ borderBottom: '1px solid var(--kx-border)', padding: '12px 0' }}>
                <span>
                  <b style={{ color: 'var(--kx-text)', display: 'block' }}>{trend.topic}</b>
                  <small style={{ color: 'var(--kx-text-faint)', fontSize: 12 }}>{trend.note}</small>
                </span>
                <Badge tone={trend.tone}>{trend.badge}</Badge>
              </div>
            ))}
            <a className="kx-btn is-secondary is-sm" href="/trend-radar" style={{ marginTop: 12 }}>
              <Icon name="radar" /> Open Trend Radar
            </a>
          </div>
        </Card>
      </div>
    </ContentOsAppShell>
  );
}
