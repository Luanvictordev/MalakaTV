export type FieldType = "text" | "textarea" | "tags" | "bool" | "image" | "spotlight" | "select";

export type Field = {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  hint?: string;
  options?: string[];
};

export type CollectionKey = "games" | "builds" | "guias" | "links";

export type CollectionDef = {
  key: CollectionKey;
  label: string;
  titleKey: string;
  subtitleKey: string;
  fields: Field[];
  create: () => Record<string, unknown>;
};

const gameOptions = ["poe1", "poe2", "hero-siege"];

export const collections: CollectionDef[] = [
  {
    key: "games",
    label: "Jogos",
    titleKey: "name",
    subtitleKey: "status",
    fields: [
      { key: "name", label: "Nome", type: "text", placeholder: "Path of Exile 2" },
      { key: "shortName", label: "Nome curto", type: "text", placeholder: "PoE 2" },
      { key: "slug", label: "Slug", type: "text", placeholder: "poe2", hint: "poe1, poe2, hero-siege. É o que liga builds e guias ao jogo." },
      { key: "status", label: "Status", type: "select", options: ["ativo", "em-breve"], hint: "em-breve deixa a seção desativada no site." },
      { key: "releaseLabel", label: "Etiqueta de lançamento", type: "text", placeholder: "Free-to-play em 11 de dezembro" },
      { key: "releaseDate", label: "Data curta", type: "text", placeholder: "dezembro" },
      { key: "description", label: "Descrição", type: "textarea" },
      { key: "cover", label: "Capa (opcional)", type: "image" },
    ],
    create: () => ({
      slug: "",
      name: "",
      shortName: "",
      status: "em-breve",
      releaseLabel: "",
      releaseDate: "",
      description: "",
      cover: "",
    }),
  },
  {
    key: "builds",
    label: "Builds",
    titleKey: "name",
    subtitleKey: "className",
    fields: [
      { key: "game", label: "Jogo", type: "select", options: gameOptions, hint: "Onde esse card aparece." },
      { key: "name", label: "Nome da build", type: "text", placeholder: "Frost Blades Trickster" },
      { key: "slug", label: "Link (slug)", type: "text", hint: "Deixe vazio pra gerar do nome." },
      { key: "className", label: "Classe / ascendancy", type: "text", placeholder: "Trickster" },
      { key: "tags", label: "Tags", type: "tags", hint: "Separe por vírgula: League Starter, Melee, Tank" },
      { key: "tier", label: "Tier (opcional)", type: "text", placeholder: "S+" },
      { key: "note", label: "Comentário", type: "textarea" },
      { key: "videoId", label: "ID do vídeo no YouTube", type: "text", placeholder: "FMtdXWFo0o8", hint: "A parte depois de watch?v=." },
      { key: "videoTitle", label: "Título do vídeo", type: "text" },
      { key: "pobUrl", label: "Link do PoB (opcional)", type: "text", placeholder: "https://pobb.in/…" },
      { key: "image", label: "Foto do card (opcional)", type: "image", hint: "Se vazio, usa a thumb do vídeo." },
      { key: "featured", label: "Destacar na home", type: "bool" },
    ],
    create: () => ({
      game: "poe1",
      slug: "",
      name: "",
      className: "",
      tags: [],
      note: "",
      videoId: "",
      videoTitle: "",
      pobUrl: "",
      image: "",
      featured: false,
      tier: "",
    }),
  },
  {
    key: "guias",
    label: "Guias & Farms",
    titleKey: "title",
    subtitleKey: "kind",
    fields: [
      { key: "game", label: "Jogo", type: "select", options: gameOptions },
      { key: "title", label: "Título", type: "text", placeholder: "Guia dos Atos para novatos" },
      { key: "slug", label: "Link (slug)", type: "text" },
      { key: "kind", label: "Tipo", type: "select", options: ["guia", "farm"] },
      { key: "metric", label: "Etiqueta", type: "text", placeholder: "20 div/h ou Leveling" },
      { key: "note", label: "Descrição", type: "textarea" },
      { key: "videoId", label: "ID do vídeo no YouTube", type: "text" },
      { key: "videoTitle", label: "Título do vídeo", type: "text" },
      { key: "image", label: "Foto do card (opcional)", type: "image" },
    ],
    create: () => ({
      game: "poe1",
      slug: "",
      kind: "guia",
      title: "",
      metric: "",
      note: "",
      videoId: "",
      videoTitle: "",
      pobUrl: "",
      image: "",
    }),
  },
  {
    key: "links",
    label: "Ferramentas",
    titleKey: "name",
    subtitleKey: "category",
    fields: [
      { key: "name", label: "Nome do site", type: "text", placeholder: "Awakened PoE Trade" },
      { key: "url", label: "Link", type: "text", placeholder: "https://…" },
      {
        key: "logo",
        label: "Logo (opcional)",
        type: "image",
        hint: "Já vem o favicon do site. Suba uma imagem só se quiser trocar.",
      },
      { key: "category", label: "Categoria", type: "text", placeholder: "Comércio e economia" },
      { key: "description", label: "O que é / pra que serve", type: "textarea" },
      {
        key: "logoInvert",
        label: "Inverter logo (logo escura)",
        type: "bool",
        hint: "Marque quando a logo for preta e sumir no fundo escuro.",
      },
    ],
    create: () => ({ name: "", url: "", category: "", description: "", logo: "", logoInvert: false }),
  },
];

export const siteFields: Field[] = [
  { key: "name", label: "Nome do canal", type: "text" },
  { key: "tagline", label: "Subtítulo", type: "text" },
  { key: "handle", label: "Arroba do canal", type: "text", placeholder: "@MalakaTV" },
  { key: "youtube", label: "Link do YouTube", type: "text" },
  { key: "discord", label: "Link do Discord", type: "text", placeholder: "https://discord.gg/…" },
  { key: "bio", label: "Sobre o canal", type: "textarea" },
  { key: "description", label: "Descrição (SEO)", type: "textarea" },
  { key: "heroTitle", label: "Título da home", type: "text" },
  { key: "heroText", label: "Texto da home", type: "textarea" },
  { key: "leaguePatch", label: "Patch da liga", type: "text", placeholder: "3.30" },
  { key: "leagueName", label: "Nome da liga", type: "text", placeholder: "Covens of Umbra" },
  { key: "leagueDate", label: "Data da liga", type: "text", placeholder: "13 de novembro" },
  { key: "leagueUrl", label: "Link da liga", type: "text", placeholder: "https://www.pathofexile.com/covens" },
  { key: "leagueImage", label: "Capa da liga (opcional)", type: "image", hint: "Se vazio, a capa é a arte da umbra desenhada no site." },
  { key: "spotlights", label: "Destaques da liga", type: "spotlight", hint: "Um por linha: título | link | descrição" },
];
