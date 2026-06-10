import { ContentOsAppShell } from '@/components/ContentOsAppShell';
import { businessKits, getBusinessKit, getSectionRecommendations } from '@/lib/growth-coach/recommendations';

type GrowthCoachPageProps = {
  searchParams?: Promise<{ kit?: string }>;
};

const signalLabels = [
  'Business Type',
  'Selected Business Kit',
  'Content Performance',
  'Social Connections',
  'Weekly Planner',
  'Campaign History',
  'Generated Content',
  'Media Library',
  'Template Usage'
];

const badgeList = (items: string[]) => (
  <div className="badge-list">
    {items.map((item) => (
      <span key={item} className="insight-badge">
        {item}
      </span>
    ))}
  </div>
);

export default async function GrowthCoachPage({ searchParams }: GrowthCoachPageProps) {
  const resolvedSearchParams = await searchParams;
  const selectedKit = getBusinessKit(resolvedSearchParams?.kit);
  const sectionRecommendations = getSectionRecommendations(selectedKit);

  return (
    <ContentOsAppShell activeLabel="Analytics">
      <div className="content-os-page" style={{ display: 'grid', gap: 24 }}>
      <section className="content-os-page-hero growth-hero">
        <div className="content-os-page-kicker">AI Growth Coach 2.0</div>
        <h1>Your business advisor for the next best marketing move.</h1>
        <p>
          The coach analyzes your business type, selected kit, performance, social connections, planner, campaign history, generated content, media library, and template usage to recommend revenue-focused action.
        </p>
        <div className="hero-actions">
          <a className="demo-button" href="#recommendations">View recommendations</a>
          <a className="secondary-link" href="/schedule">Open weekly planner</a>
        </div>
      </section>

      <section className="coach-selector" aria-label="Business kit selector">
        <div>
          <div className="content-os-page-kicker">Selected Business Kit</div>
          <h2>{selectedKit.selectedKit}</h2>
          <p>{selectedKit.businessType} recommendations are active. Switch kits to preview industry-specific coaching.</p>
        </div>
        <div className="kit-switcher">
          {businessKits.map((kit) => (
            <a key={kit.id} className={kit.id === selectedKit.id ? 'active' : ''} href={`/growth-coach?kit=${kit.id}`}>
              {kit.selectedKit.replace(' Growth Kit', '')}
            </a>
          ))}
        </div>
      </section>

      <section className="signal-grid" aria-label="Analyzed business signals">
        {signalLabels.map((label) => (
          <article key={label} className="signal-card">
            <span>{label}</span>
            <strong>
              {label === 'Business Type' && selectedKit.businessType}
              {label === 'Selected Business Kit' && selectedKit.selectedKit}
              {label === 'Content Performance' && `${selectedKit.performance.bestChannel} · ${selectedKit.performance.engagementRate}`}
              {label === 'Social Connections' && `${selectedKit.socialConnections.length} signals`}
              {label === 'Weekly Planner' && `${selectedKit.weeklyPlanner.length} planned prompts`}
              {label === 'Campaign History' && `${selectedKit.campaignHistory.length} campaigns`}
              {label === 'Generated Content' && `${selectedKit.generatedContent.length} assets`}
              {label === 'Media Library' && `${selectedKit.mediaLibrary.length} libraries`}
              {label === 'Template Usage' && selectedKit.templateUsage[0]}
            </strong>
          </article>
        ))}
      </section>

      <section className="coach-context-grid">
        <article className="card coach-context-card">
          <h2>Kit assets in use</h2>
          {badgeList(selectedKit.kitIncludes)}
        </article>
        <article className="card coach-context-card">
          <h2>Performance readout</h2>
          <p><strong>Lead trend:</strong> {selectedKit.performance.leadTrend}</p>
          <p><strong>Top content:</strong> {selectedKit.performance.topContent}</p>
        </article>
        <article className="card coach-context-card">
          <h2>Planner + campaign memory</h2>
          {badgeList([...selectedKit.weeklyPlanner.slice(0, 3), ...selectedKit.campaignHistory.slice(0, 2)])}
        </article>
      </section>

      <section id="recommendations" className="growth-sections">
        {sectionRecommendations.map(({ section, recommendation }) => (
          <article key={section} className="recommendation-card">
            <div className="recommendation-header">
              <div>
                <div className="content-os-page-kicker">{section}</div>
                <h2>{recommendation.title}</h2>
              </div>
              <span className={`difficulty difficulty-${recommendation.difficulty.toLowerCase()}`}>{recommendation.difficulty}</span>
            </div>
            <p>{recommendation.description}</p>
            <dl className="recommendation-meta">
              <div>
                <dt>Reason</dt>
                <dd>{recommendation.reason}</dd>
              </div>
              <div>
                <dt>Estimated impact</dt>
                <dd>{recommendation.estimatedImpact}</dd>
              </div>
              <div>
                <dt>Recommended action</dt>
                <dd>{recommendation.recommendedAction}</dd>
              </div>
            </dl>
            <div className="recommendation-actions">
              <button type="button">Generate content</button>
              <button type="button">Generate campaign</button>
              <button className="ghost-button" type="button">Save</button>
              <button className="ghost-button" type="button">Dismiss</button>
            </div>
          </article>
        ))}
      </section>
      </div>
    </ContentOsAppShell>
  );
}
