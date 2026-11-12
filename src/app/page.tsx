import Link from "next/link";
import { Swords } from "lucide-react";
import DiscordIcon from "@/components/icons/DiscordIcon";
import YoutubeIcon from "@/components/icons/YoutubeIcon";
import LeagueCover from "@/components/LeagueCover";
import { HeroEntrance, Reveal, StaggerGroup, StaggerItem } from "@/components/Motion";
import {
  BuildRow,
  BuildWide,
  FarmRow,
  GuideCard,
  SectionTitle,
  ToolCard,
} from "@/components/Cards";
import { getBuilds, getGames, getGuides, getLinks, getSite } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const site = await getSite();
  const games = await getGames();
  const activeGame = games.find((game) => game.status === "ativo") ?? games[0];

  const builds = await getBuilds(activeGame.slug);
  const guides = await getGuides(activeGame.slug);
  const links = await getLinks();

  const featured = builds.filter((build) => build.featured);
  const lead = featured[0] ?? builds[0];
  const sideBuilds = [...featured.slice(1), ...builds.filter((build) => !build.featured)].slice(0, 4);

  const guideCards = guides.filter((guide) => guide.kind === "guia");
  const farms = guides.filter((guide) => guide.kind === "farm");

  const homeTools = [
    "Awakened PoE Trade",
    "poe.ninja — builds",
    "FilterBlade",
    "Exile Leveling",
    "poe.re",
    "Boss of Exile",
  ]
    .map((name) => links.find((item) => item.name === name))
    .filter(Boolean);

  return (
    <div>
      {/* hero band */}
      <section className="bg-canvas-soft">
        <div className="mx-auto grid max-w-[1200px] items-center gap-6 px-5 py-8 sm:gap-10 sm:py-12 lg:grid-cols-[1.02fr_0.98fr] lg:py-16">
          <div className="min-w-0">
            <HeroEntrance>
              <div className="flex flex-wrap items-center gap-2">
                <span className="badge badge-ink">{activeGame.name}</span>
                {activeGame.releaseLabel ? (
                  <span className="badge badge-lime">{activeGame.releaseLabel}</span>
                ) : null}
                {activeGame.releaseDate ? (
                  <span className="text-xs font-medium text-mute">{activeGame.releaseDate}</span>
                ) : null}
              </div>
            </HeroEntrance>

            <HeroEntrance delay={0.06}>
              <h1 className="mt-4 font-display text-[clamp(2.15rem,6vw,4.15rem)] font-extrabold leading-[0.96] tracking-[-0.03em] text-ink sm:mt-5">
                {site.heroTitle}
              </h1>
              <p className="mt-3.5 max-w-lg text-base leading-relaxed text-body sm:mt-4 sm:text-lg">
                {site.heroText}
              </p>
            </HeroEntrance>

            <HeroEntrance delay={0.12}>
              <div className="mt-6 grid grid-cols-2 gap-2.5 sm:mt-7 sm:flex sm:flex-wrap sm:items-center sm:gap-3">
                <Link href={`/jogos/${activeGame.slug}`} className="btn btn-primary w-full px-3 sm:w-auto sm:px-6">
                  <Swords className="h-4 w-4 shrink-0" aria-hidden="true" />
                  Builds de {activeGame.shortName}
                </Link>
                <a
                  href={site.discord}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-discord w-full px-3 sm:w-auto sm:px-6"
                >
                  <DiscordIcon className="h-[18px] w-[18px] shrink-0" />
                  Entrar no Discord
                </a>
              </div>
            </HeroEntrance>
          </div>

          <HeroEntrance delay={0.14} className="min-w-0">
            <LeagueCover
              patch={site.leaguePatch}
              name={site.leagueName}
              date={activeGame.releaseDate || site.leagueDate}
              image={activeGame.cover || site.leagueImage || undefined}
            />
          </HeroEntrance>
        </div>
      </section>

      <div className="bg-canvas-soft">
        <div className="mx-auto max-w-[1200px] px-5">
          <div className="rule" />
        </div>
      </div>

      {/* builds */}
      <section className="bg-canvas-soft py-10 sm:py-16">
        <div className="mx-auto max-w-[1200px] px-5">
          <Reveal>
            <SectionTitle
              eyebrow={activeGame.releaseLabel || activeGame.shortName}
              title="Builds em destaque"
              description="As que o Malaka indicou primeiro, com vídeo completo e resumo direto."
              action={{ label: `Todas as ${builds.length} builds →`, href: `/jogos/${activeGame.slug}` }}
            />
          </Reveal>
          <div className="mt-6 grid gap-4 sm:mt-8 lg:grid-cols-[1.45fr_1fr]">
            {lead ? (
              <Reveal delay={0.05} className="flex min-w-0 [&>*]:w-full">
                <BuildWide build={lead} />
              </Reveal>
            ) : null}
            <StaggerGroup className="flex min-w-0 flex-col gap-3">
              {sideBuilds.map((build) => (
                <StaggerItem key={build.slug}>
                  <BuildRow build={build} />
                </StaggerItem>
              ))}
            </StaggerGroup>
          </div>
        </div>
      </section>

      {/* guias */}
      <section className="bg-canvas-soft pb-10 sm:pb-16">
        <div className="mx-auto max-w-[1200px] px-5">
          <div className="rule mb-8 sm:mb-12" />
          <Reveal>
            <SectionTitle
              eyebrow="Comece por aqui"
              title="Guias pra começar bem"
              description={`Os guias essenciais pra começar bem no ${activeGame.shortName}.`}
              action={{ label: "Ver guias →", href: `/jogos/${activeGame.slug}#guias` }}
            />
          </Reveal>
          <StaggerGroup className="mt-6 grid gap-4 sm:mt-8 md:grid-cols-2">
            {guideCards.map((guide) => (
              <StaggerItem key={guide.slug} className="flex min-w-0 [&>*]:w-full">
                <GuideCard guide={guide} large />
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* farms */}
      <section className="bg-canvas-soft pb-10 sm:pb-16">
        <div className="mx-auto max-w-[1200px] px-5">
          <Reveal>
            <div className="card p-5 sm:p-7">
              <SectionTitle
                eyebrow="Economia"
                title="FARMs que pagam"
                description="Farms seguros e rentáveis pra evoluir rápido."
              />
              <StaggerGroup className="mt-3">
                {farms.map((farm) => (
                  <StaggerItem key={farm.slug}>
                    <FarmRow guide={farm} />
                  </StaggerItem>
                ))}
              </StaggerGroup>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ferramentas */}
      <section className="bg-canvas py-10 sm:py-16">
        <div className="mx-auto max-w-[1200px] px-5">
          <Reveal>
            <SectionTitle
              eyebrow="Ferramentas"
              title="O que ele usa, explicado"
              description="Planners, filtros, overlays e comunidade — cada site explicado e com link direto."
              action={{ label: "Ver todas →", href: "/ferramentas" }}
            />
          </Reveal>
          <StaggerGroup className="mt-6 grid gap-4 sm:mt-8 sm:grid-cols-2 lg:grid-cols-3">
            {homeTools.map((item) => (
              <StaggerItem key={item!.name} className="flex min-w-0 [&>*]:w-full">
                <ToolCard item={item!} />
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* canal */}
      <section className="bg-canvas-soft py-10 sm:py-16">
        <div className="mx-auto max-w-[1200px] px-5">
          <Reveal>
            <div className="card grid gap-6 p-5 sm:gap-8 sm:p-8 lg:grid-cols-[1.25fr_0.75fr]">
            <div className="min-w-0">
              <p className="eyebrow">O canal</p>
              <div className="mt-3 flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/malaka-profile.jpg"
                  alt="Foto do canal MalakaTV"
                  width={56}
                  height={56}
                  className="h-14 w-14 rounded-full object-cover"
                />
                <p className="flex items-center gap-2 font-display text-3xl font-extrabold leading-none tracking-[-0.03em] text-ink sm:text-[2.25rem]">
                  Malaka
                  <span className="rounded-full bg-primary px-2.5 py-1 text-[13px] font-bold tracking-[0.04em] text-ink">
                    TV
                  </span>
                </p>
              </div>
              <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-body">{site.bio}</p>
              <div className="mt-6 grid grid-cols-2 gap-2.5 sm:flex sm:flex-wrap sm:items-center sm:gap-3">
                <a
                  href={site.youtube}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-primary w-full px-2.5 text-[13px] sm:w-auto sm:px-6 sm:text-[15px]"
                >
                  <YoutubeIcon className="h-4 w-4 shrink-0" />
                  Inscrever no canal
                </a>
                <a
                  href={site.discord}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-discord w-full px-2.5 text-[13px] sm:w-auto sm:px-6 sm:text-[15px]"
                >
                  <DiscordIcon className="h-[18px] w-[18px] shrink-0" />
                  Entrar no Discord
                </a>
              </div>
              <div className="mt-6 flex flex-wrap gap-1.5">
                {games.map((game) => (
                  <span key={game.slug} className="badge badge-neutral bg-canvas-soft">
                    {game.shortName}
                  </span>
                ))}
                <span className="badge badge-neutral bg-canvas-soft">pt-BR</span>
              </div>
            </div>

            <div className="card-soft min-w-0 p-5">
              <p className="eyebrow">Links em destaque</p>
              <ul className="mt-3 divide-y divide-ink/10">
                {site.spotlights.map((spotlight) => (
                  <li key={spotlight.label}>
                    <a
                      href={spotlight.url}
                      target="_blank"
                      rel="noreferrer"
                      className="group flex items-baseline justify-between gap-3 py-3"
                    >
                      <span className="text-sm font-semibold text-ink group-hover:underline">
                        {spotlight.label}
                      </span>
                      <span className="text-sm text-mute">↗</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
