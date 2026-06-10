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

type GeneratedPost = {
  hook: string;
  body: string[];
  hashtags: string;
  score: number;
  source: 'ai' | 'demo';
};

function buildPost(goal: string, platform: string, type: string, topic: string): GeneratedPost {
  const cleanTopic = topic.trim().replace(/\.$/, '');
  const platformLabel = platforms.find((item) => item.id === platform)?.label ?? 'social';
  const hooks: Record<string, string> = {
    sell: `Stop scrolling — this is the sign you were waiting for. ${cleanTopic} 👀`,
    grow: `Most people get this wrong about ${cleanTopic.toLowerCase() || 'growing online'}. Here's the truth:`,
    engage: `Hot take: ${cleanTopic || 'your audience wants more from you'}. Agree or disagree? 👇`,
    teach: `3 things nobody tells you about ${cleanTopic.toLowerCase() || 'getting started'}:`
  };
  const bodies: Record<string, string[]> = {
    sell: [
      `We made it ridiculously easy: ${cleanTopic}.`,
      'Spots are limited and they go fast — when they’re gone, they’re gone.',
      'Tap the link, lock yours in, and thank yourself later.'
    ],
    grow: [
      `Here’s what actually works on ${platformLabel}: show up consistently, lead with value, and make the first 2 seconds count.`,
      `${cleanTopic ? `${cleanTopic} is your unfair advantage — most of your competitors aren’t talking about it.` : 'Consistency beats perfection, every single week.'}`,
      'Save this for your next posting day. 🔖'
    ],
    engage: [
      `We keep hearing both sides of this, so let’s settle it in the comments.`,
      `${cleanTopic ? `Our take: ${cleanTopic} matters more than people admit.` : 'Our take: showing up beats going viral.'}`,
      'Drop a 🔥 if you agree — or tell us why we’re wrong.'
    ],
    teach: [
      `1. Start before you feel ready — momentum creates clarity.`,
      `2. ${cleanTopic ? `Use ${cleanTopic.toLowerCase()} as your hook — it’s what your audience is searching for.` : 'Talk about the questions customers ask you every day.'}`,
      '3. End every post with one clear next step. That’s it. That’s the playbook.'
    ]
  };
  const tagSets: Record<string, string> = {
    instagram: '#instagood #reels #smallbusiness',
    tiktok: '#fyp #tiktokmademebuyit #smallbusiness',
    facebook: '#community #local #smallbusiness',
    linkedin: '#growth #marketing #entrepreneurship',
    x: '#marketing #buildinpublic',
    youtube: '#shorts #howto'
  };
  const typeBoost = type === 'reel' ? 6 : type === 'carousel' ? 4 : 0;
  const topicBoost = Math.min(10, Math.floor(cleanTopic.length / 6));
  return {
    hook: hooks[goal] ?? hooks.grow,
    body: bodies[goal] ?? bodies.grow,
    hashtags: tagSets[platform] ?? '#content',
    score: 74 + typeBoost + topicBoost,
    source: 'demo' as const
  };
}

async function requestDraft(goal: string, platform: string, type: string, topic: string): Promise<GeneratedPost> {
  try {
    const response = await fetch('/api/ai/generate-post', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ goal, platform, contentType: type, topic })
    });
    if (response.ok) {
      const data = (await response.json()) as Partial<GeneratedPost> & { source?: 'ai' | 'demo' };
      if (data.source === 'ai' && data.hook && Array.isArray(data.body)) {
        return { hook: data.hook, body: data.body, hashtags: data.hashtags ?? '', score: data.score ?? 80, source: 'ai' };
      }
    }
  } catch {
    // Network/API problems fall through to the local demo template.
  }
  return buildPost(goal, platform, type, topic);
}

export function ContentGeneratorStudio({ initialTopic, workspaceId }: { initialTopic: string; workspaceId: string | null }) {
  const [goal, setGoal] = useState('');
  const [platform, setPlatform] = useState('');
  const [contentType, setContentType] = useState('');
  const [topic, setTopic] = useState(initialTopic);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<GeneratedPost | null>(null);
  const [savedContentId, setSavedContentId] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<'save' | 'schedule' | null>(null);
  const [toast, setToast] = useState('');

  const stepsDone = useMemo(
    () => [goal !== '', platform !== '', contentType !== '', topic.trim().length > 2],
    [goal, platform, contentType, topic]
  );
  const ready = stepsDone.every(Boolean);

  function generate() {
    if (!ready || generating) return;
    setGenerating(true);
    setResult(null);
    setSavedContentId(null);
    void requestDraft(goal, platform, contentType, topic).then((draft) => {
      setResult(draft);
      setGenerating(false);
    });
  }

  function draftAsText(draft: GeneratedPost) {
    return `${draft.hook}\n\n${draft.body.join('\n\n')}\n\n${draft.hashtags}`;
  }

  async function persistDraft(draft: GeneratedPost): Promise<string | null> {
    if (savedContentId) return savedContentId;
    const response = await fetch('/api/generated-content', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        workspace_id: workspaceId,
        prompt: topic,
        content: draftAsText(draft),
        content_type: contentType || 'post',
        metadata: { goal, platform, score: draft.score, source: draft.source, hook: draft.hook }
      })
    });
    const json = (await response.json()) as { data?: { id?: string }; error?: string };
    if (!response.ok || !json.data?.id) return null;
    setSavedContentId(json.data.id);
    return json.data.id;
  }

  async function saveToLibrary() {
    if (!result || busyAction) return;
    if (!workspaceId) {
      notify('Draft copied locally — log in to save it to your library.');
      return;
    }
    setBusyAction('save');
    try {
      const id = await persistDraft(result);
      notify(id ? 'Saved to your library' : 'Could not save — please try again.');
    } catch {
      notify('Could not save — check your connection and try again.');
    } finally {
      setBusyAction(null);
    }
  }

  async function scheduleDraft() {
    if (!result || busyAction || !workspaceId) return;
    setBusyAction('schedule');
    try {
      const contentId = await persistDraft(result);
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
          metadata: { platform, title: result.hook, excerpt: result.body[0] ?? '' }
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
    if (!result) return;
    await navigator.clipboard.writeText(`${result.hook}\n\n${result.body.join('\n\n')}\n\n${result.hashtags}`);
    notify('Copied to clipboard');
  }

  return (
    <>
      <PageHeader
        title="Content Generator"
        icon="auto_awesome"
        description="Answer four quick questions and the AI writes a ready-to-post draft for you. No blank pages, no guesswork."
        badge={<Badge tone="cyan" dot pulsing>AI Ready</Badge>}
      />

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

            <button className="kx-btn" disabled={!ready || generating} onClick={generate} type="button">
              {generating ? <span className="kx-spinner" /> : <Icon name="auto_awesome" filled />}
              {generating ? 'Writing your post...' : 'Generate Content'}
            </button>
            {!ready ? <p className="kx-help">Finish the 4 steps above and the Generate button lights up.</p> : null}
          </div>
        </Card>

        {/* Output */}
        <div style={{ display: 'grid', gap: 'var(--kx-gutter)' }}>
          {result ? (
            <>
              <Card
                variant="ai"
                title="Your draft is ready"
                icon="auto_awesome"
                headActions={<Ring label="score" size={64} value={Math.min(result.score, 99)} />}
              >
                {result.source === 'demo' ? (
                  <p className="kx-help" style={{ marginBottom: 12 }}>
                    <Icon name="info" /> Sample draft — add an <b>OPENAI_API_KEY</b> or <b>GEMINI_API_KEY</b> to enable live AI writing.
                  </p>
                ) : null}
                <div style={{ display: 'grid', gap: 14 }}>
                  <strong style={{ color: 'var(--kx-text)', fontSize: 17, lineHeight: 1.4 }}>{result.hook}</strong>
                  {result.body.map((paragraph) => (
                    <p key={paragraph} style={{ color: 'var(--kx-text-muted)', fontSize: 14.5, lineHeight: 1.65, margin: 0 }}>
                      {paragraph}
                    </p>
                  ))}
                  <p style={{ color: 'var(--kx-primary)', fontSize: 13.5, fontWeight: 600, margin: 0 }}>{result.hashtags}</p>
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
                  Copy the draft straight to your platform, save it to reuse later, or hit <b>Schedule It</b> to drop it on your
                  Content Calendar.
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
              title="Your draft will appear here"
              description="Pick a goal, platform, and content type on the left, tell us the topic, and press Generate. You'll get a ready-to-post draft in seconds."
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
