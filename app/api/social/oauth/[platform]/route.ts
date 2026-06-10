import { NextRequest, NextResponse } from "next/server";
import { createOAuthState } from "../../../../../lib/social/oauth";
import { getRequestWorkspaceContext } from "../../../../../lib/social/requestContext";
import { getOAuthProvider } from "../../../../../lib/social/providers/factory";
import { supportedPlatforms, type SocialPlatform } from "../../../../../lib/social/types";

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
  const provider = getOAuthProvider(platform);
  const { userId, workspaceId } = await getRequestWorkspaceContext();
  const returnTo = new URL(request.url).searchParams.get("returnTo") ?? "/social/accounts";
  const state = await createOAuthState(platform, userId, workspaceId, returnTo);
  return NextResponse.redirect(provider.getAuthorizationUrl(state.state));
}
