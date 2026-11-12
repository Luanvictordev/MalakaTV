import type { Metadata } from "next";
import AdminEditor from "@/components/AdminEditor";
import { getBuilds, getGames, getGuides, getLinks, getSite } from "@/lib/content";
import { getCurrentUser, supabaseConfigured } from "@/lib/supabase/server";
import { signOut } from "@/app/login/actions";

export const metadata: Metadata = {
  title: "Editor de conteúdo",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await getCurrentUser();
  const configured = supabaseConfigured();

  const [games, builds, guias, links, site] = await Promise.all([
    getGames(),
    getBuilds(),
    getGuides(),
    getLinks(),
    getSite(),
  ]);

  return (
    <div className="bg-canvas">
      <div className="mx-auto max-w-[1200px] px-5 py-12">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Área do Malaka</p>
            <h1 className="mt-3 font-display text-[clamp(2rem,4.5vw,3rem)] font-extrabold leading-[1] tracking-[-0.03em] text-ink">
              Editor de conteúdo
            </h1>
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-body">
              Adicione builds, guias, farms, jogos e ferramentas, troque textos e suba fotos. O que você
              salvar aparece no site na hora.
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

        <p className="mt-4 inline-flex flex-wrap items-center gap-2 text-xs font-medium text-mute">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          Armazenamento: {configured ? "Supabase (conteúdo no banco, imagens no Storage)" : "arquivos locais do projeto"}
        </p>

        <div className="mt-8">
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

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <div className="card-soft p-5">
            <p className="font-display text-base font-extrabold text-ink">Ligar um jogo</p>
            <p className="mt-1.5 text-sm leading-relaxed text-body">
              Em <strong className="text-ink">Jogos</strong>, mude o status de <code>em-breve</code> pra{" "}
              <code>ativo</code> e a seção abre no site.
            </p>
          </div>
          <div className="card-soft p-5">
            <p className="font-display text-base font-extrabold text-ink">Thumb automática</p>
            <p className="mt-1.5 text-sm leading-relaxed text-body">
              Só o ID do vídeo já traz a capa do YouTube. Só suba foto pra trocar a capa.
            </p>
          </div>
          <div className="card-soft p-5">
            <p className="font-display text-base font-extrabold text-ink">Cuidado com o slug</p>
            <p className="mt-1.5 text-sm leading-relaxed text-body">
              O slug é o endereço da página. Se mudar depois de publicado, o link antigo quebra.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
