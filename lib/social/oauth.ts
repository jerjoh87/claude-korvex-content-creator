import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";
import type { SocialPlatform } from "./types";

const COOKIE_PREFIX = "korvex_social_oauth";

export interface OAuthStatePayload {
  state: string;
  userId: string;
  workspaceId: string;
  platform: SocialPlatform;
  returnTo: string;
}

export async function createOAuthState(platform: SocialPlatform, userId: string, workspaceId: string, returnTo = "/social/accounts") {
  const state = randomUUID();
  const payload: OAuthStatePayload = { state, platform, userId, workspaceId, returnTo };
  const cookieStore = await cookies();
  cookieStore.set(`${COOKIE_PREFIX}_${state}`, Buffer.from(JSON.stringify(payload)).toString("base64url"), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 10,
    path: "/"
  });
  return payload;
}

export async function consumeOAuthState(state: string, platform: SocialPlatform): Promise<OAuthStatePayload> {
  const name = `${COOKIE_PREFIX}_${state}`;
  const cookieStore = await cookies();
  const value = cookieStore.get(name)?.value;
  cookieStore.delete(name);
  if (!value) throw new Error("OAuth state expired or missing.");
  const payload = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as OAuthStatePayload;
  if (payload.state !== state || payload.platform !== platform) {
    throw new Error("OAuth state mismatch.");
  }
  return payload;
}

export function getRequiredEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required.`);
  return value;
}

export function appUrl(path: string) {
  return `${getRequiredEnv("NEXT_PUBLIC_APP_URL")}${path}`;
}
