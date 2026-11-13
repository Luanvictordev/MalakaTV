import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import buildsData from "../../content/builds.json";
import gamesData from "../../content/games.json";
import guiasData from "../../content/guias.json";
import linksData from "../../content/links.json";
import siteData from "../../content/site.json";
import { createClient } from "./supabase/server";

const contentDir = path.join(process.cwd(), "content");

export const collectionFiles = {
  games: "games.json",
  builds: "builds.json",
  guias: "guias.json",
  links: "links.json",
  site: "site.json",
} as const;

export type CollectionKey = keyof typeof collectionFiles;

const bundledCollections: Record<CollectionKey, unknown> = {
  games: gamesData,
  builds: buildsData,
  guias: guiasData,
  links: linksData,
  site: siteData,
};

function readLocal<T>(key: CollectionKey): T {
  try {
    return JSON.parse(fs.readFileSync(path.join(contentDir, collectionFiles[key]), "utf8")) as T;
  } catch {
    return structuredClone(bundledCollections[key]) as T;
  }
}

const readCached = cache(async (key: CollectionKey): Promise<unknown> => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (url && anonKey) {
    try {
      const supabase = createSupabaseClient(url, anonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const { data, error } = await supabase.from("content").select("data").eq("key", key).maybeSingle();
      if (!error && data && data.data) return data.data;
    } catch {
      // Fallback para o conteúdo local/embutido se o Supabase falhar.
    }
  }

  return readLocal<unknown>(key);
});

/**
 * Lê uma coleção. Se o Supabase estiver configurado e tiver o registro, vem do banco;
 * senão cai pro JSON do repositório (primeiro deploy / desenvolvimento sem credenciais).
 */
export async function readCollection<T>(key: CollectionKey): Promise<T> {
  return (await readCached(key)) as T;
}

/** Grava uma coleção no Supabase quando configurado; senão, no arquivo local. */
export async function writeCollection(key: CollectionKey, data: unknown): Promise<"supabase" | "arquivo"> {
  const supabase = await createClient();
  if (supabase) {
    const { error } = await supabase
      .from("content")
      .upsert({ key, data, updated_at: new Date().toISOString() });
    if (error) throw new Error(error.message);
    return "supabase";
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("Sem Supabase configurado, não dá pra salvar no site publicado.");
  }

  fs.writeFileSync(
    path.join(contentDir, collectionFiles[key]),
    `${JSON.stringify(data, null, 2)}\n`,
    "utf8",
  );
  return "arquivo";
}
