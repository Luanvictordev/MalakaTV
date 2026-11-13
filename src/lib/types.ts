export type GameStatus = "ativo" | "em-breve";

export type Game = {
  slug: string;
  name: string;
  shortName: string;
  status: GameStatus;
  releaseLabel: string;
  releaseDate: string;
  description: string;
  cover: string;
};

export type Build = {
  game: string;
  slug: string;
  name: string;
  className: string;
  tags: string[];
  note: string;
  videoId: string;
  videoTitle: string;
  image: string;
  pobUrl?: string;
  budget?: string;
  focus?: string;
  playstyle?: string;
  featured: boolean;
  tier: string;
};

export type Guide = {
  game: string;
  slug: string;
  kind: "guia" | "farm";
  title: string;
  metric: string;
  note: string;
  videoId: string;
  videoTitle: string;
  image: string;
  atlasImage?: string;
  atlasUrl?: string;
  setupImages?: string[];
  setupNotes?: string;
  regex?: string;
  investment?: string;
  buildReq?: string;
  mapHint?: string;
};

export type LinkItem = {
  name: string;
  url: string;
  category: string;
  description: string;
  game?: string;
  logo?: string;
  logoInvert?: boolean;
  featured?: boolean;
};

export type Spotlight = {
  label: string;
  description: string;
  url: string;
};

export type SiteConfig = {
  name: string;
  tagline: string;
  handle: string;
  bio: string;
  youtube: string;
  discord: string;
  twitch?: string;
  instagram?: string;
  facebook?: string;
  kick?: string;
  description: string;
  heroTitle: string;
  heroText: string;
  leaguePatch: string;
  leagueName: string;
  leagueDate: string;
  leagueUrl: string;
  leagueImage: string;
  spotlights: Spotlight[];
  buildsEyebrow?: string;
  buildsTitle?: string;
  buildsDescription?: string;
  guidesEyebrow?: string;
  guidesTitle?: string;
  guidesDescription?: string;
  farmsEyebrow?: string;
  farmsTitle?: string;
  farmsDescription?: string;
  toolsEyebrow?: string;
  toolsTitle?: string;
  toolsDescription?: string;
};
