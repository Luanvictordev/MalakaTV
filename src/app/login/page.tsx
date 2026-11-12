import type { Metadata } from "next";
import Link from "next/link";
import LoginForm from "./LoginForm";
import { supabaseConfigured } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Entrar",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const configured = supabaseConfigured();

  return (
    <div className="bg-canvas-soft">
      <div className="mx-auto max-w-[460px] px-5 py-16">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-display text-xl font-extrabold tracking-tight text-ink">Malaka</span>
          <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-ink">TV</span>
        </Link>

        <h1 className="mt-8 font-display text-[2.25rem] font-extrabold leading-none tracking-[-0.03em] text-ink">
          Entrar no editor
        </h1>
        <p className="mt-2 text-[15px] leading-relaxed text-body">
          Área restrita do Malaka. O site público continua aberto pra todo mundo.
        </p>

        <div className="card mt-6 p-6">
          {configured ? (
            <LoginForm next={next ?? "/admin"} />
          ) : (
            <div>
              <p className="font-display text-base font-extrabold text-ink">Supabase ainda não configurado</p>
              <p className="mt-2 text-sm leading-relaxed text-body">
                Faltam as variáveis <code className="rounded bg-canvas-soft px-1">NEXT_PUBLIC_SUPABASE_URL</code>{" "}
                e <code className="rounded bg-canvas-soft px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>. Crie o
                projeto no Supabase, rode o SQL de <code className="rounded bg-canvas-soft px-1">supabase/schema.sql</code>{" "}
                e adicione as duas no arquivo <code className="rounded bg-canvas-soft px-1">.env.local</code>{" "}
                (e no Vercel, em Settings → Environment Variables).
              </p>
            </div>
          )}
        </div>

        <p className="mt-6 text-sm text-mute">
          <Link href="/" className="font-semibold text-ink hover:underline">
            ← Voltar pro site
          </Link>
        </p>
      </div>
    </div>
  );
}
