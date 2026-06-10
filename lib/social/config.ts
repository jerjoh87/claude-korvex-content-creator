import type { SocialAccountCard, SocialPlatform } from "./types";

export const platformConfig: Record<SocialPlatform, {
  label: string;
  short: string;
  color: string;
  manualPostingUrl: string;
  approvalNote: string;
  autoPostingStatus: SocialAccountCard["auto_posting_status"];
  requiredScopes: string[];
}> = {
  instagram: {
    label: "Instagram",
    short: "IG",
    color: "#e879f9",
    manualPostingUrl: "https://www.instagram.com/",
    approvalNote: "Instagram publishing may require Meta permissions and app review.",
    autoPostingStatus: "pending_approval",
    requiredScopes: ["instagram_basic", "pages_show_list"]
  },
  facebook: {
    label: "Facebook",
    short: "FB",
    color: "#60a5fa",
    manualPostingUrl: "https://www.facebook.com/",
    approvalNote: "Facebook publishing may require Meta permissions and app review.",
    autoPostingStatus: "pending_approval",
    requiredScopes: ["public_profile", "pages_show_list"]
  },
  tiktok: {
    label: "TikTok",
    short: "TT",
    color: "#67e8f9",
    manualPostingUrl: "https://www.tiktok.com/upload",
    approvalNote: "TikTok direct posting requires Content Posting API approval.",
    autoPostingStatus: "pending_approval",
    requiredScopes: ["user.info.basic", "video.upload"]
  },
  linkedin: {
    label: "LinkedIn",
    short: "IN",
    color: "#93c5fd",
    manualPostingUrl: "https://www.linkedin.com/feed/",
    approvalNote: "LinkedIn posting may require approved permissions.",
    autoPostingStatus: "pending_approval",
    requiredScopes: ["openid", "profile", "w_member_social"]
  },
  x: {
    label: "X / Twitter",
    short: "X",
    color: "#e7e9ea",
    manualPostingUrl: "https://x.com/compose/post",
    approvalNote: "X posting uses the official X API; free tier allows limited posts per month.",
    autoPostingStatus: "pending_approval",
    requiredScopes: ["tweet.read", "tweet.write", "users.read", "offline.access"]
  },
  youtube: {
    label: "YouTube Shorts",
    short: "YT",
    color: "#f87171",
    manualPostingUrl: "https://studio.youtube.com/",
    approvalNote: "YouTube upload access requires Google OAuth scopes and quota readiness.",
    autoPostingStatus: "pending_approval",
    requiredScopes: ["openid", "profile", "https://www.googleapis.com/auth/youtube.upload"]
  }
};

export const platformOrder = ["instagram", "facebook", "tiktok", "linkedin", "youtube", "x"] as const;
