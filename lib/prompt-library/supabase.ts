import 'server-only';

import { createClient } from '@/lib/supabase/server';
import type { InsertTables, Json, Tables } from '@/lib/supabase/database.types';
import { createPromptLibraryItem, createPromptPreviewDraft, detectPromptCategory } from './templates';
import type { PromptLibraryItem } from './types';

export type BusinessProfileSummary = {
  id: string;
  name: string;
  industry: string;
  audience: string;
  voice: string;
};

export type BrandKitSummary = {
  id: string;
  colors: string[];
  fonts: string[];
  logos: string[];
  guidelines: string;
};

export type ContentHistoryItem = {
  id: string;
  title: string;
  prompt: string;
  content: string;
  createdAt: string;
  category?: string;
  templateTitle?: string;
};

export type ContentGeneratorData = {
  workspaceId: string | null;
  businessProfile: BusinessProfileSummary | null;
  brandKit: BrandKitSummary | null;
  supabasePrompts: PromptLibraryItem[];
  history: ContentHistoryItem[];
  loadError: string | null;
};

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;
type TemplateRow = Tables<'template_library'>;
type GeneratedContentRow = Tables<'generated_content'>;

const jsonArrayToStrings = (value: Json): string[] => {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string');
};

const jsonToLabel = (value: Json): string => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return jsonArrayToStrings(value).join(', ');
  if (typeof value === 'object') {
    return Object.entries(value)
      .map(([key, entry]) => `${key}: ${typeof entry === 'string' ? entry : JSON.stringify(entry)}`)
      .join(', ');
  }
  return String(value);
};

async function getCurrentWorkspaceId(supabase: SupabaseClient, userId: string) {
  const owned = await supabase.from('workspaces').select('id').eq('owner_id', userId).order('created_at').limit(1).maybeSingle();
  if (owned.data?.id) return owned.data.id;

  const membership = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .eq('user_id', userId)
    .order('created_at')
    .limit(1)
    .maybeSingle();

  return membership.data?.workspace_id ?? null;
}

function mapTemplateToPrompt(template: TemplateRow): PromptLibraryItem {
  const category = detectPromptCategory([template.category, template.template_type, template.prompt_body].filter(Boolean).join(' '));
  const draft = createPromptPreviewDraft(template.prompt_body, category, 'seed-template', template.id.length);
  return createPromptLibraryItem(template.prompt_body, {
    ...draft,
    title: template.title,
    previewTitle: template.title,
    previewDescription: template.description ?? draft.previewDescription,
    sampleOutput: template.sample_output ?? draft.sampleOutput,
    tags: jsonArrayToStrings(template.tags).length ? jsonArrayToStrings(template.tags) : draft.tags,
    recommendedFor: [template.business_type, template.industry, template.platform].filter(Boolean) as string[]
  }, {
    id: template.id,
    createdAt: template.created_at ?? new Date().toISOString()
  });
}

function mapBusinessProfile(row: Tables<'business_profiles'>): BusinessProfileSummary {
  return {
    id: row.id,
    name: row.name,
    industry: row.industry ?? 'Not set',
    audience: jsonToLabel(row.audience),
    voice: jsonToLabel(row.voice)
  };
}

function mapBrandKit(row: Tables<'brand_kits'>): BrandKitSummary {
  return {
    id: row.id,
    colors: jsonArrayToStrings(row.colors),
    fonts: jsonArrayToStrings(row.fonts),
    logos: jsonArrayToStrings(row.logos),
    guidelines: row.guidelines ?? ''
  };
}

function mapHistory(row: GeneratedContentRow): ContentHistoryItem {
  const metadata = row.metadata && typeof row.metadata === 'object' && !Array.isArray(row.metadata) ? row.metadata : {};
  return {
    id: row.id,
    title: typeof metadata.title === 'string' ? metadata.title : 'Generated content',
    prompt: row.prompt ?? '',
    content: row.content,
    createdAt: row.created_at,
    category: typeof metadata.category === 'string' ? metadata.category : undefined,
    templateTitle: typeof metadata.templateTitle === 'string' ? metadata.templateTitle : undefined
  };
}

export async function loadContentGeneratorData(): Promise<ContentGeneratorData> {
  try {
    const supabase = await createClient();
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      return {
        workspaceId: null,
        businessProfile: null,
        brandKit: null,
        supabasePrompts: [],
        history: [],
        loadError: 'Sign in to load your Supabase business profile, Brand Kit, templates, and content history.'
      };
    }

    const workspaceId = await getCurrentWorkspaceId(supabase, authData.user.id);
    if (!workspaceId) {
      return {
        workspaceId: null,
        businessProfile: null,
        brandKit: null,
        supabasePrompts: [],
        history: [],
        loadError: 'No workspace was found for this account.'
      };
    }

    const [businessProfileResult, brandKitResult, templateResult, historyResult] = await Promise.all([
      supabase
        .from('business_profiles')
        .select('*')
        .eq('workspace_id', workspaceId)
        .eq('user_id', authData.user.id)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from('brand_kits')
        .select('*')
        .eq('workspace_id', workspaceId)
        .eq('user_id', authData.user.id)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from('template_library')
        .select('*')
        .eq('is_active', true)
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(60),
      supabase
        .from('generated_content')
        .select('*')
        .eq('workspace_id', workspaceId)
        .eq('user_id', authData.user.id)
        .eq('content_type', 'content_generator')
        .order('created_at', { ascending: false })
        .limit(24)
    ]);

    const loadErrors = [
      businessProfileResult.error?.message,
      brandKitResult.error?.message,
      templateResult.error?.message,
      historyResult.error?.message
    ].filter(Boolean);

    return {
      workspaceId,
      businessProfile: businessProfileResult.data ? mapBusinessProfile(businessProfileResult.data) : null,
      brandKit: brandKitResult.data ? mapBrandKit(brandKitResult.data) : null,
      supabasePrompts: (templateResult.data ?? []).map(mapTemplateToPrompt),
      history: (historyResult.data ?? []).map(mapHistory),
      loadError: loadErrors.length ? `Some Supabase data could not load: ${loadErrors.join(' ')}` : null
    };
  } catch (error) {
    return {
      workspaceId: null,
      businessProfile: null,
      brandKit: null,
      supabasePrompts: [],
      history: [],
      loadError: error instanceof Error ? error.message : 'Unable to load Supabase data.'
    };
  }
}

export type SaveGeneratedContentInput = {
  workspaceId: string;
  title: string;
  prompt: string;
  content: string;
  category?: string;
  templateTitle?: string;
  previewType?: string;
};

export async function saveGeneratedContent(input: SaveGeneratedContentInput) {
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) throw new Error('Sign in to save generated content.');

  const payload: InsertTables<'generated_content'> = {
    user_id: authData.user.id,
    workspace_id: input.workspaceId,
    prompt: input.prompt,
    content: input.content,
    content_type: 'content_generator',
    metadata: {
      title: input.title,
      category: input.category,
      templateTitle: input.templateTitle,
      previewType: input.previewType
    }
  };

  const { data, error } = await supabase.from('generated_content').insert(payload).select('*').single();
  if (error) throw new Error(error.message);

  await trackContentGeneratorEvent({
    workspaceId: input.workspaceId,
    metricName: 'content_generator_saved',
    dimensions: {
      title: input.title,
      category: input.category,
      templateTitle: input.templateTitle
    }
  });

  return mapHistory(data);
}

export type TrackContentGeneratorEventInput = {
  workspaceId: string;
  metricName: string;
  metricValue?: number;
  dimensions?: Record<string, Json | undefined>;
};

export async function trackContentGeneratorEvent(input: TrackContentGeneratorEventInput) {
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) return;

  const payload: InsertTables<'analytics'> = {
    user_id: authData.user.id,
    workspace_id: input.workspaceId,
    metric_name: input.metricName,
    metric_value: input.metricValue ?? 1,
    dimensions: input.dimensions ?? {}
  };

  await supabase.from('analytics').insert(payload);
}
