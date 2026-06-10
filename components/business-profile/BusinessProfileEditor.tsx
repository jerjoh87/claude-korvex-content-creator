'use client';

import { useMemo, useState } from 'react';
import { Badge, Card, EmptyState, Icon, PageHeader, ProgressBar } from '../ui/kx';

const industries = ['Barber Shop', 'Restaurant / Cafe', 'Fitness / Gym', 'Real Estate', 'E-commerce', 'Software / SaaS', 'Beauty / Salon', 'Other'];
const toneLabels = ['Playful', 'Friendly', 'Balanced', 'Professional', 'Authoritative'];
const goalOptions = [
  { id: 'customers', label: 'Get more customers', icon: 'storefront' },
  { id: 'followers', label: 'Grow my followers', icon: 'group_add' },
  { id: 'awareness', label: 'Build brand awareness', icon: 'campaign' },
  { id: 'sales', label: 'Sell a product or offer', icon: 'sell' },
  { id: 'community', label: 'Build a community', icon: 'diversity_3' }
];
const ctaOptions = ['Book Now', 'Shop Now', 'DM Us', 'Call Us', 'Visit Website', 'Sign Up'];

type Persona = { name: string; detail: string; tags: string[] };

export type SavedBusinessProfile = {
  id: string;
  name: string;
  industry: string | null;
  audience: { description?: string; personas?: Persona[] };
  voice: {
    description?: string;
    location?: string;
    website?: string;
    services?: string[];
    tone?: number;
    goals?: string[];
    cta?: string;
  };
};

type BusinessProfileEditorProps = {
  workspaceId: string | null;
  initialProfile: SavedBusinessProfile | null;
};

export function BusinessProfileEditor({ workspaceId, initialProfile }: BusinessProfileEditorProps) {
  const [profileId, setProfileId] = useState<string | null>(initialProfile?.id ?? null);
  const [name, setName] = useState(initialProfile?.name ?? '');
  const [industry, setIndustry] = useState(initialProfile?.industry ?? '');
  const [description, setDescription] = useState(initialProfile?.voice.description ?? '');
  const [location, setLocation] = useState(initialProfile?.voice.location ?? '');
  const [website, setWebsite] = useState(initialProfile?.voice.website ?? '');
  const [services, setServices] = useState<string[]>(initialProfile?.voice.services ?? []);
  const [serviceDraft, setServiceDraft] = useState('');
  const [tone, setTone] = useState(initialProfile?.voice.tone ?? 2);
  const [goals, setGoals] = useState<string[]>(initialProfile?.voice.goals ?? []);
  const [cta, setCta] = useState(initialProfile?.voice.cta ?? '');
  const [audience, setAudience] = useState(initialProfile?.audience.description ?? '');
  const [personas, setPersonas] = useState<Persona[]>(initialProfile?.audience.personas ?? []);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const completion = useMemo(() => {
    const checks = [
      name.trim().length > 0,
      industry.length > 0,
      description.trim().length > 19,
      location.trim().length > 0,
      services.length > 0,
      goals.length > 0,
      cta.length > 0,
      audience.trim().length > 0 || personas.length > 0
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [name, industry, description, location, services, goals, cta, audience, personas]);

  function toggleGoal(id: string) {
    setGoals((current) => (current.includes(id) ? current.filter((goal) => goal !== id) : [...current, id]));
  }

  function addService() {
    const value = serviceDraft.trim();
    if (!value || services.includes(value)) return;
    setServices((current) => [...current, value]);
    setServiceDraft('');
  }

  function addPersona() {
    const detail = audience.trim();
    if (!detail) return;
    setPersonas((current) => [...current, { name: `Audience ${current.length + 1}`, detail, tags: [industry || 'General'] }]);
    setAudience('');
  }

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(''), 3200);
  }

  async function save() {
    if (saving) return;
    if (!workspaceId) {
      notify('Saved on this device — log in to sync it to your workspace.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        workspace_id: workspaceId,
        name: name.trim() || 'My Business',
        industry: industry || null,
        audience: { description: audience, personas },
        voice: { description, location, website, services, tone, goals, cta }
      };
      const response = await fetch(profileId ? `/api/business-profiles/${profileId}` : '/api/business-profiles', {
        method: profileId ? 'PATCH' : 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = (await response.json()) as { data?: { id?: string }; error?: string };
      if (!response.ok || json.error) {
        notify(json.error ?? 'Could not save — please try again.');
      } else {
        if (json.data?.id) setProfileId(json.data.id);
        notify('Profile saved — your AI content just got smarter.');
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
        title="Business Profile"
        icon="storefront"
        description="Tell Korvex about your business once — every AI post, caption, and campaign will automatically sound like you."
        actions={
          <>
            <button className="kx-btn is-secondary" type="button">
              <Icon name="history" /> Revert Changes
            </button>
            <button className="kx-btn" disabled={saving} onClick={save} type="button">
              {saving ? <span className="kx-spinner" /> : <Icon name="save" />}
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </>
        }
      />

      {/* Profile completion */}
      <Card compact>
        <div style={{ alignItems: 'center', display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'space-between' }}>
          <div style={{ flex: 1, minWidth: 240 }}>
            <h3 className="kx-card-title" style={{ marginBottom: 4 }}>
              <Icon name="task_alt" /> Profile completion: {completion}%
            </h3>
            <p className="kx-card-sub" style={{ marginBottom: 12 }}>
              {completion === 100
                ? 'Your profile is complete — the AI now has everything it needs.'
                : 'The more you fill in, the smarter and more on-brand your AI content becomes.'}
            </p>
            <ProgressBar value={completion} green={completion === 100} />
          </div>
          {completion === 100 ? <Badge tone="green" icon="check_circle">Ready for AI</Badge> : <Badge tone="gold" icon="pending">In progress</Badge>}
        </div>
      </Card>

      <div className="kx-grid-2">
        {/* Business info */}
        <Card icon="badge" title="Business Info" subtitle="The basics: who you are and what you do.">
          <div style={{ display: 'grid', gap: 16 }}>
            <div className="kx-field">
              <label className="kx-label" htmlFor="bp-name">Business Name</label>
              <input className="kx-input" id="bp-name" onChange={(event) => setName(event.target.value)} placeholder="e.g. Fade Masters Barber Shop" value={name} />
            </div>
            <div className="kx-field">
              <label className="kx-label" htmlFor="bp-industry">Industry</label>
              <select className="kx-select" id="bp-industry" onChange={(event) => setIndustry(event.target.value)} value={industry}>
                <option value="">Choose your industry...</option>
                {industries.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>
            <div className="kx-field">
              <label className="kx-label" htmlFor="bp-desc">
                Short Description
                <Badge tone="cyan" icon="auto_awesome">Powers the AI</Badge>
              </label>
              <textarea
                className="kx-textarea"
                id="bp-desc"
                onChange={(event) => setDescription(event.target.value)}
                placeholder="In one or two sentences, what does your business do and what makes it special?"
                value={description}
              />
              <p className="kx-help">
                <Icon name="lightbulb" /> Example: &ldquo;We give modern fades and classic cuts in downtown Austin — walk-ins welcome.&rdquo;
              </p>
            </div>
          </div>
        </Card>

        {/* Location + services */}
        <Card icon="location_on" title="Location & Services" subtitle="Where customers find you and what you offer.">
          <div style={{ display: 'grid', gap: 16 }}>
            <div className="kx-form-grid">
              <div className="kx-field">
                <label className="kx-label" htmlFor="bp-location">City / Area</label>
                <input className="kx-input" id="bp-location" onChange={(event) => setLocation(event.target.value)} placeholder="e.g. Austin, TX" value={location} />
              </div>
              <div className="kx-field">
                <label className="kx-label" htmlFor="bp-website">Website (optional)</label>
                <input className="kx-input" id="bp-website" onChange={(event) => setWebsite(event.target.value)} placeholder="yourwebsite.com" value={website} />
              </div>
            </div>
            <div className="kx-field">
              <label className="kx-label" htmlFor="bp-service">Services or Products</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  className="kx-input"
                  id="bp-service"
                  onChange={(event) => setServiceDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      addService();
                    }
                  }}
                  placeholder="e.g. Skin fades"
                  value={serviceDraft}
                />
                <button className="kx-btn is-secondary" onClick={addService} type="button">
                  <Icon name="add" /> Add
                </button>
              </div>
              {services.length > 0 ? (
                <div className="kx-chip-row">
                  {services.map((service) => (
                    <button className="kx-chip is-selected" key={service} onClick={() => setServices((current) => current.filter((item) => item !== service))} type="button">
                      {service} <Icon name="close" />
                    </button>
                  ))}
                </div>
              ) : (
                <p className="kx-help">Add at least one — the AI mentions your services in posts and offers.</p>
              )}
            </div>
          </div>
        </Card>

        {/* Brand voice */}
        <Card icon="record_voice_over" title="Brand Voice" subtitle="How should your posts sound? Slide to set the vibe.">
          <div style={{ display: 'grid', gap: 18 }}>
            <div className="kx-field">
              <label className="kx-label" htmlFor="bp-tone">
                Tone
                <Badge tone="purple">{toneLabels[tone]}</Badge>
              </label>
              <input className="kx-range" id="bp-tone" max={4} min={0} onChange={(event) => setTone(Number(event.target.value))} step={1} type="range" value={tone} />
              <div style={{ color: 'var(--kx-text-faint)', display: 'flex', fontSize: 12, justifyContent: 'space-between' }}>
                <span>Playful</span>
                <span>Authoritative</span>
              </div>
            </div>
            <div className="kx-field">
              <label className="kx-label" htmlFor="bp-cta">Favorite Call-to-Action</label>
              <div className="kx-chip-row" id="bp-cta">
                {ctaOptions.map((option) => (
                  <button className={`kx-chip${cta === option ? ' is-selected' : ''}`} key={option} onClick={() => setCta(option)} type="button">
                    {option}
                  </button>
                ))}
              </div>
              <p className="kx-help">This is what we ask people to do at the end of your posts.</p>
            </div>
          </div>
        </Card>

        {/* Goals */}
        <Card icon="flag" title="Goals" subtitle="What do you want your content to achieve? Pick all that apply.">
          <div className="kx-chip-row">
            {goalOptions.map((goal) => (
              <button className={`kx-chip${goals.includes(goal.id) ? ' is-selected' : ''}`} key={goal.id} onClick={() => toggleGoal(goal.id)} type="button">
                <Icon name={goal.icon} /> {goal.label}
              </button>
            ))}
          </div>
        </Card>
      </div>

      {/* Audience */}
      <Card
        icon="groups"
        title="Target Audience"
        subtitle="Describe who you want to reach. Plain words are perfect — e.g. “young professionals who want a sharp look for work”."
        headActions={
          <button className="kx-btn is-secondary is-sm" onClick={addPersona} type="button">
            <Icon name="person_add" /> Save as Audience
          </button>
        }
      >
        <div style={{ display: 'grid', gap: 16 }}>
          <textarea
            aria-label="Describe your target audience"
            className="kx-textarea"
            onChange={(event) => setAudience(event.target.value)}
            placeholder="Who are your ideal customers? Age, interests, what they care about..."
            style={{ minHeight: 88 }}
            value={audience}
          />
          {personas.length > 0 ? (
            <div className="kx-grid-3">
              {personas.map((persona) => (
                <Card compact hoverable key={persona.name}>
                  <h4 style={{ color: 'var(--kx-text)', fontSize: 15, margin: '0 0 6px' }}>{persona.name}</h4>
                  <p style={{ color: 'var(--kx-text-faint)', fontSize: 13, lineHeight: 1.5, margin: '0 0 10px' }}>{persona.detail}</p>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {persona.tags.map((tag) => (
                      <Badge key={tag} tone="cyan">{tag}</Badge>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              icon="groups"
              title="No saved audiences yet"
              description="Write a quick description above and tap “Save as Audience”. The AI will write every post with these people in mind."
            />
          )}
        </div>
      </Card>

      {toast ? (
        <div className="kx-toast" role="status">
          <Icon name="check_circle" filled /> {toast}
        </div>
      ) : null}
    </>
  );
}
