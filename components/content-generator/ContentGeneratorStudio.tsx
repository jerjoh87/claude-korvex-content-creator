'use client';

import { useMemo, useState } from 'react';
import { Badge, Card, EmptyState, Icon, PageHeader, Ring } from '../ui/kx';

const goals = [
  { id: 'sell', label: 'Sell something', icon: 'sell' },
  { id: 'grow', label: 'Grow followers', icon: 'trending_up' },
  { id: 'engage', label: 'Start conversations', icon: 'forum' },
  { id: 'teach', label: 'Teach or share tips', icon: 'school' }
];

const platforms = [
  { id: 'instagram', label: 'Instagram', icon: 'photo_camera' },
  { id: 'tiktok', label: 'TikTok', icon: 'music_note' },
  { id: 'facebook', label: 'Facebook', icon: 'thumb_up' },
  { id: 'linkedin', label: 'LinkedIn', icon: 'work' },
  { id: 'x', label: 'X / Twitter', icon: 'tag' },
  { id: 'youtube', label: 'YouTube Shorts', icon: 'play_circle' }
];

const contentTypes = [
  { id: 'post', label: 'Post / Caption', icon: 'article' },
  { id: 'reel', label: 'Reel / Video Script', icon: 'movie' },
  { id: 'story', label: 'Story', icon: 'amp_stories' },
  { id: 'carousel', label: 'Carousel', icon: 'view_carousel' }
];

export type TextModelChoice = {
  id: string;
  label: string;
  note: string;
  available: boolean;
};

type Variant = {
  angle: string;
  hook: string;
  body: string[];
  hashtags: string;
  score: number;
};

type DraftResult = {
  variants: Variant[];
  source: 'ai' | 'demo';
  personalized: boolean;
};

function buildDemoVariants(goal: string, platform: string, type: string, topic: string): DraftResult {
  const cleanTopic = topic.trim().replace(/\.$/, '');
  const platformLabel = platforms.find((item) => item.id === platform)?.label ?? 'social';
  const tagSets: Record<string, string> = {
    instagram: '#instagood #reels #smallbusiness',
    tiktok: '#fyp #tiktokmademebuyit #smallbusiness',
    facebook: '#community #local #smallbusiness',
    linkedin: '#growth #marketing #entrepreneurship',
    x: '#marketing #buildinpublic',
    youtube: '#shorts #howto'
  };
  const hashtags = tagSets[platform] ?? '#content';
  const typeBoost = type === 'reel' ? 6 : type === 'carousel' ? 4 : 0;
  const topicBoost = Math.min(10, Math.floor(cleanTopic.length / 6));
  const base = 72 + typeBoost + topicBoost;

  const variants: Variant[] = [
    {
      angle: 'Bold & Direct',
      hook: `Stop scrolling — ${cleanTopic || 'this is the sign you were waiting for'}. 👀`,
      body: [
        `We made it ridiculously easy: ${cleanTopic || 'one simple step and you’re in'}.`,
        'Spots are limited and they go fast — when they’re gone, they’re gone.',
        'Tap the link, lock yours in, and thank yourself later.'
      ],
      hashtags,
      score: base + 2
    },
    {
      angle: 'Story-Driven',
      hook: `Most people get this wrong about ${cleanTopic.toLowerCase() || 'growing online'}. Here's the truth:`,
      body: [
        `Here’s what actually works on ${platformLabel}: show up consistently, lead with value, and make the first 2 seconds count.`,
        cleanTopic ? `${cleanTopic} is your unfair advantage — most of your competitors aren’t talking about it.` : 'Consistency beats perfection, every single week.',
        'Save this for your next posting day. 🔖'
      ],
      hashtags,
      score: base
    },
    {
      angle: 'Question Hook',
      hook: `Hot take: ${cleanTopic || 'your audience wants more from you'}. Agree or disagree? 👇`,
      body: [
        'We keep hearing both sides of this, so let’s settle it in the comments.',
        cleanTopic ? `Our take: ${cleanTopic} matters more than people admit.` : 'Our take: showing up beats going viral.',
        'Drop a 🔥 if you agree — or tell us why we’re wrong.'
      ],
      hashtags,
      score: base - 3
    }
  ];

  return { variants: variants.sort((a, b) => b.score - a.score), source: 'demo', personalized: false };
}

type DraftRequest = {
  goal: string;
  platform: string;
  type: string;
  topic: string;
  model: string;
  trendContext: string;
};

async function requestDraft(params: DraftRequest): Promise<DraftResult> {
  try {
    const response = await fetch('/api/ai/generate-post', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        goal: params.goal,
        platform: params.platform,
        contentType: params.type,
        topic: params.topic,
        model: params.model,
        trendContext: params.trendContext || undefined
      })
    });
    if (response.ok) {
      const data = (await response.json()) as { source?: 'ai' | 'demo'; variants?: Variant[]; personalized?: boolean };
      if (data.source === 'ai' && Array.isArray(data.variants) && data.variants.length > 0) {
        return { variants: data.variants, source: 'ai', personalized: Boolean(data.personalized) };
      }
    }
  } catch {
    // Network/API problems fall through to the local demo template.
  }
  return buildDemoVariants(params.goal, params.platform, params.type, params.topic);
}

type ContentGeneratorStudioProps = {
  initialTopic: string;
  initialContext: string;
  workspaceId: string | null;
  models: TextModelChoice[];
};

export function ContentGeneratorStudio({ initialTopic, initialContext, workspaceId, models }: ContentGeneratorStudioProps) {
  const [goal, setGoal] = useState('');
  const [platform, setPlatform] = useState('');
  const [contentType, setContentType] = useState('');
  const [topic, setTopic] = useState(initialTopic);
  const [model, setModel] = useState(models.find((m) => m.available)?.id ?? 'auto');
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<DraftResult | null>(null);
  const [variantIndex, setVariantIndex] = useState(0);
  const [savedContentId, setSavedContentId] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<'save' | 'schedule' | null>(null);
  const [toast, setToast] = useState('');

  const stepsDone = useMemo(
    () => [goal !== '', platform !== '', contentType !== '', topic.trim().length > 2],
    [goal, platform, contentType, topic]
  );
  const ready = stepsDone.every(Boolean);
  const current = result?.variants[variantIndex] ?? null;

  function generate() {
    if (!ready || generating) return;
    setGenerating(true);
    setResult(null);
    setVariantIndex(0);
    setSavedContentId(null);
    void requestDraft({ goal, platform, type: contentType, topic, model, trendContext: initialContext }).then((draft) => {
      setResult(draft);
      setGenerating(false);
    });
  }

  function selectVariant(index: number) {
    setVariantIndex(index);
    setSavedContentId(null);
  }

  function draftAsText(draft: Variant) {
    return `${draft.hook}\n\n${draft.body.join('\n\n')}\n\n${draft.hashtags}`;
  }

  async function persistDraft(draft: Variant): Promise<string | null> {
    if (savedContentId) return savedContentId;
    const response = await fetch('/api/generated-content', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        workspace_id: workspaceId,
        prompt: topic,
        content: draftAsText(draft),
        content_type: contentType || 'post',
        metadata: {
          goal,
          platform,
          score: draft.score,
          angle: draft.angle,
          source: result?.source ?? 'demo',
          personalized: result?.personalized ?? false,
          model,
          hook: draft.hook
        }
      })
    });
    const json = (await response.json()) as { data?: { id?: string }; error?: string };
    if (!response.ok || !json.data?.id) return null;
    setSavedContentId(json.data.id);
    return json.data.id;
  }

  async function saveToLibrary() {
    if (!current || busyAction) return;
    if (!workspaceId) {
      notify('Draft copied locally — log in to save it to your library.');
      return;
    }
    setBusyAction('save');
    try {
      const id = await persistDraft(current);
      notify(id ? 'Saved to your library' : 'Could not save — please try again.');
    } catch {
      notify('Could not save — check your connection and try again.');
    } finally {
      setBusyAction(null);
    }
  }

  async function scheduleDraft() {
    if (!current || busyAction || !workspaceId) return;
    setBusyAction('schedule');
    try {
      const contentId = await persistDraft(current);
      if (!contentId) {
        notify('Could not schedule — saving the draft failed.');
        return;
      }
      const tomorrowNine = new Date();
      tomorrowNine.setDate(tomorrowNine.getDate() + 1);
      tomorrowNine.setHours(9, 0, 0, 0);
      const response = await fetch('/api/scheduled-posts', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          workspace_id: workspaceId,
          generated_content_id: contentId,
          scheduled_for: tomorrowNine.toISOString(),
          status: 'scheduled',
          metadata: { platform, title: current.hook, excerpt: current.body[0] ?? '' }
        })
      });
      const json = (await response.json()) as { error?: string };
      notify(!response.ok || json.error ? json.error ?? 'Could not schedule — please try again.' : 'Scheduled for tomorrow 9:00 AM — see Scheduled Posts.');
    } catch {
      notify('Could not schedule — check your connection and try again.');
    } finally {
      setBusyAction(null);
    }
  }

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(''), 2600);
  }

  async function copyResult() {
    if (!current) return;
    await navigator.clipboard.writeText(draftAsText(current));
    notify('Copied to clipboard');
  }

  const selectedModel = models.find((m) => m.id === model);

  return (
    <>
      <PageHeader
        title="Content Generator"
        icon="auto_awesome"
        description="Answer four quick questions and the AI writes three ready-to-post drafts for you. No blank pages, no guesswork."
        badge={<Badge tone="cyan" dot pulsing>AI Ready</Badge>}
      />

      {initialContext ? (
        <Card compact>
          <p className="kx-help" style={{ margin: 0 }}>
            <Icon name="radar" /> <b style={{ color: 'var(--kx-text)' }}>Riding a trend:</b> {initialContext}
          </p>
        </Card>
      ) : null}

      <div className="kx-split">
        {/* Guided builder */}
        <Card>
          <div className="kx-steps" style={{ marginBottom: 22 }}>
            {['Goal', 'Platform', 'Type', 'Topic'].map((label, index) => (
              <span className={`kx-step${stepsDone[index] ? ' is-done' : ''}`} key={label}>
                <i>{stepsDone[index] ? '✓' : index + 1}</i> {label}
              </span>
            ))}
          </div>

          <div style={{ display: 'grid', gap: 22 }}>
            <div className="kx-field">
              <span className="kx-label">1. What do you want this post to do?</span>
              <div className="kx-chip-row">
                {goals.map((item) => (
                  <button className={`kx-chip${goal === item.id ? ' is-selected' : ''}`} key={item.id} onClick={() => setGoal(item.id)} type="button">
                    <Icon name={item.icon} /> {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="kx-field">
              <span className="kx-label">2. Where will you post it?</span>
              <div className="kx-chip-row">
                {platforms.map((item) => (
                  <button className={`kx-chip${platform === item.id ? ' is-selected' : ''}`} key={item.id} onClick={() => setPlatform(item.id)} type="button">
                    <Icon name={item.icon} /> {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="kx-field">
              <span className="kx-label">3. What kind of content?</span>
              <div className="kx-chip-row">
                {contentTypes.map((item) => (
                  <button className={`kx-chip${contentType === item.id ? ' is-selected' : ''}`} key={item.id} onClick={() => setContentType(item.id)} type="button">
                    <Icon name={item.icon} /> {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="kx-field">
              <label className="kx-label" htmlFor="cg-topic">4. What is it about?</label>
              <textarea
                className="kx-textarea"
                id="cg-topic"
                onChange={(event) => setTopic(event.target.value)}
                placeholder="e.g. 20% off first haircut this week only"
                style={{ minHeight: 92 }}
                value={topic}
              />
              <p className="kx-help">
                <Icon name="lightbulb" /> Keep it simple — an offer, a tip, or a question works great.
              </p>
            </div>

            <div className="kx-field">
              <label className="kx-label" htmlFor="cg-model">
                AI Model
                {selectedModel && !selectedModel.available ? <Badge tone="gold">needs key</Badge> : null}
              </label>
              <select className="kx-select" id="cg-model" onChange={(event) => setModel(event.target.value)} value={model}>
                {models.map((option) => (
                  <option disabled={!option.available} key={option.id} value={option.id}>
                    {option.label}
                    {option.available ? '' : ' — add key to enable'}
                  </option>
                ))}
              </select>
              {selectedModel ? <p className="kx-help">{selectedModel.note}</p> : null}
            </div>

            <button className="kx-btn" disabled={!ready || generating} onClick={generate} type="button">
              {generating ? <span className="kx-spinner" /> : <Icon name="auto_awesome" filled />}
              {generating ? 'Writing 3 drafts...' : 'Generate Content'}
            </button>
            {!ready ? <p className="kx-help">Finish the 4 steps above and the Generate button lights up.</p> : null}
          </div>
        </Card>

        {/* Output */}
        <div style={{ display: 'grid', gap: 'var(--kx-gutter)' }}>
          {result && current ? (
            <>
              <Card
                variant="ai"
                title="Your drafts are ready"
                icon="auto_awesome"
                headActions={<Ring label="score" size={64} value={Math.min(current.score, 99)} />}
              >
                {result.source === 'demo' ? (
                  <p className="kx-help" style={{ marginBottom: 12 }}>
                    <Icon name="info" /> Sample drafts — add an <b>OPENAI_API_KEY</b> or <b>GEMINI_API_KEY</b> to enable live AI writing.
                  </p>
                ) : null}
                {result.personalized ? (
                  <p style={{ marginBottom: 12, marginTop: 0 }}>
                    <Badge tone="green" icon="storefront">Personalized to your Business Profile</Badge>
                  </p>
                ) : null}

                {result.variants.length > 1 ? (
                  <div className="kx-chip-row" style={{ marginBottom: 16 }}>
                    {result.variants.map((variant, index) => (
                      <button
                        className={`kx-chip${index === variantIndex ? ' is-selected' : ''}`}
                        key={variant.angle + index}
                        onClick={() => selectVariant(index)}
                        type="button"
                      >
                        {variant.angle} · {Math.min(variant.score, 99)}
                      </button>
                    ))}
                  </div>
                ) : null}

                <div style={{ display: 'grid', gap: 14 }}>
                  <strong style={{ color: 'var(--kx-text)', fontSize: 17, lineHeight: 1.4 }}>{current.hook}</strong>
                  {current.body.map((paragraph) => (
                    <p key={paragraph} style={{ color: 'var(--kx-text-muted)', fontSize: 14.5, lineHeight: 1.65, margin: 0 }}>
                      {paragraph}
                    </p>
                  ))}
                  <p style={{ color: 'var(--kx-primary)', fontSize: 13.5, fontWeight: 600, margin: 0 }}>{current.hashtags}</p>
                </div>
                <hr className="kx-divider" style={{ margin: '18px 0' }} />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  <button className="kx-btn is-sm" onClick={copyResult} type="button">
                    <Icon name="content_copy" /> Copy
                  </button>
                  <button className="kx-btn is-secondary is-sm" disabled={busyAction !== null} onClick={saveToLibrary} type="button">
                    <Icon name={savedContentId ? 'bookmark_added' : 'bookmark_add'} />
                    {busyAction === 'save' ? 'Saving...' : savedContentId ? 'Saved ✓' : 'Save to Library'}
                  </button>
                  {workspaceId ? (
                    <button className="kx-btn is-secondary is-sm" disabled={busyAction !== null} onClick={scheduleDraft} type="button">
                      <Icon name="event" /> {busyAction === 'schedule' ? 'Scheduling...' : 'Schedule It'}
                    </button>
                  ) : (
                    <a className="kx-btn is-secondary is-sm" href="/calendar">
                      <Icon name="event" /> Schedule It
                    </a>
                  )}
                  <button className="kx-btn is-ghost is-sm" onClick={generate} type="button">
                    <Icon name="refresh" /> Try Again
                  </button>
                </div>
              </Card>
              <Card compact title="What happens next?" icon="route">
                <p className="kx-card-sub" style={{ margin: 0 }}>
                  Pick your favorite of the 3 angles above, then copy it, save it to your library, or hit <b>Schedule It</b> to
                  drop it on your Content Calendar.
                </p>
              </Card>
            </>
          ) : generating ? (
            <Card>
              <div style={{ display: 'grid', gap: 12 }}>
                <div className="kx-skeleton" style={{ height: 22, width: '70%' }} />
                <div className="kx-skeleton" style={{ height: 14 }} />
                <div className="kx-skeleton" style={{ height: 14 }} />
                <div className="kx-skeleton" style={{ height: 14, width: '85%' }} />
                <div className="kx-skeleton" style={{ height: 14, width: '40%' }} />
              </div>
            </Card>
          ) : (
            <EmptyState
              icon="draw"
              title="Your drafts will appear here"
              description="Pick a goal, platform, and content type on the left, tell us the topic, and press Generate. You'll get three different takes in seconds."
            />
          )}
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
