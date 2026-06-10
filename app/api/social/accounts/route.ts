import { NextResponse } from "next/server";
import { getRequestWorkspaceContext } from "../../../../lib/social/requestContext";
import { listSocialAccounts } from "../../../../lib/social/repository";

export async function GET() {
  const { userId, workspaceId } = await getRequestWorkspaceContext();
  const accounts = await listSocialAccounts(userId, workspaceId);
  return NextResponse.json({ accounts });
}
