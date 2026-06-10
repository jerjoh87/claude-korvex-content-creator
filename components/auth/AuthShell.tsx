import type { ReactNode } from 'react';
import { Icon } from '../ui/kx';

type AuthShellProps = {
  title: string;
  subtitle: string;
  error?: string;
  message?: string;
  children: ReactNode;
};

export function AuthShell({ title, subtitle, error, message, children }: AuthShellProps) {
  return (
    <main className="kx-app kx-auth">
      <section className="kx-auth-card">
        <div className="kx-auth-brand">
          <span className="kx-logo-mark">
            <Icon name="auto_awesome" filled />
          </span>
          <span>
            <strong style={{ color: 'var(--kx-primary-pale)', display: 'block', fontSize: 18 }}>KORVEX OS</strong>
            <small style={{ color: 'var(--kx-text-faint)', display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
              AI Marketing OS
            </small>
          </span>
        </div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
        {message ? <p className="kx-auth-notice">{message}</p> : null}
        {error ? <p className="kx-auth-error">{error}</p> : null}
        {children}
        <p style={{ color: 'var(--kx-text-faint)', fontSize: 12, margin: '22px 0 0', textAlign: 'center' }}>
          By continuing you agree to our{' '}
          <a href="/terms" style={{ color: 'var(--kx-text-muted)', textDecoration: 'underline' }}>Terms</a> and{' '}
          <a href="/privacy" style={{ color: 'var(--kx-text-muted)', textDecoration: 'underline' }}>Privacy Policy</a>.
        </p>
      </section>
    </main>
  );
}
