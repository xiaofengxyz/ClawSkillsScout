export interface MultiRankingSkill {
  rank: number;
  slug: string;
  name: string;
  author: string;
  description: string;
  downloads: number;
  stars: number;
  installsCurrent: number;
  url: string;
  theme: string;
}

export interface MultiRankingThemeSummary {
  theme: string;
  count: number;
}

export interface MultiRankingBoard {
  top10: MultiRankingSkill[];
  top20ThemeSummary: MultiRankingThemeSummary[];
}

export interface CrossRankSkill {
  slug: string;
  name: string;
  author: string;
  url: string;
  description: string;
  downloads: number;
  stars: number;
  installsCurrent: number;
  theme: string;
  ranks: Record<string, number>;
  appearances: number;
  compositeScore: number;
}

export interface CrossRankAuthor {
  author: string;
  distinctSkills: number;
  appearances: number;
  score: number;
  bestRanks: Record<string, number>;
}

export interface CrossRankAuthorProfileSkill {
  slug: string;
  name: string;
  downloads: number;
  stars: number;
  installsCurrent: number;
  theme: string;
}

export interface CrossRankAuthorProfile {
  totalSkills: number;
  topSkills: CrossRankAuthorProfileSkill[];
}

export interface AisaPrioritySkill {
  owner: string;
  slug: string;
  name: string;
  downloads: number;
  stars: number;
  installsCurrent: number;
  theme: string;
  path: string;
  priorityScore: number;
  reason: string;
}

export interface ClawhubMultiRankingReport {
  generatedAt: string;
  sources: {
    rankingPages: Record<string, string>;
    convexQueryUrl: string;
    sampleSizePerRanking: number;
  };
  rankings: {
    downloads: MultiRankingBoard;
    stars: MultiRankingBoard;
    installs: MultiRankingBoard;
  };
  crossRanking: {
    topSkills: CrossRankSkill[];
    topAuthors: CrossRankAuthor[];
    topAuthorProfiles: Record<string, CrossRankAuthorProfile>;
  };
  aisaSnapshot: {
    owners: Record<string, { totalSkills: number; topSkills: CrossRankAuthorProfileSkill[] }>;
    localSkills: AisaPrioritySkill[];
    priorityOrder: AisaPrioritySkill[];
    primaryFlagshipSlug: string | null;
  };
}
