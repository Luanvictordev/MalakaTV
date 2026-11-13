"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import { EASE_OUT_EXPO } from "./Motion";

const STORAGE_KEY = "malaka-theme";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
    setMounted(true);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    document.documentElement.style.colorScheme = next ? "dark" : "light";
    try {
      localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
    } catch {
      // Ignore storage errors in restricted contexts
    }
  };

  const isDark = mounted && dark;
  const label = isDark ? "Ativar tema claro" : "Ativar tema escuro";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      aria-pressed={isDark}
      title={label}
      className="flex h-9 w-9 items-center justify-center rounded-full bg-on-chrome/10 text-on-chrome/80 transition-colors hover:bg-primary hover:text-on-primary"
    >
      <AnimatePresence mode="wait" initial={false}>
        <m.span
          key={isDark ? "sun" : "moon"}
          initial={{ opacity: 0, rotate: -45, scale: 0.75 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 45, scale: 0.75 }}
          transition={{ duration: 0.16, ease: EASE_OUT_EXPO }}
          className="inline-flex items-center justify-center"
        >
          {isDark ? (
            <Sun className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Moon className="h-4 w-4" aria-hidden="true" />
          )}
        </m.span>
      </AnimatePresence>
    </button>
  );
}
