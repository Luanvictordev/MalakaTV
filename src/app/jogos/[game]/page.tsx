import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import YoutubeIcon from "@/components/icons/YoutubeIcon";
import BuildsExplorer from "@/components/BuildsExplorer";
import { FarmRow, GuideCard, SectionTitle } from "@/components/Cards";
import { getBuilds, getGame, getGames, getGuides, getSite } from "@/lib/content";

type Params = { params: Promise<{ game: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { game: slug } = await params;
  const game = await getGame(slug);
  if (!game) return { title: "Jogo não encontrado" };
  const title = `${game.name} — ${game.releaseLabel}`;
  return {
    title,
    description: game.description,
    alternates: {
      canonical: `/jogos/${slug}`,
    },
    openGraph: {
      title,
      description: game.description,
      url: `/jogos/${slug}`,
    },
  };
}

export default async function GamePage({ params }: Params) {
  const { game: slug } = await params;
  const game = await getGame(slug);
  if (!game) notFound();

  const site = await getSite();
  const games = await getGames();
  const activeGame = games.find((item) => item.status === "ativo");
  const builds = await getBuilds(game.slug);
  const guides = await getGuides(game.slug);
  const guideCards = guides.filter((guide) => guide.kind === "guia");
  const farms = guides.filter((guide) => guide.kind === "farm");

  if (game.status !== "ativo") {
    return (
      <div className="bg-canvas">
        <div className="mx-auto max-w-[820px] px-5 py-16">
          <span className="badge badge-neutral">em breve</span>
          <h1 className="mt-4 font-display text-[clamp(2.4rem,5vw,3.5rem)] font-extrabold leading-[0.98] tracking-[-0.03em] text-ink">
            {game.name}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-body">{game.description}</p>

          <div className="card-soft mt-8 p-6">
            <p className="eyebrow">Previsão</p>
            <p className="mt-2 font-display text-2xl font-extrabold tracking-tight text-ink">
              {game.releaseLabel}
            </p>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-body">
              Nada de guia pela metade. Quando começar, os cards entram aqui — build, farm e ferramenta
              no mesmo formato do {activeGame?.shortName ?? "PoE 1"}.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/" className="btn btn-secondary">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Voltar pra home
            </Link>
            <a href={site.youtube} target="_blank" rel="noreferrer" className="btn btn-primary">
              <YoutubeIcon className="h-4 w-4" />
              Acompanhar no canal
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <section className="border-b border-ink/10 bg-canvas">
        <div className="mx-auto max-w-[1200px] px-5 py-12">
          <div className="flex flex-wrap items-center gap-2">
            <span className="badge badge-lime">Liga {site.leaguePatch}</span>
            <span className="text-xs font-medium text-mute">{game.releaseLabel}</span>
          </div>
          <h1 className="mt-4 font-display text-[clamp(2.4rem,5vw,3.75rem)] font-extrabold leading-[0.96] tracking-[-0.03em] text-ink">
            {game.name}
          </h1>
          <p className="mt-3 max-w-2xl text-lg leading-relaxed text-body">{game.description}</p>
        </div>
      </section>

      <section className="bg-canvas-soft py-12">
        <div className="mx-auto max-w-[1200px] px-5">
          <SectionTitle
            eyebrow={`League starter ${site.leaguePatch}`}
            title={`${builds.length} builds pra liga`}
            description="Filtre por ascendancy, tag ou busque pela skill que você quer jogar."
          />
          <div className="mt-7">
            <Suspense fallback={null}>
              <BuildsExplorer builds={builds} />
            </Suspense>
          </div>
        </div>
      </section>

      {guideCards.length > 0 ? (
        <section className="border-t border-ink/10 bg-canvas py-12">
          <div className="mx-auto max-w-[1200px] px-5">
            <SectionTitle
              eyebrow="Fundamentos"
              title="Guias"
              description="Atos e atlas explicados pra quem está começando a liga."
            />
            <div className="mt-7 grid gap-4 md:grid-cols-2">
              {guideCards.map((guide) => (
                <GuideCard key={guide.slug} guide={guide} large />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {farms.length > 0 ? (
        <section className="bg-canvas-soft py-12">
          <div className="mx-auto max-w-[1200px] px-5">
            <SectionTitle
              eyebrow="Economia"
              title="FARMs que pagam"
              description="Farms seguros pra primeira semana da liga."
            />
            <div className="card mt-7 p-5">
              {farms.map((farm) => (
                <FarmRow key={farm.slug} guide={farm} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
