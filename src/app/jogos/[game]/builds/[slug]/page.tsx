import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, ExternalLink } from "lucide-react";
import CopyLinkButton from "@/components/CopyLinkButton";
import YoutubeIcon from "@/components/icons/YoutubeIcon";
import { BuildCard, Tag } from "@/components/Cards";
import ZoomableImage from "@/components/ZoomableImage";
import { getBuild, getBuilds, getGame, getSite, youtubeThumb, youtubeWatch } from "@/lib/content";
import { SITE_URL } from "@/lib/seo";

type Params = { params: Promise<{ game: string; slug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { game: gameSlug, slug } = await params;
  const build = await getBuild(slug, gameSlug);
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
  const build = await getBuild(slug, gameSlug);
  if (!build) notFound();

  const game = (await getGame(build.game)) ?? (await getGame(gameSlug));
  const site = await getSite();
  const related = (await getBuilds(build.game))
    .filter((item) => item.slug !== build.slug && item.className && item.className === build.className)
    .slice(0, 3);

  const patchTags = build.tags.filter((tag) => /^\d+\.\d+$/.test(tag.trim()));
  const outdatedPatch =
    site.leaguePatch && patchTags.length > 0 && !patchTags.includes(site.leaguePatch)
      ? patchTags[patchTags.length - 1]
      : null;

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
      <div className="mx-auto max-w-[1000px] px-5 pb-24 pt-6 sm:py-10">
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-mute">
          <Link href={`/jogos/${game?.slug ?? gameSlug}`} className="hover:text-ink">
            {game?.shortName ?? gameSlug}
          </Link>
          <span>/</span>
          {build.className ? (
            <Link
              href={`/jogos/${game?.slug ?? gameSlug}?classe=${encodeURIComponent(build.className)}`}
              className="uppercase tracking-[0.12em] transition-colors hover:text-ink"
            >
              {build.className}
            </Link>
          ) : (
            <span className="uppercase tracking-[0.12em]">build</span>
          )}
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
            {build.videoId ? (
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
            ) : null}
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

        {build.budget || build.focus || build.playstyle ? (
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {build.budget ? (
              <div className="card-soft p-4">
                <p className="eyebrow">Investimento</p>
                <p className="mt-1 font-display text-base font-extrabold text-ink">{build.budget}</p>
              </div>
            ) : null}
            {build.focus ? (
              <div className="card-soft p-4">
                <p className="eyebrow">Foco</p>
                <p className="mt-1 font-display text-base font-extrabold text-ink">{build.focus}</p>
              </div>
            ) : null}
            {build.playstyle ? (
              <div className="card-soft p-4">
                <p className="eyebrow">Estilo</p>
                <p className="mt-1 font-display text-base font-extrabold text-ink">{build.playstyle}</p>
              </div>
            ) : null}
          </div>
        ) : null}

        {outdatedPatch ? (
          <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-ink">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
            <p className="text-body">
              Build marcada para a liga <strong className="text-ink">{outdatedPatch}</strong> — confira no vídeo ou PoB se houve mudanças na{" "}
              <strong className="text-ink">{site.leaguePatch}</strong>.
            </p>
          </div>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-1.5">
          {build.tags.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </div>

        {build.videoId ? (
          <div className="card mt-7 overflow-hidden p-2.5">
            <div className="aspect-video overflow-hidden rounded-2xl bg-chrome">
              <iframe
                className="h-full w-full"
                src={`https://www.youtube-nocookie.com/embed/${build.videoId}`}
                title={build.videoTitle || build.name}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        ) : build.image ? (
          <div className="card mt-7 overflow-hidden p-2.5">
            <ZoomableImage
              src={build.image}
              alt={build.name}
              caption={build.name}
              className="aspect-[16/9]"
            />
          </div>
        ) : null}

        {build.videoId || build.videoTitle ? (
          <div className="card-soft mt-4 p-5">
            <p className="eyebrow">Vídeo do guia</p>
            {build.videoTitle ? (
              <p className="mt-2 text-[15px] leading-relaxed text-ink">{build.videoTitle}</p>
            ) : null}
            <p className="mt-2 text-sm text-body">
              {build.pobUrl
                ? "Leveling e demais detalhes estão disponíveis no vídeo completo."
                : "PoB, leveling e demais detalhes estão disponíveis no vídeo completo."}
            </p>
          </div>
        ) : null}

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

      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-2 border-t border-ink/10 bg-canvas/95 px-4 py-2.5 backdrop-blur sm:hidden">
        {build.videoId ? (
          <a
            href={youtubeWatch(build.videoId)}
            target="_blank"
            rel="noreferrer"
            className="btn btn-primary btn-sm flex-1"
          >
            <YoutubeIcon className="h-4 w-4 shrink-0" />
            YouTube
          </a>
        ) : null}
        {build.pobUrl ? (
          <CopyLinkButton
            text={build.pobUrl}
            label="Copiar PoB"
            copiedLabel="PoB copiado!"
            variant="tertiary"
            className="btn-sm flex-1"
          />
        ) : (
          <CopyLinkButton variant="tertiary" className="btn-sm flex-1" />
        )}
      </div>
    </div>
  );
}
