"use client";

import { useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";

export default function CopyLinkButton({
  text,
  label = "Copiar link",
  copiedLabel = "Link copiado!",
  variant = "secondary",
}: {
  text?: string;
  label?: string;
  copiedLabel?: string;
  variant?: "secondary" | "tertiary";
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text ?? window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard indisponível
    }
  }

  const IdleIcon = text ? Copy : Share2;

  return (
    <button
      type="button"
      onClick={copy}
      className={`btn ${variant === "tertiary" ? "btn-tertiary" : "btn-secondary"}`}
    >
      {copied ? (
        <Check className="h-4 w-4 text-positive-deep" aria-hidden="true" />
      ) : (
        <IdleIcon className="h-4 w-4" aria-hidden="true" />
      )}
      {copied ? copiedLabel : label}
    </button>
  );
}
