import { getStore } from "@netlify/blobs";
import { blobStore } from "@/lib/blobs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// TEMPORÁRIO: diagnóstico do Netlify Blobs. Remover depois.
export async function GET() {
  const timeout = <T,>(p: Promise<T>) =>
    Promise.race([p, new Promise<T>((_, rej) => setTimeout(() => rej(new Error("timeout 6s")), 6000))]);
  const run = async (label: string, fn: () => Promise<unknown>) => {
    const t = Date.now();
    try {
      return { label, ok: true, value: await timeout(fn()), ms: Date.now() - t };
    } catch (e) {
      return { label, ok: false, error: String(e), ms: Date.now() - t };
    }
  };
  const results = [
    await run("padrao (fetch do Next)", () => getStore({ name: "content" }).get("links", { type: "json" })),
    await run("blobStore (fetch original)", () => blobStore("content")!.get("links", { type: "json" })),
    await run("blobStore set+get+delete", async () => {
      const s = blobStore("content")!;
      await s.setJSON("_diag", { ok: 1 });
      const v = await s.get("_diag", { type: "json" });
      await s.delete("_diag");
      return v;
    }),
  ];
  return Response.json(results);
}
