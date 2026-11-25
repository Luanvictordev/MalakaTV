import { getStore } from "@netlify/blobs";

// No runtime do Netlify, o res.body.cancel() que o Blobs faz ao receber um 404
// (chave inexistente) nunca termina e a requisição trava até o timeout. Aqui o 404
// vira uma resposta vazia e o corpo original é descartado sem esperar.
const safeFetch: typeof fetch = async (input, init) => {
  const res = await fetch(input, init);
  if (res.status !== 404) return res;
  void res.body?.cancel().catch(() => {});
  return new Response(null, { status: 404, headers: res.headers });
};

/**
 * Netlify Blobs só existe no ambiente do Netlify. Fora dele (npm run dev) o
 * getStore lança erro — aqui vira null e o chamador cai pros arquivos locais.
 */
export function blobStore(name: "content" | "uploads") {
  try {
    return getStore({ name, consistency: "strong", fetch: safeFetch });
  } catch {
    return null;
  }
}
