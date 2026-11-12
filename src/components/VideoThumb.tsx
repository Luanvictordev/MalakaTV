"use client";

import { useState } from "react";

export default function VideoThumb({
  videoId,
  image,
  alt,
  className = "",
}: {
  videoId: string;
  image?: string;
  alt: string;
  className?: string;
}) {
  const [step, setStep] = useState(0);
  const sources = [
    image,
    `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
    `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
  ].filter(Boolean) as string[];

  const src = sources[Math.min(step, sources.length - 1)];

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={className}
      onError={() => setStep((current) => (current + 1 < sources.length ? current + 1 : current))}
      onLoad={(event) => {
        const img = event.currentTarget;
        // maxresdefault sometimes serves a 120x90 placeholder when it does not exist.
        if (img.naturalWidth <= 120 && step + 1 < sources.length) setStep(step + 1);
      }}
    />
  );
}
