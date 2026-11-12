import { revalidatePath } from "next/cache";
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

  try {
    const storage = await writeCollection(body.collection as CollectionKey, body.data);
    revalidatePath("/", "layout");
    return Response.json({ ok: true, storage });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Falha ao salvar." },
      { status: 500 },
    );
  }
}
