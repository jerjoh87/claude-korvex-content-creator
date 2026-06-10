import { NextRequest, NextResponse } from "next/server";
import { disconnectSocialAccount } from "../../../../../lib/social/repository";
import { getRequestWorkspaceContext } from "../../../../../lib/social/requestContext";

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const { userId } = await getRequestWorkspaceContext();

  await disconnectSocialAccount(id, userId);

  return NextResponse.json({ ok: true });
}
