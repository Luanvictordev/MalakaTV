import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import CopyLinkButton from "@/components/CopyLinkButton";
import YoutubeIcon from "@/components/icons/YoutubeIcon";
import { FarmRow } from "@/components/Cards";
import AtlasTreeViewer from "@/components/AtlasTreeViewer";
import SetupNotes from "@/components/SetupNotes";
import ZoomableImage from "@/components/ZoomableImage";
import { resolveAtlasTreeUrl } from "@/lib/atlasTree";
import { getGame, getGuide, getGuides, getSite, youtubeThumb, youtubeWatch } from "@/lib/content";
import { SITE_URL } from "@/lib/seo";

type Params = { params: Promise<{ game: string; slug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { game: gameSlug, slug } = await params;
  const guide = await getGuide(slug, gameSlug);
  if (!guide || guide.kind !== "farm") return { title: "Farm não encontrado" };
  const game = (await getGame(guide.game)) ?? (await getGame(gameSlug));
  const description = guide.note || `Setup de farm ${guide.title} — guia de ${game?.name ?? "ARPG"}.`;
  const thumb = guide.atlasImage || guide.image || (guide.videoId ? youtubeThumb(guide.videoId) : undefined);

  return {
    title: guide.title,
    description,
    alternates: {
      canonical: `/jogos/${guide.game}/farms/${guide.slug}`,
    },
    openGraph: {
      title: guide.title,
      description,
      type: "article",
      url: `/jogos/${guide.game}/farms/${guide.slug}`,
      images: thumb ? [thumb] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      images: thumb ? [thumb] : undefined,
    },
  };
}

export default async function FarmPage({ params }: Params) {
  const { game: gameSlug, slug } = await params;
  const guide = await getGuide(slug, gameSlug);
  if (!guide || guide.kind !== "farm") notFound();

  const game = (await getGame(guide.game)) ?? (await getGame(gameSlug));
  const site = await getSite();
  const otherFarms = (await getGuides(guide.game))
    .filter((item) => item.kind === "farm" && item.slug !== guide.slug)
    .slice(0, 4);

  const pageUrl = `${SITE_URL}/jogos/${guide.game}/farms/${guide.slug}`;
  const thumbUrl = guide.atlasImage || guide.image || (guide.videoId ? youtubeThumb(guide.videoId) : undefined);
  const setupImages = (guide.setupImages ?? []).filter(Boolean);
  const decodedAtlas = guide.atlasUrl ? await resolveAtlasTreeUrl(guide.atlasUrl) : null;

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
        { "@type": "ListItem", position: 3, name: guide.title, item: pageUrl },
      ],
    },
    ...(guide.videoId
      ? [
          {
            "@context": "https://schema.org",
            "@type": "VideoObject",
            name: guide.videoTitle || guide.title,
            description: guide.note || `Guia de farm ${guide.title} para ${game?.name ?? "ARPG"}.`,
            thumbnailUrl: thumbUrl ? [thumbUrl] : undefined,
            embedUrl: `https://www.youtube-nocookie.com/embed/${guide.videoId}`,
            contentUrl: youtubeWatch(guide.videoId),
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
          <Link href={`/jogos/${game?.slug ?? gameSlug}#farms`} className="uppercase tracking-[0.12em] hover:text-ink">
            Economia
          </Link>
          <span>/</span>
          <span className="uppercase tracking-[0.12em]">Farm</span>
        </div>

        <header className="mt-4 flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-end lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              {guide.metric ? <span className="badge badge-lime-solid">{guide.metric}</span> : null}
              <span className="badge badge-neutral">
                {site.leaguePatch} · {site.leagueName}
              </span>
            </div>
            <h1 className="mt-3 font-display text-[clamp(1.85rem,4.5vw,3rem)] font-extrabold leading-[0.98] tracking-[-0.03em] text-ink">
              {guide.title}
            </h1>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-2.5">
            {guide.videoId ? (
              <a
                href={youtubeWatch(guide.videoId)}
                target="_blank"
                rel="noreferrer"
                className={`btn btn-primary w-full px-3 sm:w-auto sm:px-6 ${guide.atlasUrl ? "col-span-2 sm:col-span-1" : ""}`}
              >
                <YoutubeIcon className="h-4 w-4 shrink-0" />
                Abrir no YouTube
                <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-75" aria-hidden="true" />
              </a>
            ) : null}
            <CopyLinkButton variant="tertiary" className="w-full px-3 sm:w-auto sm:px-6" />
            {guide.atlasUrl ? (
              <>
                <CopyLinkButton
                  text={guide.atlasUrl}
                  label="Copiar Atlas"
                  copiedLabel="Atlas copiado!"
                  variant="tertiary"
                  className="w-full px-3 sm:w-auto sm:px-6"
                />
                <a
                  href={guide.atlasUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-tertiary col-span-2 w-full px-3 sm:col-span-1 sm:w-auto sm:px-6"
                >
                  Abrir Atlas
                  <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-75" aria-hidden="true" />
                </a>
              </>
            ) : null}
          </div>
        </header>

        {guide.note ? <p className="mt-4 max-w-2xl text-lg leading-relaxed text-body">{guide.note}</p> : null}

        {guide.investment || guide.buildReq || guide.mapHint ? (
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {guide.investment ? (
              <div className="card-soft p-4">
                <p className="eyebrow">Investimento</p>
                <p className="mt-1 font-display text-base font-extrabold text-ink">{guide.investment}</p>
              </div>
            ) : null}
            {guide.buildReq ? (
              <div className="card-soft p-4">
                <p className="eyebrow">Exigência da build</p>
                <p className="mt-1 font-display text-base font-extrabold text-ink">{guide.buildReq}</p>
              </div>
            ) : null}
            {guide.mapHint ? (
              <div className="card-soft p-4">
                <p className="eyebrow">Mapa / Waystone</p>
                <p className="mt-1 font-display text-base font-extrabold text-ink">{guide.mapHint}</p>
              </div>
            ) : null}
          </div>
        ) : null}

        {guide.videoId ? (
          <div className="card mt-7 overflow-hidden p-2.5">
            <div className="aspect-video overflow-hidden rounded-2xl bg-chrome">
              <iframe
                className="h-full w-full"
                src={`https://www.youtube-nocookie.com/embed/${guide.videoId}`}
                title={guide.videoTitle || guide.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        ) : null}

        {guide.image ? (
          <div className="card mt-7 overflow-hidden p-2.5">
            <ZoomableImage
              src={guide.image}
              alt={guide.title}
              caption={guide.title}
              className="aspect-[16/9]"
            />
          </div>
        ) : null}

        {decodedAtlas || guide.atlasImage ? (
          <section className="mt-8">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="eyebrow">Atlas</p>
                <h2 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-ink">
                  Tree do Atlas
                </h2>
              </div>
              {guide.atlasUrl ? (
                <a
                  href={guide.atlasUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="link-arrow"
                >
                  Abrir planner ↗
                </a>
              ) : null}
            </div>
            <div className="card mt-4 overflow-hidden p-2.5">
              {decodedAtlas ? (
                <AtlasTreeViewer
                  allocatedHashes={decodedAtlas.hashes}
                  masteryEffects={decodedAtlas.masteryEffects}
                  atlasUrl={guide.atlasUrl}
                  title={guide.title}
                />
              ) : guide.atlasImage ? (
                <ZoomableImage
                  src={guide.atlasImage}
                  alt={`Tree do Atlas — ${guide.title}`}
                  caption={`Tree do Atlas · ${guide.title}`}
                  className="aspect-[16/9]"
                />
              ) : null}
            </div>
          </section>
        ) : null}

        {setupImages.length > 0 ? (
          <section className="mt-8">
            <p className="eyebrow">Setup</p>
            <h2 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-ink">
              Prints do setup
            </h2>
            <div className={`mt-4 grid gap-4 ${setupImages.length === 1 ? "grid-cols-1" : "sm:grid-cols-2"}`}>
              {setupImages.map((src, index) => (
                <div key={`${src}-${index}`} className="card overflow-hidden p-2.5">
                  <ZoomableImage
                    src={src}
                    alt={`Setup ${index + 1} — ${guide.title}`}
                    caption={`Setup ${index + 1} · ${guide.title}`}
                    className="aspect-video"
                  />
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {guide.regex ? (
          <section className="mt-8">
            <div className="card-soft flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 flex-1">
                <p className="eyebrow">Regex do mapa</p>
                <p className="mt-2 overflow-x-auto rounded-xl border border-ink/10 bg-canvas px-3.5 py-2.5 font-mono text-xs text-ink sm:text-sm">
                  {guide.regex}
                </p>
              </div>
              <CopyLinkButton
                text={guide.regex}
                label="Copiar Regex"
                copiedLabel="Regex copiada!"
                variant="secondary"
                className="shrink-0"
              />
            </div>
          </section>
        ) : null}

        {guide.setupNotes ? (
          <section className="mt-8">
            <div className="card-soft p-6 sm:p-8">
              <p className="eyebrow">Passo a passo</p>
              <h2 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-ink">
                Como rodar esse farm
              </h2>
              <div className="mt-4">
                <SetupNotes text={guide.setupNotes} />
              </div>
            </div>
          </section>
        ) : guide.videoTitle ? (
          <div className="card-soft mt-6 p-5">
            <p className="eyebrow">Vídeo do farm</p>
            <p className="mt-2 text-[15px] leading-relaxed text-ink">{guide.videoTitle}</p>
          </div>
        ) : null}

        {otherFarms.length > 0 ? (
          <section className="mt-14">
            <div className="card p-5 sm:p-7">
              <p className="eyebrow">Economia</p>
              <h2 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-ink">
                Outros farms de {game?.shortName ?? gameSlug}
              </h2>
              <div className="mt-3">
                {otherFarms.map((farm) => (
                  <FarmRow key={farm.slug} guide={farm} />
                ))}
              </div>
            </div>
          </section>
        ) : null}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-2 border-t border-ink/10 bg-canvas/95 px-4 py-2.5 backdrop-blur sm:hidden">
        {guide.videoId ? (
          <a
            href={youtubeWatch(guide.videoId)}
            target="_blank"
            rel="noreferrer"
            className="btn btn-primary btn-sm flex-1"
          >
            <YoutubeIcon className="h-4 w-4 shrink-0" />
            YouTube
          </a>
        ) : guide.atlasUrl ? (
          <a
            href={guide.atlasUrl}
            target="_blank"
            rel="noreferrer"
            className="btn btn-primary btn-sm flex-1"
          >
            Abrir Atlas
            <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          </a>
        ) : null}
        {guide.regex ? (
          <CopyLinkButton
            text={guide.regex}
            label="Copiar Regex"
            copiedLabel="Regex copiada!"
            variant="tertiary"
            className="btn-sm flex-1"
          />
        ) : guide.atlasUrl ? (
          <CopyLinkButton
            text={guide.atlasUrl}
            label="Copiar Atlas"
            copiedLabel="Atlas copiado!"
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
