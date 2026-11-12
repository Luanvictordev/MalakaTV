import type { Metadata } from "next";
import Link from "next/link";
import { ToolCard } from "@/components/Cards";
import { getGames, getLinks, getSite } from "@/lib/content";

export const metadata: Metadata = {
  title: "Ferramentas",
  description:
    "Os sites e overlays que o MalakaTV usa: trade, preço, filtros, atlas, builds e comunidade — cada um explicado.",
};

function anchor(category: string) {
  return category.replace(/\s+/g, "-").toLowerCase();
}

export const dynamic = "force-dynamic";

export default async function FerramentasPage() {
  const links = await getLinks();
  const site = await getSite();
  const games = await getGames();
  const activeGame = games.find((game) => game.status === "ativo") ?? games[0];
  const categories = [...new Set(links.map((item) => item.category))];

  return (
    <div className="bg-canvas">
      <div className="mx-auto max-w-[1200px] px-5 py-12">
        <p className="eyebrow">Ferramentas</p>
        <h1 className="mt-3 font-display text-[clamp(2.4rem,5vw,3.5rem)] font-extrabold leading-[0.98] tracking-[-0.03em] text-ink">
          O que o Malaka usa
        </h1>
        <p className="mt-3 max-w-2xl text-lg leading-relaxed text-body">
          Cada site com o logo, o que é e pra que serve. Todos abrem em aba nova.
        </p>

        <div className="mt-6 flex flex-wrap gap-1.5">
          {categories.map((category) => (
            <a
              key={category}
              href={`#${anchor(category)}`}
              className="rounded-full bg-canvas-soft px-3 py-1.5 text-xs font-semibold text-body transition-colors hover:bg-primary-pale hover:text-ink"
            >
              {category}
            </a>
          ))}
        </div>

        <div className="mt-12 space-y-12">
          {categories.map((category) => (
            <section key={category} id={anchor(category)}>
              <div className="flex items-center gap-3">
                <h2 className="font-display text-2xl font-extrabold tracking-tight text-ink">{category}</h2>
                <span className="rule flex-1" />
                <span className="text-xs font-medium text-mute">
                  {links.filter((item) => item.category === category).length}
                </span>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {links
                  .filter((item) => item.category === category)
                  .map((item) => (
                    <ToolCard key={item.name} item={item} />
                  ))}
              </div>
            </section>
          ))}
        </div>

        <section className="mt-14">
          <div className="flex items-center gap-3">
            <h2 className="font-display text-2xl font-extrabold tracking-tight text-ink">Recursos da liga</h2>
            <span className="rule flex-1" />
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {site.spotlights.map((spotlight) => (
              <a
                key={spotlight.label}
                href={spotlight.url}
                target="_blank"
                rel="noreferrer"
                className="card-soft p-5 transition-colors hover:bg-primary-pale"
              >
                <p className="font-display text-base font-extrabold tracking-tight text-ink">
                  {spotlight.label}
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-body">{spotlight.description}</p>
              </a>
            ))}
          </div>
        </section>

        <p className="mt-12 text-sm text-body">
          Voltando pro jogo?{" "}
          <Link href={`/jogos/${activeGame.slug}`} className="font-semibold text-ink underline underline-offset-4">
            builds de {activeGame.shortName} →
          </Link>
        </p>
      </div>
    </div>
  );
}
