export interface DownloadInsightSkill {
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

export interface DownloadInsightAuthorSkill {
  name: string;
  url: string;
  downloads: number;
  category: string;
  likelyApis: string[];
  description: string;
}

export interface DownloadInsightAuthor {
  author: string;
  profileUrl: string;
  totalSkills: number;
  sampledTopSkills: number;
  sampledSkillUrls: string[];
  skills: DownloadInsightAuthorSkill[];
  numberOf10kPlusSkills: number;
  numberOf5kPlusSkills: number;
  categoryDistribution: Record<string, number>;
  repetitionScore: number;
  apiReuseLikelihood: string;
  templateUsage: string;
  strategyLabel: string;
  totalDownloadsInPortfolio: number;
  totalDownloadsInTopSample: number;
  topSkillNames: string[];
  apiFamilies: string[];
  authorPageStatus: string;
  viralProductive: boolean;
}

export interface DownloadInsightsReport {
  generatedAt: string;
  source: {
    skillsListUrl: string;
    convexQueryUrl: string;
    sampleType: string;
    notes: string[];
  };
  summary: {
    sampledSkills: number;
    sampledAuthors: number;
    skills5kPlus: number;
    skills10kPlus: number;
    topSkillDownloads: number;
    prolificHitAuthors: number;
    topCategory: string;
  };
  collectionDiagnostics: {
    authorPageStatusCounts: Record<string, number>;
    thresholds: {
      midDownload: number;
      highDownload: number;
    };
  };
  skills: DownloadInsightSkill[];
  authors: DownloadInsightAuthor[];
  documents: {
    document1: {
      title: string;
      categoryDistribution: Array<{ category: string; count: number; share: number }>;
      top20Skills: DownloadInsightSkill[];
      keySuccessFactors: string[];
    };
    document2: {
      title: string;
      top10Authors: DownloadInsightAuthor[];
      viralProductiveAuthors: Array<{
        author: string;
        profileUrl: string;
        totalSkills: number;
        numberOf10kPlusSkills: number;
        strategyLabel: string;
      }>;
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
