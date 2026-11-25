import { getStore } from "@netlify/blobs";

// O Next troca o fetch global por uma versão com cache que divide o corpo da resposta.
// Com isso, o res.body.cancel() que o Blobs faz num 404 nunca termina e a requisição
// trava até o timeout. Usamos o fetch original pra falar com o Blobs.
const originalFetch: typeof fetch =
  (globalThis.fetch as typeof fetch & { _nextOriginalFetch?: typeof fetch })._nextOriginalFetch ??
  globalThis.fetch;

/**
 * Netlify Blobs só existe no ambiente do Netlify. Fora dele (npm run dev) o
 * getStore lança erro — aqui vira null e o chamador cai pros arquivos locais.
 */
export function blobStore(name: "content" | "uploads") {
  try {
    return getStore({ name, consistency: "strong", fetch: originalFetch });
  } catch {
    return null;
  }
}
