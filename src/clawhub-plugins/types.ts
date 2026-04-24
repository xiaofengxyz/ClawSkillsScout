export interface PluginSurfaceRow {
  rank: number;
  catalogRank: number;
  href: string;
  url: string;
  name: string;
  owner: string;
  family: string;
  theme: string;
  scanStatus: string | null;
  verificationTier: string | null;
  executesCode: boolean;
  publicStatsZero: boolean;
  versions: number;
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
  catalogRank: number;
  verificationTier: string | null;
  verification?: PluginVerification | null;
  scanStatus?: string | null;
  executesCode: boolean;
  publicStatsZero: boolean;
  versions: number;
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
    catalogRank: number;
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
    explicitSortBoardsVisible: boolean;
    visiblePublicSurfaces: string[];
    usedExistingSnapshot: boolean;
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
    topCatalogPlugin: string | null;
    topTheme: string | null;
    topAuthor: string | null;
  };
  surfaces: {
    catalogTop: PluginSurfaceRow[];
    codePlugins: PluginSurfaceRow[];
    bundlePlugins: PluginSurfaceRow[];
    verifiedOnly: PluginSurfaceRow[];
    executesCode: PluginSurfaceRow[];
    compositeTop: PluginCompositeRow[];
  };
  authors: PluginAuthorProfile[];
  aisaCandidates: PluginAisaCandidate[];
  mechanics: {
    listingMechanics: string[];
    breakoutMechanics: string[];
    trustMechanics: string[];
    publishMoves: string[];
  };
}
