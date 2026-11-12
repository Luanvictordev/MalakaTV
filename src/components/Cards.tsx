import Link from "next/link";
import AscendancyAvatar from "./AscendancyAvatar";
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

const interactiveCard =
  "card group transition-all duration-200 hover:-translate-y-0.5 hover:ring-2 hover:ring-primary hover:shadow-[0_12px_28px_-14px_rgba(14,15,12,0.14)] active:scale-[0.99]";

export function BuildWide({ build }: { build: Build }) {
  return (
    <Link
      href={buildHref(build)}
      className={`${interactiveCard} flex min-w-0 flex-col overflow-hidden p-2.5`}
    >
      <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-canvas-soft">
        <VideoThumb
          videoId={build.videoId}
          image={build.image || undefined}
          alt={build.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
        <span className="badge badge-neutral absolute left-3 top-3 bg-canvas/90 backdrop-blur">
          {build.className ? <AscendancyAvatar name={build.className} className="h-4 w-4" /> : null}
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
      className={`${interactiveCard} flex min-w-0 items-center gap-3 p-2.5 sm:gap-4`}
    >
      <div className="relative aspect-video w-28 shrink-0 overflow-hidden rounded-2xl bg-canvas-soft">
        <VideoThumb
          videoId={build.videoId}
          image={build.image || undefined}
          alt={build.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
        />
      </div>
      <div className="min-w-0 pr-2">
        <div className="flex items-center gap-1.5">
          {build.className ? <AscendancyAvatar name={build.className} className="h-4 w-4" /> : null}
          <Meta>{build.className || "PoE 1"}</Meta>
        </div>
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
      className={`${interactiveCard} flex min-w-0 flex-col overflow-hidden p-2.5`}
    >
      <div className="relative aspect-video overflow-hidden rounded-2xl bg-canvas-soft">
        <VideoThumb
          videoId={build.videoId}
          image={build.image || undefined}
          alt={build.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
        <span className="badge badge-neutral absolute left-3 top-3 bg-canvas/90 backdrop-blur">
          {build.className ? <AscendancyAvatar name={build.className} className="h-4 w-4" /> : null}
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
      className={`${interactiveCard} flex flex-col overflow-hidden p-2.5`}
    >
      <div className="relative aspect-video overflow-hidden rounded-2xl bg-canvas-soft">
        <VideoThumb
          videoId={guide.videoId}
          image={guide.image || undefined}
          alt={guide.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
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
      className="group flex min-w-0 items-center gap-3 border-b border-ink/10 py-3 last:border-b-0 sm:gap-4"
    >
      <div className="relative aspect-video w-24 shrink-0 overflow-hidden rounded-xl bg-canvas-soft sm:w-32">
        <VideoThumb
          videoId={guide.videoId}
          image={guide.image || undefined}
          alt={guide.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-sm font-extrabold tracking-tight text-ink group-hover:underline sm:text-base">
          {guide.title}
        </p>
        <p className="mt-0.5 line-clamp-1 text-xs text-body">{guide.note}</p>
        {guide.metric ? <span className="badge badge-lime mt-1.5 sm:hidden">{guide.metric}</span> : null}
      </div>
      {guide.metric ? (
        <span className="badge badge-lime hidden whitespace-nowrap sm:inline-flex">{guide.metric}</span>
      ) : null}
    </a>
  );
}

export function ToolCard({ item }: { item: LinkItem }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noreferrer"
      className="card-soft group flex gap-3 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-pale hover:shadow-[0_12px_28px_-14px_rgba(14,15,12,0.12)]"
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
    <div className="flex flex-wrap items-end justify-between gap-3 sm:gap-5">
      <div className="max-w-2xl">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h2 className="mt-2 font-display text-[1.75rem] font-extrabold leading-[1.05] tracking-[-0.02em] text-ink sm:text-[2.5rem]">
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
