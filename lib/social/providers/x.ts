import { createHmac } from "node:crypto";
import { appUrl, getRequiredEnv } from "../oauth";
import { platformConfig } from "../config";
import type { OAuthProfile, OAuthProvider, OAuthTokenSet } from "../types";

/**
 * X (Twitter) OAuth 2.0 with mandatory PKCE.
 *
 * The shared OAuthProvider flow only round-trips `state` between the
 * authorize and callback steps, so the PKCE verifier is derived
 * deterministically from `state` + the client secret (plain method:
 * challenge === verifier). The value is unguessable without the secret and
 * the state cookie already binds the flow to this browser.
 */
function pkceVerifierFromState(state: string): string {
  return createHmac("sha256", getRequiredEnv("X_CLIENT_SECRET")).update(state).digest("hex");
}

export class XProvider implements OAuthProvider {
  platform = "x" as const;
  displayName = platformConfig.x.label;
  requiredScopes = platformConfig.x.requiredScopes;
  manualPostingUrl = platformConfig.x.manualPostingUrl;
  supportsAutoPosting = false;
  approvalNote = platformConfig.x.approvalNote;

  getAuthorizationUrl(state: string): string {
    const url = new URL("https://x.com/i/oauth2/authorize");
    url.searchParams.set("response_type", "code");
    url.searchParams.set("client_id", getRequiredEnv("X_CLIENT_ID"));
    url.searchParams.set("redirect_uri", appUrl("/api/social/oauth/x/callback"));
    url.searchParams.set("scope", this.requiredScopes.join(" "));
    url.searchParams.set("state", state);
    url.searchParams.set("code_challenge", pkceVerifierFromState(state));
    url.searchParams.set("code_challenge_method", "plain");
    return url.toString();
  }

  async exchangeCodeForTokens(code: string, state?: string): Promise<OAuthTokenSet> {
    if (!state) throw new Error("X token exchange requires the OAuth state for PKCE.");
    const basic = Buffer.from(`${getRequiredEnv("X_CLIENT_ID")}:${getRequiredEnv("X_CLIENT_SECRET")}`).toString("base64");
    const response = await fetch("https://api.x.com/2/oauth2/token", {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        authorization: `Basic ${basic}`
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: appUrl("/api/social/oauth/x/callback"),
        code_verifier: pkceVerifierFromState(state)
      })
    });
    if (!response.ok) throw new Error(`X token exchange failed: ${response.status}`);
    const json = await response.json() as { access_token: string; refresh_token?: string; expires_in?: number; scope?: string };
    return {
      accessToken: json.access_token,
      refreshToken: json.refresh_token,
      expiresAt: json.expires_in ? new Date(Date.now() + json.expires_in * 1000) : undefined,
      scopes: json.scope?.split(" ") ?? this.requiredScopes
    };
  }

  async getProfile(tokens: OAuthTokenSet): Promise<OAuthProfile> {
    const response = await fetch("https://api.x.com/2/users/me", {
      headers: { Authorization: `Bearer ${tokens.accessToken}` }
    });
    if (!response.ok) throw new Error(`X profile lookup failed: ${response.status}`);
    const json = await response.json() as { data?: { id: string; name?: string; username?: string } };
    if (!json.data?.id) throw new Error("X profile response missing user id.");
    return {
      platformAccountId: json.data.id,
      accountName: json.data.name ?? json.data.username ?? "X User",
      accountHandle: json.data.username ? `@${json.data.username}` : "X User"
    };
  }
}
