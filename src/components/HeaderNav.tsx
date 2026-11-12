"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import DiscordIcon from "./icons/DiscordIcon";
import YoutubeIcon from "./icons/YoutubeIcon";
import type { Game } from "@/lib/types";

export default function HeaderNav({
  games,
  discord,
  youtube,
  handle,
}: {
  games: Game[];
  discord: string;
  youtube: string;
  handle: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  const linkClass = (href: string) =>
    `text-sm font-semibold transition-colors ${
      isActive(href) ? "text-primary" : "text-canvas/80 hover:text-primary"
    }`;

  return (
    <>
      <nav className="hidden items-center gap-x-5 md:flex">
        {games.map((game) =>
          game.status === "ativo" ? (
            <Link
              key={game.slug}
              href={`/jogos/${game.slug}`}
              aria-current={isActive(`/jogos/${game.slug}`) ? "page" : undefined}
              className={linkClass(`/jogos/${game.slug}`)}
            >
              {game.shortName}
            </Link>
          ) : (
            <span
              key={game.slug}
              aria-disabled="true"
              title={`${game.name} — ${game.releaseLabel}`}
              className="flex cursor-default items-center gap-1.5 text-sm font-medium text-canvas/35"
            >
              {game.shortName}
              <span className="rounded-full border border-canvas/20 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-canvas/40">
                em breve
              </span>
            </span>
          ),
        )}
        <Link
          href="/ferramentas"
          aria-current={isActive("/ferramentas") ? "page" : undefined}
          className={linkClass("/ferramentas")}
        >
          Ferramentas
        </Link>
      </nav>

      <div className="ml-auto flex items-center gap-2">
        <a
          href={discord}
          target="_blank"
          rel="noreferrer"
          aria-label="Entrar no Discord do Malaka"
          title="Discord do Malaka"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-canvas/10 text-canvas/80 transition-colors hover:bg-primary hover:text-ink"
        >
          <DiscordIcon className="h-4 w-4" />
        </a>
        <a href={youtube} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm hidden sm:inline-flex">
          <YoutubeIcon className="h-4 w-4" />
          {handle}
        </a>
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          aria-expanded={open}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-canvas/10 text-canvas transition-colors hover:bg-canvas/20 md:hidden"
        >
          {open ? <X className="h-4 w-4" aria-hidden="true" /> : <Menu className="h-4 w-4" aria-hidden="true" />}
        </button>
      </div>

      {open ? (
        <div className="basis-full border-t border-canvas/10 pt-3 md:hidden">
          <nav className="flex flex-col gap-2">
            {games.map((game) =>
              game.status === "ativo" ? (
                <Link
                  key={game.slug}
                  href={`/jogos/${game.slug}`}
                  onClick={() => setOpen(false)}
                  aria-current={isActive(`/jogos/${game.slug}`) ? "page" : undefined}
                  className={`rounded-xl px-3 py-2 ${linkClass(`/jogos/${game.slug}`)}`}
                >
                  {game.name}
                </Link>
              ) : (
                <span
                  key={game.slug}
                  aria-disabled="true"
                  className="flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium text-canvas/35"
                >
                  <span>{game.shortName}</span>
                  <span className="rounded-full border border-canvas/20 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-canvas/40">
                    em breve
                  </span>
                </span>
              ),
            )}
            <Link
              href="/ferramentas"
              onClick={() => setOpen(false)}
              aria-current={isActive("/ferramentas") ? "page" : undefined}
              className={`rounded-xl px-3 py-2 ${linkClass("/ferramentas")}`}
            >
              Ferramentas
            </Link>
            <a
              href={youtube}
              target="_blank"
              rel="noreferrer"
              onClick={() => setOpen(false)}
              className="btn btn-primary btn-sm mt-1 w-full sm:hidden"
            >
              <YoutubeIcon className="h-4 w-4" />
              {handle}
            </a>
          </nav>
        </div>
      ) : null}
    </>
  );
}
