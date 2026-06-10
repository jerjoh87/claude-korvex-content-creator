'use client';

import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { saveGeneratedContentAction, trackContentGeneratorEventAction } from '@/app/prompt-library/actions';
import {
  createPromptLibraryItem,
  createPromptPreviewDraft,
  getPromptCategoryTemplate,
  promptCategoryTemplates,
  starterPromptLibrary
} from '@/lib/prompt-library/templates';
import type { ContentGeneratorData, ContentHistoryItem } from '@/lib/prompt-library/supabase';
import type { PromptCategory, PromptLibraryItem, PromptPreviewDraft, PromptPreviewSource, PromptPreviewType } from '@/lib/prompt-library/types';

const storageKey = 'korvex-prompt-library-v2';

function previewTypeLabel(type: PromptPreviewType) {
  return {
    image: 'Image preview',
    carousel: 'Carousel preview',
    copy: 'Copy preview',
    campaign: 'Campaign board',
    ad: 'Ad creative',
    poster: 'Product poster',
    video: 'Video storyboard'
  }[type];
}

function previewSourceLabel(source: PromptPreviewSource) {
  return {
    'generated-mockup': 'Tailwind-style mock preview',
    'uploaded-image': 'Uploaded preview image',
    'seed-template': 'Seed preview system'
  }[source];
}

function isPromptLibraryItem(value: unknown): value is PromptLibraryItem {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<PromptLibraryItem>;
  return Boolean(item.id && item.promptText && item.previewTitle && item.previewType && item.previewMockup);
}

function hydratePreviewFromItem(item: PromptLibraryItem): PromptPreviewDraft {
  const template = getPromptCategoryTemplate(item.category);
  return {
    ...item,
    visualPreviewPrompt: `Render a premium ${previewTypeLabel(item.previewType).toLowerCase()} for: ${item.promptText}`,
    whatItCreates: template.whatItCreates,
    bestUseCases: template.bestUseCases
  };
}

function mockupStyle(item: Pick<PromptLibraryItem, 'category'>) {
  const template = getPromptCategoryTemplate(item.category);
  return {
    '--accent': template.accent,
    '--secondary': template.secondary
  } as CSSProperties;
}

function PromptVisualPreview({ item, compact = false }: { item: PromptLibraryItem | PromptPreviewDraft; compact?: boolean }) {
  if (item.previewImageUrl) {
    return <img className="visual-preview-image" src={item.previewImageUrl} alt={`${item.previewTitle} preview`} />;
  }

  const mockup = item.previewMockup;
  const badges = mockup?.badges ?? [];
  const tiles = mockup?.tiles ?? [];
  const captionLines = mockup?.captionLines ?? [];
  const boardColumns = mockup?.boardColumns ?? [];
  const storyboard = mockup?.storyboard ?? [];

  return (
    <div className={`visual-preview visual-preview-${item.previewType} ${compact ? 'is-compact' : ''}`} style={mockupStyle(item)}>
      <div className="preview-glow preview-glow-one" />
      <div className="preview-glow preview-glow-two" />
      <div className="preview-topline">
        <span>{item.estimatedUseTime}</span>
      </div>

      {item.previewType === 'poster' ? (
        <>
          <div className="poster-hero-copy">
            <span>Korvex Commerce</span>
            <strong>{mockup?.headline ?? item.previewTitle}</strong>
            <p>{mockup?.subheadline ?? item.previewDescription}</p>
          </div>
          <div className="poster-product-grid">
            {(tiles.length ? tiles : ['Hero Jar', 'Serum', 'Bundle', 'Mini', 'Mask', 'SPF']).slice(0, 6).map((tile, index) => (
              <div className="poster-product-tile" key={tile}>
                <span className="product-orb" />
                <small>{tile}</small>
                <em>{badges[index % Math.max(badges.length, 1)] ?? 'New'}</em>
              </div>
            ))}
          </div>
          <div className="poster-footer-row">
            <button type="button">{mockup?.cta ?? 'Shop the Set'}</button>
            <div>
              {badges.map((badge) => <span key={badge}>{badge}</span>)}
            </div>
          </div>
        </>
      ) : null}

      {item.previewType === 'copy' ? (
        <div className="copy-preview-card">
          <span>Caption Draft</span>
          <strong>{mockup?.headline ?? item.previewTitle}</strong>
          {(captionLines.length ? captionLines : ['Hook: Lead with the transformation.', 'Proof: Add one specific outcome.', 'CTA: Invite the next step.']).map((line) => <p key={line}>{line}</p>)}
          <button type="button">{mockup?.cta ?? 'Copy Angle'}</button>
        </div>
      ) : null}

      {item.previewType === 'campaign' ? (
        <div className="campaign-preview-board">
          <div>
            <strong>{mockup?.headline ?? item.previewTitle}</strong>
            <span>{mockup?.subheadline ?? 'Mini campaign board'}</span>
          </div>
          <div className="campaign-columns">
            {(boardColumns.length ? boardColumns : [
              { title: 'Hook', items: ['Problem', 'Promise'] },
              { title: 'Proof', items: ['Story', 'Metric'] },
              { title: 'CTA', items: ['Offer', 'Deadline'] }
            ]).map((column) => (
              <section key={column.title}>
                <h4>{column.title}</h4>
                {column.items.map((entry) => <p key={entry}>{entry}</p>)}
              </section>
            ))}
          </div>
        </div>
      ) : null}

      {item.previewType === 'video' ? (
        <div className="video-preview-frame">
          <div className="phone-frame">
            {(storyboard.length ? storyboard : [
              { label: '0-3s', note: 'Hook' },
              { label: '4-8s', note: 'Proof' },
              { label: '9-15s', note: 'CTA' }
            ]).map((scene) => (
              <section key={scene.label}>
                <span>{scene.label}</span>
                <p>{scene.note}</p>
              </section>
            ))}
          </div>
          <strong>{mockup?.headline ?? item.previewTitle}</strong>
        </div>
      ) : null}

      {item.previewType === 'ad' ? (
        <div className="ad-preview-card">
          <span>Meta Ad Test</span>
          <strong>{mockup?.headline ?? item.previewTitle}</strong>
          <div className="ad-creative-block" />
          {badges.map((badge) => <em key={badge}>{badge}</em>)}
          <button type="button">{mockup?.cta ?? 'Learn More'}</button>
        </div>
      ) : null}

      {(item.previewType === 'image' || item.previewType === 'carousel') ? (
        <div className="image-carousel-preview">
          <strong>{mockup?.headline ?? item.previewTitle}</strong>
          <p>{mockup?.subheadline ?? item.previewDescription}</p>
          <div>
            {(tiles.length ? tiles : ['Hero', 'Proof', 'CTA']).map((tile) => <span key={tile}>{tile}</span>)}
          </div>
          <button type="button">{mockup?.cta ?? 'Generate Preview'}</button>
        </div>
      ) : null}
    </div>
  );
}

type PromptLibraryDashboardProps = {
  initialData: ContentGeneratorData;
};

type Notice = {
  type: 'success' | 'error' | 'info';
  message: string;
};

export function PromptLibraryDashboard({ initialData }: PromptLibraryDashboardProps) {
  const [prompts, setPrompts] = useState<PromptLibraryItem[]>(
    initialData.supabasePrompts.length ? initialData.supabasePrompts : starterPromptLibrary
  );
  const [history, setHistory] = useState<ContentHistoryItem[]>(initialData.history);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<'All' | PromptCategory>('All');
  const [activePreviewType, setActivePreviewType] = useState<'All' | PromptPreviewType>('All');
  const [draftPrompt, setDraftPrompt] = useState('');
  const [draftPreview, setDraftPreview] = useState<PromptPreviewDraft | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedPrompt, setSelectedPrompt] = useState<PromptLibraryItem | null>(null);
  const [notice, setNotice] = useState<Notice | null>(initialData.loadError ? { type: 'error', message: initialData.loadError } : null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [customFields, setCustomFields] = useState({
    brandName: initialData.businessProfile?.name ?? '',
    productName: '',
    targetCustomer: initialData.businessProfile?.audience ?? '',
    brandAesthetic: [
      initialData.brandKit?.guidelines,
      initialData.brandKit?.colors.length ? `Colors: ${initialData.brandKit.colors.join(', ')}` : '',
      initialData.brandKit?.fonts.length ? `Fonts: ${initialData.brandKit.fonts.join(', ')}` : ''
    ].filter(Boolean).join(' | ')
  });

  useEffect(() => {
    if (initialData.supabasePrompts.length) return;
    const saved = window.localStorage.getItem(storageKey);
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved) as unknown[];
      if (Array.isArray(parsed) && parsed.every(isPromptLibraryItem)) {
        setPrompts(parsed);
      }
    } catch {
      window.localStorage.removeItem(storageKey);
    }
  }, [initialData.supabasePrompts.length]);

  useEffect(() => {
    if (initialData.supabasePrompts.length) return;
    window.localStorage.setItem(storageKey, JSON.stringify(prompts));
  }, [initialData.supabasePrompts.length, prompts]);

  useEffect(() => {
    if (!initialData.workspaceId) return;
    void trackContentGeneratorEventAction({
      workspaceId: initialData.workspaceId,
      metricName: 'content_generator_viewed',
      dimensions: {
        supabaseTemplateCount: initialData.supabasePrompts.length,
        historyCount: initialData.history.length
      }
    });
  }, [initialData.history.length, initialData.supabasePrompts.length, initialData.workspaceId]);

  useEffect(() => {
    if (!selectedPrompt) return;
    setCustomFields({
      brandName: selectedPrompt.previewMockup?.headline ?? '',
      productName: selectedPrompt.previewMockup?.tiles?.[0] ?? '',
      targetCustomer: selectedPrompt.recommendedFor[0] ?? '',
      brandAesthetic: selectedPrompt.previewType === 'poster' ? 'Clean minimalist / Luxury' : ''
    });
  }, [selectedPrompt]);

  const filteredPrompts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return prompts.filter((prompt) => {
      const matchesCategory = activeCategory === 'All' || prompt.category === activeCategory;
      const matchesPreviewType = activePreviewType === 'All' || prompt.previewType === activePreviewType;
      const searchable = [
        prompt.title,
        prompt.description,
        prompt.promptText,
        prompt.category,
        prompt.previewType,
        prompt.difficulty,
        prompt.estimatedUseTime,
        ...prompt.tags,
        ...prompt.businessKitRelevance,
        ...prompt.recommendedFor
      ].join(' ').toLowerCase();
      return matchesCategory && matchesPreviewType && (!query || searchable.includes(query));
    });
  }, [activeCategory, activePreviewType, prompts, search]);

  const selectedPromptText = useMemo(() => {
    if (!selectedPrompt) return '';
    return selectedPrompt.promptText
      .replaceAll('[BRAND NAME]', customFields.brandName || '[BRAND NAME]')
      .replaceAll('[PRODUCT NAME]', customFields.productName || '[PRODUCT NAME]')
      .replaceAll('[e.g. Women 25–35 / Health-conscious men / Gen Z]', customFields.targetCustomer || '[e.g. Women 25–35 / Health-conscious men / Gen Z]')
      .replaceAll('[e.g. Women 25-35 / Health-conscious men / Gen Z]', customFields.targetCustomer || '[e.g. Women 25-35 / Health-conscious men / Gen Z]')
      .replaceAll('[e.g. Clean minimalist / Luxury / Natural & earthy / Bold & energetic]', customFields.brandAesthetic || '[e.g. Clean minimalist / Luxury / Natural & earthy / Bold & energetic]');
  }, [customFields.brandAesthetic, customFields.brandName, customFields.productName, customFields.targetCustomer, selectedPrompt]);

  function showNotice(type: Notice['type'], message: string) {
    setNotice({ type, message });
    window.setTimeout(() => setNotice(null), 2800);
  }

  function brandContextLines() {
    return [
      initialData.businessProfile ? `Business: ${initialData.businessProfile.name}` : '',
      initialData.businessProfile?.industry ? `Industry: ${initialData.businessProfile.industry}` : '',
      initialData.businessProfile?.audience ? `Audience: ${initialData.businessProfile.audience}` : '',
      initialData.businessProfile?.voice ? `Voice: ${initialData.businessProfile.voice}` : '',
      initialData.brandKit?.guidelines ? `Brand kit: ${initialData.brandKit.guidelines}` : '',
      initialData.brandKit?.colors.length ? `Colors: ${initialData.brandKit.colors.join(', ')}` : '',
      initialData.brandKit?.fonts.length ? `Fonts: ${initialData.brandKit.fonts.join(', ')}` : ''
    ].filter(Boolean);
  }

  function generatePromptDraft() {
    if (!draftPrompt.trim()) return;
    setIsGenerating(true);
    const preview = createPromptPreviewDraft(draftPrompt);
    const template = getPromptCategoryTemplate(preview.category);
    const context = brandContextLines();
    const generatedPrompt = [
      `Create a ${template.previewLabel.toLowerCase()} for ${draftPrompt.trim()}.`,
      context.length ? `Use this business and Brand Kit context: ${context.join(' | ')}.` : '',
      'Include a compelling hook, premium visual direction, audience-specific messaging, conversion-focused CTA, realistic sample output, and platform-ready notes.'
    ].filter(Boolean).join(' ');
    setDraftPrompt(generatedPrompt);
    setDraftPreview(createPromptPreviewDraft(generatedPrompt, preview.category, 'generated-mockup', Date.now()));
    if (initialData.workspaceId) {
      void trackContentGeneratorEventAction({
        workspaceId: initialData.workspaceId,
        metricName: 'content_generator_prompt_drafted',
        dimensions: { category: preview.category }
      });
    }
    window.setTimeout(() => setIsGenerating(false), 250);
  }

  function generatePreview(category?: PromptCategory) {
    setIsGenerating(true);
    const preview = createPromptPreviewDraft(draftPrompt, category, 'generated-mockup', Date.now());
    setDraftPreview(preview);
    if (initialData.workspaceId) {
      void trackContentGeneratorEventAction({
        workspaceId: initialData.workspaceId,
        metricName: 'content_generator_preview_generated',
        dimensions: { category: preview.category, previewType: preview.previewType }
      });
    }
    window.setTimeout(() => setIsGenerating(false), 250);
  }

  function resetBuilder() {
    setDraftPrompt('');
    setDraftPreview(null);
    setEditingId(null);
  }

  async function savePrompt() {
    if (!draftPrompt.trim() || !draftPreview) return;
    if (!initialData.workspaceId) {
      showNotice('error', 'Connect Supabase and sign in before saving generated content.');
      return;
    }

    setIsSaving(true);
    const existing = prompts.find((prompt) => prompt.id === editingId);
    const savedPrompt = createPromptLibraryItem(draftPrompt.trim(), draftPreview, existing);

    try {
      const savedHistory = await saveGeneratedContentAction({
        workspaceId: initialData.workspaceId,
        title: savedPrompt.title,
        prompt: savedPrompt.promptText,
        content: savedPrompt.sampleOutput || savedPrompt.previewDescription,
        category: savedPrompt.category,
        previewType: savedPrompt.previewType
      });
      setPrompts((current) => {
        if (!editingId) return [savedPrompt, ...current];
        return current.map((prompt) => (prompt.id === editingId ? savedPrompt : prompt));
      });
      setHistory((current) => [savedHistory, ...current]);
      setSelectedPrompt(savedPrompt);
      resetBuilder();
      showNotice('success', 'Generated content saved to Supabase.');
    } catch (error) {
      showNotice('error', error instanceof Error ? error.message : 'Unable to save generated content.');
    } finally {
      setIsSaving(false);
    }
  }

  async function saveSelectedPrompt() {
    if (!selectedPrompt) return;
    if (!initialData.workspaceId) {
      showNotice('error', 'Connect Supabase and sign in before saving generated content.');
      return;
    }

    setIsSaving(true);
    try {
      const savedHistory = await saveGeneratedContentAction({
        workspaceId: initialData.workspaceId,
        title: selectedPrompt.title,
        prompt: selectedPromptText || selectedPrompt.promptText,
        content: selectedPrompt.sampleOutput || selectedPrompt.previewDescription,
        category: selectedPrompt.category,
        templateTitle: selectedPrompt.title,
        previewType: selectedPrompt.previewType
      });
      setPrompts((current) => {
        const exists = current.some((prompt) => prompt.id === selectedPrompt.id);
        return exists ? current : [selectedPrompt, ...current];
      });
      setHistory((current) => [savedHistory, ...current]);
      showNotice('success', 'Prompt output saved to Supabase history.');
    } catch (error) {
      showNotice('error', error instanceof Error ? error.message : 'Unable to save prompt output.');
    } finally {
      setIsSaving(false);
    }
  }

  function handleUpload(file?: File) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const category = draftPreview?.category ?? createPromptPreviewDraft(draftPrompt).category;
      const nextPreview = createPromptPreviewDraft(draftPrompt, category, 'uploaded-image');
      setDraftPreview({ ...nextPreview, previewImageUrl: String(reader.result), previewSource: 'uploaded-image' });
    };
    reader.readAsDataURL(file);
  }

  function editPrompt(prompt: PromptLibraryItem) {
    setEditingId(prompt.id);
    setDraftPrompt(prompt.promptText);
    setDraftPreview(hydratePreviewFromItem(prompt));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function copyPrompt(promptText: string) {
    await navigator.clipboard.writeText(promptText);
    showNotice('success', 'Prompt copied to clipboard.');
    if (initialData.workspaceId) {
      void trackContentGeneratorEventAction({
        workspaceId: initialData.workspaceId,
        metricName: 'content_generator_prompt_copied'
      });
    }
  }

  function usePrompt(prompt: PromptLibraryItem) {
    setDraftPrompt(selectedPrompt?.id === prompt.id && selectedPromptText ? selectedPromptText : prompt.promptText);
    setDraftPreview(hydratePreviewFromItem(prompt));
    setSelectedPrompt(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function regenerateCardPreview(prompt: PromptLibraryItem) {
    const preview = createPromptPreviewDraft(prompt.promptText, prompt.category, 'generated-mockup', Date.now());
    const updated = createPromptLibraryItem(prompt.promptText, preview, prompt);
    setPrompts((current) => current.map((item) => (item.id === prompt.id ? updated : item)));
    setSelectedPrompt((current) => (current?.id === prompt.id ? updated : current));
  }

  return (
    <div className="prompt-library-shell">
      <section className="prompt-hero glass-panel">
        <div>
          <div className="eyebrow">Prompt Preview Library</div>
          <h1>Browse prompts with a proof-of-output preview.</h1>
          <p>
            Every prompt now carries preview metadata, realistic mock output, sample copy, business kit relevance, and fast actions before you use or save it.
          </p>
        </div>
        <div className="preview-requirement-card">
          <span>Visual preview system</span>
          <strong>{prompts.length} preview-ready prompts</strong>
          <p>Image previews render when available. Otherwise Korvex builds a premium in-app mockup for the prompt type.</p>
        </div>
      </section>

      <section className="prompt-builder-grid">
        <div className="prompt-builder glass-panel">
          <div className="section-kicker">Create prompt → preview result → save</div>
          <h2>{editingId ? 'Edit prompt preview package' : 'Generate a new prompt preview'}</h2>
          <textarea
            value={draftPrompt}
            onChange={(event) => setDraftPrompt(event.target.value)}
            placeholder="Describe the prompt you want to save. Example: Create a premium product grid poster for a skincare bundle with six tiles, badges, and a Shopify-ready CTA."
          />
          <div className="builder-actions">
            <button type="button" onClick={() => generatePreview()} disabled={!draftPrompt.trim()}>
              Generate Preview
            </button>
            <button type="button" className="secondary-action" onClick={generatePromptDraft} disabled={!draftPrompt.trim()}>
              Generate Prompt Draft
            </button>
            <label className="upload-preview-button">
              Add Preview Image
              <input type="file" accept="image/*" onChange={(event) => handleUpload(event.target.files?.[0])} />
            </label>
            <button type="button" className="ghost-action" onClick={resetBuilder}>Clear</button>
          </div>

          {draftPreview ? (
            <div className="generated-preview-card">
              <PromptVisualPreview item={draftPreview} />
              <div className="generated-preview-copy">
                <div className="preview-status-row">
                  <span>{previewSourceLabel(draftPreview.previewSource)}</span>
                  <span>{previewTypeLabel(draftPreview.previewType)}</span>
                </div>
                <h3>{draftPreview.previewTitle}</h3>
                <p>{draftPreview.previewDescription}</p>
                <div className="meta-strip">
                  <span>{draftPreview.difficulty}</span>
                  <span>{draftPreview.estimatedUseTime}</span>
                  <span>{draftPreview.businessKitRelevance[0]}</span>
                </div>
                <div className="tag-row">
                  {draftPreview.tags.map((tag) => <span key={tag}>#{tag}</span>)}
                </div>
                <details>
                  <summary>Sample output</summary>
                  <p>{draftPreview.sampleOutput}</p>
                </details>
                <details>
                  <summary>Visual preview prompt</summary>
                  <p>{draftPreview.visualPreviewPrompt}</p>
                </details>
                <div className="builder-actions compact-actions">
                  <button type="button" onClick={savePrompt}>{editingId ? 'Update Prompt' : 'Save Prompt'}</button>
                  <button type="button" className="secondary-action" onClick={() => generatePreview(draftPreview.category)}>
                    Regenerate
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="empty-preview-state">
              <span>Preview</span>
              <h3>Generate a result preview before saving.</h3>
              <p>The library will render a product poster, campaign board, copy card, ad mockup, carousel, or vertical video storyboard based on the prompt.</p>
            </div>
          )}
        </div>

        <aside className="preview-template-panel glass-panel">
          <div className="section-kicker">Preview types by category</div>
          <h2>Mockup modes</h2>
          <div className="template-list">
            {promptCategoryTemplates.map((template) => (
              <button
                key={template.category}
                type="button"
                onClick={() => generatePreview(template.category)}
                disabled={!draftPrompt.trim()}
                style={{ '--accent': template.accent } as CSSProperties}
              >
                <span>{template.previewLabel}</span>
                <small>{template.previewType} · {template.estimatedUseTime}</small>
              </button>
            ))}
          </div>
        </aside>
      </section>

      <section className="library-controls glass-panel">
        <div>
          <div className="section-kicker">Prompt grid</div>
          <h2>{filteredPrompts.length} prompt cards</h2>
        </div>
        <div className="search-and-filter">
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search prompts, tags, kits, or recommended use" />
          <select value={activeCategory} onChange={(event) => setActiveCategory(event.target.value as 'All' | PromptCategory)}>
            <option value="All">All categories</option>
            {promptCategoryTemplates.map((template) => (
              <option key={template.category} value={template.category}>{template.category}</option>
            ))}
          </select>
          <select value={activePreviewType} onChange={(event) => setActivePreviewType(event.target.value as 'All' | PromptPreviewType)}>
            <option value="All">All preview types</option>
            {(['image', 'carousel', 'copy', 'campaign', 'ad', 'poster', 'video'] as PromptPreviewType[]).map((type) => (
              <option key={type} value={type}>{previewTypeLabel(type)}</option>
            ))}
          </select>
        </div>
      </section>

      {filteredPrompts.length ? (
        <section className="prompt-grid">
          {filteredPrompts.map((prompt) => (
            <article className="prompt-card glass-panel" key={prompt.id} onClick={() => setSelectedPrompt(prompt)}>
              <div className="prompt-thumb-wrap">
                <PromptVisualPreview item={prompt} compact />
              </div>
              <div className="prompt-card-body">
                <div className="prompt-card-heading">
                  <h3>{prompt.title}</h3>
                  <small>{prompt.difficulty} · {prompt.estimatedUseTime}</small>
                </div>
                <p>{prompt.previewDescription}</p>
                <div className="tag-row">
                  {prompt.tags.map((tag) => <span key={tag}>#{tag}</span>)}
                </div>
                <div className="kit-row">
                  {prompt.businessKitRelevance.slice(0, 3).map((kit) => <span key={kit}>{kit}</span>)}
                </div>
                <div className="prompt-card-actions" onClick={(event) => event.stopPropagation()}>
                  <button type="button" onClick={() => setSelectedPrompt(prompt)}>Preview</button>
                  <button type="button" onClick={() => regenerateCardPreview(prompt)}>Generate Preview</button>
                  <button type="button" onClick={() => usePrompt(prompt)}>Use Prompt</button>
                  <button type="button" onClick={() => copyPrompt(prompt.promptText)}>Copy</button>
                </div>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <section className="premium-empty-state glass-panel">
          <span>No matches</span>
          <h2>No prompt cards match your filters.</h2>
          <p>Clear search or create a new prompt. Every saved prompt appears with preview metadata and a visual mock result.</p>
        </section>
      )}

      {selectedPrompt ? (
        <div className="prompt-modal-backdrop" role="dialog" aria-modal="true" aria-label={`${selectedPrompt.title} prompt preview`}>
          <div className="prompt-modal glass-panel">
            <button className="modal-close" type="button" onClick={() => setSelectedPrompt(null)}>×</button>
            <PromptVisualPreview item={selectedPrompt} />
            <div className="prompt-modal-copy">
              <span className="section-kicker">{previewSourceLabel(selectedPrompt.previewSource)}</span>
              <h2>{selectedPrompt.title}</h2>
              <p>{selectedPrompt.previewDescription}</p>

              <div className="custom-field-grid">
                <label>
                  Brand Name
                  <input value={customFields.brandName} onChange={(event) => setCustomFields((current) => ({ ...current, brandName: event.target.value }))} placeholder="Brand name" />
                </label>
                <label>
                  Product / Offer
                  <input value={customFields.productName} onChange={(event) => setCustomFields((current) => ({ ...current, productName: event.target.value }))} placeholder="Product or offer" />
                </label>
                <label>
                  Target Customer
                  <input value={customFields.targetCustomer} onChange={(event) => setCustomFields((current) => ({ ...current, targetCustomer: event.target.value }))} placeholder="Audience" />
                </label>
                <label>
                  Brand Aesthetic
                  <input value={customFields.brandAesthetic} onChange={(event) => setCustomFields((current) => ({ ...current, brandAesthetic: event.target.value }))} placeholder="Aesthetic" />
                </label>
              </div>

              <div className="modal-info-grid">
                <div>
                  <strong>Preview Type</strong>
                  <p>{previewTypeLabel(selectedPrompt.previewType)}</p>
                </div>
                <div>
                  <strong>Business Kit Relevance</strong>
                  <p>{selectedPrompt.businessKitRelevance.join(', ')}</p>
                </div>
                <div>
                  <strong>Recommended For</strong>
                  <ul>
                    {selectedPrompt.recommendedFor.map((useCase) => <li key={useCase}>{useCase}</li>)}
                  </ul>
                </div>
                <div>
                  <strong>Sample Output</strong>
                  <p>{selectedPrompt.sampleOutput}</p>
                </div>
              </div>
              <div className="full-prompt-box">
                <strong>Full prompt text</strong>
                <p>{selectedPromptText || selectedPrompt.promptText}</p>
              </div>
              <div className="builder-actions compact-actions">
                <button type="button" onClick={() => usePrompt(selectedPrompt)}>Use Prompt</button>
                <button type="button" className="secondary-action" onClick={saveSelectedPrompt}>Save Prompt</button>
                <button type="button" className="secondary-action" onClick={() => copyPrompt(selectedPromptText || selectedPrompt.promptText)}>Copy Prompt</button>
                <button type="button" className="ghost-action" onClick={() => regenerateCardPreview(selectedPrompt)}>Generate Preview</button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
