import { getStore } from "@netlify/blobs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// TEMPORÁRIO: diagnóstico do Netlify Blobs. Remover depois.
export async function GET() {
  const log: unknown[] = [];
  const spyFetch: typeof fetch = async (input, init) => {
    const t = Date.now();
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    try {
      const res = await fetch(input, init);
      const body = res.status >= 400 ? (await res.clone().text()).slice(0, 300) : "";
      log.push({ url: url.replace(/\?.*/, ""), method: init?.method ?? "GET", status: res.status, ms: Date.now() - t, nfError: res.headers.get("x-nf-error"), body });
      if (res.status >= 400) throw new Error(`HTTP ${res.status}`);
      return res;
    } catch (e) {
      log.push({ url: url.replace(/\?.*/, ""), error: String(e), ms: Date.now() - t });
      throw e;
    }
  };
  try {
    const store = getStore({ name: "content", consistency: "eventual", fetch: spyFetch });
    const value = await Promise.race([
      store.get("links", { type: "json" }),
      new Promise((_, rej) => setTimeout(() => rej(new Error("timeout 7s")), 7000)),
    ]);
    return Response.json({ ok: true, found: value !== null, log });
  } catch (e) {
    return Response.json({ ok: false, error: String(e), log });
  }
}
