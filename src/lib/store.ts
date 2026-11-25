import fs from "node:fs";
import path from "node:path";
import { unstable_cache } from "next/cache";
import { cache } from "react";
import buildsData from "../../content/builds.json";
import gamesData from "../../content/games.json";
import guiasData from "../../content/guias.json";
import linksData from "../../content/links.json";
import siteData from "../../content/site.json";
import { blobStore } from "./blobs";

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

async function fetchFromBlobs(key: CollectionKey): Promise<unknown | null> {
  const store = blobStore("content");
  if (!store) return null;
  return (await store.get(key, { type: "json" })) ?? null;
}

// Cache entre requisições (invalidado pela tag "content" quando o admin salva).
// Se a leitura do Blobs falhar, o erro sobe (e não é guardado no cache): numa
// regeração em segundo plano o Next mantém a página anterior no ar, em vez de
// publicar o JSON do repositório (que pode estar desatualizado) por até 1 hora.
const fetchCached = unstable_cache(fetchFromBlobs, ["content"], {
  tags: ["content"],
  revalidate: 3600,
});

const readCached = cache(async (key: CollectionKey): Promise<unknown> => {
  // Fora do Netlify ou sem o registro no Blobs, usa o conteúdo local/embutido.
  const remote = await fetchCached(key);
  return remote ?? readLocal<unknown>(key);
});

/**
 * Lê uma coleção. No Netlify, se o Blobs tiver o registro (salvo pelo /admin), vem dele;
 * senão cai pro JSON do repositório (primeiro deploy / desenvolvimento local).
 */
export async function readCollection<T>(key: CollectionKey): Promise<T> {
  return (await readCached(key)) as T;
}

/** Grava uma coleção no Netlify Blobs quando disponível; senão, no arquivo local. */
export async function writeCollection(key: CollectionKey, data: unknown): Promise<"netlify" | "arquivo"> {
  const store = blobStore("content");
  if (store) {
    await store.setJSON(key, data);
    return "netlify";
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("Netlify Blobs indisponível, não dá pra salvar no site publicado.");
  }

  fs.writeFileSync(
    path.join(contentDir, collectionFiles[key]),
    `${JSON.stringify(data, null, 2)}\n`,
    "utf8",
  );
  return "arquivo";
}
