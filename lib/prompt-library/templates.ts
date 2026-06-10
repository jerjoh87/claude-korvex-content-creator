import type {
  PromptCategory,
  PromptCategoryTemplate,
  PromptLibraryItem,
  PromptPreviewDraft,
  PromptPreviewMockup,
  PromptPreviewSource,
  PromptPreviewType
} from './types';

export const productGridPosterPromptBody = `Create a premium, ultra high-definition DTC ecommerce hero image for [BRAND NAME]'s [PRODUCT NAME].
Product category: [e.g. Skincare / Supplements / Apparel / Food & Beverage]
Target customer: [e.g. Women 25–35 / Health-conscious men / Gen Z]
Brand aesthetic: [e.g. Clean minimalist / Luxury / Natural & earthy / Bold & energetic]
Brand color palette: [e.g. Ivory, gold, and sage green]
Core customer transformation: [e.g. Glowing, even skin tone — visibly younger-looking in 4 weeks]
Scene / setting: [e.g. Marble bathroom counter, soft morning light, linen towel nearby]
Number of carousel images: [e.g. 6]

The image should feel like a premium DTC ecommerce hero/product-grid visual, clean enough for a landing page, TikTok Shop, Instagram ad, or Shopify product page.`;

export const promptCategoryTemplates: PromptCategoryTemplate[] = [
  {
    category: 'Ecommerce product posters',
    accent: '#f59e0b',
    secondary: '#fb7185',
    keywords: ['product', 'ecommerce', 'shop', 'sale', 'poster', 'bundle', 'launch', 'merch', 'dtc', 'carousel'],
    tags: ['product', 'poster', 'conversion'],
    businessKitRelevance: ['Ecommerce', 'Retail', 'Beauty', 'Food & Beverage'],
    difficulty: 'Intermediate',
    estimatedUseTime: '8 min',
    recommendedFor: ['Shopify brands', 'TikTok Shop sellers', 'DTC product launches'],
    whatItCreates: 'High-converting product-grid poster concepts with visual hierarchy, benefit callouts, labels, badges, and offer framing.',
    bestUseCases: ['Product launches', 'Seasonal offers', 'Shopify hero assets'],
    sampleOutput: 'A six-tile premium ecommerce product board with soft lighting, SKU labels, best-seller badges, a hero headline, and a clean conversion CTA.',
    previewLabel: 'Product Poster',
    previewType: 'poster'
  },
  {
    category: 'Social media posts',
    accent: '#8b5cf6',
    secondary: '#06b6d4',
    keywords: ['instagram', 'facebook', 'linkedin', 'tiktok', 'social', 'caption', 'carousel', 'post'],
    tags: ['social', 'carousel', 'engagement'],
    businessKitRelevance: ['Local Services', 'Restaurant', 'Creator', 'Fitness'],
    difficulty: 'Easy',
    estimatedUseTime: '4 min',
    recommendedFor: ['Daily content calendars', 'Community posts', 'Offer reminders'],
    whatItCreates: 'Scroll-stopping social post concepts with hook, caption angle, creative direction, and channel-specific notes.',
    bestUseCases: ['Daily content calendars', 'Carousel concepts', 'Community engagement posts'],
    sampleOutput: 'A polished caption with a bold hook, three proof bullets, branded CTA, and carousel slide outline.',
    previewLabel: 'Social Post',
    previewType: 'carousel'
  },
  {
    category: 'Website hero sections',
    accent: '#22c55e',
    secondary: '#14b8a6',
    keywords: ['hero', 'website', 'above the fold', 'homepage', 'headline', 'web section'],
    tags: ['website', 'hero', 'ux'],
    businessKitRelevance: ['SaaS', 'Agency', 'Business Funding', 'Local Services'],
    difficulty: 'Advanced',
    estimatedUseTime: '12 min',
    recommendedFor: ['Homepage refreshes', 'Offer pages', 'Service positioning'],
    whatItCreates: 'Premium above-the-fold website sections with headline, subcopy, CTA, proof, and visual direction.',
    bestUseCases: ['Homepage refreshes', 'SaaS positioning', 'Service landing intros'],
    sampleOutput: 'A dark SaaS hero with glowing product UI, dual CTAs, trust proof, and concise conversion copy.',
    previewLabel: 'Hero Section',
    previewType: 'image'
  },
  {
    category: 'Landing pages',
    accent: '#38bdf8',
    secondary: '#6366f1',
    keywords: ['landing', 'funnel', 'sales page', 'opt in', 'lead magnet', 'web page'],
    tags: ['landing-page', 'funnel', 'leads'],
    businessKitRelevance: ['Agency', 'Business Funding', 'Credit Repair', 'Coaching'],
    difficulty: 'Advanced',
    estimatedUseTime: '15 min',
    recommendedFor: ['Lead capture pages', 'Offer validation', 'Campaign funnels'],
    whatItCreates: 'Complete landing page blueprints with hero, proof, benefits, offer stack, FAQ, and CTA flow.',
    bestUseCases: ['Lead capture pages', 'Offer validation', 'Campaign funnels'],
    sampleOutput: 'A conversion page plan with hero copy, proof sections, benefit blocks, FAQ, and sticky CTA.',
    previewLabel: 'Landing Page',
    previewType: 'campaign'
  },
  {
    category: 'AI automation diagrams',
    accent: '#a855f7',
    secondary: '#10b981',
    keywords: ['automation', 'workflow', 'zapier', 'make', 'agent', 'diagram', 'ai system'],
    tags: ['automation', 'workflow', 'ai'],
    businessKitRelevance: ['Agency', 'Operations', 'SaaS'],
    difficulty: 'Advanced',
    estimatedUseTime: '10 min',
    recommendedFor: ['Operations mapping', 'Client onboarding', 'AI service delivery'],
    whatItCreates: 'Visual AI workflow diagrams that explain triggers, agents, tools, approvals, and outputs.',
    bestUseCases: ['Operations mapping', 'AI agency deliverables', 'Client onboarding'],
    sampleOutput: 'A node-based automation map with trigger, enrichment, approval checkpoint, and publishing lanes.',
    previewLabel: 'AI Workflow',
    previewType: 'campaign'
  },
  {
    category: 'Brand kits',
    accent: '#f97316',
    secondary: '#ec4899',
    keywords: ['brand', 'logo', 'palette', 'typography', 'style guide', 'identity'],
    tags: ['brand-kit', 'identity', 'style'],
    businessKitRelevance: ['New Brand', 'Agency', 'Creator', 'Retail'],
    difficulty: 'Intermediate',
    estimatedUseTime: '9 min',
    recommendedFor: ['New brands', 'Client identity systems', 'Campaign style guides'],
    whatItCreates: 'Brand kit directions with palette, typography, tone, image style, and usage rules.',
    bestUseCases: ['New brands', 'Client identity systems', 'Campaign style guides'],
    sampleOutput: 'A brand board with logo lockup, palette, font pairing, icon samples, and voice attributes.',
    previewLabel: 'Brand Kit',
    previewType: 'image'
  },
  {
    category: 'Client proposal decks',
    accent: '#eab308',
    secondary: '#ef4444',
    keywords: ['proposal', 'deck', 'client', 'pitch', 'slides', 'presentation'],
    tags: ['proposal', 'deck', 'sales'],
    businessKitRelevance: ['Agency', 'Consulting', 'Creative Services'],
    difficulty: 'Advanced',
    estimatedUseTime: '14 min',
    recommendedFor: ['Agency pitches', 'Consulting proposals', 'Retainer upsells'],
    whatItCreates: 'Client-ready proposal deck outlines with slide narrative, proof, pricing, and implementation plan.',
    bestUseCases: ['Agency pitches', 'Consulting proposals', 'Retainer upsells'],
    sampleOutput: 'A proposal deck outline with cover, diagnosis, strategy, timeline, investment, and next steps.',
    previewLabel: 'Proposal Deck',
    previewType: 'campaign'
  },
  {
    category: 'Email templates',
    accent: '#0ea5e9',
    secondary: '#22c55e',
    keywords: ['email', 'newsletter', 'sequence', 'subject line', 'drip', 'inbox'],
    tags: ['email', 'sequence', 'retention'],
    businessKitRelevance: ['Ecommerce', 'Local Services', 'Coaching', 'B2B'],
    difficulty: 'Easy',
    estimatedUseTime: '5 min',
    recommendedFor: ['Launch sequences', 'Nurture campaigns', 'Win-back emails'],
    whatItCreates: 'Email templates with subject lines, preview text, body copy, CTA, and segmentation notes.',
    bestUseCases: ['Launch sequences', 'Nurture campaigns', 'Win-back emails'],
    sampleOutput: 'Subject line options, preview text, body copy, CTA block, and segmentation notes.',
    previewLabel: 'Email Template',
    previewType: 'copy'
  },
  {
    category: 'Ad creatives',
    accent: '#ef4444',
    secondary: '#f97316',
    keywords: ['ad', 'creative', 'meta ads', 'google ads', 'campaign', 'hook', 'ugc'],
    tags: ['ads', 'creative', 'paid-media'],
    businessKitRelevance: ['Ecommerce', 'Local Services', 'Restaurant', 'Med Spa'],
    difficulty: 'Intermediate',
    estimatedUseTime: '7 min',
    recommendedFor: ['Meta ad tests', 'UGC briefs', 'Retargeting creative'],
    whatItCreates: 'Ad creative concepts with hook variants, visual direction, offer angle, and CTA copy.',
    bestUseCases: ['Meta ad tests', 'UGC briefs', 'Retargeting creative'],
    sampleOutput: 'Three ad hooks, visual direction, primary text, headline, CTA, and testing angle.',
    previewLabel: 'Ad Creative',
    previewType: 'ad'
  },
  {
    category: 'Business funding plans',
    accent: '#10b981',
    secondary: '#84cc16',
    keywords: ['funding', 'business credit', 'loan', 'capital', 'investor', 'financial plan'],
    tags: ['funding', 'finance', 'planning'],
    businessKitRelevance: ['Business Funding', 'Credit Repair', 'Consulting'],
    difficulty: 'Advanced',
    estimatedUseTime: '13 min',
    recommendedFor: ['Startup funding prep', 'Business credit planning', 'Capital roadmaps'],
    whatItCreates: 'Funding plan documents with readiness checklist, capital strategy, milestones, and lender-facing narrative.',
    bestUseCases: ['Startup funding prep', 'Business credit planning', 'Capital roadmaps'],
    sampleOutput: 'A financial roadmap with readiness score, capital stages, documents checklist, and milestone timeline.',
    previewLabel: 'Funding Plan',
    previewType: 'campaign'
  },
  {
    category: 'Credit repair documents',
    accent: '#60a5fa',
    secondary: '#a78bfa',
    keywords: ['credit repair', 'dispute', 'tradeline', 'credit score', 'bureau', 'debt validation'],
    tags: ['credit', 'documents', 'repair'],
    businessKitRelevance: ['Credit Repair', 'Financial Services'],
    difficulty: 'Intermediate',
    estimatedUseTime: '9 min',
    recommendedFor: ['Dispute packet drafts', 'Client document prep', 'Credit education workflows'],
    whatItCreates: 'Credit repair document drafts with structured sections, compliance-minded language, and evidence checklists.',
    bestUseCases: ['Dispute packet drafts', 'Client document prep', 'Credit education workflows'],
    sampleOutput: 'A clean document draft with account summary, dispute sections, evidence checklist, and next steps.',
    previewLabel: 'Credit Document',
    previewType: 'copy'
  }
];

export const defaultPromptCategory = promptCategoryTemplates[1].category;

export function getPromptCategoryTemplate(category: PromptCategory) {
  return promptCategoryTemplates.find((template) => template.category === category) ?? promptCategoryTemplates[1];
}

export function detectPromptCategory(promptText: string): PromptCategory {
  const normalized = promptText.toLowerCase();
  const scored = promptCategoryTemplates.map((template) => ({
    category: template.category,
    score: template.keywords.reduce((total, keyword) => total + (normalized.includes(keyword) ? 1 : 0), 0)
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.score ? scored[0].category : defaultPromptCategory;
}

function titleFromPrompt(promptText: string, category: PromptCategory) {
  const words = promptText.replace(/[#*_`[\]]/g, '').split(/\s+/).filter(Boolean).slice(0, 7).join(' ');
  return words ? `${words}${promptText.split(/\s+/).length > 7 ? '...' : ''}` : category;
}

function buildMockup(previewType: PromptPreviewType, title: string): PromptPreviewMockup {
  if (previewType === 'poster') {
    return {
      headline: 'LUMEN SKIN DROP',
      subheadline: 'Premium DTC product-grid hero',
      cta: 'Shop the Set',
      badges: ['Best Seller', 'New', 'Bundle', 'TikTok Shop Ready'],
      tiles: ['Glow Serum', 'Cloud Cream', 'Barrier Oil', 'Daily SPF', 'Night Mask', 'Travel Set']
    };
  }

  if (previewType === 'copy') {
    return {
      headline: title,
      subheadline: 'Copy-ready sample',
      cta: 'Use this angle',
      captionLines: ['Hook: Stop guessing what to post next.', 'Proof: Turn one insight into a full campaign.', 'CTA: Reply READY for the next step.']
    };
  }

  if (previewType === 'campaign') {
    return {
      headline: title,
      subheadline: 'Mini campaign board',
      cta: 'Build campaign',
      boardColumns: [
        { title: 'Hook', items: ['Problem aware', 'Outcome led'] },
        { title: 'Proof', items: ['Customer story', 'Metric callout'] },
        { title: 'CTA', items: ['Book now', 'Claim offer'] }
      ]
    };
  }

  if (previewType === 'video') {
    return {
      headline: title,
      subheadline: 'Vertical reel storyboard',
      cta: 'Generate reel',
      storyboard: [
        { label: '0-3s', note: 'Pattern interrupt' },
        { label: '4-8s', note: 'Problem proof' },
        { label: '9-15s', note: 'CTA close' }
      ]
    };
  }

  if (previewType === 'ad') {
    return {
      headline: title,
      subheadline: 'Paid creative preview',
      cta: 'Launch test',
      badges: ['Hook A', 'Retargeting', 'Offer'],
      captionLines: ['Primary text', 'Outcome claim', 'CTA variant']
    };
  }

  return {
    headline: title,
    subheadline: 'Premium visual preview',
    cta: 'Generate',
    tiles: ['Hero', 'Proof', 'CTA']
  };
}

function makeDescription(promptText: string, template: PromptCategoryTemplate) {
  const compact = promptText.trim().replace(/\s+/g, ' ');
  if (!compact) return template.whatItCreates;
  return compact.length > 132 ? `${compact.slice(0, 129)}...` : compact;
}

function makeVisualPreviewPrompt(promptText: string, template: PromptCategoryTemplate) {
  return `Render a premium ${template.previewLabel.toLowerCase()} preview for this prompt: ${promptText.trim() || template.whatItCreates}. Use dark luxury SaaS styling, glass panels, high-contrast typography, ${template.accent} and ${template.secondary} accents, and client-ready composition.`;
}

export function createPromptPreviewDraft(
  promptText: string,
  overrideCategory?: PromptCategory,
  previewSource: PromptPreviewSource = 'generated-mockup',
  seed = Date.now()
): PromptPreviewDraft {
  const category = overrideCategory ?? detectPromptCategory(promptText);
  const template = getPromptCategoryTemplate(category);
  const title = titleFromPrompt(promptText, category);
  const previewTitle = category === 'Ecommerce product posters' && promptText.includes('DTC ecommerce hero image') ? 'Product Grid Poster Prompt' : title;
  const previewMockup = buildMockup(template.previewType, previewTitle);

  return {
    title: previewTitle,
    category,
    description: makeDescription(promptText, template),
    tags: Array.from(new Set([...template.tags, ...((promptText.toLowerCase().match(/#[a-z0-9-]+/g) ?? []).map((tag) => tag.slice(1)))])).slice(0, 7),
    promptText,
    previewTitle,
    previewDescription: `${template.previewLabel} preview built for ${template.recommendedFor[0]?.toLowerCase() ?? 'marketing teams'}.`,
    previewType: template.previewType,
    previewImageUrl: previewSource === 'uploaded-image' ? undefined : undefined,
    previewMockup: { ...previewMockup, headline: previewMockup.headline || previewTitle },
    previewSource,
    sampleOutput: template.sampleOutput,
    businessKitRelevance: template.businessKitRelevance,
    difficulty: template.difficulty,
    estimatedUseTime: template.estimatedUseTime,
    recommendedFor: template.recommendedFor,
    visualPreviewPrompt: `${makeVisualPreviewPrompt(promptText, template)} Seed: ${seed}.`,
    whatItCreates: template.whatItCreates,
    bestUseCases: template.bestUseCases
  };
}

export function createPromptLibraryItem(promptText: string, preview: PromptPreviewDraft, existing?: Partial<PromptLibraryItem>): PromptLibraryItem {
  const now = new Date().toISOString();
  return {
    id: existing?.id ?? `prompt-${Date.now()}`,
    title: preview.previewTitle || preview.title,
    category: preview.category,
    description: preview.description,
    promptText,
    previewTitle: preview.previewTitle,
    previewDescription: preview.previewDescription,
    previewType: preview.previewType,
    previewImageUrl: preview.previewImageUrl,
    previewMockup: preview.previewMockup,
    previewSource: preview.previewSource,
    sampleOutput: preview.sampleOutput,
    tags: preview.tags,
    businessKitRelevance: preview.businessKitRelevance,
    difficulty: preview.difficulty,
    estimatedUseTime: preview.estimatedUseTime,
    recommendedFor: preview.recommendedFor,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now
  };
}

export const starterPromptLibrary: PromptLibraryItem[] = [
  createPromptLibraryItem(
    productGridPosterPromptBody,
    createPromptPreviewDraft(productGridPosterPromptBody, 'Ecommerce product posters', 'seed-template', 11),
    { id: 'product-grid-poster-prompt', createdAt: '2026-06-01T14:00:00.000Z' }
  ),
  createPromptLibraryItem(
    'Create a premium ecommerce poster for a limited edition skincare bundle with benefit callouts, luxury lighting, an urgency badge, and a clean buy now CTA.',
    createPromptPreviewDraft('Create a premium ecommerce poster for a limited edition skincare bundle with benefit callouts, luxury lighting, an urgency badge, and a clean buy now CTA.', 'Ecommerce product posters', 'seed-template', 12),
    { id: 'starter-ecommerce-poster', createdAt: '2026-05-21T14:00:00.000Z' }
  ),
  createPromptLibraryItem(
    'Design an AI automation diagram for a lead intake workflow that qualifies prospects, enriches CRM records, drafts follow-up emails, and routes hot leads to sales.',
    createPromptPreviewDraft('Design an AI automation diagram for a lead intake workflow that qualifies prospects, enriches CRM records, drafts follow-up emails, and routes hot leads to sales.', 'AI automation diagrams', 'seed-template', 18),
    { id: 'starter-ai-workflow', createdAt: '2026-05-22T14:00:00.000Z' }
  ),
  createPromptLibraryItem(
    'Generate a dark luxury website hero section for a business funding consultant with a bold promise, proof metrics, application CTA, and trust-building microcopy.',
    createPromptPreviewDraft('Generate a dark luxury website hero section for a business funding consultant with a bold promise, proof metrics, application CTA, and trust-building microcopy.', 'Website hero sections', 'seed-template', 25),
    { id: 'starter-funding-hero', createdAt: '2026-05-23T14:00:00.000Z' }
  ),
  createPromptLibraryItem(
    'Create a vertical reel storyboard for a restaurant weekend special with a 3-second hook, food closeups, owner voiceover, offer overlay, and reservation CTA.',
    {
      ...createPromptPreviewDraft('Create a vertical reel storyboard for a restaurant weekend special with a 3-second hook, food closeups, owner voiceover, offer overlay, and reservation CTA.', 'Social media posts', 'seed-template', 32),
      previewType: 'video',
      previewMockup: buildMockup('video', 'Weekend Special Reel')
    },
    { id: 'starter-restaurant-reel', createdAt: '2026-05-24T14:00:00.000Z' }
  )
];
