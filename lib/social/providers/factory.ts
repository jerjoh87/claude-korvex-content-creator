import { MetaProvider } from "./meta";
import { TikTokProvider } from "./tiktok";
import { LinkedInProvider } from "./linkedin";
import { YouTubeProvider } from "./youtube";
import { XProvider } from "./x";
import type { OAuthProvider, SocialPlatform } from "../types";

export function getOAuthProvider(platform: SocialPlatform): OAuthProvider {
  if (platform === "instagram" || platform === "facebook") return new MetaProvider(platform);
  if (platform === "tiktok") return new TikTokProvider();
  if (platform === "linkedin") return new LinkedInProvider();
  if (platform === "youtube") return new YouTubeProvider();
  if (platform === "x") return new XProvider();
  throw new Error(`Unsupported social platform: ${platform}`);
}
