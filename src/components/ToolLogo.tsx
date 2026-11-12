"use client";

import { useState } from "react";
import { hostOf } from "@/lib/format";

export default function ToolLogo({
  name,
  url,
  logo,
  invert = false,
}: {
  name: string;
  url: string;
  logo?: string;
  invert?: boolean;
}) {
  const [step, setStep] = useState(0);
  const host = hostOf(url);
  const letter = name.trim().charAt(0).toUpperCase();

  const sources = [
    logo,
    host ? `https://www.google.com/s2/favicons?domain=${host}&sz=128` : "",
  ].filter(Boolean) as string[];

  if (!sources.length || step >= sources.length) {
    return (
      <span className="flex h-full w-full items-center justify-center font-display text-sm font-extrabold text-ink">
        {letter}
      </span>
    );
  }

  return (
    <img
      src={sources[step]}
      alt=""
      width={32}
      height={32}
      loading="lazy"
      onError={() => setStep((current) => current + 1)}
      className={`h-full w-full object-contain ${invert ? "invert" : ""}`}
    />
  );
}
