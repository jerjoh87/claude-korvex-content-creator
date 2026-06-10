import { ContentOsAppShell } from '@/components/ContentOsAppShell';
import { Badge, Card, Icon, PageHeader, ProgressBar, SectionHeader, StatCard } from '@/components/ui/kx';

export const metadata = {
  title: 'Analytics | Korvex OS',
  description: 'Plain-English insights about what is working and what to post next.'
};

const topPosts = [
  { title: 'Client transformation reel', platform: 'Instagram', metric: '12.4k views', badge: 'Best this week' },
  { title: '5 quick tips thread', platform: 'LinkedIn', metric: '8.1k impressions', badge: 'Most shared' },
  { title: 'Weekly offer announcement', platform: 'Facebook', metric: '3.2k reach', badge: 'Most clicks' }
];

const platforms = [
  { name: 'Instagram', share: 46, note: 'Your strongest channel' },
  { name: 'TikTok', share: 28, note: 'Fastest growing' },
  { name: 'LinkedIn', share: 18, note: 'Best for clicks' },
  { name: 'Facebook', share: 8, note: 'Steady but slow' }
];

const insights = [
  {
    icon: 'movie',
    title: 'Post more Reels this week',
    detail: 'Your video posts get 3× more reach than images. Aim for 2–3 Reels in the next 7 days.',
    action: { label: 'Generate a Reel script', href: '/content-generator' }
  },
  {
    icon: 'schedule',
    title: 'Post on Wednesday around 3 PM',
    detail: 'That’s when your audience is most active across platforms, based on the last 14 days.',
    action: { label: 'Schedule a post', href: '/calendar' }
  },
  {
    icon: 'trending_up',
    title: 'Double down on transformation content',
    detail: 'Before/after style posts are your top performers. Your audience loves seeing results.',
    action: { label: 'See trending angles', href: '/trend-radar' }
  }
];

const chartBars = [42, 58, 50, 72, 64, 88, 79, 96];

export default function AnalyticsPage() {
  return (
    <ContentOsAppShell activeLabel="Analytics" searchPlaceholder="Search analytics...">
      <PageHeader
        title="Analytics"
        icon="monitoring"
        description="How your content is doing — in plain English. Check the insights below to know exactly what to post next."
        badge={<Badge tone="green" dot pulsing>Live sync</Badge>}
        actions={
          <>
            <button className="kx-btn is-secondary" type="button">
              <Icon name="calendar_today" /> Last 30 Days
            </button>
            <button className="kx-btn" type="button">
              <Icon name="download" /> Export Report
            </button>
          </>
        }
      />

      <div className="kx-stat-grid">
        <StatCard delta="+24.5%" icon="payments" label="Estimated ROI" note="AI attributes 40% to your latest campaign" value="$12,450" />
        <StatCard delta="+12.1%" icon="ads_click" label="Conversion Rate" note="people who clicked, then acted" value="4.8%" />
        <StatCard delta="-2.4%" deltaDirection="down" icon="visibility" label="Total Reach" note="1.8M organic • 0.6M paid" value="2.4M" />
        <StatCard delta="+0.8%" icon="favorite" label="Engagement Rate" note="above your industry average" value="5.82%" />
      </div>

      <div className="kx-split">
        <Card
          icon="bar_chart"
          title="Audience Growth & Engagement"
          subtitle="Aggregated across all connected platforms — last 8 weeks."
          headActions={
            <div className="kx-segmented">
              <button className="is-active" type="button">ALL</button>
              <button type="button">IG</button>
              <button type="button">TT</button>
              <button type="button">LI</button>
            </div>
          }
        >
          <div aria-label="Weekly growth chart" role="img" style={{ alignItems: 'end', display: 'grid', gap: 12, gridTemplateColumns: 'repeat(8, 1fr)', height: 220, marginTop: 8 }}>
            {chartBars.map((height, index) => (
              <div key={index} style={{ display: 'grid', gap: 8, height: '100%', alignContent: 'end', justifyItems: 'center' }}>
                <div
                  style={{
                    background: index === chartBars.length - 1 ? 'linear-gradient(180deg, #00f2fe, #7900cd)' : 'linear-gradient(180deg, rgb(0 220 230 / 65%), rgb(0 220 230 / 15%))',
                    borderRadius: '8px 8px 3px 3px',
                    height: `${height}%`,
                    width: '100%'
                  }}
                />
                <small style={{ color: 'var(--kx-text-faint)', fontSize: 11, fontWeight: 700 }}>W{index + 1}</small>
              </div>
            ))}
          </div>
        </Card>

        <div style={{ display: 'grid', gap: 'var(--kx-gutter)' }}>
          <Card icon="schedule" title="Best Time to Post" compact>
            <div style={{ display: 'grid', gap: 10 }}>
              <div style={{ display: 'grid', gap: 6, gridTemplateColumns: 'repeat(4, 1fr)' }}>
                {['9 AM', '12 PM', '3 PM', '6 PM'].map((slot, index) => (
                  <div
                    key={slot}
                    style={{
                      background: index === 2 ? 'rgb(0 220 230 / 18%)' : 'rgb(255 255 255 / 4%)',
                      border: index === 2 ? '1px solid rgb(0 220 230 / 55%)' : '1px solid var(--kx-border)',
                      borderRadius: 8,
                      color: index === 2 ? 'var(--kx-primary)' : 'var(--kx-text-faint)',
                      fontSize: 12.5,
                      fontWeight: 700,
                      padding: '12px 4px',
                      textAlign: 'center'
                    }}
                  >
                    {slot}
                  </div>
                ))}
              </div>
              <p className="kx-help" style={{ margin: 0 }}>
                <Icon name="auto_awesome" /> AI suggests <b style={{ color: 'var(--kx-primary)' }}>Wednesday 3 PM</b> for maximum engagement.
              </p>
            </div>
          </Card>

          <Card icon="leaderboard" title="Top Platforms" compact>
            <div style={{ display: 'grid', gap: 14 }}>
              {platforms.map((platform) => (
                <div key={platform.name} style={{ display: 'grid', gap: 6 }}>
                  <div className="kx-meter-row">
                    <span>
                      <b style={{ color: 'var(--kx-text)' }}>{platform.name}</b> — {platform.note}
                    </span>
                    <b>{platform.share}%</b>
                  </div>
                  <ProgressBar value={platform.share} />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <SectionHeader icon="emoji_events" title="Your best content" description="What worked recently — make more like this." />
      <div className="kx-grid-3">
        {topPosts.map((post) => (
          <Card compact hoverable key={post.title}>
            <Badge tone="cyan">{post.badge}</Badge>
            <h4 style={{ color: 'var(--kx-text)', fontSize: 15.5, margin: '12px 0 6px' }}>{post.title}</h4>
            <p style={{ color: 'var(--kx-text-faint)', fontSize: 13, margin: 0 }}>
              {post.platform} • {post.metric}
            </p>
          </Card>
        ))}
      </div>

      <SectionHeader icon="tips_and_updates" title="What should I do next?" description="The AI turned your numbers into three simple actions." />
      <div className="kx-grid-3">
        {insights.map((insight) => (
          <Card className="is-hoverable" key={insight.title} variant="ai">
            <Icon className="kx-icon" name={insight.icon} />
            <h4 style={{ color: 'var(--kx-text)', fontSize: 16, margin: '10px 0 8px' }}>{insight.title}</h4>
            <p style={{ color: 'var(--kx-text-muted)', fontSize: 13.5, lineHeight: 1.6, margin: '0 0 14px' }}>{insight.detail}</p>
            <a className="kx-btn is-secondary is-sm" href={insight.action.href}>
              {insight.action.label} <Icon name="arrow_forward" />
            </a>
          </Card>
        ))}
      </div>
    </ContentOsAppShell>
  );
}
