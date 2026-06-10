export type PromptPreviewType = 'image' | 'carousel' | 'copy' | 'campaign' | 'ad' | 'poster' | 'video';

export type PromptPreviewSource = 'generated-mockup' | 'uploaded-image' | 'seed-template';

export type PromptDifficulty = 'Easy' | 'Intermediate' | 'Advanced';

export type PromptCategory =
  | 'Ecommerce product posters'
  | 'Social media posts'
  | 'Website hero sections'
  | 'Landing pages'
  | 'AI automation diagrams'
  | 'Brand kits'
  | 'Client proposal decks'
  | 'Email templates'
  | 'Ad creatives'
  | 'Business funding plans'
  | 'Credit repair documents';

export type PromptPreviewMockup = {
  headline: string;
  subheadline?: string;
  cta?: string;
  badges?: string[];
  tiles?: string[];
  captionLines?: string[];
  boardColumns?: Array<{ title: string; items: string[] }>;
  storyboard?: Array<{ label: string; note: string }>;
};

export type PromptLibraryItem = {
  id: string;
  title: string;
  category: PromptCategory;
  description: string;
  promptText: string;
  previewTitle: string;
  previewDescription: string;
  previewType: PromptPreviewType;
  previewImageUrl?: string;
  previewMockup?: PromptPreviewMockup;
  previewSource: PromptPreviewSource;
  sampleOutput?: string;
  tags: string[];
  businessKitRelevance: string[];
  difficulty: PromptDifficulty;
  estimatedUseTime: string;
  recommendedFor: string[];
  createdAt: string;
  updatedAt: string;
};

export type PromptPreviewDraft = Omit<PromptLibraryItem, 'id' | 'createdAt' | 'updatedAt'> & {
  visualPreviewPrompt: string;
  whatItCreates: string;
  bestUseCases: string[];
};

export type PromptCategoryTemplate = {
  category: PromptCategory;
  accent: string;
  secondary: string;
  keywords: string[];
  tags: string[];
  businessKitRelevance: string[];
  difficulty: PromptDifficulty;
  estimatedUseTime: string;
  recommendedFor: string[];
  whatItCreates: string;
  bestUseCases: string[];
  sampleOutput: string;
  previewLabel: string;
  previewType: PromptPreviewType;
};
