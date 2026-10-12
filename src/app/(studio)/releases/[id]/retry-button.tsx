"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function RetryButton({ releaseId }: { releaseId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  async function retry() {
    setPending(true);
    const response = await fetch(`/api/releases/${releaseId}/retry`, { method: "POST" });
    setPending(false);
    if (response.ok) router.refresh();
  }
  return <button className="button secondary" type="button" onClick={retry} disabled={pending}>{pending ? "Preparing…" : "Retry release"}</button>;
}
