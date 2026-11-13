import { revalidatePath } from "next/cache";
import { slugify } from "@/lib/format";
import { writeCollection, type CollectionKey } from "@/lib/store";
import { getCurrentUser, supabaseConfigured } from "@/lib/supabase/server";

export const runtime = "nodejs";

const allowed: CollectionKey[] = ["games", "builds", "guias", "links", "site"];

export async function POST(request: Request) {
  if (supabaseConfigured()) {
    const user = await getCurrentUser();
    if (!user) return Response.json({ error: "Faça login pra salvar." }, { status: 401 });
  } else if (process.env.NODE_ENV === "production") {
    return Response.json(
      { error: "Configure o Supabase (NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY) pra editar no site publicado." },
      { status: 403 },
    );
  }

  let body: { collection?: string; data?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "JSON inválido." }, { status: 400 });
  }

  if (!body.collection || !allowed.includes(body.collection as CollectionKey)) {
    return Response.json({ error: "Coleção desconhecida." }, { status: 400 });
  }
  if (body.data === undefined || body.data === null) {
    return Response.json({ error: "Nada pra salvar." }, { status: 400 });
  }

  const collection = body.collection as CollectionKey;
  if (collection === "site") {
    if (typeof body.data !== "object" || Array.isArray(body.data)) {
      return Response.json({ error: "Dados do site inválidos." }, { status: 400 });
    }
  } else if (!Array.isArray(body.data)) {
    return Response.json({ error: "A coleção precisa ser uma lista." }, { status: 400 });
  }

  let payload = body.data;
  if (collection === "games" || collection === "builds" || collection === "guias") {
    payload = (body.data as Record<string, unknown>[]).map((item, index) => {
      const existing = typeof item.slug === "string" ? item.slug.trim() : "";
      if (existing) return item;
      const source = String(item.name ?? item.title ?? "");
      return { ...item, slug: slugify(source) || `${collection}-${index + 1}` };
    });
  }

  try {
    const storage = await writeCollection(collection, payload);
    revalidatePath("/", "layout");
    return Response.json({ ok: true, storage });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Falha ao salvar." },
      { status: 500 },
    );
  }
}
