export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// TEMPORÁRIO: diagnóstico do Netlify Blobs. Remover depois.
export async function GET() {
  const raw = process.env.NETLIFY_BLOBS_CONTEXT ?? "";
  let ctx: Record<string, unknown> = {};
  try {
    ctx = JSON.parse(Buffer.from(raw, "base64").toString("utf8"));
  } catch (e) {
    return Response.json({ parse: String(e) });
  }
  const { token, ...safe } = ctx as { token?: string } & Record<string, unknown>;
  const out: Record<string, unknown> = { ctx: safe, region: process.env.USE_REGIONAL_BLOBS };

  const probe = async (label: string, url: string | undefined, path: string) => {
    if (!url) return (out[label] = "sem url");
    const t = Date.now();
    try {
      const res = await fetch(`${url.replace(/\/$/, "")}${path}`, {
        headers: { authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(6000),
      });
      out[label] = { status: res.status, ms: Date.now() - t };
    } catch (e) {
      out[label] = { error: e instanceof Error ? `${e.name}: ${e.message}` : String(e), ms: Date.now() - t };
    }
  };

  const siteID = safe.siteID as string | undefined;
  await Promise.all([
    probe("edge", safe.edgeURL as string | undefined, `/${siteID}/site:content/links`),
    probe("uncachedEdge", safe.uncachedEdgeURL as string | undefined, `/${siteID}/site:content/links`),
    probe("api", (safe.apiURL as string | undefined) ?? "https://api.netlify.com", `/api/v1/blobs/${siteID}/site:content/links`),
  ]);
  return Response.json(out);
}
