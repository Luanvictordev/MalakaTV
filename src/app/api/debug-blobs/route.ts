import { getStore } from "@netlify/blobs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// TEMPORÁRIO: diagnóstico do Netlify Blobs. Remover depois.
export async function GET() {
  const env = Object.keys(process.env).filter((k) => /NETLIFY|BLOB/i.test(k));
  const out: Record<string, unknown> = { env, ctx: Boolean(process.env.NETLIFY_BLOBS_CONTEXT) };

  const withTimeout = <T,>(p: Promise<T>, ms: number) =>
    Promise.race([p, new Promise<T>((_, rej) => setTimeout(() => rej(new Error(`timeout ${ms}ms`)), ms))]);

  for (const consistency of ["eventual", "strong"] as const) {
    const t = Date.now();
    try {
      const store = getStore({ name: "content", consistency });
      const value = await withTimeout(store.get("links", { type: "json" }), 8000);
      out[consistency] = { ok: true, ms: Date.now() - t, found: value !== null };
    } catch (e) {
      out[consistency] = { ok: false, ms: Date.now() - t, error: e instanceof Error ? `${e.name}: ${e.message}` : String(e) };
    }
  }
  return Response.json(out);
}
