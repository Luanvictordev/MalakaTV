import Link from "next/link";
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
                Builds da liga
              </Link>
              <a href={site.discord} target="_blank" rel="noreferrer" className="btn btn-discord">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/malaka-profile.jpg"
                  alt=""
                  width={22}
                  height={22}
                  className="h-[22px] w-[22px] rounded-full ring-2 ring-white/70"
                />
                Entrar no Discord
              </a>
              <Link href="/ferramentas" className="btn btn-secondary">
                Ferramentas
              </Link>
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

      {/* jogos cobertos — faixa discreta, o foco da página são os guias */}
      <section id="jogos" className="bg-canvas py-8">
        <div className="mx-auto max-w-[1200px] px-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-display text-lg font-extrabold tracking-tight text-ink">Jogos cobertos</h2>
            <p className="text-xs text-mute">A cobertura de cada jogo abre junto com a temporada dele.</p>
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {games.map((game) =>
              game.status === "ativo" ? (
                <Link
                  key={game.slug}
                  href={`/jogos/${game.slug}`}
                  className="group flex items-center justify-between gap-3 rounded-2xl bg-ink px-4 py-3"
                >
                  <span className="flex items-center gap-2.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    <span className="font-display text-sm font-extrabold tracking-tight text-canvas">
                      {game.name}
                    </span>
                  </span>
                  <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">
                    ver guias
                    <span className="transition-transform group-hover:translate-x-0.5">→</span>
                  </span>
                </Link>
              ) : (
                <div
                  key={game.slug}
                  aria-disabled="true"
                  className="flex items-center justify-between gap-3 rounded-2xl bg-canvas-soft px-4 py-3"
                  title={`${game.name} — ${game.releaseLabel}`}
                >
                  <span className="flex items-center gap-2.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-ink/20" />
                    <span className="font-display text-sm font-extrabold tracking-tight text-ink/60">
                      {game.name}
                    </span>
                  </span>
                  <span className="truncate text-[10px] font-semibold uppercase tracking-[0.1em] text-mute">
                    {game.releaseLabel}
                  </span>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

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
              description="Farms seguros pra começar — não quer dizer que são ruins depois."
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
            description="Trade, preço, filtro, atlas e comunidade — cada site com o logo e o que faz."
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
                  Inscrever no canal
                </a>
                <a href={site.discord} target="_blank" rel="noreferrer" className="btn btn-discord">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/malaka-profile.jpg"
                    alt=""
                    width={22}
                    height={22}
                    className="h-[22px] w-[22px] rounded-full ring-2 ring-white/70"
                  />
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
