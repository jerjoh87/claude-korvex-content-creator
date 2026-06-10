import { z } from 'zod';

export const ownedResources = {
  'business-profiles': { table: 'business_profiles' },
  'generated-content': { table: 'generated_content' },
  campaigns: { table: 'campaigns' },
  'media-assets': { table: 'media_assets' },
  'scheduled-posts': { table: 'scheduled_posts' },
  subscriptions: { table: 'subscriptions' },
  analytics: { table: 'analytics' },
  'brand-kit': { table: 'brand_kits' },
  'social-accounts': { table: 'social_accounts' },
  'remix-history': { table: 'remix_history' }
} as const;

export type OwnedResource = keyof typeof ownedResources;

export function getOwnedResource(resource: string) {
  if (resource in ownedResources) {
    return ownedResources[resource as OwnedResource];
  }
  return null;
}

export const workspacePayloadSchema = z.object({
  workspace_id: z.string().uuid()
});

export function sanitizeOwnedPayload(input: unknown, userId: string) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new Error('JSON object body is required');
  }

  const payload = { ...(input as Record<string, unknown>) };
  const parsed = workspacePayloadSchema.parse(payload);

  delete payload.id;
  delete payload.created_at;
  delete payload.updated_at;
  payload.user_id = userId;
  payload.workspace_id = parsed.workspace_id;

  return payload;
}
