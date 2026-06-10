"use client";

import { useMemo, useState } from 'react';
import { platformConfig, platformOrder } from '../lib/social/config';
import type { SocialAccountCard, SocialPlatform } from '../lib/social/types';
import { Badge, Card, Icon } from './ui/kx';

export function ManualPostingAssistant({ accounts }: { accounts: SocialAccountCard[] }) {
  const [platform, setPlatform] = useState<SocialPlatform>(accounts[0]?.platform ?? 'instagram');
  const [caption, setCaption] = useState('Launch-ready AI caption goes here. Refine tone, add CTA, then copy into the platform composer.');
  const [hashtags, setHashtags] = useState('#AIContent #CreatorOS #SocialMedia');
  const [posted, setPosted] = useState(false);
  const selected = accounts.find((account) => account.platform === platform);
  const ready = useMemo(
    () => ({
      account: Boolean(selected?.manual_posting_ready),
      caption: caption.trim().length > 0,
      media: true,
      manual: Boolean(selected?.manual_posting_ready && caption.trim().length > 0),
      auto: selected?.auto_posting_status === 'available'
    }),
    [caption, selected]
  );

  async function copyAll() {
    await navigator.clipboard.writeText(`${caption}\n\n${hashtags}`);
  }

  const checklist: Array<{ label: string; ok: boolean; okText: string; pendingText: string }> = [
    { label: 'Account connected', ok: ready.account, okText: 'Ready', pendingText: 'Needs connection' },
    { label: 'Caption written', ok: ready.caption, okText: 'Ready', pendingText: 'Draft needed' },
    { label: 'Media ready', ok: ready.media, okText: 'Ready', pendingText: 'Upload media' },
    { label: 'Manual posting', ok: ready.manual, okText: 'Ready', pendingText: 'Pending' },
    { label: 'Auto-posting', ok: ready.auto, okText: 'Available', pendingText: 'Waiting for approval' }
  ];

  return (
    <div className="kx-grid-2">
      <Card icon="edit_note" title="Prepare your post" subtitle="Pick a platform, polish the caption, then copy everything and paste it into the app.">
        <div style={{ display: 'grid', gap: 16 }}>
          <div className="kx-field">
            <label className="kx-label" htmlFor="mpa-platform">Platform</label>
            <select className="kx-select" id="mpa-platform" onChange={(event) => setPlatform(event.target.value as SocialPlatform)} value={platform}>
              {platformOrder.map((item) => (
                <option key={item} value={item}>
                  {platformConfig[item].label}
                </option>
              ))}
            </select>
          </div>
          <div className="kx-field">
            <label className="kx-label" htmlFor="mpa-caption">Caption</label>
            <textarea className="kx-textarea" id="mpa-caption" onChange={(event) => setCaption(event.target.value)} value={caption} />
          </div>
          <div className="kx-field">
            <label className="kx-label" htmlFor="mpa-hashtags">Hashtags</label>
            <textarea className="kx-textarea" id="mpa-hashtags" onChange={(event) => setHashtags(event.target.value)} style={{ minHeight: 64 }} value={hashtags} />
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <button className="kx-btn is-sm" onClick={copyAll} type="button">
              <Icon name="content_copy" /> Copy caption + hashtags
            </button>
            <a className="kx-btn is-secondary is-sm" href={platformConfig[platform].manualPostingUrl} rel="noreferrer" target="_blank">
              <Icon name="open_in_new" /> Open {platformConfig[platform].label}
            </a>
            <button className="kx-btn is-secondary is-sm" onClick={() => setPosted(true)} type="button">
              <Icon name={posted ? 'check_circle' : 'task_alt'} /> {posted ? 'Posted ✓' : 'Mark as posted'}
            </button>
          </div>
        </div>
      </Card>

      <Card icon="checklist" title="Posting readiness" subtitle="Everything green? You're ready to post.">
        <div style={{ display: 'grid', gap: 10 }}>
          {checklist.map((item) => (
            <div className="kx-meter-row" key={item.label} style={{ background: 'rgb(255 255 255 / 3%)', border: '1px solid var(--kx-border)', borderRadius: 8, padding: '12px 14px' }}>
              <span>{item.label}</span>
              <Badge tone={item.ok ? 'green' : 'gold'} icon={item.ok ? 'check' : 'hourglass_top'}>
                {item.ok ? item.okText : item.pendingText}
              </Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
