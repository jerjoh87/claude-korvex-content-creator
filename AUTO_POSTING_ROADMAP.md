# Auto-Posting Roadmap

## Current state

Phase 1 ships account connection, encrypted token storage, account status cards, settings integration, scheduling readiness, and manual posting assistance. Auto-posting remains disabled by default.

## Approval requirements

- Instagram/Facebook publishing may require Meta permissions and app review.
- TikTok direct posting requires Content Posting API approval.
- LinkedIn posting may require approved permissions and product access.
- YouTube Shorts publishing requires Google OAuth verification, YouTube upload scope approval, and quota planning.

## Milestone 1: provider publish contracts

Add a common provider method:

```ts
publishPost(input: {
  accountId: string;
  caption: string;
  hashtags: string[];
  mediaUrl: string;
  scheduledAt?: string;
}): Promise<{ providerPostId: string; status: "published" | "scheduled" }>;
```

Each implementation should live in:

- `lib/social/providers/meta.ts`
- `lib/social/providers/tiktok.ts`
- `lib/social/providers/linkedin.ts`
- `lib/social/providers/youtube.ts`

## Milestone 2: scheduling worker integration

When scheduled content is due:

1. Load the connected account metadata and encrypted token row server-side.
2. Decrypt the access token only inside the worker/provider boundary.
3. Refresh tokens if needed.
4. Upload media using provider-specific APIs.
5. Record provider post id and publish status.
6. Fall back to manual checklist if provider publishing fails or approval is missing.

## Milestone 3: observability and controls

- Add audit logs for connect, disconnect, token refresh, manual posted, auto-post success, and auto-post failure.
- Add workspace-level `ENABLE_SOCIAL_AUTO_POSTING` controls.
- Add retry queues with dead-letter handling.
- Add per-platform rate-limit tracking.

## Milestone 4: compliance launch

- Complete platform app reviews.
- Add customer-facing permission explanations.
- Add deletion and disconnect guarantees.
- Add token rotation runbooks.
- Run production security review before turning on auto-posting.
