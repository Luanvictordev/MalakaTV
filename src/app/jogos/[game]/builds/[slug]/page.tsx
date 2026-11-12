import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BuildCard, Tag } from "@/components/Cards";
import { getBuild, getBuilds, getGame, getSite, youtubeWatch } from "@/lib/content";

type Params = { params: Promise<{ game: string; slug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const build = await getBuild(slug);
  if (!build) return { title: "Build não encontrada" };
  return {
    title: build.name,
    description: build.note || `Build ${build.name} — guia de Path of Exile.`,
  };
}

export default async function BuildPage({ params }: Params) {
  const { game: gameSlug, slug } = await params;
  const build = await getBuild(slug);
  if (!build) notFound();

  const game = (await getGame(build.game)) ?? (await getGame(gameSlug));
  const site = await getSite();
  const related = (await getBuilds(build.game))
    .filter((item) => item.slug !== build.slug && item.className && item.className === build.className)
    .slice(0, 3);

  return (
    <div className="bg-canvas">
      <div className="mx-auto max-w-[1000px] px-5 py-10">
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-mute">
          <Link href={`/jogos/${game?.slug ?? "poe1"}`} className="hover:text-ink">
            {game?.shortName ?? "PoE 1"}
          </Link>
          <span>/</span>
          <span className="uppercase tracking-[0.12em]">{build.className || "build"}</span>
        </div>

        <header className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              {build.tier ? <span className="badge badge-lime-solid">{build.tier}</span> : null}
              <span className="badge badge-neutral">
                {site.leaguePatch} · {site.leagueName}
              </span>
            </div>
            <h1 className="mt-3 font-display text-[clamp(2rem,4.5vw,3rem)] font-extrabold leading-[0.98] tracking-[-0.03em] text-ink">
              {build.name}
            </h1>
          </div>
          <a href={youtubeWatch(build.videoId)} target="_blank" rel="noreferrer" className="btn btn-primary">
            Abrir no YouTube ↗
          </a>
        </header>

        {build.note ? <p className="mt-4 max-w-2xl text-lg leading-relaxed text-body">{build.note}</p> : null}

        <div className="mt-4 flex flex-wrap gap-1.5">
          {build.tags.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </div>

        <div className="card mt-7 overflow-hidden p-2.5">
          <div className="aspect-video overflow-hidden rounded-2xl bg-ink">
            <iframe
              className="h-full w-full"
              src={`https://www.youtube-nocookie.com/embed/${build.videoId}`}
              title={build.videoTitle || build.name}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>

        <div className="card-soft mt-4 p-5">
          <p className="eyebrow">Vídeo do guia</p>
          <p className="mt-2 text-[15px] leading-relaxed text-ink">{build.videoTitle}</p>
          <p className="mt-2 text-sm text-body">
            PoB, leveling e detalhes estão no vídeo do canal. Esse card é o atalho.
          </p>
        </div>

        {related.length > 0 ? (
          <section className="mt-14">
            <h2 className="font-display text-2xl font-extrabold tracking-tight text-ink">
              Outras de {build.className}
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <BuildCard key={item.slug} build={item} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
