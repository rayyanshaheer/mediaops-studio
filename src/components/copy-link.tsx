"use client";
import { useState } from "react";

export function CopyLink({ value, label = "Copy website URL" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }
  return <button className="text-action" type="button" onClick={copy}>{copied ? "Copied" : label}</button>;
}
