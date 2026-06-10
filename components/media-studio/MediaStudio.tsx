'use client';

import { useState } from 'react';
import { Badge, Card, Icon, PageHeader } from '../ui/kx';

const mediaTypes = [
  { id: 'image', label: 'Image', icon: 'image' },
  { id: 'video', label: 'Video', icon: 'movie' }
];

const ratios = ['1:1', '16:9', '9:16', '4:5'];

const styles = [
  { id: 'cinematic', label: 'Cinematic' },
  { id: 'minimal', label: 'Minimal' },
  { id: 'cyberpunk', label: 'Cyberpunk' },
  { id: 'hyperreal', label: 'Hyper-real' },
  { id: 'playful', label: 'Playful' }
];

type Generation = {
  id: number;
  title: string;
  type: string;
  ratio: string;
  art: number;
  status: 'ready' | 'generating';
  imageUrl?: string;
};

const seedGenerations: Generation[] = [
  { id: 1, title: 'Cosmic Nebula', type: 'Image', ratio: '16:9', art: 1, status: 'ready' },
  { id: 2, title: 'Neon City Intro', type: 'Video', ratio: '16:9', art: 2, status: 'ready' },
  { id: 3, title: 'Product Glow Shot', type: 'Image', ratio: '1:1', art: 3, status: 'ready' },
  { id: 4, title: 'Emerald Waves', type: 'Image', ratio: '4:5', art: 4, status: 'ready' }
];

export function MediaStudio() {
  const [prompt, setPrompt] = useState('');
  const [mediaType, setMediaType] = useState('image');
  const [ratio, setRatio] = useState('16:9');
  const [style, setStyle] = useState('cinematic');
  const [generations, setGenerations] = useState<Generation[]>(seedGenerations);
  const [generating, setGenerating] = useState(false);
  const [toast, setToast] = useState('');

  const ready = prompt.trim().length > 4;

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(''), 2600);
  }

  function generate() {
    if (!ready || generating) return;
    setGenerating(true);
    const id = Date.now();
    const title = prompt.trim().split(/\s+/).slice(0, 3).join(' ');
    setGenerations((current) => [
      { id, title: title.charAt(0).toUpperCase() + title.slice(1), type: mediaType === 'video' ? 'Video' : 'Image', ratio, art: (id % 4) + 1, status: 'generating' },
      ...current
    ]);

    const finish = (imageUrl?: string, message = 'Your new asset is ready') => {
      setGenerations((current) => current.map((item) => (item.id === id ? { ...item, status: 'ready', imageUrl } : item)));
      setGenerating(false);
      notify(message);
    };

    // Video generation has no provider yet; images go through the AI route
    // and fall back to a styled placeholder when no key is configured.
    if (mediaType === 'video') {
      window.setTimeout(() => finish(undefined, 'Video preview ready (sample mode)'), 1800);
      return;
    }

    void fetch('/api/ai/generate-media', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ prompt: prompt.trim(), ratio, style })
    })
      .then(async (response) => {
        const data = response.ok ? ((await response.json()) as { source?: string; imageUrl?: string }) : null;
        if (data?.source === 'ai' && data.imageUrl) {
          finish(data.imageUrl);
        } else {
          finish(undefined, 'Sample asset ready — add an OpenAI key for real image generation');
        }
      })
      .catch(() => finish(undefined, 'Sample asset ready — add an OpenAI key for real image generation'));
  }

  return (
    <>
      <PageHeader
        title="AI Media Studio"
        icon="perm_media"
        description="Describe the image or video you want — the AI creates it in your brand style, sized for any platform."
        badge={<Badge tone="purple" icon="auto_awesome">Creative Studio</Badge>}
      />

      <div className="kx-split">
        <div style={{ display: 'grid', gap: 'var(--kx-gutter)' }}>
          {/* Prompt builder */}
          <Card variant="ai" title="Generate New Asset" icon="brush">
            <div style={{ display: 'grid', gap: 16 }}>
              <div className="kx-field">
                <label className="kx-label" htmlFor="ms-prompt">Describe what you want to create</label>
                <textarea
                  className="kx-textarea"
                  id="ms-prompt"
                  onChange={(event) => setPrompt(event.target.value)}
                  placeholder="e.g. A barber giving a fresh fade in a moody studio, neon teal and purple lighting"
                  value={prompt}
                />
                <p className="kx-help">
                  <Icon name="lightbulb" /> Good prompts mention a <b>subject</b>, a <b>setting</b>, and a <b>mood</b> — like
                  &ldquo;iced coffee on a marble counter, bright morning light&rdquo;.
                </p>
              </div>

              <div className="kx-form-grid">
                <div className="kx-field">
                  <span className="kx-label">Type</span>
                  <div className="kx-chip-row">
                    {mediaTypes.map((item) => (
                      <button className={`kx-chip${mediaType === item.id ? ' is-selected' : ''}`} key={item.id} onClick={() => setMediaType(item.id)} type="button">
                        <Icon name={item.icon} /> {item.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="kx-field">
                  <span className="kx-label">Size / Aspect Ratio</span>
                  <div className="kx-chip-row">
                    {ratios.map((item) => (
                      <button className={`kx-chip${ratio === item ? ' is-selected' : ''}`} key={item} onClick={() => setRatio(item)} type="button">
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="kx-field">
                <span className="kx-label">Style</span>
                <div className="kx-chip-row">
                  {styles.map((item) => (
                    <button className={`kx-chip${style === item.id ? ' is-selected' : ''}`} key={item.id} onClick={() => setStyle(item.id)} type="button">
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <button className="kx-btn" disabled={!ready || generating} onClick={generate} type="button">
                {generating ? <span className="kx-spinner" /> : <Icon name="auto_awesome" filled />}
                {generating ? 'Creating your asset...' : 'Generate'}
              </button>
              {!ready ? <p className="kx-help">Write a short description above to enable Generate.</p> : null}
            </div>
          </Card>

          {/* Recent generations */}
          <Card
            title="Recent Generations"
            icon="history"
            headActions={<Badge tone="cyan">{generations.length} assets</Badge>}
          >
            <div className="kx-grid-2" style={{ gap: 16 }}>
              {generations.map((item) => (
                <div className="kx-media-tile" key={item.id}>
                  <div
                    className={`kx-media-art is-${item.art}`}
                    style={item.imageUrl ? { backgroundImage: `url(${item.imageUrl})`, backgroundPosition: 'center', backgroundSize: 'cover' } : undefined}
                  >
                    {item.status === 'generating' ? (
                      <Badge tone="gold" icon="hourglass_top">Generating...</Badge>
                    ) : (
                      <Badge tone="green" icon="check">Ready</Badge>
                    )}
                  </div>
                  <div className="kx-media-meta">
                    <div>
                      <strong>{item.title}</strong>
                      <small>
                        {item.type} • {item.ratio}
                      </small>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button aria-label={`Download ${item.title}`} className="kx-icon-btn" onClick={() => notify('Download started')} type="button">
                        <Icon name="download" />
                      </button>
                      <button aria-label={`Reuse prompt for ${item.title}`} className="kx-icon-btn" onClick={() => notify('Prompt loaded into the builder')} type="button">
                        <Icon name="replay" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Magic editor */}
        <Card
          title="Magic Editor"
          icon="wand_stars"
          headActions={<Badge tone="purple">Beta</Badge>}
          subtitle="Pick any generated asset to enhance it without leaving the studio."
        >
          <div style={{ display: 'grid', gap: 18 }}>
            <div className="kx-field">
              <span className="kx-label">AI Upscale</span>
              <div className="kx-chip-row">
                <button className="kx-chip" onClick={() => notify('Upscaling at 2x')} type="button">
                  <Icon name="zoom_in" /> 2x Standard
                </button>
                <button className="kx-chip" onClick={() => notify('Upscaling at 4x')} type="button">
                  <Icon name="zoom_in" /> 4x Ultra
                </button>
              </div>
            </div>
            <div className="kx-field">
              <span className="kx-label">Smart Filters</span>
              <div className="kx-chip-row">
                {['Cinematic', 'Cyberpunk', 'Hyper-real', 'Warm Film'].map((filter) => (
                  <button className="kx-chip" key={filter} onClick={() => notify(`${filter} filter applied`)} type="button">
                    {filter}
                  </button>
                ))}
              </div>
            </div>
            <hr className="kx-divider" />
            <p className="kx-help">
              <Icon name="info" /> Tip: generate a 9:16 version of your best image to reuse it as a Story or Reel cover.
            </p>
          </div>
        </Card>
      </div>

      {toast ? (
        <div className="kx-toast" role="status">
          <Icon name="check_circle" filled /> {toast}
        </div>
      ) : null}
    </>
  );
}
