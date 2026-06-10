'use client';

import { useState } from 'react';
import { Badge, Card, Icon, PageHeader, Ring } from '../ui/kx';

const primaryColors = [
  { hex: '#00DCE6', name: 'Korvex Teal' },
  { hex: '#0A0E18', name: 'Deep Space' }
];

const accentColors = [
  { hex: '#DDB7FF', name: 'Lavender' },
  { hex: '#55F888', name: 'Signal Green' },
  { hex: '#FFD487', name: 'Amber' }
];

const sampleCaptions = [
  { tag: 'Promo', text: 'Fresh week, fresh look. 20% off your first visit — tap to book before spots fill. ✂️' },
  { tag: 'Tips', text: '3 things your stylist wishes you knew before your appointment. Save this one. 🔖' },
  { tag: 'Community', text: 'Big love to everyone who came through this weekend — you make this place what it is. 💙' }
];

const consistencyChecks = [
  { label: 'Logo uploaded', done: true },
  { label: 'Colors defined', done: true },
  { label: 'Fonts chosen', done: true },
  { label: 'Brand voice trained', done: true },
  { label: 'Sample captions approved', done: false },
  { label: 'Media style selected', done: false }
];

export type SavedBrandKit = {
  id: string;
  voice: {
    tone?: string;
    audience?: string;
    vocab?: string;
    mediaStyle?: string;
  };
};

type BrandKitBoardProps = {
  workspaceId: string | null;
  initialKit: SavedBrandKit | null;
};

export function BrandKitBoard({ workspaceId, initialKit }: BrandKitBoardProps) {
  const [kitId, setKitId] = useState<string | null>(initialKit?.id ?? null);
  const [tone, setTone] = useState(initialKit?.voice.tone ?? 'Confident, friendly, a little playful');
  const [audienceNote, setAudienceNote] = useState(initialKit?.voice.audience ?? 'Busy professionals, 25-45, who value quality and speed');
  const [vocab, setVocab] = useState(initialKit?.voice.vocab ?? 'Use: fresh, effortless, on-point. Avoid: cheap, discount-y language, jargon.');
  const [mediaStyle, setMediaStyle] = useState(initialKit?.voice.mediaStyle ?? 'Cinematic');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const score = Math.round((consistencyChecks.filter((check) => check.done).length / consistencyChecks.length) * 100);

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(''), 3200);
  }

  async function saveKit() {
    if (saving) return;
    if (!workspaceId) {
      notify('Saved on this device — log in to sync it to your workspace.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        workspace_id: workspaceId,
        colors: [...primaryColors.map((c) => ({ ...c, group: 'primary' })), ...accentColors.map((c) => ({ ...c, group: 'accent' }))],
        fonts: [
          { role: 'headings', font: 'Inter Bold' },
          { role: 'body', font: 'Inter Regular' }
        ],
        // Voice settings live in the guidelines text column as JSON.
        guidelines: JSON.stringify({ tone, audience: audienceNote, vocab, mediaStyle })
      };
      const response = await fetch(kitId ? `/api/brand-kit/${kitId}` : '/api/brand-kit', {
        method: kitId ? 'PATCH' : 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = (await response.json()) as { data?: { id?: string }; error?: string };
      if (!response.ok || json.error) {
        notify(json.error ?? 'Could not save — please try again.');
      } else {
        if (json.data?.id) setKitId(json.data.id);
        notify('Brand kit saved — new content will match it.');
      }
    } catch {
      notify('Could not save — check your connection and try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Brand Kit"
        icon="palette"
        description="Your brand's look and voice, all in one place. Everything the AI creates — posts, images, captions — follows what you set here."
        actions={
          <>
            <button className="kx-btn is-secondary" onClick={() => notify('Preparing your asset bundle...')} type="button">
              <Icon name="folder_zip" /> Export Assets
            </button>
            <button className="kx-btn" disabled={saving} onClick={saveKit} type="button">
              {saving ? <span className="kx-spinner" /> : <Icon name="save" />}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </>
        }
      />

      <div className="kx-split is-reverse">
        {/* Consistency score */}
        <Card icon="verified" title="Brand Consistency Score" subtitle="How complete and consistent your brand kit is. Higher score = more on-brand AI content.">
          <div style={{ alignItems: 'center', display: 'flex', gap: 22, marginBottom: 16 }}>
            <Ring label="/ 100" size={104} value={score} />
            <div>
              <Badge tone={score >= 80 ? 'green' : 'gold'} icon={score >= 80 ? 'check_circle' : 'pending'}>
                {score >= 80 ? 'Looking sharp' : 'Almost there'}
              </Badge>
              <p className="kx-help" style={{ margin: '10px 0 0' }}>
                Finish the unchecked items below to reach 100.
              </p>
            </div>
          </div>
          <div style={{ display: 'grid', gap: 8 }}>
            {consistencyChecks.map((check) => (
              <div className="kx-meter-row" key={check.label}>
                <span style={{ alignItems: 'center', display: 'inline-flex', gap: 8 }}>
                  <Icon className="kx-icon" name={check.done ? 'check_circle' : 'radio_button_unchecked'} filled={check.done} />
                  {check.label}
                </span>
                {check.done ? <Badge tone="green">Done</Badge> : <Badge tone="gold">To do</Badge>}
              </div>
            ))}
          </div>
        </Card>

        <div style={{ display: 'grid', gap: 'var(--kx-gutter)' }}>
          {/* Logos */}
          <Card
            icon="diamond"
            title="Brand Logos"
            headActions={
              <button className="kx-btn is-secondary is-sm" onClick={() => notify('Choose a PNG or SVG to upload')} type="button">
                <Icon name="upload" /> Upload New
              </button>
            }
          >
            <div className="kx-grid-3" style={{ gap: 14 }}>
              <div style={{ display: 'grid', gap: 8 }}>
                <div style={{ alignItems: 'center', background: '#0a0e18', border: '1px solid var(--kx-border)', borderRadius: 8, display: 'flex', justifyContent: 'center', minHeight: 110 }}>
                  <span className="kx-logo-mark"><Icon name="auto_awesome" filled /></span>
                </div>
                <small className="kx-help">Primary (Dark)</small>
              </div>
              <div style={{ display: 'grid', gap: 8 }}>
                <div style={{ alignItems: 'center', background: '#e8ecf5', border: '1px solid var(--kx-border)', borderRadius: 8, display: 'flex', justifyContent: 'center', minHeight: 110 }}>
                  <span className="kx-logo-mark" style={{ background: '#0a0e18', color: '#00dce6' }}><Icon name="auto_awesome" filled /></span>
                </div>
                <small className="kx-help">Primary (Light)</small>
              </div>
              <button className="kx-upload-tile" onClick={() => notify('Drop an SVG or PNG here')} type="button">
                <Icon name="add_photo_alternate" />
                Drag logo here
                <span style={{ fontSize: 11, opacity: 0.7 }}>SVG or PNG, up to 5 MB</span>
              </button>
            </div>
          </Card>

          {/* Colors */}
          <Card icon="colors" title="Color Palette" subtitle="These colors are used in your AI-generated images and templates.">
            <div style={{ display: 'grid', gap: 16 }}>
              <div>
                <span className="kx-label" style={{ marginBottom: 8 }}>Primary Brand Colors</span>
                <div className="kx-swatch-row" style={{ marginTop: 8 }}>
                  {primaryColors.map((color) => (
                    <div className="kx-swatch" key={color.hex}>
                      <div style={{ background: color.hex }} />
                      <small>{color.hex}</small>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <span className="kx-label" style={{ marginBottom: 8 }}>Secondary & Accents</span>
                <div className="kx-swatch-row" style={{ marginTop: 8 }}>
                  {accentColors.map((color) => (
                    <div className="kx-swatch" key={color.hex}>
                      <div style={{ background: color.hex }} />
                      <small>{color.hex}</small>
                    </div>
                  ))}
                  <button className="kx-upload-tile" onClick={() => notify('Pick a new accent color')} style={{ minHeight: 0 }} type="button">
                    <Icon name="add" /> Add color
                  </button>
                </div>
              </div>
            </div>
          </Card>

          {/* Typography */}
          <Card icon="text_fields" title="Typography">
            <div className="kx-grid-2" style={{ gap: 14 }}>
              {[
                { role: 'Headings', font: 'Inter Bold', sample: 'Aa Bb Cc', weight: 700 },
                { role: 'Body Text', font: 'Inter Regular', sample: 'Aa Bb Cc', weight: 400 }
              ].map((entry) => (
                <div key={entry.role} style={{ alignItems: 'center', background: 'rgb(255 255 255 / 3%)', border: '1px solid var(--kx-border)', borderRadius: 8, display: 'flex', gap: 14, justifyContent: 'space-between', padding: '14px 16px' }}>
                  <div>
                    <small style={{ color: 'var(--kx-text-faint)', display: 'block', fontSize: 11.5, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{entry.role}</small>
                    <strong style={{ color: 'var(--kx-text)', fontSize: 15 }}>{entry.font}</strong>
                  </div>
                  <span style={{ color: 'var(--kx-primary-pale)', fontSize: 24, fontWeight: entry.weight }}>{entry.sample}</span>
                  <button className="kx-btn is-ghost is-sm" onClick={() => notify('Font picker coming right up')} type="button">
                    Change
                  </button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <div className="kx-grid-2">
        {/* AI Brand Voice */}
        <Card variant="ai" icon="record_voice_over" title="AI Brand Voice" subtitle="Teach the AI how you talk. It uses this on every caption and reply.">
          <div style={{ display: 'grid', gap: 16 }}>
            <div className="kx-field">
              <label className="kx-label" htmlFor="bk-tone">Tone of Voice</label>
              <input className="kx-input" id="bk-tone" onChange={(event) => setTone(event.target.value)} value={tone} />
            </div>
            <div className="kx-field">
              <label className="kx-label" htmlFor="bk-audience">Target Audience</label>
              <input className="kx-input" id="bk-audience" onChange={(event) => setAudienceNote(event.target.value)} value={audienceNote} />
            </div>
            <div className="kx-field">
              <label className="kx-label" htmlFor="bk-vocab">Words to Use / Avoid</label>
              <textarea className="kx-textarea" id="bk-vocab" onChange={(event) => setVocab(event.target.value)} style={{ minHeight: 84 }} value={vocab} />
            </div>
            <button className="kx-btn" disabled={saving} onClick={saveKit} type="button">
              <Icon name="model_training" /> {saving ? 'Saving...' : 'Train AI Voice'}
            </button>
          </div>
        </Card>

        <div style={{ display: 'grid', gap: 'var(--kx-gutter)' }}>
          {/* Sample captions */}
          <Card icon="chat" title="Sample Captions" subtitle="Approved examples the AI imitates. Swap them anytime.">
            <div style={{ display: 'grid', gap: 10 }}>
              {sampleCaptions.map((caption) => (
                <div className="kx-row" key={caption.tag} style={{ padding: '12px 14px' }}>
                  <Badge tone="cyan">{caption.tag}</Badge>
                  <div className="kx-row-main">
                    <p style={{ WebkitLineClamp: 3 }}>{caption.text}</p>
                  </div>
                  <button aria-label={`Edit ${caption.tag} caption`} className="kx-icon-btn" onClick={() => notify('Opening caption editor')} type="button">
                    <Icon name="edit" />
                  </button>
                </div>
              ))}
            </div>
          </Card>

          {/* Media style */}
          <Card icon="movie_filter" title="Media Style" subtitle="The default look for AI-generated images and videos.">
            <div className="kx-chip-row">
              {['Cinematic', 'Minimal', 'Bold & Bright', 'Warm Film', 'Hyper-real'].map((style) => (
                <button className={`kx-chip${mediaStyle === style ? ' is-selected' : ''}`} key={style} onClick={() => setMediaStyle(style)} type="button">
                  {style}
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {toast ? (
        <div className="kx-toast" role="status">
          <Icon name="check_circle" filled /> {toast}
        </div>
      ) : null}
    </>
  );
}
