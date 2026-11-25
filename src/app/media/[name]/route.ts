import { blobStore } from "@/lib/blobs";

export const runtime = "nodejs";

/** Serve as imagens enviadas pelo /admin e guardadas no Netlify Blobs. */
export async function GET(_request: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const store = blobStore("uploads");
  if (!store) return new Response("Not found", { status: 404 });

  const result = await store.getWithMetadata(name, { type: "arrayBuffer" });
  if (!result) return new Response("Not found", { status: 404 });

  const contentType = typeof result.metadata.contentType === "string" ? result.metadata.contentType : "application/octet-stream";
  return new Response(result.data, {
    headers: {
      "content-type": contentType,
      "cache-control": "public, max-age=31536000, immutable",
    },
  });
}
