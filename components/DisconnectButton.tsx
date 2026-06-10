"use client";

import { useState } from "react";

export function DisconnectButton({ accountId }: { accountId: string }) {
  const [busy, setBusy] = useState(false);
  async function disconnect() {
    setBusy(true);
    await fetch(`/api/social/accounts/${accountId}`, { method: "DELETE" });
    window.location.reload();
  }
  return (
    <button className="kx-btn is-danger is-sm" disabled={busy} onClick={disconnect} type="button">
      {busy ? "Disconnecting…" : "Disconnect"}
    </button>
  );
}
