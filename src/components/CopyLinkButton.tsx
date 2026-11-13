"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import { EASE_OUT_EXPO } from "./Motion";

function fallbackCopy(value: string): boolean {
  try {
    const textarea = document.createElement("textarea");
    textarea.value = value;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

export default function CopyLinkButton({
  text,
  label = "Copiar link",
  copiedLabel = "Link copiado!",
  variant = "secondary",
  className = "",
}: {
  text?: string;
  label?: string;
  copiedLabel?: string;
  variant?: "secondary" | "tertiary";
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  async function copy() {
    const value = text ?? window.location.href;
    let ok = false;
    try {
      await navigator.clipboard.writeText(value);
      ok = true;
    } catch {
      ok = fallbackCopy(value);
    }

    if (ok) {
      setCopied(true);
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => setCopied(false), 2000);
    }
  }

  const IdleIcon = text ? Copy : Share2;

  return (
    <button
      type="button"
      onClick={copy}
      className={`btn ${variant === "tertiary" ? "btn-tertiary" : "btn-secondary"} ${className}`.trim()}
    >
      <AnimatePresence mode="wait" initial={false}>
        {copied ? (
          <m.span
            key="copied"
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ duration: 0.14, ease: EASE_OUT_EXPO }}
            className="inline-flex items-center gap-1.5"
          >
            <Check className="h-4 w-4 text-positive-deep" aria-hidden="true" />
            <span>{copiedLabel}</span>
          </m.span>
        ) : (
          <m.span
            key="idle"
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ duration: 0.14, ease: EASE_OUT_EXPO }}
            className="inline-flex items-center gap-1.5"
          >
            <IdleIcon className="h-4 w-4" aria-hidden="true" />
            <span>{label}</span>
          </m.span>
        )}
      </AnimatePresence>
    </button>
  );
}
