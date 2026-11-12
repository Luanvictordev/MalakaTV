"use client";

import { useState } from "react";
import { hostOf } from "@/lib/format";

export default function ToolLogo({
  name,
  url,
  invert = false,
}: {
  name: string;
  url: string;
  invert?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const host = hostOf(url);
  const letter = name.trim().charAt(0).toUpperCase();

  if (!host || failed) {
    return (
      <span className="flex h-full w-full items-center justify-center font-display text-sm font-extrabold text-ink">
        {letter}
      </span>
    );
  }

  return (
    <img
      src={`https://www.google.com/s2/favicons?domain=${host}&sz=128`}
      alt=""
      width={32}
      height={32}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`h-full w-full object-contain ${invert ? "invert" : ""}`}
    />
  );
}
