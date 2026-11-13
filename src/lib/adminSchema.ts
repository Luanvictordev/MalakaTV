export type FieldType = "text" | "textarea" | "tags" | "pills" | "bool" | "image" | "images" | "spotlight" | "select" | "youtube" | "ascendancy";

export type Field = {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  hint?: string;
  options?: string[];
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
    key: "games",
    label: "Jogos",
    titleKey: "name",
    subtitleKey: "status",
    fields: [
      { key: "name", label: "Nome", type: "text", placeholder: "Path of Exile 2" },
      { key: "shortName", label: "Nome curto", type: "text", placeholder: "PoE 2" },
      { key: "slug", label: "Slug", type: "text", placeholder: "poe2", hint: "poe1, poe2, hero-siege. É o que liga builds e guias ao jogo.", advanced: true },
      { key: "status", label: "Status", type: "select", options: ["ativo", "em-breve"], hint: "em-breve deixa a seção desativada no site." },
      { key: "releaseLabel", label: "Etiqueta de lançamento", type: "text", placeholder: "Free-to-play em 11 de dezembro" },
      { key: "releaseDate", label: "Data curta", type: "text", placeholder: "dezembro", advanced: true },
      { key: "description", label: "Descrição", type: "textarea" },
      { key: "cover", label: "Capa (opcional)", type: "image", advanced: true },
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
      { key: "game", label: "Jogo", type: "select", options: gameOptions },
      { key: "name", label: "Nome da build", type: "text", placeholder: "Frost Blades Trickster" },
      { key: "videoId", label: "Vídeo do YouTube", type: "youtube", placeholder: "Cole o link do YouTube ou o ID" },
      { key: "className", label: "Classe / ascendancy", type: "ascendancy", placeholder: "Trickster" },
      { key: "pobUrl", label: "Link do PoB (opcional)", type: "text", placeholder: "https://pobb.in/…" },
      { key: "tags", label: "Tags", type: "tags" },
      { key: "note", label: "Comentário", type: "textarea" },
      { key: "featured", label: "Destacar na home", type: "bool" },
      {
        key: "budget",
        label: "Investimento (opcional)",
        type: "pills",
        options: ["Zero / SSF", "Barato", "Médio", "High Budget"],
        hint: "Clique para marcar ou desmarcar. Ajuda o usuário a filtrar.",
        advanced: true,
      },
      {
        key: "focus",
        label: "Foco da build (opcional)",
        type: "pills",
        options: ["Mapper", "Bosser", "All-rounder", "Sanctum / Trial"],
        advanced: true,
      },
      {
        key: "playstyle",
        label: "Estilo / botões (opcional)",
        type: "pills",
        options: ["1 botão / Chill", "Médio", "Muitos botões"],
        advanced: true,
      },
      { key: "tier", label: "Tier (opcional)", type: "text", placeholder: "S+", advanced: true },
      { key: "videoTitle", label: "Título do vídeo (opcional)", type: "text", advanced: true },
      { key: "image", label: "Foto customizada (opcional)", type: "image", hint: "Se vazio, usa a thumb do vídeo.", advanced: true },
      { key: "slug", label: "Link da página (slug)", type: "text", hint: "Gerado automaticamente pelo nome.", advanced: true },
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
      { key: "game", label: "Jogo", type: "select", options: gameOptions },
      { key: "kind", label: "Tipo", type: "select", options: ["guia", "farm"] },
      { key: "title", label: "Título", type: "text", placeholder: "Guia dos Atos para novatos" },
      {
        key: "videoId",
        label: "Vídeo do YouTube (opcional)",
        type: "youtube",
        placeholder: "Cole o link do YouTube ou deixe vazio para usar só foto",
      },
      {
        key: "image",
        label: "Foto / capa (opcional)",
        type: "image",
        hint: "Use quando não tiver vídeo, ou junto com o vídeo para mostrar os dois no post.",
      },
      { key: "metric", label: "Etiqueta", type: "text", placeholder: "20 div/h ou Leveling" },
      { key: "note", label: "Resumo curto", type: "textarea" },
      {
        key: "atlasUrl",
        label: "Link da Tree do Atlas (recomendado)",
        type: "text",
        placeholder: "https://poedb.tw/pt/atlas-skill-tree/… ou https://poeplanner.com/…",
        hint: "Cole o link do PoEDB, PoE Planner ou site oficial para gerar a Atlas Tree interativa (com zoom sem perder qualidade e descrição nos nodes).",
        onlyWhenKind: "farm",
      },
      {
        key: "atlasImage",
        label: "Print da Tree do Atlas (opcional — só se não tiver o link)",
        type: "image",
        hint: "Só envie imagem se você não tiver o link da tree acima.",
        onlyWhenKind: "farm",
      },
      {
        key: "setupImages",
        label: "Prints do setup",
        type: "images",
        hint: "Scarabs, map device, mapa, regex, ídolos — adicione quantos prints quiser.",
        onlyWhenKind: "farm",
      },
      {
        key: "regex",
        label: "Regex do mapa (opcional)",
        type: "text",
        placeholder: '"!m q|!el" "m q.*([89]\\d|1\\d\\d)"',
        onlyWhenKind: "farm",
      },
      {
        key: "setupNotes",
        label: "Explicação do setup",
        type: "textarea",
        placeholder: "Explique passo a passo: scarabs, tier de mapa, investimento, mecânica e dicas…",
        hint: "Opcional: use '- ' para listas, '1. ' para passos, 'Título:' para seções e 'Dica:' ou 'Atenção:' para destacar.",
        onlyWhenKind: "farm",
      },
      {
        key: "investment",
        label: "Investimento inicial (opcional)",
        type: "pills",
        options: ["Zero (Alch & Go)", "Baixo", "Médio", "Alto"],
        onlyWhenKind: "farm",
        advanced: true,
      },
      {
        key: "buildReq",
        label: "Exigência da build (opcional)",
        type: "pills",
        options: ["Qualquer build", "Clear rápido", "Single target forte", "Tank"],
        onlyWhenKind: "farm",
        advanced: true,
      },
      {
        key: "mapHint",
        label: "Mapa / Waystone recomendado (opcional)",
        type: "text",
        placeholder: "Ex: Jungle Valley / Dunes ou T15+",
        onlyWhenKind: "farm",
        advanced: true,
      },
      { key: "videoTitle", label: "Título do vídeo (opcional)", type: "text", advanced: true },
      { key: "slug", label: "Link (slug)", type: "text", hint: "Gerado automaticamente pelo título.", advanced: true },
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
      {
        key: "game",
        label: "Jogo (opcional)",
        type: "pills",
        options: ["Ambos", "PoE 1", "PoE 2"],
        hint: "Se deixar vazio, aparece como compatível com ambos.",
      },
      { key: "description", label: "O que é / pra que serve", type: "textarea" },
      {
        key: "logoInvert",
        label: "Inverter logo (logo escura)",
        type: "bool",
        hint: "Marque quando a logo for preta e sumir no fundo escuro.",
      },
      { key: "featured", label: "Destacar na home", type: "bool", hint: "Se nenhuma ferramenta for marcada, a home mostra as 6 padrão." },
    ],
    create: () => ({ name: "", url: "", category: "", game: "", description: "", logo: "", logoInvert: false, featured: false }),
  },
];

export const siteFields: Field[] = [
  { key: "name", label: "Nome do canal", type: "text" },
  { key: "tagline", label: "Subtítulo", type: "text" },
  { key: "handle", label: "Arroba do canal", type: "text", placeholder: "@MalakaTV" },
  { key: "youtube", label: "Link do YouTube", type: "text" },
  { key: "discord", label: "Link do Discord", type: "text", placeholder: "https://discord.gg/…" },
  { key: "twitch", label: "Link da Twitch", type: "text", placeholder: "https://www.twitch.tv/…" },
  { key: "instagram", label: "Link do Instagram", type: "text", placeholder: "https://www.instagram.com/…" },
  { key: "facebook", label: "Link do Facebook", type: "text", placeholder: "https://www.facebook.com/…" },
  { key: "kick", label: "Link da Kick", type: "text", placeholder: "https://kick.com/…" },
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
  { key: "buildsEyebrow", label: "Seção Builds — etiqueta", type: "text", placeholder: "Padrão: etiqueta de lançamento do jogo" },
  { key: "buildsTitle", label: "Seção Builds — título", type: "text", placeholder: "Builds em destaque" },
  { key: "buildsDescription", label: "Seção Builds — descrição", type: "textarea", placeholder: "As que o Malaka indicou primeiro, com vídeo completo e resumo direto." },
  { key: "guidesEyebrow", label: "Seção Guias — etiqueta", type: "text", placeholder: "Comece por aqui" },
  { key: "guidesTitle", label: "Seção Guias — título", type: "text", placeholder: "Guias pra começar bem" },
  { key: "guidesDescription", label: "Seção Guias — descrição", type: "textarea", placeholder: "Os guias essenciais pra começar bem." },
  { key: "farmsEyebrow", label: "Seção Farms — etiqueta", type: "text", placeholder: "Economia" },
  { key: "farmsTitle", label: "Seção Farms — título", type: "text", placeholder: "FARMs que pagam" },
  { key: "farmsDescription", label: "Seção Farms — descrição", type: "textarea", placeholder: "Farms seguros e rentáveis pra evoluir rápido." },
  { key: "toolsEyebrow", label: "Seção Ferramentas — etiqueta", type: "text", placeholder: "Ferramentas" },
  { key: "toolsTitle", label: "Seção Ferramentas — título", type: "text", placeholder: "O que ele usa, explicado" },
  { key: "toolsDescription", label: "Seção Ferramentas — descrição", type: "textarea", placeholder: "Planners, filtros, overlays e comunidade — cada site explicado e com link direto." },
];
