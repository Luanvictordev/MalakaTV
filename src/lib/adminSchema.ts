export type FieldType =
  | "text"
  | "textarea"
  | "tags"
  | "pills"
  | "bool"
  | "image"
  | "images"
  | "spotlight"
  | "select"
  | "youtube"
  | "ascendancy";

export type Field = {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  hint?: string;
  options?: string[];
  optionLabels?: Record<string, string>;
  half?: boolean;
  group?: string;
  advanced?: boolean;
  onlyWhenKind?: "farm" | "guia";
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
    key: "builds",
    label: "Builds",
    titleKey: "name",
    subtitleKey: "className",
    fields: [
      { key: "game", label: "Jogo", type: "select", options: gameOptions, half: true },
      { key: "className", label: "Classe / Ascendancy", type: "ascendancy", placeholder: "Trickster", half: true },
      { key: "name", label: "Nome da build", type: "text", placeholder: "Frost Blades Trickster" },
      { key: "videoId", label: "Vídeo do YouTube", type: "youtube", placeholder: "Cole o link do YouTube ou ID", half: true },
      { key: "pobUrl", label: "Link do PoB (opcional)", type: "text", placeholder: "https://pobb.in/…", half: true },
      { key: "note", label: "Resumo / comentário da build", type: "textarea" },
      { key: "tags", label: "Tags", type: "tags" },
      { key: "featured", label: "Destacar na capa da Home", type: "bool" },
      {
        key: "budget",
        label: "Custo / Investimento",
        type: "pills",
        options: ["Zero / SSF", "Barato", "Médio", "High Budget"],
        advanced: true,
      },
      {
        key: "focus",
        label: "Foco da build",
        type: "pills",
        options: ["Mapper", "Bosser", "All-rounder", "Sanctum / Trial"],
        advanced: true,
      },
      {
        key: "playstyle",
        label: "Estilo de jogo",
        type: "pills",
        options: ["1 botão / Chill", "Médio", "Muitos botões"],
        advanced: true,
      },
      { key: "tier", label: "Tier no card (ex: S+)", type: "text", placeholder: "S+", advanced: true },
      { key: "image", label: "Capa customizada (opcional)", type: "image", hint: "Se vazio, usa a thumb do YouTube.", advanced: true },
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
      budget: "",
      focus: "",
      playstyle: "",
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
      { key: "game", label: "Jogo", type: "select", options: gameOptions, half: true },
      {
        key: "kind",
        label: "Tipo de conteúdo",
        type: "select",
        options: ["guia", "farm"],
        optionLabels: { guia: "Guia", farm: "Farm" },
        half: true,
      },
      { key: "title", label: "Título", type: "text", placeholder: "Guia dos Atos para novatos", half: true },
      { key: "metric", label: "Destaque no card (opcional)", type: "text", placeholder: "20 div/h ou Leveling", half: true },
      {
        key: "atlasUrl",
        label: "Tree do Atlas",
        type: "text",
        placeholder: "Cole o link do PoEDB, PoE Planner ou site oficial…",
        onlyWhenKind: "farm",
      },
      {
        key: "videoId",
        label: "Vídeo do YouTube (opcional)",
        type: "youtube",
        placeholder: "Cole o link do YouTube ou deixe vazio",
      },
      { key: "note", label: "Resumo curto", type: "textarea" },
      {
        key: "regex",
        label: "Regex do mapa (opcional)",
        type: "text",
        placeholder: '"!m q|!el" "m q.*([89]\\d|1\\d\\d)"',
        onlyWhenKind: "farm",
      },
      {
        key: "setupNotes",
        label: "Passo a passo do setup (opcional)",
        type: "textarea",
        placeholder: "Explique passo a passo: scarabs, tier de mapa, investimento, mecânica e dicas…",
        hint: "Use '- ' para listas, '1. ' para passos, 'Título:' para seções e 'Dica:' ou 'Atenção:' para destacar.",
        onlyWhenKind: "farm",
      },
      {
        key: "setupImages",
        label: "Prints extras: scarabs, map device… (opcional)",
        type: "images",
        onlyWhenKind: "farm",
      },
      {
        key: "image",
        label: "Capa customizada (opcional)",
        type: "image",
        hint: "Se vazio, usa a thumb do YouTube ou gera a print do Atlas automaticamente.",
        advanced: true,
      },
      {
        key: "investment",
        label: "Investimento inicial",
        type: "pills",
        options: ["Zero (Alch & Go)", "Baixo", "Médio", "Alto"],
        onlyWhenKind: "farm",
        advanced: true,
      },
      {
        key: "buildReq",
        label: "Exigência da build",
        type: "pills",
        options: ["Qualquer build", "Clear rápido", "Single target forte", "Tank"],
        onlyWhenKind: "farm",
        advanced: true,
      },
      {
        key: "mapHint",
        label: "Mapa recomendado",
        type: "text",
        placeholder: "Ex: Jungle Valley / Dunes ou T15+",
        onlyWhenKind: "farm",
        advanced: true,
      },
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
      atlasImage: "",
      atlasUrl: "",
      setupImages: [],
      regex: "",
      setupNotes: "",
      investment: "",
      buildReq: "",
      mapHint: "",
    }),
  },
  {
    key: "games",
    label: "Jogos",
    titleKey: "name",
    subtitleKey: "status",
    fields: [
      { key: "name", label: "Nome do jogo", type: "text", placeholder: "Path of Exile 2", half: true },
      { key: "shortName", label: "Nome curto (menu)", type: "text", placeholder: "PoE 2", half: true },
      {
        key: "status",
        label: "Status no site",
        type: "select",
        options: ["ativo", "em-breve"],
        optionLabels: { ativo: "Ativo no site", "em-breve": "Em breve" },
        half: true,
      },
      {
        key: "releaseLabel",
        label: "Selo da temporada / aviso",
        type: "text",
        placeholder: "Ex: Liga 3.30 · Covens of Umbra",
        half: true,
      },
      { key: "description", label: "Descrição curta da página do jogo", type: "textarea" },
      { key: "releaseDate", label: "Data curta ao lado do selo (opcional)", type: "text", placeholder: "13 de novembro", advanced: true },
      { key: "cover", label: "Banner customizado (opcional)", type: "image", advanced: true },
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
    key: "links",
    label: "Ferramentas",
    titleKey: "name",
    subtitleKey: "category",
    fields: [
      { key: "name", label: "Nome da ferramenta", type: "text", placeholder: "Awakened PoE Trade", half: true },
      { key: "url", label: "Link do site", type: "text", placeholder: "https://…", half: true },
      {
        key: "category",
        label: "Categoria",
        type: "pills",
        options: ["Comércio e economia", "Leveling e árvore", "Overlays e ferramentas", "Filtros", "Builds", "Comunidade"],
      },
      {
        key: "game",
        label: "Compatível com",
        type: "pills",
        options: ["Ambos", "PoE 1", "PoE 2"],
        half: true,
      },
      { key: "featured", label: "Destacar na Home", type: "bool", half: true },
      { key: "description", label: "Para que serve (resumo curto)", type: "textarea" },
      {
        key: "logo",
        label: "Logo customizada (opcional)",
        type: "image",
        hint: "Por padrão já puxa o ícone oficial do site.",
        advanced: true,
      },
      {
        key: "logoInvert",
        label: "Inverter cor da logo (para logos pretas)",
        type: "bool",
        advanced: true,
      },
    ],
    create: () => ({ name: "", url: "", category: "", game: "", description: "", logo: "", logoInvert: false, featured: false }),
  },
];

export const siteFields: Field[] = [
  { key: "leaguePatch", label: "Patch", type: "text", placeholder: "3.30", half: true, group: "Liga em destaque (Banner da Home)" },
  { key: "leagueName", label: "Nome da liga", type: "text", placeholder: "Covens of Umbra", half: true, group: "Liga em destaque (Banner da Home)" },
  { key: "leagueDate", label: "Data / lançamento", type: "text", placeholder: "13 de novembro", half: true, group: "Liga em destaque (Banner da Home)" },
  { key: "leagueImage", label: "Arte da liga (opcional)", type: "image", hint: "Se vazio, usa a arte padrão desenhada no site.", group: "Liga em destaque (Banner da Home)" },

  { key: "heroTitle", label: "Título principal da Home", type: "text", group: "Boas-vindas & Atalhos da Home" },
  { key: "heroText", label: "Subtítulo da Home", type: "textarea", group: "Boas-vindas & Atalhos da Home" },
  { key: "spotlights", label: "Links rápidos da liga (Patch notes, Árvore, Atlas)", type: "spotlight", group: "Boas-vindas & Atalhos da Home" },

  { key: "youtube", label: "YouTube", type: "text", half: true, group: "Canal & Redes Sociais" },
  { key: "discord", label: "Discord", type: "text", placeholder: "https://discord.gg/…", half: true, group: "Canal & Redes Sociais" },
  { key: "twitch", label: "Twitch", type: "text", placeholder: "https://www.twitch.tv/…", half: true, group: "Canal & Redes Sociais" },
  { key: "kick", label: "Kick", type: "text", placeholder: "https://kick.com/…", half: true, group: "Canal & Redes Sociais" },
  { key: "instagram", label: "Instagram", type: "text", placeholder: "https://www.instagram.com/…", half: true, group: "Canal & Redes Sociais" },
  { key: "facebook", label: "Facebook", type: "text", placeholder: "https://www.facebook.com/…", half: true, group: "Canal & Redes Sociais" },
  { key: "bio", label: "Frase sobre o canal (rodapé)", type: "textarea", group: "Canal & Redes Sociais" },
];
