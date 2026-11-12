"use client";

import { useState } from "react";

const KNOWN_PORTRAITS = new Set([
  "assassin",
  "berserker",
  "champion",
  "chieftain",
  "deadeye",
  "elementalist",
  "gladiator",
  "guardian",
  "hierophant",
  "inquisitor",
  "juggernaut",
  "necromancer",
  "occultist",
  "pathfinder",
  "saboteur",
  "slayer",
  "trickster",
  "warden",
  "ascendant",
]);

export default function AscendancyAvatar({
  name,
  className = "h-7 w-7",
}: {
  name: string;
  className?: string;
}) {
  const key = name.trim().toLowerCase();
  const hasPortrait = KNOWN_PORTRAITS.has(key);
  const [failed, setFailed] = useState(false);

  if (!hasPortrait || failed) {
    return (
      <span
        className={`flex shrink-0 items-center justify-center rounded-full bg-ink/10 font-display text-[11px] font-extrabold text-ink ${className}`}
      >
        {name.trim().charAt(0).toUpperCase()}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/ascendancies/${key}.png`}
      alt=""
      width={32}
      height={32}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`shrink-0 rounded-full object-cover object-top ring-1 ring-ink/15 ${className}`}
    />
  );
}
