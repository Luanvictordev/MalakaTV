import Link from "next/link";
import HeaderNav from "./HeaderNav";
import { getGames, getSite } from "@/lib/content";

export default async function SiteHeader() {
  const site = await getSite();
  const games = await getGames();

  return (
    <header className="sticky top-0 z-40 bg-ink">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-x-6 gap-y-2 px-5 py-3">
        <Link href="/" className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/malaka-profile.jpg"
            alt=""
            width={30}
            height={30}
            className="h-[30px] w-[30px] rounded-full object-cover"
          />
          <span className="font-display text-xl font-extrabold tracking-tight text-canvas">Malaka</span>
          <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold tracking-[0.08em] text-ink">
            TV
          </span>
        </Link>

        <HeaderNav games={games} discord={site.discord} youtube={site.youtube} handle={site.handle} />
      </div>
    </header>
  );
}
