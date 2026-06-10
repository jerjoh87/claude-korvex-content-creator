import { headers } from "next/headers";

export async function getRequestWorkspaceContext() {
  const headerBag = await headers();
  return {
    userId: headerBag.get("x-korvex-user-id") ?? process.env.DEMO_USER_ID ?? "demo-user",
    workspaceId: headerBag.get("x-korvex-workspace-id") ?? process.env.DEMO_WORKSPACE_ID ?? "demo-workspace"
  };
}
