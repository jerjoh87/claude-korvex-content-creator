import { ContentOsAppShell } from '@/components/ContentOsAppShell';
import { Badge, Card, Icon, PageHeader, StatCard } from '@/components/ui/kx';
import { getRequestWorkspaceContext } from '@/lib/social/requestContext';
import { listSocialAccounts } from '@/lib/social/repository';
import type { SocialAccountCard as AccountCard } from '@/lib/social/types';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Settings | Korvex OS',
  description: 'Your workspace, plan, and connection health.'
};

async function getAccounts(): Promise<AccountCard[]> {
  try {
    const { userId, workspaceId } = await getRequestWorkspaceContext();
    return await listSocialAccounts(userId, workspaceId);
  } catch {
    return [];
  }
}

const settingsLinks = [
  { icon: 'storefront', title: 'Business Profile', copy: 'Your business info, audience, and goals — what powers the AI.', href: '/business-profile' },
  { icon: 'palette', title: 'Brand Kit', copy: 'Logo, colors, fonts, and brand voice for every post.', href: '/brand-kit' },
  { icon: 'hub', title: 'Social Accounts', copy: 'Connect or reconnect Instagram, TikTok, LinkedIn, and more.', href: '/social/accounts' }
];

export default async function SettingsPage() {
  const accounts = await getAccounts();
  const connected = accounts.filter((account) => account.status === 'connected');
  const expired = accounts.filter((account) => account.token_status === 'expired');

  return (
    <ContentOsAppShell activeLabel="Settings" searchPlaceholder="Search settings...">
      <PageHeader
        title="Settings"
        icon="settings"
        description="Manage your workspace, plan, and connections. Most day-to-day setup lives in Business Profile and Brand Kit."
      />

      <div className="kx-stat-grid">
        <StatCard icon="check_circle" label="Connected Accounts" note="publishing-ready platforms" value={connected.length} />
        <StatCard icon="error" label="Needs Reconnect" note="expired logins to refresh" value={expired.length} />
        <StatCard icon="bolt" label="AI Credits" note="renews on the 1st" value={<>2,450</>} />
      </div>

      <div className="kx-grid-3">
        {settingsLinks.map((link) => (
          <a className="kx-card is-hoverable" href={link.href} key={link.title} style={{ display: 'grid', gap: 8 }}>
            <Icon className="kx-icon" name={link.icon} />
            <strong style={{ color: 'var(--kx-text)', fontSize: 16 }}>{link.title}</strong>
            <p style={{ color: 'var(--kx-text-faint)', fontSize: 13.5, lineHeight: 1.55, margin: 0 }}>{link.copy}</p>
            <span style={{ alignItems: 'center', color: 'var(--kx-primary)', display: 'inline-flex', fontSize: 13.5, fontWeight: 700, gap: 6 }}>
              Open <Icon name="arrow_forward" />
            </span>
          </a>
        ))}
      </div>

      <Card icon="workspace_premium" title="Plan & Billing" compact headActions={<Badge tone="purple">Premium Tier</Badge>}>
        <p className="kx-card-sub" style={{ marginBottom: 14 }}>
          You're on the Premium plan with unlimited posts and 1M monthly AI tokens. Upgrade to Pro for team seats and priority generation.
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="kx-btn is-sm" type="button">
            <Icon name="upgrade" /> Upgrade to Pro
          </button>
          <button className="kx-btn is-secondary is-sm" type="button">
            <Icon name="receipt_long" /> Billing History
          </button>
        </div>
      </Card>
    </ContentOsAppShell>
  );
}
