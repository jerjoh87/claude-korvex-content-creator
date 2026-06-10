'use client';

import { useMemo, useState } from 'react';
import { Badge, Card, EmptyState, Icon, PageHeader } from '../ui/kx';

type PostStatus = 'Draft' | 'Ready' | 'Scheduled' | 'Posted';

export type CalendarPost = {
  id: number;
  day: number; // day offset within current month (1-based)
  time: string;
  title: string;
  platform: string;
  status: PostStatus;
};

const statusColor: Record<PostStatus, string> = {
  Draft: '#ffd487',
  Ready: '#00dce6',
  Scheduled: '#ddb7ff',
  Posted: '#55f888'
};

const statusTone: Record<PostStatus, 'gold' | 'cyan' | 'purple' | 'green'> = {
  Draft: 'gold',
  Ready: 'cyan',
  Scheduled: 'purple',
  Posted: 'green'
};

const platformFilters = ['All', 'Instagram', 'TikTok', 'Facebook', 'LinkedIn'];

function seedPosts(today: Date): CalendarPost[] {
  const d = today.getDate();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const clamp = (value: number) => Math.max(1, Math.min(daysInMonth, value));
  return [
    { id: 1, day: clamp(d - 3), time: '10:00', title: 'Client transformation reel', platform: 'Instagram', status: 'Posted' },
    { id: 2, day: clamp(d - 1), time: '18:30', title: '5 quick tips thread', platform: 'LinkedIn', status: 'Posted' },
    { id: 3, day: clamp(d), time: '14:00', title: 'Behind the scenes video', platform: 'TikTok', status: 'Ready' },
    { id: 4, day: clamp(d + 1), time: '09:00', title: 'Weekly offer announcement', platform: 'Facebook', status: 'Scheduled' },
    { id: 5, day: clamp(d + 2), time: '17:00', title: 'Q&A story series', platform: 'Instagram', status: 'Scheduled' },
    { id: 6, day: clamp(d + 4), time: '12:00', title: 'Product launch teaser', platform: 'TikTok', status: 'Draft' },
    { id: 7, day: clamp(d + 6), time: '15:30', title: 'Customer review highlight', platform: 'Instagram', status: 'Draft' }
  ];
}

const weekdays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

type ContentCalendarProps = {
  /** Real rows for signed-in users; null means guest/demo (use sample data). */
  initialPosts: CalendarPost[] | null;
  persisted: boolean;
};

export function ContentCalendar({ initialPosts, persisted }: ContentCalendarProps) {
  const today = useMemo(() => new Date(), []);
  const [view, setView] = useState<'month' | 'week'>('month');
  const [platform, setPlatform] = useState('All');
  const posts = useMemo(() => (persisted && initialPosts ? initialPosts : seedPosts(today)), [initialPosts, persisted, today]);

  const visiblePosts = platform === 'All' ? posts : posts.filter((post) => post.platform === platform);

  const monthLabel = today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: Array<{ day: number | null }> = [
    ...Array.from({ length: firstWeekday }, () => ({ day: null })),
    ...Array.from({ length: daysInMonth }, (_, index) => ({ day: index + 1 }))
  ];
  while (cells.length % 7 !== 0) cells.push({ day: null });

  // Week view: the 7 days around today (Sun–Sat of current week)
  const weekStart = today.getDate() - today.getDay();
  const weekDays = Array.from({ length: 7 }, (_, index) => weekStart + index).filter((day) => day >= 1 && day <= daysInMonth);

  return (
    <>
      <PageHeader
        title="Content Calendar"
        icon="calendar_month"
        description="See every post at a glance — what's drafted, what's ready, and what's already live. Click any day to plan it."
        actions={
          <a className="kx-btn" href="/content-generator">
            <Icon name="add" /> Create Post
          </a>
        }
      />

      <Card compact>
        <div style={{ alignItems: 'center', display: 'flex', flexWrap: 'wrap', gap: 14, justifyContent: 'space-between' }}>
          <div style={{ alignItems: 'center', display: 'flex', gap: 12 }}>
            <h2 style={{ fontSize: 19, fontWeight: 700, margin: 0 }}>{monthLabel}</h2>
            <Badge tone="cyan">{visiblePosts.length} posts planned</Badge>
          </div>
          <div style={{ alignItems: 'center', display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            <div className="kx-chip-row">
              {platformFilters.map((item) => (
                <button className={`kx-chip${platform === item ? ' is-selected' : ''}`} key={item} onClick={() => setPlatform(item)} type="button">
                  {item}
                </button>
              ))}
            </div>
            <div className="kx-segmented" role="tablist">
              <button aria-selected={view === 'month'} className={view === 'month' ? 'is-active' : ''} onClick={() => setView('month')} role="tab" type="button">
                Month
              </button>
              <button aria-selected={view === 'week'} className={view === 'week' ? 'is-active' : ''} onClick={() => setView('week')} role="tab" type="button">
                Week
              </button>
            </div>
          </div>
        </div>
        <div className="kx-legend" style={{ marginTop: 14 }}>
          {(Object.keys(statusColor) as PostStatus[]).map((status) => (
            <span key={status}>
              <i style={{ background: statusColor[status] }} /> {status}
            </span>
          ))}
        </div>
      </Card>

      {view === 'month' ? (
        <Card compact>
          <div className="kx-cal-head">
            {weekdays.map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>
          <div className="kx-cal-grid">
            {cells.map((cell, index) => {
              if (cell.day === null) {
                return <div className="kx-cal-day is-muted" key={`empty-${index}`} />;
              }
              const dayPosts = visiblePosts.filter((post) => post.day === cell.day);
              const isToday = cell.day === today.getDate();
              return (
                <div className={`kx-cal-day${isToday ? ' is-today' : ''}`} key={cell.day}>
                  <small>{cell.day}</small>
                  {dayPosts.map((post) => (
                    <div className="kx-cal-event" key={post.id} style={{ ['--event-color' as string]: statusColor[post.status] }} title={`${post.title} — ${post.status}`}>
                      <strong>{post.title}</strong>
                      <small>
                        {post.platform} • {post.time}
                      </small>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </Card>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {weekDays.map((day) => {
            const date = new Date(year, month, day);
            const dayPosts = visiblePosts.filter((post) => post.day === day);
            const isToday = day === today.getDate();
            return (
              <Card compact key={day}>
                <div style={{ alignItems: 'center', display: 'flex', gap: 10, marginBottom: dayPosts.length ? 12 : 0 }}>
                  <strong style={{ color: isToday ? 'var(--kx-primary)' : 'var(--kx-text)', fontSize: 15 }}>
                    {date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                  </strong>
                  {isToday ? <Badge tone="cyan">Today</Badge> : null}
                </div>
                {dayPosts.length > 0 ? (
                  <div style={{ display: 'grid', gap: 8 }}>
                    {dayPosts.map((post) => (
                      <div className="kx-row" key={post.id} style={{ padding: '12px 14px' }}>
                        <span className="kx-platform">{post.platform.slice(0, 2).toUpperCase()}</span>
                        <div className="kx-row-main">
                          <h4>{post.title}</h4>
                          <p>
                            {post.platform} • {post.time}
                          </p>
                        </div>
                        <Badge tone={statusTone[post.status]}>{post.status}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="kx-help" style={{ margin: 0 }}>
                    Nothing planned — <a href="/content-generator" style={{ color: 'var(--kx-primary)' }}>generate a post</a> for this day.
                  </p>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {visiblePosts.length === 0 ? (
        <EmptyState
          icon="event_available"
          title={platform === 'All' ? 'Nothing scheduled this month yet' : `No ${platform} posts this month`}
          description={
            platform === 'All'
              ? 'Generate a post and hit “Schedule It” — it will land right here on your calendar.'
              : 'Try another platform filter, or create a new post and schedule it for this month.'
          }
          action={
            <a className="kx-btn" href="/content-generator">
              <Icon name="auto_awesome" /> Generate a Post
            </a>
          }
        />
      ) : null}

      <div className="kx-grid-2">
        <Card title="AI Drafts" icon="auto_awesome" subtitle="Ideas the AI prepared for you — schedule them with one click.">
          <div style={{ display: 'grid', gap: 10 }}>
            {[
              { title: '5 ways AI saves small businesses 10 hours a week', tags: 'LinkedIn • Thread' },
              { title: 'Before & after: the power of a fresh look', tags: 'Instagram • Reel' }
            ].map((draft) => (
              <div className="kx-row" key={draft.title} style={{ padding: '12px 14px' }}>
                <div className="kx-row-main">
                  <h4>{draft.title}</h4>
                  <p>{draft.tags}</p>
                </div>
                <div className="kx-row-actions">
                  <a aria-label={`Schedule draft: ${draft.title}`} className="kx-btn is-secondary is-sm" href="/scheduled-posts">
                    <Icon name="event" /> Schedule
                  </a>
                </div>
              </div>
            ))}
            <a className="kx-btn is-ghost is-sm" href="/content-generator" style={{ justifySelf: 'start' }}>
              <Icon name="add" /> Generate New Draft
            </a>
          </div>
        </Card>

        <Card title="Active Campaigns" icon="campaign" subtitle="Multi-post campaigns currently mapped onto your calendar.">
          <div style={{ display: 'grid', gap: 10 }}>
            <div className="kx-row" style={{ padding: '12px 14px' }}>
              <div className="kx-row-main">
                <h4>Holiday Promo Phase 1</h4>
                <p>4 of 12 posts scheduled</p>
              </div>
              <Badge tone="purple">Scheduled</Badge>
            </div>
            <div className="kx-row" style={{ padding: '12px 14px' }}>
              <div className="kx-row-main">
                <h4>New Service Launch</h4>
                <p>Needs content — 0 of 6 posts ready</p>
              </div>
              <Badge tone="gold">Needs content</Badge>
            </div>
            <a className="kx-btn is-ghost is-sm" href="/prompt-library" style={{ justifySelf: 'start' }}>
              <Icon name="campaign" /> Plan a Campaign
            </a>
          </div>
        </Card>
      </div>
    </>
  );
}
