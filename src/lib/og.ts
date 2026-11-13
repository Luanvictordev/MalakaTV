import fs from "node:fs";
import path from "node:path";
import { SITE_URL } from "./seo";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

let cachedAvatarDataUrl: string | null = null;

/**
 * Carrega o avatar do canal como Data URL para uso no ImageResponse,
 * com fallback para a CDN estática caso o arquivo não esteja no filesystem da função.
 */
export async function getAvatarDataUrl(): Promise<string | null> {
  if (cachedAvatarDataUrl) return cachedAvatarDataUrl;

  const candidates = [
    path.join(process.cwd(), "public", "images", "malaka-profile.jpg"),
    path.join(process.cwd(), "src", "app", "icon.jpg"),
  ];

  for (const filePath of candidates) {
    try {
      const buffer = fs.readFileSync(filePath);
      cachedAvatarDataUrl = `data:image/jpeg;base64,${buffer.toString("base64")}`;
      return cachedAvatarDataUrl;
    } catch {
      // Tenta o próximo caminho ou busca via HTTP da CDN.
    }
  }

  try {
    const response = await fetch(`${SITE_URL}/images/malaka-profile.jpg`);
    if (!response.ok) return null;
    const buffer = Buffer.from(await response.arrayBuffer());
    const mimeType = response.headers.get("content-type")?.split(";")[0] || "image/jpeg";
    cachedAvatarDataUrl = `data:${mimeType};base64,${buffer.toString("base64")}`;
    return cachedAvatarDataUrl;
  } catch {
    return null;
  }
}
