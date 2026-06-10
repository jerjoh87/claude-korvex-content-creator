import type { ReactNode } from 'react';

/*
  Korvex UI primitives — server-component friendly (no hooks).
  Visual language follows the "AI Content OS Dashboard" Stitch design system.
  Styles live in app/korvex-ui.css (kx-* classes).
*/

export function Icon({ name, filled, className }: { name: string; filled?: boolean; className?: string }) {
  return (
    <span aria-hidden="true" className={`kx-icon${filled ? ' is-filled' : ''}${className ? ` ${className}` : ''}`}>
      {name}
    </span>
  );
}

type PageHeaderProps = {
  title: string;
  description: string;
  icon?: string;
  badge?: ReactNode;
  actions?: ReactNode;
};

export function PageHeader({ title, description, icon, badge, actions }: PageHeaderProps) {
  return (
    <header className="kx-page-header">
      <div>
        <h1>
          {icon ? <Icon name={icon} filled /> : null}
          {title}
          {badge}
        </h1>
        <p>{description}</p>
      </div>
      {actions ? <div className="kx-page-header-actions">{actions}</div> : null}
    </header>
  );
}

type SectionHeaderProps = {
  title: string;
  icon?: string;
  description?: string;
  actions?: ReactNode;
};

export function SectionHeader({ title, icon, description, actions }: SectionHeaderProps) {
  return (
    <div className="kx-section-header">
      <h2>
        {icon ? <Icon name={icon} /> : null}
        {title}
      </h2>
      {actions}
      {description ? <p>{description}</p> : null}
    </div>
  );
}

type CardProps = {
  children: ReactNode;
  title?: string;
  icon?: string;
  subtitle?: string;
  headActions?: ReactNode;
  variant?: 'default' | 'ai';
  hoverable?: boolean;
  compact?: boolean;
  className?: string;
};

export function Card({ children, title, icon, subtitle, headActions, variant = 'default', hoverable, compact, className }: CardProps) {
  const classes = [
    'kx-card',
    variant === 'ai' ? 'is-ai' : '',
    hoverable ? 'is-hoverable' : '',
    compact ? 'is-compact' : '',
    className ?? ''
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <section className={classes}>
      {title ? (
        <div className="kx-card-head">
          <h3 className="kx-card-title">
            {icon ? <Icon name={icon} /> : null}
            {title}
          </h3>
          {headActions}
        </div>
      ) : null}
      {subtitle ? <p className="kx-card-sub">{subtitle}</p> : null}
      {children}
    </section>
  );
}

type StatCardProps = {
  label: string;
  value: ReactNode;
  note?: string;
  delta?: string;
  deltaDirection?: 'up' | 'down';
  icon?: string;
};

export function StatCard({ label, value, note, delta, deltaDirection = 'up', icon }: StatCardProps) {
  return (
    <article className="kx-stat">
      <span className="kx-stat-label">
        {label}
        {icon ? <Icon name={icon} /> : null}
      </span>
      <span className="kx-stat-value">
        {value}{' '}
        {delta ? <span className={`kx-delta ${deltaDirection === 'up' ? 'is-up' : 'is-down'}`}>{delta}</span> : null}
      </span>
      {note ? <span className="kx-stat-note">{note}</span> : null}
    </article>
  );
}

export type BadgeTone = 'neutral' | 'cyan' | 'green' | 'gold' | 'red' | 'purple';

export function Badge({ tone = 'neutral', icon, dot, pulsing, children }: { tone?: BadgeTone; icon?: string; dot?: boolean; pulsing?: boolean; children: ReactNode }) {
  return (
    <span className={`kx-badge${tone === 'neutral' ? '' : ` is-${tone}`}`}>
      {dot ? <span className={`kx-dot${pulsing ? ' is-pulsing' : ''}`} /> : null}
      {icon ? <Icon name={icon} /> : null}
      {children}
    </span>
  );
}

type EmptyStateProps = {
  icon: string;
  title: string;
  description: string;
  action?: ReactNode;
};

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="kx-empty">
      <span className="kx-empty-icon">
        <Icon name={icon} />
      </span>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}

export function ProgressBar({ value, green }: { value: number; green?: boolean }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div aria-valuemax={100} aria-valuemin={0} aria-valuenow={clamped} className={`kx-progress${green ? ' is-green' : ''}`} role="progressbar">
      <span style={{ width: `${clamped}%` }} />
    </div>
  );
}

export function Ring({ value, size = 96, label }: { value: number; size?: number; label?: string }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <span className="kx-ring" style={{ ['--ring-value' as string]: clamped, ['--ring-size' as string]: `${size}px` }}>
      <span style={{ display: 'grid', justifyItems: 'center' }}>
        <strong>{clamped}</strong>
        {label ? <small>{label}</small> : null}
      </span>
    </span>
  );
}
