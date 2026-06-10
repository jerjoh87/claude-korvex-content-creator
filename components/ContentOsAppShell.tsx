import type { ReactNode } from 'react';
import { getShellUser } from '@/lib/auth/currentUser';
import { Icon } from './ui/kx';

const navItems: Array<{ label: string; href: string; icon: string }> = [
  { label: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
  { label: 'Business Profile', href: '/business-profile', icon: 'storefront' },
  { label: 'Content Generator', href: '/content-generator', icon: 'auto_awesome' },
  { label: 'AI Media Studio', href: '/media-studio', icon: 'perm_media' },
  { label: 'AI Campaigns', href: '/prompt-library', icon: 'campaign' },
  { label: 'Content Calendar', href: '/calendar', icon: 'calendar_month' },
  { label: 'Scheduled Posts', href: '/scheduled-posts', icon: 'schedule_send' },
  { label: 'Social Accounts', href: '/social/accounts', icon: 'hub' },
  { label: 'Analytics', href: '/analytics', icon: 'monitoring' },
  { label: 'AI Trend Radar', href: '/trend-radar', icon: 'radar' },
  { label: 'Brand Kit', href: '/brand-kit', icon: 'palette' },
  { label: 'Settings', href: '/settings', icon: 'settings' },
];

type ContentOsAppShellProps = {
  activeLabel: string;
  searchPlaceholder?: string;
  children: ReactNode;
};

export async function ContentOsAppShell({ activeLabel, searchPlaceholder, children }: ContentOsAppShellProps) {
  const user = await getShellUser();
  return (
    <div className="kx-app">
      <aside className="kx-sidebar">
        <a className="kx-sidebar-brand" href="/dashboard">
          <span className="kx-logo-mark">
            <Icon name="auto_awesome" filled />
          </span>
          <span>
            <strong>KORVEX OS</strong>
            <small>AI Marketing OS</small>
          </span>
        </a>

        <nav className="kx-nav" aria-label="Main navigation">
          {navItems.map((item) => {
            const active = item.label === activeLabel;
            return (
              <a aria-current={active ? 'page' : undefined} className={active ? 'is-active' : ''} href={item.href} key={item.label}>
                <Icon name={item.icon} filled={active} />
                {item.label}
              </a>
            );
          })}
        </nav>

        <div className="kx-upgrade">
          <strong>Upgrade to Pro</strong>
          <p>Unlock unlimited campaigns, AI models, and premium features.</p>
          <a className="kx-btn is-secondary is-sm is-block" href="/settings">
            Upgrade Now
          </a>
        </div>

        <div className="kx-user">
          <span className="kx-avatar">{user.initials}</span>
          <div>
            <strong>{user.name}</strong>
            <small>{user.plan}</small>
          </div>
        </div>
      </aside>

      <div className="kx-main">
        <header className="kx-topbar">
          <label className="kx-search">
            <Icon name="search" />
            <input aria-label="Search workspace" placeholder={searchPlaceholder ?? 'Search content, campaigns, or insights...'} />
          </label>
          <div className="kx-topbar-actions">
            <span className="kx-credits">
              <Icon name="bolt" filled />
              2,450 credits
            </span>
            <button aria-label="Notifications" className="kx-icon-btn" type="button">
              <Icon name="notifications" />
            </button>
            <a aria-label="Open settings" className="kx-icon-btn" href="/settings">
              <Icon name="settings" />
            </a>
          </div>
        </header>

        <main className="kx-page">{children}</main>
      </div>
    </div>
  );
}
