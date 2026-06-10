import { platformConfig } from "./config";
import type { PostingReadiness, SocialAccountCard } from "./types";

export interface PublishDraft {
  caption: string;
  hashtags: string[];
  mediaUrl?: string;
}

export function getPostingReadiness(account: SocialAccountCard | undefined, draft: PublishDraft): PostingReadiness {
  const accountConnected = account?.status === "connected" && account.manual_posting_ready;
  const captionReady = draft.caption.trim().length > 0;
  const mediaReady = Boolean(draft.mediaUrl);
  return {
    accountConnected,
    captionReady,
    mediaReady,
    manualPostingReady: accountConnected && captionReady && mediaReady,
    autoPostingAvailable: account?.auto_posting_status === "available" && process.env.ENABLE_SOCIAL_AUTO_POSTING === "true"
  };
}

export async function publishOrPrepareManual(account: SocialAccountCard, draft: PublishDraft) {
  const readiness = getPostingReadiness(account, draft);
  if (!readiness.manualPostingReady && !readiness.autoPostingAvailable) {
    return { mode: "checklist" as const, readiness };
  }

  if (readiness.autoPostingAvailable) {
    throw new Error("Auto-posting service is intentionally disabled until platform approvals are complete.");
  }

  return {
    mode: "manual" as const,
    readiness,
    postingUrl: platformConfig[account.platform].manualPostingUrl,
    caption: [draft.caption, draft.hashtags.map((tag) => tag.startsWith("#") ? tag : `#${tag}`).join(" ")].filter(Boolean).join("\n\n")
  };
}
