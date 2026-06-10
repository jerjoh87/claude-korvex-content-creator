import type { ReactNode } from 'react';
import { Icon } from '../ui/kx';

type LegalPageProps = {
  title: string;
  updated: string;
  children: ReactNode;
};

export function LegalPage({ title, updated, children }: LegalPageProps) {
  return (
    <main className="kx-app" style={{ padding: '48px 16px 80px' }}>
      <article style={{ margin: '0 auto', maxWidth: 760 }}>
        <a href="/" style={{ alignItems: 'center', display: 'inline-flex', gap: 10, marginBottom: 28 }}>
          <span className="kx-logo-mark">
            <Icon name="auto_awesome" filled />
          </span>
          <strong style={{ color: 'var(--kx-primary-pale)', fontSize: 17 }}>KORVEX OS</strong>
        </a>
        <h1 style={{ color: 'var(--kx-text)', fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 6px' }}>{title}</h1>
        <p style={{ color: 'var(--kx-text-faint)', fontSize: 13, margin: '0 0 32px' }}>Last updated: {updated}</p>
        <div className="kx-legal-prose">{children}</div>
        <hr className="kx-divider" style={{ margin: '36px 0 20px' }} />
        <p style={{ color: 'var(--kx-text-faint)', fontSize: 13.5 }}>
          Questions? Contact us at <a href="mailto:support@korvex.app" style={{ color: 'var(--kx-primary)' }}>support@korvex.app</a>.
          {' '}See also: <a href="/privacy" style={{ color: 'var(--kx-primary)' }}>Privacy Policy</a> ·{' '}
          <a href="/terms" style={{ color: 'var(--kx-primary)' }}>Terms of Service</a>
        </p>
      </article>
    </main>
  );
}
