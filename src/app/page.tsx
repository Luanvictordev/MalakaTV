import Link from "next/link";
import { Swords } from "lucide-react";
import DiscordIcon from "@/components/icons/DiscordIcon";
import YoutubeIcon from "@/components/icons/YoutubeIcon";
import LeagueCover from "@/components/LeagueCover";
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
        <div className="mx-auto grid max-w-[1200px] items-center gap-10 px-5 py-12 lg:grid-cols-[1.02fr_0.98fr] lg:py-16">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="badge badge-ink">Path of Exile 1</span>
              <span className="badge badge-lime">Liga {site.leaguePatch}</span>
              <span className="text-xs font-medium text-mute">começa {site.leagueDate}</span>
            </div>

            <h1 className="mt-5 font-display text-[clamp(2.6rem,6vw,4.15rem)] font-extrabold leading-[0.94] tracking-[-0.03em] text-ink">
              {site.heroTitle}
            </h1>
            <p className="mt-4 max-w-lg text-lg leading-relaxed text-body">{site.heroText}</p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link href={`/jogos/${activeGame.slug}`} className="btn btn-primary">
                <Swords className="h-4 w-4" aria-hidden="true" />
                Builds da liga
              </Link>
              <a href={site.discord} target="_blank" rel="noreferrer" className="btn btn-discord">
                <DiscordIcon className="h-[18px] w-[18px]" />
                Entrar no Discord
              </a>
            </div>
          </div>

          <LeagueCover
            patch={site.leaguePatch}
            name={site.leagueName}
            date={site.leagueDate}
            image={site.leagueImage || undefined}
          />
        </div>
      </section>

      <div className="bg-canvas-soft">
        <div className="mx-auto max-w-[1200px] px-5">
          <div className="rule" />
        </div>
      </div>

      {/* builds */}
      <section className="bg-canvas-soft py-16">
        <div className="mx-auto max-w-[1200px] px-5">
          <SectionTitle
            eyebrow={`League starter ${site.leaguePatch}`}
            title="Builds em destaque"
            description="As que o Malaka indicou primeiro, com vídeo do leveling ao endgame."
            action={{ label: `Todas as ${builds.length} builds →`, href: `/jogos/${activeGame.slug}` }}
          />
          <div className="mt-8 grid gap-4 lg:grid-cols-[1.45fr_1fr]">
            {lead ? <BuildWide build={lead} /> : null}
            <div className="flex flex-col gap-3">
              {sideBuilds.map((build) => (
                <BuildRow key={build.slug} build={build} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* guias */}
      <section className="bg-canvas-soft pb-16">
        <div className="mx-auto max-w-[1200px] px-5">
          <div className="rule mb-12" />
          <SectionTitle
            eyebrow="Comece por aqui"
            title="Atos e Atlas sem sofrimento"
            description="Os dois guias que resolvem a primeira semana de liga."
            action={{ label: "Ver guias →", href: `/jogos/${activeGame.slug}` }}
          />
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {guideCards.map((guide) => (
              <GuideCard key={guide.slug} guide={guide} large />
            ))}
          </div>
        </div>
      </section>

      {/* farms */}
      <section className="bg-canvas-soft pb-16">
        <div className="mx-auto max-w-[1200px] px-5">
          <div className="card p-5 sm:p-7">
            <SectionTitle
              eyebrow="Economia"
              title="FARMs que pagam na primeira semana"
              description="Farms seguros e rentáveis pra começar a liga com o pé direito."
            />
            <div className="mt-3">
              {farms.map((farm) => (
                <FarmRow key={farm.slug} guide={farm} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ferramentas */}
      <section className="bg-canvas py-16">
        <div className="mx-auto max-w-[1200px] px-5">
          <SectionTitle
            eyebrow="Ferramentas"
            title="O que ele usa, explicado"
            description="Trade, preço, filtro, atlas e comunidade — cada site explicado e com link direto."
            action={{ label: "Ver todas →", href: "/ferramentas" }}
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {homeTools.map((item) => (
              <ToolCard key={item!.name} item={item!} />
            ))}
          </div>
        </div>
      </section>

      {/* canal */}
      <section className="bg-canvas-soft py-16">
        <div className="mx-auto max-w-[1200px] px-5">
          <div className="card grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.25fr_0.75fr]">
            <div>
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
                <p className="flex items-center gap-2 font-display text-[2.25rem] font-extrabold leading-none tracking-[-0.03em] text-ink">
                  Malaka
                  <span className="rounded-full bg-primary px-2.5 py-1 text-[13px] font-bold tracking-[0.04em] text-ink">
                    TV
                  </span>
                </p>
              </div>
              <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-body">{site.bio}</p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <a href={site.youtube} target="_blank" rel="noreferrer" className="btn btn-primary">
                  <YoutubeIcon className="h-4 w-4" />
                  Inscrever no canal
                </a>
                <a href={site.discord} target="_blank" rel="noreferrer" className="btn btn-discord">
                  <DiscordIcon className="h-[18px] w-[18px]" />
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

            <div className="card-soft p-5">
              <p className="eyebrow">Recursos da liga</p>
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
        </div>
      </section>
    </div>
  );
}
