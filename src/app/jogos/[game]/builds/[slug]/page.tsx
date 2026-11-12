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
  const { game: gameSlug, slug } = await params;
  const build = await getBuild(slug);
  if (!build) return { title: "Build não encontrada" };
  const game = (await getGame(build.game)) ?? (await getGame(gameSlug));
  const description = build.note || `Build ${build.name} — guia de ${game?.name ?? "ARPG"}.`;
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
          name: game?.shortName ?? gameSlug,
          item: `${SITE_URL}/jogos/${game?.slug ?? gameSlug}`,
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
            description: build.note || `Guia da build ${build.name} para ${game?.name ?? "ARPG"}.`,
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
      <div className="mx-auto max-w-[1000px] px-5 py-6 sm:py-10">
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-mute">
          <Link href={`/jogos/${game?.slug ?? gameSlug}`} className="hover:text-ink">
            {game?.shortName ?? gameSlug}
          </Link>
          <span>/</span>
          <span className="uppercase tracking-[0.12em]">{build.className || "build"}</span>
        </div>

        <header className="mt-4 flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-end lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              {build.tier ? <span className="badge badge-lime-solid">{build.tier}</span> : null}
              <span className="badge badge-neutral">
                {site.leaguePatch} · {site.leagueName}
              </span>
            </div>
            <h1 className="mt-3 font-display text-[clamp(1.85rem,4.5vw,3rem)] font-extrabold leading-[0.98] tracking-[-0.03em] text-ink">
              {build.name}
            </h1>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-2.5">
            <a
              href={youtubeWatch(build.videoId)}
              target="_blank"
              rel="noreferrer"
              className={`btn btn-primary w-full px-3 sm:w-auto sm:px-6 ${build.pobUrl ? "col-span-2 sm:col-span-1" : ""}`}
            >
              <YoutubeIcon className="h-4 w-4 shrink-0" />
              Abrir no YouTube
              <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-75" aria-hidden="true" />
            </a>
            <CopyLinkButton variant="tertiary" className="w-full px-3 sm:w-auto sm:px-6" />
            {build.pobUrl ? (
              <>
                <CopyLinkButton
                  text={build.pobUrl}
                  label="Copiar PoB"
                  copiedLabel="PoB copiado!"
                  variant="tertiary"
                  className="w-full px-3 sm:w-auto sm:px-6"
                />
                <a
                  href={build.pobUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-tertiary col-span-2 w-full px-3 sm:col-span-1 sm:w-auto sm:px-6"
                >
                  Abrir PoB
                  <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-75" aria-hidden="true" />
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
