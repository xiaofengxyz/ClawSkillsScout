export interface PluginRankingRow {
  rank: number;
  href: string;
  url: string;
  name: string;
  owner: string;
  family: string;
  theme: string;
  scanStatus: string | null;
  verificationTier: string | null;
  bestRank: number | null;
  worstRank: number | null;
  rankSpread: number;
  bestSorts: string[];
}

export interface PluginVerification {
  tier: string;
}

export interface PluginCompositeRow {
  href: string;
  url: string;
  owner: string;
  displayName: string;
  family: string;
  theme: string;
  summary: string;
  compositeScore: number;
  bestRank: number | null;
  worstRank: number | null;
  rankSpread: number;
  bestSorts: string[];
  verification?: PluginVerification | null;
  scanStatus?: string | null;
}

export interface PluginAuthorProfile {
  author: string;
  ownerDisplayName: string;
  totalPlugins: number;
  codePlugins: number;
  bundlePlugins: number;
  cleanPlugins: number;
  sourceLinkedPlugins: number;
  averageCompositeScore: number;
  primaryThemes: string[];
  topPlugins: Array<{
    href: string;
    name: string;
    family: string;
    theme: string;
    compositeScore: number;
    scanStatus: string | null;
    url: string;
  }>;
}

export interface PluginAisaCandidate {
  href: string;
  url: string;
  owner: string;
  name: string;
  summary: string;
  family: string;
  theme: string;
  scanStatus: string | null;
  verificationTier: string | null;
  aisaFitScore: number;
  monetizationScore: number;
  factoryScore: number;
  opportunityScore: number;
  whyItFits: string;
}

export interface ClawhubPluginReport {
  generatedAt: string;
  sources: string[];
  methodology: {
    note: string;
    dataDate: string;
    identicalRankingOrders: boolean;
  };
  summary: {
    totalPlugins: number;
    codePlugins: number;
    bundlePlugins: number;
    sourceLinkedPlugins: number;
    cleanPlugins: number;
    suspiciousPlugins: number;
    executesCodePlugins: number;
    publicStatsZeroPlugins: number;
    topDownloadsPlugin: string | null;
    topInstallsPlugin: string | null;
    topStarsPlugin: string | null;
    topTheme: string | null;
    topAuthor: string | null;
  };
  rankings: {
    downloads: PluginRankingRow[];
    installs: PluginRankingRow[];
    stars: PluginRankingRow[];
    divergenceHighlights: PluginCompositeRow[];
    compositeTop: PluginCompositeRow[];
  };
  authors: PluginAuthorProfile[];
  aisaCandidates: PluginAisaCandidate[];
  mechanics: {
    rankingMechanics: string[];
    breakoutMechanics: string[];
    trustMechanics: string[];
    publishMoves: string[];
  };
}
