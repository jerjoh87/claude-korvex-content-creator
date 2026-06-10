'use client';

import { useMemo, useState } from 'react';
import { Badge, Card, EmptyState, Icon, PageHeader, StatCard } from '../ui/kx';

type QueueStatus = 'Ready' | 'Draft' | 'Scheduled';

export type QueuedPost = {
  id: string;
  group: 'Today' | 'Tomorrow' | 'This Week';
  time: string;
  relative: string;
  platform: string;
  status: QueueStatus;
  title: string;
  excerpt: string;
};

const seedQueue: QueuedPost[] = [
  {
    id: '1',
    group: 'Today',
    time: '14:30',
    relative: 'in 2 hours',
    platform: 'LinkedIn',
    status: 'Ready',
    title: 'The Future of AI in Small Business: 5 Trends to Watch',
    excerpt: 'Discover how AI is reshaping the way small teams create, schedule, and grow...'
  },
  {
    id: '2',
    group: 'Today',
    time: '18:00',
    relative: 'in 5.5 hours',
    platform: 'X / Twitter',
    status: 'Draft',
    title: 'Quick thread on saving 10 hours a week with AI 🧵',
    excerpt: '1/5 Start by automating the content you already repeat every week...'
  },
  {
    id: '3',
    group: 'Tomorrow',
    time: '09:00',
    relative: 'tomorrow morning',
    platform: 'Instagram',
    status: 'Scheduled',
    title: 'Weekly offer announcement — 20% off this week only',
    excerpt: 'Tap the link in bio to claim your spot before they fill up...'
  },
  {
    id: '4',
    group: 'This Week',
    time: 'Fri 17:00',
    relative: 'in 3 days',
    platform: 'TikTok',
    status: 'Scheduled',
    title: 'Behind the scenes: how we prep every order',
    excerpt: 'POV: you ordered from a small business that actually cares...'
  }
];

const statusTone: Record<QueueStatus, 'green' | 'gold' | 'purple'> = {
  Ready: 'green',
  Draft: 'gold',
  Scheduled: 'purple'
};

const platformFilters = ['All', 'Instagram', 'TikTok', 'LinkedIn', 'X / Twitter'];

type ScheduledPostsQueueProps = {
  /** Real rows for signed-in users; null means guest/demo (use sample data). */
  initialPosts: QueuedPost[] | null;
  persisted: boolean;
};

export function ScheduledPostsQueue({ initialPosts, persisted }: ScheduledPostsQueueProps) {
  const [platform, setPlatform] = useState('All');
  const [queue, setQueue] = useState<QueuedPost[]>(persisted && initialPosts ? initialPosts : seedQueue);
  const [toast, setToast] = useState('');

  const visible = useMemo(
    () => (platform === 'All' ? queue : queue.filter((post) => post.platform === platform)),
    [platform, queue]
  );

  const groups = ['Today', 'Tomorrow', 'This Week'] as const;

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(''), 2600);
  }

  async function removePost(id: string) {
    if (persisted) {
      try {
        const response = await fetch(`/api/scheduled-posts/${id}`, { method: 'DELETE' });
        if (!response.ok) {
          notify('Could not remove the post — please try again.');
          return;
        }
      } catch {
        notify('Could not remove the post — check your connection.');
        return;
      }
    }
    setQueue((current) => current.filter((post) => post.id !== id));
    notify('Post removed from the queue');
  }

  return (
    <>
      <PageHeader
        title="Scheduled Posts"
        icon="schedule_send"
        description="Your publishing queue. Everything below goes out automatically at its scheduled time — edit or reschedule anytime."
        actions={
          <>
            <button className="kx-btn is-secondary" onClick={() => notify('Queue paused — nothing will publish until you resume')} type="button">
              <Icon name="pause" /> Pause Queue
            </button>
            <a className="kx-btn" href="/content-generator">
              <Icon name="add" /> New Post
            </a>
          </>
        }
      />

      <div className="kx-stat-grid">
        <StatCard icon="pending_actions" label="In Queue" note="across all platforms" value={queue.length} />
        <StatCard icon="event_upcoming" label="Going Out Today" note={queue[0] ? `next: ${queue[0].time}` : 'nothing queued yet'} value={queue.filter((post) => post.group === 'Today').length} />
        <StatCard icon="draft" label="Needs Review" note="drafts waiting for approval" value={queue.filter((post) => post.status === 'Draft').length} />
      </div>

      <Card compact>
        <div style={{ alignItems: 'center', display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between' }}>
          <div className="kx-chip-row">
            {platformFilters.map((item) => (
              <button className={`kx-chip${platform === item ? ' is-selected' : ''}`} key={item} onClick={() => setPlatform(item)} type="button">
                {item}
              </button>
            ))}
          </div>
          <Badge tone="cyan">{visible.length} shown</Badge>
        </div>
      </Card>

      {visible.length === 0 ? (
        <EmptyState
          icon="schedule_send"
          title="No scheduled posts yet"
          description="When you schedule content, it shows up here with its date, platform, and status. Create your first post and pick a time — we'll handle the rest."
          action={
            <a className="kx-btn" href="/content-generator">
              <Icon name="auto_awesome" /> Create Your First Post
            </a>
          }
        />
      ) : (
        groups.map((group) => {
          const groupPosts = visible.filter((post) => post.group === group);
          if (groupPosts.length === 0) return null;
          return (
            <section key={group} style={{ display: 'grid', gap: 12 }}>
              <h2 style={{ alignItems: 'center', color: 'var(--kx-text)', display: 'flex', fontSize: 17, fontWeight: 700, gap: 10, margin: 0 }}>
                {group}
                <Badge>{groupPosts.length}</Badge>
              </h2>
              {groupPosts.map((post) => (
                <article className="kx-row" key={post.id}>
                  <div className="kx-row-time">
                    <strong>{post.time}</strong>
                    <small>{post.relative}</small>
                  </div>
                  <div className="kx-thumb">
                    <Icon name="image" />
                  </div>
                  <div className="kx-row-main">
                    <h4>{post.title}</h4>
                    <p>{post.excerpt}</p>
                  </div>
                  <Badge tone="neutral">{post.platform}</Badge>
                  <Badge tone={statusTone[post.status]}>{post.status}</Badge>
                  <div className="kx-row-actions">
                    <button aria-label={`Edit: ${post.title}`} className="kx-icon-btn" onClick={() => notify('Opening editor...')} type="button">
                      <Icon name="edit" />
                    </button>
                    <button aria-label={`Reschedule: ${post.title}`} className="kx-icon-btn" onClick={() => notify('Pick a new time on the calendar')} type="button">
                      <Icon name="event_repeat" />
                    </button>
                    <button aria-label={`Delete: ${post.title}`} className="kx-icon-btn" onClick={() => void removePost(post.id)} type="button">
                      <Icon name="delete" />
                    </button>
                  </div>
                </article>
              ))}
            </section>
          );
        })
      )}

      {toast ? (
        <div className="kx-toast" role="status">
          <Icon name="check_circle" filled /> {toast}
        </div>
      ) : null}
    </>
  );
}
