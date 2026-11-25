import { getStore } from "@netlify/blobs";

/**
 * Netlify Blobs só existe no ambiente do Netlify. Fora dele (npm run dev) o
 * getStore lança erro — aqui vira null e o chamador cai pros arquivos locais.
 */
export function blobStore(name: "content" | "uploads") {
  try {
    return getStore({ name, consistency: "strong" });
  } catch {
    return null;
  }
}
