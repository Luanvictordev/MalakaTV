"use client";

import type { ReactNode } from "react";
import { m } from "motion/react";
import { EASE_OUT_EXPO } from "@/components/Motion";

export default function Template({ children }: { children: ReactNode }) {
  return (
    <m.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: EASE_OUT_EXPO }}
    >
      {children}
    </m.div>
  );
}
