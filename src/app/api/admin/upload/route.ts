import fs from "node:fs";
import path from "node:path";
import { slugify } from "@/lib/format";
import { createClient, getCurrentUser, supabaseConfigured } from "@/lib/supabase/server";

export const runtime = "nodejs";

const allowed = ["image/png", "image/jpeg", "image/webp", "image/gif", "image/avif"];

export async function POST(request: Request) {
  if (supabaseConfigured()) {
    const user = await getCurrentUser();
    if (!user) return Response.json({ error: "Faça login pra enviar imagens." }, { status: 401 });
  } else if (process.env.NODE_ENV === "production") {
    return Response.json({ error: "Configure o Supabase pra enviar imagens." }, { status: 403 });
  }

  const form = await request.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return Response.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
  }
  if (!allowed.includes(file.type)) {
    return Response.json({ error: "Use PNG, JPG, WEBP, GIF ou AVIF." }, { status: 400 });
  }
  if (file.size > 8 * 1024 * 1024) {
    return Response.json({ error: "Imagem maior que 8MB." }, { status: 400 });
  }

  const ext = path.extname(file.name) || `.${file.type.split("/")[1]}`;
  const base = slugify(path.basename(file.name, path.extname(file.name))) || "imagem";
  const name = `${base}-${Date.now().toString(36)}${ext.toLowerCase()}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  if (supabaseConfigured()) {
    const supabase = await createClient();
    if (!supabase) return Response.json({ error: "Supabase indisponível." }, { status: 500 });

    const { error } = await supabase.storage
      .from("malaka")
      .upload(name, buffer, { contentType: file.type, upsert: false });

    if (error) return Response.json({ error: error.message }, { status: 500 });

    const { data } = supabase.storage.from("malaka").getPublicUrl(name);
    return Response.json({ url: data.publicUrl });
  }

  const dir = path.join(process.cwd(), "public", "uploads");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, name), buffer);

  return Response.json({ url: `/uploads/${name}` });
}
