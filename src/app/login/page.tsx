import type { Metadata } from "next";
import Link from "next/link";
import LoginForm from "./LoginForm";
import { authConfigured } from "@/lib/auth";

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
  const configured = authConfigured();

  return (
    <div className="bg-canvas-soft">
      <div className="mx-auto max-w-[460px] px-5 py-16">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-display text-xl font-extrabold tracking-tight text-ink">Malaka</span>
          <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-on-primary">TV</span>
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
              <p className="font-display text-base font-extrabold text-ink">Login ainda não configurado</p>
              <p className="mt-2 text-sm leading-relaxed text-body">
                Faltam as variáveis <code className="rounded bg-canvas-soft px-1">ADMIN_PASSWORD</code> e{" "}
                <code className="rounded bg-canvas-soft px-1">ADMIN_SESSION_SECRET</code>. Adicione as duas no
                Netlify (Site configuration → Environment variables) ou no arquivo{" "}
                <code className="rounded bg-canvas-soft px-1">.env.local</code>.
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
