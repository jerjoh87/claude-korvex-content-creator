'use client';

import { useMemo, useState } from 'react';
import { Badge, Card, EmptyState, Icon, PageHeader, SectionHeader } from '../ui/kx';

type Trend = {
  id: number;
  title: string;
  summary: string;
  industry: string;
  velocity: string;
  hashtags: string[];
  platforms: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
  idea: string;
};

const trends: Trend[] = [
  {
    id: 1,
    title: 'The "Zero-Click" Search Survival Guide',
    summary: 'Audiences now get answers from AI overviews instead of clicking links. Brands that explain things directly in-feed are winning the reach.',
    industry: 'Tech / SaaS',
    velocity: '+340% / 24h',
    hashtags: ['#SEO2026', '#AIOverviews', '#ContentStrategy'],
    platforms: ['LinkedIn', 'X'],
    difficulty: 'Medium',
    idea: 'A carousel explaining how customers find you now vs. 2 years ago'
  },
  {
    id: 2,
    title: 'Before & After everything',
    summary: 'Transformation content is spiking across every niche — cuts, meals, rooms, spreadsheets. Show the result first, then the process.',
    industry: 'Local Business',
    velocity: '+180% / 7d',
    hashtags: ['#BeforeAndAfter', '#Transformation'],
    platforms: ['Instagram', 'TikTok'],
    difficulty: 'Easy',
    idea: 'A 15-second reel: end result first, 3 process clips, your offer at the end'
  },
  {
    id: 3,
    title: '"Day in the life" with a twist',
    summary: 'POV-style behind-the-scenes videos keep outperforming polished ads. The twist: narrate the one thing customers never see.',
    industry: 'Local Business',
    velocity: '+95% / 7d',
    hashtags: ['#DayInTheLife', '#SmallBusiness'],
    platforms: ['TikTok', 'Instagram'],
    difficulty: 'Easy',
    idea: 'Film your opening routine and narrate the detail customers never notice'
  },
  {
    id: 4,
    title: 'AI co-pilot confessions',
    summary: 'Founders sharing exactly how they use AI tools (with real screenshots) is driving huge saves and shares on professional feeds.',
    industry: 'Tech / SaaS',
    velocity: '+120% / 7d',
    hashtags: ['#AItools', '#BuildInPublic'],
    platforms: ['LinkedIn', 'X'],
    difficulty: 'Medium',
    idea: 'A post: "3 things I automated this month — and the one I rolled back"'
  },
  {
    id: 5,
    title: 'Unhinged brand humor',
    summary: 'Playful, self-aware posting from small brands is being rewarded by the algorithm — especially quick memes reacting to weekly news.',
    industry: 'E-commerce',
    velocity: '+210% / 7d',
    hashtags: ['#BrandHumor', '#Memes'],
    platforms: ['X', 'TikTok'],
    difficulty: 'Hard',
    idea: 'A meme about the one thing every customer asks you'
  }
];

const hooks = [
  { score: 98, text: '“Stop optimizing for Google. Optimize for AI.”', meta: '1.2M est. reach • High engagement' },
  { score: 92, text: '“We tried the viral trend so you don’t have to.”', meta: '850K est. reach • High shares' },
  { score: 85, text: '“The landing page is dead. Here’s what replaced it.”', meta: '620K est. reach • Steady growth' }
];

const industryOptions = ['All Industries', 'Tech / SaaS', 'Local Business', 'E-commerce'];
const platformOptions = ['All Platforms', 'Instagram', 'TikTok', 'LinkedIn', 'X'];

const difficultyTone: Record<Trend['difficulty'], 'green' | 'gold' | 'red'> = {
  Easy: 'green',
  Medium: 'gold',
  Hard: 'red'
};

export function TrendRadar() {
  const [industry, setIndustry] = useState('All Industries');
  const [platform, setPlatform] = useState('All Platforms');

  const visibleTrends = useMemo(
    () =>
      trends.filter(
        (trend) =>
          (industry === 'All Industries' || trend.industry === industry) &&
          (platform === 'All Platforms' || trend.platforms.includes(platform))
      ),
    [industry, platform]
  );

  const [mega, ...rest] = visibleTrends;

  return (
    <>
      <PageHeader
        title="AI Trend Radar"
        icon="radar"
        description="Live analysis of what's taking off right now — and exactly how your business can ride it. Pick a trend and generate content in one click."
        badge={<Badge tone="green" dot pulsing>Live</Badge>}
        actions={
          <button className="kx-btn is-secondary" type="button">
            <Icon name="sync" /> Refresh Trends
          </button>
        }
      />

      <Card compact>
        <div style={{ alignItems: 'center', display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          <span className="kx-label" style={{ textTransform: 'uppercase' }}>Filter:</span>
          <select aria-label="Filter by industry" className="kx-select" onChange={(event) => setIndustry(event.target.value)} style={{ width: 'auto' }} value={industry}>
            {industryOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <select aria-label="Filter by platform" className="kx-select" onChange={(event) => setPlatform(event.target.value)} style={{ width: 'auto' }} value={platform}>
            {platformOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <Badge tone="cyan">{visibleTrends.length} trends</Badge>
        </div>
      </Card>

      {visibleTrends.length === 0 ? (
        <EmptyState
          icon="radar"
          title="No trends match those filters"
          description="Try a different industry or platform combination — new trends are detected every few hours."
        />
      ) : (
        <>
          {mega ? (
            <Card variant="ai">
              <div style={{ alignItems: 'center', display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
                <Badge tone="purple" icon="local_fire_department">Mega Trend</Badge>
                <Badge tone="green" icon="trending_up">Velocity: {mega.velocity}</Badge>
                <Badge tone={difficultyTone[mega.difficulty]}>{mega.difficulty} to make</Badge>
              </div>
              <h2 style={{ color: 'var(--kx-text)', fontSize: 24, fontWeight: 700, letterSpacing: '-0.01em', margin: '0 0 10px' }}>{mega.title}</h2>
              <p style={{ color: 'var(--kx-text-muted)', fontSize: 15, lineHeight: 1.65, margin: '0 0 14px', maxWidth: 720 }}>{mega.summary}</p>
              <div style={{ alignItems: 'center', display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
                {mega.hashtags.map((tag) => (
                  <Badge key={tag} tone="cyan">{tag}</Badge>
                ))}
                {mega.platforms.map((item) => (
                  <Badge key={item}>{item}</Badge>
                ))}
              </div>
              <div style={{ background: 'rgb(255 255 255 / 4%)', border: '1px solid var(--kx-border)', borderRadius: 8, marginBottom: 18, padding: '12px 14px' }}>
                <p className="kx-help" style={{ margin: 0 }}>
                  <Icon name="lightbulb" /> <b style={{ color: 'var(--kx-text)' }}>Content idea for you:</b> {mega.idea}
                </p>
              </div>
              <a className="kx-btn" href={`/content-generator?topic=${encodeURIComponent(mega.idea)}`}>
                <Icon name="auto_awesome" filled /> Generate Content From This Trend
              </a>
            </Card>
          ) : null}

          <div className="kx-grid-2">
            {rest.map((trend) => (
              <Card hoverable key={trend.id}>
                <div style={{ alignItems: 'center', display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                  <Badge tone="green" icon="trending_up">{trend.velocity}</Badge>
                  <Badge tone={difficultyTone[trend.difficulty]}>{trend.difficulty} to make</Badge>
                  <Badge>{trend.industry}</Badge>
                </div>
                <h3 style={{ color: 'var(--kx-text)', fontSize: 18, fontWeight: 600, margin: '0 0 8px' }}>{trend.title}</h3>
                <p style={{ color: 'var(--kx-text-muted)', fontSize: 14, lineHeight: 1.6, margin: '0 0 12px' }}>{trend.summary}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                  {trend.hashtags.map((tag) => (
                    <Badge key={tag} tone="cyan">{tag}</Badge>
                  ))}
                  {trend.platforms.map((item) => (
                    <Badge key={item}>{item}</Badge>
                  ))}
                </div>
                <p className="kx-help" style={{ margin: '0 0 14px' }}>
                  <Icon name="lightbulb" /> Idea: {trend.idea}
                </p>
                <a className="kx-btn is-secondary is-sm" href={`/content-generator?topic=${encodeURIComponent(trend.idea)}`}>
                  <Icon name="auto_awesome" /> Generate From This Trend
                </a>
              </Card>
            ))}
          </div>
        </>
      )}

      <div className="kx-split">
        <div style={{ display: 'grid', gap: 'var(--kx-gutter)' }}>
          <SectionHeader icon="bolt" title="Viral hooks right now" description="Opening lines with the highest engagement scores this week. Steal the structure, not the words." />
          <div style={{ display: 'grid', gap: 12 }}>
            {hooks.map((hook) => (
              <div className="kx-row" key={hook.score}>
                <span aria-label={`Score ${hook.score}`} className="kx-platform" style={{ color: 'var(--kx-primary)', fontSize: 14 }}>
                  {hook.score}
                </span>
                <div className="kx-row-main">
                  <h4>{hook.text}</h4>
                  <p>{hook.meta}</p>
                </div>
                <a aria-label="Use this hook" className="kx-btn is-secondary is-sm" href={`/content-generator?topic=${encodeURIComponent(hook.text)}`}>
                  <Icon name="east" /> Use Hook
                </a>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gap: 'var(--kx-gutter)' }}>
          <Card icon="sentiment_satisfied" title="Market Sentiment" compact>
            <div className="kx-sentiment-bar" style={{ marginBottom: 12 }}>
              <span style={{ width: '60%' }} />
              <span style={{ width: '25%' }} />
              <span style={{ width: '15%' }} />
            </div>
            <div className="kx-legend">
              <span><i style={{ background: 'var(--kx-success-dim)' }} /> 60% Positive</span>
              <span><i style={{ background: 'var(--kx-surface-variant)' }} /> 25% Neutral</span>
              <span><i style={{ background: '#e0747e' }} /> 15% Negative</span>
            </div>
          </Card>

          <Card icon="tag" title="Keyword Cloud" compact>
            <div className="kx-keyword-cloud">
              {['AI Agents', 'Short-form Video', 'Automation', 'UGC', 'Behind the Scenes', 'Zero-Click', 'Storytelling', 'Local SEO'].map((keyword) => (
                <Badge key={keyword} tone="purple">{keyword}</Badge>
              ))}
            </div>
          </Card>

          <Card icon="notifications_active" title="Automate Monitoring" compact subtitle="Get an alert when a trend matches your industry — never miss a wave.">
            <button className="kx-btn is-secondary is-sm" type="button">
              <Icon name="add_alert" /> Configure Alerts
            </button>
          </Card>
        </div>
      </div>
    </>
  );
}
