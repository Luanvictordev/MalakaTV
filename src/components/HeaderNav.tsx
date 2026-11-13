"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import GlobalSearch, { type SearchItem } from "./GlobalSearch";
import DiscordIcon from "./icons/DiscordIcon";
import YoutubeIcon from "./icons/YoutubeIcon";
import { EASE_OUT_EXPO } from "./Motion";
import ThemeToggle from "./ThemeToggle";
import type { Game } from "@/lib/types";

export default function HeaderNav({
  games,
  discord,
  youtube,
  handle,
  searchItems = [],
}: {
  games: Game[];
  discord: string;
  youtube: string;
  handle: string;
  searchItems?: SearchItem[];
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      const header = menuRef.current?.closest("header");
      if (header && !header.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  const linkClass = (href: string, muted = false) =>
    `text-sm font-semibold transition-colors ${
      isActive(href)
        ? "text-primary"
        : muted
          ? "text-on-chrome/50 hover:text-primary"
          : "text-on-chrome/80 hover:text-primary"
    }`;

  return (
    <>
      <nav aria-label="Navegação principal" className="hidden items-center gap-x-5 md:flex">
        {games.map((game) => {
          const href = `/jogos/${game.slug}`;
          const active = isActive(href);
          const soon = game.status !== "ativo";
          return (
            <Link
              key={game.slug}
              href={href}
              aria-current={active ? "page" : undefined}
              title={soon ? `${game.name} — ${game.releaseLabel}` : game.name}
              className={`relative flex items-center gap-1.5 py-1 ${linkClass(href, soon)}`}
            >
              <span>{game.shortName}</span>
              {soon ? (
                <span className="rounded-full border border-on-chrome/20 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-on-chrome/50">
                  em breve
                </span>
              ) : null}
              {active ? (
                <m.span
                  layoutId="header-nav-active"
                  transition={{ duration: 0.22, ease: EASE_OUT_EXPO }}
                  className="absolute inset-x-0 -bottom-1 h-0.5 rounded-full bg-primary"
                />
              ) : null}
            </Link>
          );
        })}
        <Link
          href="/ferramentas"
          aria-current={isActive("/ferramentas") ? "page" : undefined}
          className={`relative py-1 ${linkClass("/ferramentas")}`}
        >
          Ferramentas
          {isActive("/ferramentas") ? (
            <m.span
              layoutId="header-nav-active"
              transition={{ duration: 0.22, ease: EASE_OUT_EXPO }}
              className="absolute inset-x-0 -bottom-1 h-0.5 rounded-full bg-primary"
            />
          ) : null}
        </Link>
      </nav>

      <div className="ml-auto flex items-center gap-2">
        <GlobalSearch items={searchItems} />
        <ThemeToggle />
        <a
          href={discord}
          target="_blank"
          rel="noreferrer"
          aria-label="Entrar no Discord do Malaka"
          title="Discord do Malaka"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-on-chrome/10 text-on-chrome/80 transition-colors hover:bg-primary hover:text-on-primary"
        >
          <DiscordIcon className="h-4 w-4" />
        </a>
        <a href={youtube} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm hidden sm:inline-flex">
          <YoutubeIcon className="h-4 w-4" />
          {handle}
        </a>
        <button
          ref={menuButtonRef}
          type="button"
          onClick={() => setOpen((current) => !current)}
          aria-expanded={open}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-on-chrome/10 text-on-chrome transition-colors hover:bg-on-chrome/20 md:hidden"
        >
          {open ? <X className="h-4 w-4" aria-hidden="true" /> : <Menu className="h-4 w-4" aria-hidden="true" />}
        </button>
      </div>

      <AnimatePresence initial={false}>
        {open ? (
          <m.div
            key="mobile-menu"
            ref={menuRef}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: EASE_OUT_EXPO }}
            className="basis-full overflow-hidden border-t border-on-chrome/10 md:hidden"
          >
            <nav aria-label="Menu mobile" className="flex flex-col gap-1.5 pb-1 pt-3">
              {games.map((game) => {
                const href = `/jogos/${game.slug}`;
                const soon = game.status !== "ativo";
                return (
                  <Link
                    key={game.slug}
                    href={href}
                    onClick={() => setOpen(false)}
                    aria-current={isActive(href) ? "page" : undefined}
                    className={`flex items-center justify-between rounded-xl px-3 py-2.5 ${linkClass(href, soon)}`}
                  >
                    <span>{game.name}</span>
                    {soon ? (
                      <span className="rounded-full border border-on-chrome/20 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-on-chrome/50">
                        em breve
                      </span>
                    ) : null}
                  </Link>
                );
              })}
              <Link
                href="/ferramentas"
                onClick={() => setOpen(false)}
                aria-current={isActive("/ferramentas") ? "page" : undefined}
                className={`rounded-xl px-3 py-2.5 ${linkClass("/ferramentas")}`}
              >
                Ferramentas
              </Link>
              <a
                href={youtube}
                target="_blank"
                rel="noreferrer"
                onClick={() => setOpen(false)}
                className="btn btn-primary btn-sm mt-1.5 w-full sm:hidden"
              >
                <YoutubeIcon className="h-4 w-4" />
                {handle}
              </a>
            </nav>
          </m.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
