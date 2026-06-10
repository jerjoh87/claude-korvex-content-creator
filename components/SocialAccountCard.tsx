import { platformConfig } from '../lib/social/config';
import type { SocialAccountCard as AccountCard, SocialPlatform } from '../lib/social/types';
import { DisconnectButton } from './DisconnectButton';
import { Badge, Icon } from './ui/kx';

type Props = {
  platform: SocialPlatform;
  account?: AccountCard;
};

function formatDate(value?: string | null) {
  if (!value) return 'Not connected yet';
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
}

export function SocialAccountCard({ platform, account }: Props) {
  const config = platformConfig[platform];
  const connected = account?.status === 'connected';
  const tokenExpired = account?.token_status === 'expired';

  return (
    <article className="kx-card is-hoverable" style={{ display: 'grid', gap: 16 }}>
      <div style={{ alignItems: 'flex-start', display: 'flex', gap: 12, justifyContent: 'space-between' }}>
        <div style={{ alignItems: 'center', display: 'flex', gap: 12 }}>
          <span className="kx-platform" style={{ color: config.color, height: 44, width: 44 }}>
            {config.short}
          </span>
          <div>
            <h3 style={{ color: 'var(--kx-text)', fontSize: 17, fontWeight: 600, margin: 0 }}>{config.label}</h3>
            <small style={{ color: 'var(--kx-text-faint)', fontSize: 12.5 }}>
              {connected ? account?.account_handle ?? account?.account_name ?? 'Connected' : 'Not connected yet'}
            </small>
          </div>
        </div>
        {tokenExpired ? (
          <Badge tone="red" dot>Needs reconnect</Badge>
        ) : connected ? (
          <Badge tone="green" dot pulsing>Connected</Badge>
        ) : (
          <Badge tone="neutral" dot>Not connected</Badge>
        )}
      </div>

      {connected ? (
        <div style={{ display: 'grid', gap: 8 }}>
          <div className="kx-meter-row">
            <span>Account</span>
            <b>{account?.account_name ?? '—'}</b>
          </div>
          <div className="kx-meter-row">
            <span>Last connected</span>
            <b>{formatDate(account?.updated_at)}</b>
          </div>
          <div className="kx-meter-row">
            <span>Auto-posting</span>
            <b>
              {account?.auto_posting_status === 'available' ? (
                <Badge tone="green">On</Badge>
              ) : (
                <Badge tone="gold">Waiting for approval</Badge>
              )}
            </b>
          </div>
        </div>
      ) : (
        <p className="kx-card-sub" style={{ margin: 0 }}>
          Connect your {config.label} account so Korvex can prepare and publish posts for you. It takes about 30 seconds.
        </p>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <a className={`kx-btn is-sm${connected && !tokenExpired ? ' is-secondary' : ''}`} href={`/api/social/oauth/${platform}`}>
          <Icon name={connected ? 'sync' : 'link'} />
          {tokenExpired ? 'Reconnect' : connected ? 'Refresh Connection' : 'Connect'}
        </a>
        {connected && account ? <DisconnectButton accountId={account.id} /> : null}
      </div>

      <p className="kx-help" style={{ margin: 0 }}>
        <Icon name="info" /> {config.approvalNote} Manual posting works right away.
      </p>
    </article>
  );
}
