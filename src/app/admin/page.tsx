import type { Metadata } from "next";
import AdminEditor from "@/components/AdminEditor";
import { getBuilds, getGames, getGuides, getLinks, getSite } from "@/lib/content";
import { getCurrentUser } from "@/lib/supabase/server";
import { signOut } from "@/app/login/actions";

export const metadata: Metadata = {
  title: "Painel do Malaka",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await getCurrentUser();

  const [games, builds, guias, links, site] = await Promise.all([
    getGames(),
    getBuilds(),
    getGuides(),
    getLinks(),
    getSite(),
  ]);

  return (
    <div className="bg-canvas">
      <div className="mx-auto max-w-[1200px] px-5 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-[clamp(1.75rem,3.5vw,2.5rem)] font-extrabold leading-tight tracking-[-0.03em] text-ink">
              Painel do Malaka
            </h1>
            <p className="mt-1 text-sm text-body">
              Gerencie builds, farms, guias, jogos, ferramentas e textos da home em um só lugar.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="badge badge-neutral">{user?.email ?? "sessão local"}</span>
            {user ? (
              <form action={signOut}>
                <button type="submit" className="btn btn-tertiary btn-sm">
                  Sair
                </button>
              </form>
            ) : null}
          </div>
        </div>

        <div className="mt-6">
          <AdminEditor
            initial={{
              games: games as unknown as Record<string, unknown>[],
              builds: builds as unknown as Record<string, unknown>[],
              guias: guias as unknown as Record<string, unknown>[],
              links: links as unknown as Record<string, unknown>[],
              site: site as unknown as Record<string, unknown>,
            }}
          />
        </div>
      </div>
    </div>
  );
}
