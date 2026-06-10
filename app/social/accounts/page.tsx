import { ContentOsAppShell } from '@/components/ContentOsAppShell';
import { SocialAccountCard } from '@/components/SocialAccountCard';
import { Card, Icon, PageHeader, SectionHeader, StatCard } from '@/components/ui/kx';
import { platformOrder } from '@/lib/social/config';
import { getRequestWorkspaceContext } from '@/lib/social/requestContext';
import { listSocialAccounts } from '@/lib/social/repository';
import type { SocialAccountCard as AccountCard } from '@/lib/social/types';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Social Accounts | Korvex OS',
  description: 'Connect your social platforms so Korvex can post for you.'
};

async function getAccounts(): Promise<AccountCard[]> {
  try {
    const { userId, workspaceId } = await getRequestWorkspaceContext();
    return await listSocialAccounts(userId, workspaceId);
  } catch {
    return [];
  }
}

export default async function ConnectedAccountsPage() {
  const accounts = await getAccounts();
  const connected = accounts.filter((account) => account.status === 'connected');
  const needsAttention = accounts.filter((account) => account.token_status === 'expired');

  return (
    <ContentOsAppShell activeLabel="Social Accounts" searchPlaceholder="Search platforms...">
      <PageHeader
        title="Social Accounts"
        icon="hub"
        description="Connect your accounts once, and Korvex can prepare, schedule, and publish content everywhere. Connected accounts also unlock analytics and best-time-to-post suggestions."
      />

      <div className="kx-stat-grid">
        <StatCard icon="check_circle" label="Connected" note="ready for publishing" value={connected.length} />
        <StatCard icon="error" label="Needs Attention" note="reconnect to keep posting" value={needsAttention.length} />
        <StatCard icon="add_link" label="Available" note="platforms you can connect" value={platformOrder.length - connected.length} />
      </div>

      <SectionHeader
        icon="link"
        title="Your platforms"
        description="Green means you're good to go. If a card says “Needs reconnect”, one click fixes it."
      />

      <div className="kx-grid-3">
        {platformOrder.map((platform) => (
          <SocialAccountCard account={accounts.find((account) => account.platform === platform)} key={platform} platform={platform} />
        ))}
      </div>

      <Card title="Why connect your accounts?" icon="help" compact>
        <div className="kx-grid-3" style={{ gap: 16 }}>
          {[
            { icon: 'schedule_send', title: 'Post automatically', copy: 'Schedule once and Korvex publishes for you — no reminders, no copy-pasting.' },
            { icon: 'monitoring', title: 'See what works', copy: 'Analytics pulls real numbers from your accounts so you know what to post more of.' },
            { icon: 'verified_user', title: 'Safe & private', copy: 'We use each platform’s official login. You can disconnect any account at any time.' }
          ].map((item) => (
            <div key={item.title} style={{ display: 'grid', gap: 6 }}>
              <Icon name={item.icon} className="kx-icon" />
              <strong style={{ color: 'var(--kx-text)', fontSize: 14.5 }}>{item.title}</strong>
              <p style={{ color: 'var(--kx-text-faint)', fontSize: 13, lineHeight: 1.55, margin: 0 }}>{item.copy}</p>
            </div>
          ))}
        </div>
      </Card>
    </ContentOsAppShell>
  );
}
