"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import { EASE_OUT_EXPO } from "./Motion";

const RING_RADIUS = 18;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export default function BackToTop() {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 420);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible ? (
        <m.button
          key="back-to-top"
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Voltar ao topo"
          title="Voltar ao topo"
          initial={{ opacity: 0, y: 8, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.92 }}
          transition={{ duration: 0.2, ease: EASE_OUT_EXPO }}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.94 }}
          className="fixed bottom-20 right-5 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-chrome text-primary shadow-lg transition-colors duration-150 hover:bg-ink-deep sm:bottom-5"
        >
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full -rotate-90"
            viewBox="0 0 40 40"
            aria-hidden="true"
          >
            <circle
              cx="20"
              cy="20"
              r={RING_RADIUS}
              fill="none"
              stroke="currentColor"
              strokeOpacity="0.2"
              strokeWidth="2"
            />
            <circle
              cx="20"
              cy="20"
              r={RING_RADIUS}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={RING_CIRCUMFERENCE}
              strokeDashoffset={RING_CIRCUMFERENCE * (1 - progress)}
            />
          </svg>
          <ArrowUp className="relative h-4 w-4" aria-hidden="true" />
        </m.button>
      ) : null}
    </AnimatePresence>
  );
}
