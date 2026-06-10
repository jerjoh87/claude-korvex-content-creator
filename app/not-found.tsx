import { Icon } from '@/components/ui/kx';

export default function NotFound() {
  return (
    <main className="kx-app kx-auth">
      <section className="kx-auth-card" style={{ textAlign: 'center' }}>
        <span className="kx-empty-icon" style={{ margin: '0 auto 16px' }}>
          <Icon name="explore_off" />
        </span>
        <h1>Page not found</h1>
        <p>That page doesn&rsquo;t exist (or moved). Let&rsquo;s get you back to your workspace.</p>
        <div style={{ display: 'grid', gap: 10, marginTop: 8 }}>
          <a className="kx-btn is-block" href="/dashboard">
            <Icon name="dashboard" /> Go to Dashboard
          </a>
          <a className="kx-btn is-secondary is-block" href="/">
            <Icon name="home" /> Back to Home
          </a>
        </div>
      </section>
    </main>
  );
}
