"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 420);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Voltar ao topo"
      title="Voltar ao topo"
      className="fixed bottom-5 right-5 z-40 flex h-10 w-10 items-center justify-center rounded-full bg-ink text-primary shadow-lg transition-all duration-150 hover:-translate-y-0.5 hover:bg-ink-deep active:scale-95"
    >
      <ArrowUp className="h-4 w-4" aria-hidden="true" />
    </button>
  );
}
