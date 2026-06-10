import styles from './landing.module.css';

const setupItems = [
  ['Business Type', 'Barber Shop'],
  ['Campaign Objective', 'Sell More Cuts'],
  ['Offer / Promotion', '20% Off First Haircut'],
  ['Platforms', 'IG / TikTok / Facebook'],
  ['Duration', '7 Days'],
  ['Tone', 'Bold & Confident'],
];

const sidebarItems = [
  'Dashboard',
  'Business Profile',
  'Content Generator',
  'AI Campaigns',
  'Content Calendar',
  'Scheduled Posts',
  'Social Accounts',
  'Analytics',
  'AI Growth Coach',
  'Brand Kit',
];

const features = [
  ['CM', 'Campaign Generator', 'Turn an offer, audience, and business type into a complete content campaign.'],
  ['WP', 'Weekly Planner', 'Map high-intent content across the week with timing, objective, and CTA logic.'],
  ['BB', 'AI Business Brain', 'Keep brand voice, services, customer signals, and best angles available everywhere.'],
  ['PS', 'Performance Signals', 'See what deserves more attention before the next content cycle starts.'],
];

function cx(...names: string[]) {
  return names.map((name) => styles[name]).join(' ');
}

export default function Home() {
  return (
    <main className={styles.landing}>
      <div className={styles.dots} aria-hidden="true" />
      <div className={styles.glow} aria-hidden="true" />

      <header className={styles.nav}>
        <div className={cx('wrap', 'navInner')}>
          <a className={styles.brand} href="/">
            <span className={styles.mark}>K</span>
            <span>Content OS</span>
          </a>
          <nav className={styles.links} aria-label="Landing navigation">
            <a href="#features">Features</a>
            <a href="#features">Industries</a>
            <a href="#showcase">Showcase</a>
            <a href="/auth/signup">Pricing</a>
          </nav>
          <div className={styles.navActions}>
            <a href="/auth/login">Login</a>
            <a className={cx('button', 'primary')} href="/auth/demo">Start Free</a>
          </div>
        </div>
      </header>

      <section className={styles.hero}>
        <div className={styles.wrap}>
          <div className={styles.badge}>The new standard for creators</div>
          <h1>
            Command Your
            <span>Content Empire.</span>
          </h1>
          <p className={styles.lead}>
            The AI Marketing OS that transforms complex creative workflows into a streamlined,
            high-performance command center. Generate, schedule, and analyze with unprecedented precision.
          </p>
          <div className={styles.heroActions}>
            <a className={cx('button', 'primary')} href="/auth/demo">Deploy AI Campaign</a>
            <a className={cx('button', 'secondary')} href="#showcase">View Demo</a>
          </div>

          <section id="showcase" className={styles.preview} aria-label="AI Campaign Generator preview">
            <div className={cx('float', 'floatLeft')}>
              <strong>+127%</strong>
              <span>Engagement Rate</span>
            </div>
            <div className={cx('float', 'floatRight')}>
              <span>Campaign Score</span>
              <strong>92 <small>/100</small></strong>
              <div className={styles.scoreBar}><span /></div>
            </div>

            <div className={styles.dashboard}>
              <aside className={styles.sidebar}>
                <div className={styles.sideBrand}>
                  <span className={styles.mark}>K</span>
                  <div>
                    <strong>Content OS</strong>
                    <small>Marketing AI</small>
                  </div>
                </div>
                <div className={styles.sideList}>
                  {sidebarItems.map((item) => (
                    <div key={item} className={item === 'AI Campaigns' ? styles.active : undefined}>{item}</div>
                  ))}
                </div>
              </aside>

              <div className={styles.dashboardMain}>
                <div className={styles.dashboardTop}>
                  <div className={styles.titleRow}>
                    <span className={styles.iconbox}>AI</span>
                    <div>
                      <h2>AI Campaign Generator</h2>
                      <p>Generate complete marketing campaigns in seconds with AI</p>
                    </div>
                  </div>
                  <div className={styles.miniActions}>
                    <span>Save Campaign</span>
                    <span className={styles.hot}>Generate Campaign</span>
                  </div>
                </div>

                <div className={styles.setup}>
                  <div className={styles.panelLabel}>Campaign Setup</div>
                  <div className={styles.setupGrid}>
                    {setupItems.map(([label, value]) => (
                      <div key={label} className={styles.field}>
                        <small>{label}</small>
                        <strong>{value}</strong>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={styles.campaignGrid}>
                  <div className={styles.campaignCard}>
                    <div className={styles.panelLabel}>AI Generated Campaign</div>
                    <div className={styles.campaignMain}>
                      <div className={styles.poster}>
                        <strong>Your Best Cut Awaits</strong>
                        <span>Book Now</span>
                      </div>
                      <div className={styles.campaignCopy}>
                        <small>AI Campaign</small>
                        <h3>Fresh Cut. Fresh Start.</h3>
                        <p>A 7-day campaign built for weekend bookings, first-time client interest, and local brand trust.</p>
                        <div className={styles.metrics}>
                          <div><small>Est. Reach</small><strong>12.5K</strong></div>
                          <div><small>Engagement</small><strong>8.6%</strong></div>
                          <div><small>Lead Potential</small><strong>32</strong></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={styles.summary}>
                    <div className={styles.panelLabel}>Campaign Summary</div>
                    <div className={styles.score}>92</div>
                    <h4>Excellent Campaign</h4>
                    <p>This campaign is optimized for conversion and local demand.</p>
                    <ul>
                      <li>Strategy aligned</li>
                      <li>Content hook strong</li>
                      <li>Offer time-sensitive</li>
                      <li>CTA clear</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </section>

      <section id="features" className={styles.features}>
        <div className={styles.wrap}>
          <div className={styles.sectionTitle}>
            <p>Features</p>
            <h2>Everything a content team needs in one operating system</h2>
            <span>The core modules move from strategy to finished campaign without bouncing between disconnected tools.</span>
          </div>
          <div className={styles.featureGrid}>
            {features.map(([glyph, title, description]) => (
              <article key={title} className={styles.featureCard}>
                <div>{glyph}</div>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={cx('wrap', 'footerInner')}>
          <a className={styles.brand} href="/">
            <span className={styles.mark}>K</span>
            <span>Content OS</span>
          </a>
          <div>
            <a href="/auth/login">Privacy Policy</a>
            <a href="/auth/login">Terms of Service</a>
            <a href="/auth/login">Cookie Policy</a>
            <a href="/auth/login">Support</a>
          </div>
          <p>(c) 2026 AI Content Creator OS.</p>
        </div>
      </footer>
    </main>
  );
}
