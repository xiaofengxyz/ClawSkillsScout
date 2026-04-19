export interface SystemSkill {
  rank: number;
  name: string;
  author: string;
  slug: string;
  url: string;
  downloads: number;
  stars: number | null;
  description: string;
  version: string | null;
  category: string;
  inputComplexity: string;
  outputValue: string;
  apiDependency: string;
  monetizationPotential: string;
  likelyApis: string[];
  titleKeywords: string[];
  repeatablePatternFlags: string[];
}

export interface SystemAuthor {
  author: string;
  profileUrl: string;
  totalSkills: number;
  sampled10kSkills: number;
  numberOf10kPlusSkills: number;
  numberOf5kPlusSkills: number;
  totalDownloadsInPortfolio: number;
  totalDownloadsIn10kSample: number;
  categoryDistribution: Record<string, number>;
  repetitionScore: number;
  apiReuseLikelihood: string;
  templateUsage: string;
  apiFamilies: string[];
  topSkillNames: string[];
  authorPageStatus: string;
  isProlific: boolean;
}

export interface SystemReport {
  generatedAt: string;
  summary: {
    sampled10kSkills: number;
    sampledAuthors: number;
    prolificAuthors: number;
    topSkillDownloads: number;
    downloaded10kSkills: number;
    downloadedProlificPortfolioSkills: number;
    failed10kSkillDownloads: number;
    failedProlificPortfolioDownloads: number;
  };
  skills: SystemSkill[];
  authors: SystemAuthor[];
  documents: {
    document1: {
      title: string;
      categoryDistribution: Array<{ category: string; count: number; share: number }>;
      top20Skills: SystemSkill[];
      systemLevelFindings: string[];
      repeatableSystem: string[];
    };
    document2: {
      title: string;
      top10Authors: SystemAuthor[];
      prolificAuthors: SystemAuthor[];
      selfImprovingAuthorFocus: SystemAuthor[];
      productionSystemFindings: string[];
    };
    document3: {
      title: string;
      operatingModel: string[];
      ordinaryToViralTransformation: string[];
      executionChecklist: string[];
    };
    document4: {
      title: string;
      replaceableApis: Array<{ apiFamily: string; skillCount: number; systemPlay: string }>;
      freeProModelByCategory: Array<{ category: string; freeTier: string; proTier: string }>;
      top10AisaRebuildCandidates: Array<{
        skill: string;
        author: string;
        category: string;
        downloads: number;
        likelyApis: string[];
        systemRationale: string;
        aisaMonetizationHook: string;
      }>;
      monetizationFunnel: string[];
      roadmap: string[];
    };
  };
}
