import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import CopyLinkButton from "@/components/CopyLinkButton";
import YoutubeIcon from "@/components/icons/YoutubeIcon";
import { BuildCard, Tag } from "@/components/Cards";
import { getBuild, getBuilds, getGame, getSite, youtubeThumb, youtubeWatch } from "@/lib/content";
import { SITE_URL } from "@/lib/seo";

type Params = { params: Promise<{ game: string; slug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const build = await getBuild(slug);
  if (!build) return { title: "Build não encontrada" };
  const description = build.note || `Build ${build.name} — guia de Path of Exile.`;
  const thumb = build.image || (build.videoId ? youtubeThumb(build.videoId) : undefined);

  return {
    title: build.name,
    description,
    alternates: {
      canonical: `/jogos/${build.game}/builds/${build.slug}`,
    },
    openGraph: {
      title: build.name,
      description,
      type: "article",
      url: `/jogos/${build.game}/builds/${build.slug}`,
      images: thumb ? [thumb] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      images: thumb ? [thumb] : undefined,
    },
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

  const pageUrl = `${SITE_URL}/jogos/${build.game}/builds/${build.slug}`;
  const thumbUrl = build.image || (build.videoId ? youtubeThumb(build.videoId) : undefined);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Início", item: SITE_URL },
        {
          "@type": "ListItem",
          position: 2,
          name: game?.shortName ?? "PoE 1",
          item: `${SITE_URL}/jogos/${game?.slug ?? "poe1"}`,
        },
        { "@type": "ListItem", position: 3, name: build.name, item: pageUrl },
      ],
    },
    ...(build.videoId
      ? [
          {
            "@context": "https://schema.org",
            "@type": "VideoObject",
            name: build.videoTitle || build.name,
            description: build.note || `Guia da build ${build.name} para ${game?.name ?? "Path of Exile"}.`,
            thumbnailUrl: thumbUrl ? [thumbUrl] : undefined,
            embedUrl: `https://www.youtube-nocookie.com/embed/${build.videoId}`,
            contentUrl: youtubeWatch(build.videoId),
          },
        ]
      : []),
  ];

  return (
    <div className="bg-canvas">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
          <div className="flex flex-wrap items-center gap-2.5">
            <a href={youtubeWatch(build.videoId)} target="_blank" rel="noreferrer" className="btn btn-primary">
              <YoutubeIcon className="h-4 w-4" />
              Abrir no YouTube
              <ExternalLink className="h-3.5 w-3.5 opacity-75" aria-hidden="true" />
            </a>
            <CopyLinkButton variant="tertiary" />
            {build.pobUrl ? (
              <>
                <CopyLinkButton text={build.pobUrl} label="Copiar PoB" copiedLabel="PoB copiado!" variant="tertiary" />
                <a href={build.pobUrl} target="_blank" rel="noreferrer" className="btn btn-tertiary">
                  Abrir PoB
                  <ExternalLink className="h-3.5 w-3.5 opacity-75" aria-hidden="true" />
                </a>
              </>
            ) : null}
          </div>
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
            {build.pobUrl
              ? "Leveling e demais detalhes estão disponíveis no vídeo completo."
              : "PoB, leveling e demais detalhes estão disponíveis no vídeo completo."}
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
