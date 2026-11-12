import Link from "next/link";
import VideoThumb from "./VideoThumb";
import ToolLogo from "./ToolLogo";
import { hostOf, youtubeWatch } from "@/lib/format";
import type { Build, Guide, LinkItem } from "@/lib/types";

export function buildHref(build: Build) {
  return `/jogos/${build.game || "poe1"}/builds/${build.slug}`;
}

export function Tag({ children }: { children: React.ReactNode }) {
  return <span className="badge badge-neutral">{children}</span>;
}

function Meta({ children }: { children: React.ReactNode }) {
  return <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mute">{children}</span>;
}

export function BuildWide({ build }: { build: Build }) {
  return (
    <Link
      href={buildHref(build)}
      className="card group flex flex-col overflow-hidden p-2.5 transition-shadow hover:ring-2 hover:ring-primary"
    >
      <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-canvas-soft">
        <VideoThumb
          videoId={build.videoId}
          image={build.image || undefined}
          alt={build.name}
          className="h-full w-full object-cover"
        />
        <span className="badge badge-neutral absolute left-3 top-3 bg-canvas/90 backdrop-blur">
          {build.className || "PoE 1"}
        </span>
        {build.tier ? <span className="badge badge-lime-solid absolute right-3 top-3">{build.tier}</span> : null}
      </div>
      <div className="p-4">
        <h3 className="font-display text-2xl font-extrabold leading-tight tracking-tight text-ink">
          {build.name}
        </h3>
        {build.note ? (
          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-body">{build.note}</p>
        ) : null}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {build.tags.slice(0, 3).map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </div>
      </div>
    </Link>
  );
}

export function BuildRow({ build }: { build: Build }) {
  return (
    <Link
      href={buildHref(build)}
      className="card group flex items-center gap-4 p-2.5 transition-shadow hover:ring-2 hover:ring-primary"
    >
      <div className="relative aspect-video w-28 shrink-0 overflow-hidden rounded-2xl bg-canvas-soft">
        <VideoThumb
          videoId={build.videoId}
          image={build.image || undefined}
          alt={build.name}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="min-w-0 pr-2">
        <Meta>{build.className || "PoE 1"}</Meta>
        <p className="mt-1 truncate font-display text-base font-extrabold tracking-tight text-ink">
          {build.name}
        </p>
        <p className="mt-0.5 truncate text-xs text-mute">{build.tags.slice(0, 2).join(" · ")}</p>
      </div>
    </Link>
  );
}

export function BuildCard({ build }: { build: Build }) {
  return (
    <Link
      href={buildHref(build)}
      className="card group flex flex-col overflow-hidden p-2.5 transition-shadow hover:ring-2 hover:ring-primary"
    >
      <div className="relative aspect-video overflow-hidden rounded-2xl bg-canvas-soft">
        <VideoThumb
          videoId={build.videoId}
          image={build.image || undefined}
          alt={build.name}
          className="h-full w-full object-cover"
        />
        <span className="badge badge-neutral absolute left-3 top-3 bg-canvas/90 backdrop-blur">
          {build.className || "PoE 1"}
        </span>
        {build.tier ? <span className="badge badge-lime-solid absolute right-3 top-3">{build.tier}</span> : null}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display text-lg font-extrabold leading-tight tracking-tight text-ink">
          {build.name}
        </h3>
        {build.note ? (
          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-body">{build.note}</p>
        ) : null}
        <div className="mt-auto flex flex-wrap gap-1.5 pt-4">
          {build.tags.slice(0, 3).map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </div>
      </div>
    </Link>
  );
}

export function GuideCard({ guide, large = false }: { guide: Guide; large?: boolean }) {
  const isFarm = guide.kind === "farm";
  return (
    <a
      href={youtubeWatch(guide.videoId)}
      target="_blank"
      rel="noreferrer"
      className="card group flex flex-col overflow-hidden p-2.5 transition-shadow hover:ring-2 hover:ring-primary"
    >
      <div className="relative aspect-video overflow-hidden rounded-2xl bg-canvas-soft">
        <VideoThumb
          videoId={guide.videoId}
          image={guide.image || undefined}
          alt={guide.title}
          className="h-full w-full object-cover"
        />
        <span
          className={`badge absolute left-3 top-3 ${isFarm ? "badge-lime-solid" : "badge-ink"}`}
        >
          {guide.metric || (isFarm ? "Farm" : "Guia")}
        </span>
      </div>
      <div className={`flex flex-1 flex-col ${large ? "p-5" : "p-4"}`}>
        <h3
          className={`font-display font-extrabold leading-tight tracking-tight text-ink ${
            large ? "text-2xl" : "text-lg"
          }`}
        >
          {guide.title}
        </h3>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-body">{guide.note}</p>
      </div>
    </a>
  );
}

export function FarmRow({ guide }: { guide: Guide }) {
  return (
    <a
      href={youtubeWatch(guide.videoId)}
      target="_blank"
      rel="noreferrer"
      className="group flex items-center gap-4 border-b border-ink/10 py-3 last:border-b-0"
    >
      <div className="relative aspect-video w-24 shrink-0 overflow-hidden rounded-xl bg-canvas-soft sm:w-32">
        <VideoThumb
          videoId={guide.videoId}
          image={guide.image || undefined}
          alt={guide.title}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-base font-extrabold tracking-tight text-ink group-hover:underline">
          {guide.title}
        </p>
        <p className="mt-0.5 line-clamp-1 text-xs text-body">{guide.note}</p>
      </div>
      <span className="badge badge-lime whitespace-nowrap">{guide.metric}</span>
    </a>
  );
}

export function ToolCard({ item }: { item: LinkItem }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noreferrer"
      className="card-soft group flex gap-3 p-4 transition-colors hover:bg-primary-pale"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-canvas p-1.5">
        <ToolLogo name={item.name} url={item.url} logo={item.logo} invert={item.logoInvert} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-base font-extrabold leading-tight tracking-tight text-ink">
            {item.name}
          </h3>
          <span className="text-sm text-mute transition-colors group-hover:text-ink">↗</span>
        </div>
        <p className="mt-1.5 text-sm leading-relaxed text-body">{item.description}</p>
        <span className="mt-2 block truncate text-[11px] font-medium uppercase tracking-[0.12em] text-mute">
          {hostOf(item.url)}
        </span>
      </div>
    </a>
  );
}

export function SectionTitle({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: { label: string; href: string };
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-5">
      <div className="max-w-2xl">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h2 className="mt-2 font-display text-[2rem] font-extrabold leading-[1.05] tracking-[-0.02em] text-ink sm:text-[2.5rem]">
          {title}
        </h2>
        {description ? (
          <p className="mt-2 text-[15px] leading-relaxed text-body">{description}</p>
        ) : null}
      </div>
      {action ? (
        <Link href={action.href} className="link-arrow">
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}
