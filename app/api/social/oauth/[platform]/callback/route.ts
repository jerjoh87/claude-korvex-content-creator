import { NextRequest, NextResponse } from "next/server";
import { consumeOAuthState } from "../../../../../../lib/social/oauth";
import { getOAuthProvider } from "../../../../../../lib/social/providers/factory";
import { upsertSocialAccount } from "../../../../../../lib/social/repository";
import { supportedPlatforms, type SocialPlatform } from "../../../../../../lib/social/types";

function parsePlatform(value: string): SocialPlatform {
  if (supportedPlatforms.includes(value as SocialPlatform)) return value as SocialPlatform;
  throw new Error("Unsupported social platform.");
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ platform: string }> }
) {
  const { platform: platformParam } = await context.params;
  const platform = parsePlatform(platformParam);
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const stateValue = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  if (error) {
    return NextResponse.redirect(new URL(`/social/accounts?oauth_error=${encodeURIComponent(error)}`, request.url));
  }
  if (!code || !stateValue) {
    return NextResponse.redirect(new URL("/social/accounts?oauth_error=missing_code_or_state", request.url));
  }

  try {
    const state = await consumeOAuthState(stateValue, platform);
    const provider = getOAuthProvider(platform);
    const tokens = await provider.exchangeCodeForTokens(code, stateValue);
    const profile = await provider.getProfile(tokens);
    await upsertSocialAccount({ userId: state.userId, workspaceId: state.workspaceId, platform, tokens, profile });
    return NextResponse.redirect(new URL(`${state.returnTo}?connected=${platform}`, request.url));
  } catch (callbackError) {
    const message = callbackError instanceof Error ? callbackError.message : "oauth_callback_failed";
    return NextResponse.redirect(new URL(`/social/accounts?oauth_error=${encodeURIComponent(message)}`, request.url));
  }
}
