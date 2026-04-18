export interface GrowthSkill {
  rank: number;
  name: string;
  url: string;
  author: string;
  slug: string;
  downloads: number;
  rating: number | null;
  description: string;
  version: string | null;
  badges: string[];
  category: string;
  inputComplexity: string;
  outputValue: string;
  apiDependency: string;
  monetizationPotential: string;
  likelyApis: string[];
  titleKeywords: string[];
  repeatablePatternFlags: string[];
}

export interface GrowthAuthor {
  author: string;
  profileUrl: string;
  sampledTotalSkills: number;
  sampledSkillUrls: string[];
  skills: Array<{
    name: string;
    url: string;
    downloads: number;
    category: string;
    likelyApis: string[];
  }>;
  numberOf5kPlusSkills: number;
  categoryDistribution: Record<string, number>;
  repetitionScore: number;
  apiReuseLikelihood: string;
  templateUsage: string;
  strategyLabel: string;
  totalDownloadsInSample: number;
  topSkillNames: string[];
  authorPageStatus: string;
}

export interface GrowthReport {
  generatedAt: string;
  source: {
    skillsListUrl: string;
    sampleType: string;
    notes: string[];
  };
  summary: {
    sampledSkills: number;
    sampledAuthors: number;
    highDownloadSkills: number;
    topSkillDownloads: number;
  };
  skills: GrowthSkill[];
  authors: GrowthAuthor[];
  documents: {
    document1: {
      title: string;
      categoryDistribution: Array<{ category: string; count: number; share: number }>;
      top20Skills: GrowthSkill[];
      keySuccessFactors: string[];
    };
    document2: {
      title: string;
      top10Authors: GrowthAuthor[];
      authorPatterns: string[];
    };
    document3: {
      title: string;
      productionSystem: string[];
      templates: Array<{ name: string; bestFor: string; structure: string }>;
      namingPatterns: string[];
    };
    document4: {
      title: string;
      replaceableApis: Array<{ apiFamily: string; skillCount: number; whyItMatters: string }>;
      freeVsPaidByCategory: Array<{ category: string; freeTier: string; paidTier: string }>;
      top10Rebuilds: Array<{
        skill: string;
        author: string;
        category: string;
        rationale: string;
        aisaAngle: string;
      }>;
      skillFactorySystemDesign: string[];
      apiMonetizationFunnel: string[];
      roadmap: string[];
    };
  };
}
