// Exporta conteúdo e imagens do Supabase para o repositório (uso único, antes de desligar o projeto).
// Uso: node --env-file=.env scripts/export-supabase.mjs
import fs from "node:fs";
import path from "node:path";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !key) throw new Error("Faltam NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY.");

const headers = { apikey: key, Authorization: `Bearer ${key}` };
const root = process.cwd();
const uploads = path.join(root, "public", "uploads");
fs.mkdirSync(uploads, { recursive: true });

// 1) imagens do bucket
const list = await fetch(`${url}/storage/v1/object/list/malaka`, {
  method: "POST",
  headers: { ...headers, "Content-Type": "application/json" },
  body: JSON.stringify({ prefix: "", limit: 1000, offset: 0 }),
});
if (!list.ok) throw new Error(`Listagem do bucket falhou: ${list.status} ${await list.text()}`);
const objects = (await list.json()).filter((o) => o.id);
for (const o of objects) {
  const res = await fetch(`${url}/storage/v1/object/public/malaka/${encodeURIComponent(o.name)}`);
  if (!res.ok) throw new Error(`Falha ao baixar ${o.name}: ${res.status}`);
  fs.writeFileSync(path.join(uploads, o.name), Buffer.from(await res.arrayBuffer()));
  console.log("imagem:", o.name);
}

// 2) conteúdo
const res = await fetch(`${url}/rest/v1/content?select=key,data`, { headers });
if (!res.ok) throw new Error(`Leitura de content falhou: ${res.status} ${await res.text()}`);
const rows = await res.json();
const prefix = `${url}/storage/v1/object/public/malaka/`;
for (const row of rows) {
  const text = JSON.stringify(row.data, null, 2).split(prefix).join("/uploads/");
  fs.writeFileSync(path.join(root, "content", `${row.key}.json`), `${text}\n`, "utf8");
  console.log("conteúdo:", row.key);
}
console.log(`ok: ${objects.length} imagens, ${rows.length} coleções`);
