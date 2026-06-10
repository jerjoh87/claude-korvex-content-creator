'use client';

import { Icon } from '@/components/ui/kx';

export default function AppError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="kx-app kx-auth">
      <section className="kx-auth-card" style={{ textAlign: 'center' }}>
        <span className="kx-empty-icon" style={{ margin: '0 auto 16px' }}>
          <Icon name="error" />
        </span>
        <h1>Something went wrong</h1>
        <p>An unexpected error interrupted this page. Your data is safe — try again or head back to the dashboard.</p>
        <div style={{ display: 'grid', gap: 10, marginTop: 8 }}>
          <button className="kx-btn is-block" onClick={reset} type="button">
            <Icon name="refresh" /> Try Again
          </button>
          <a className="kx-btn is-secondary is-block" href="/dashboard">
            <Icon name="dashboard" /> Go to Dashboard
          </a>
        </div>
      </section>
    </main>
  );
}
