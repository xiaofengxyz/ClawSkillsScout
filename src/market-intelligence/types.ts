export interface MarketSkill {
  name: string;
  ecosystem?: string;
  slug?: string;
  owner?: string;
  author?: string;
  repo?: string;
  href?: string;
  description: string;
  category: string;
  apiFamily: string;
  targetTitle: string;
  summary?: string;
  moves?: string[];
  stars?: number;
  installs?: number;
  installsCurrent?: number;
  weeklyDownloads?: number;
  pluginCount?: number;
  listedSkillCount?: number;
  listedGithubStars?: number;
  githubStars?: number;
  qualityScore?: number;
  securityScore?: number;
  trustIdentityScore?: number;
  behavioralMonitoringScore?: number;
  vulnerabilityExposureScore?: number;
  securitySignalsResolved?: boolean;
  platformCoverageCount?: number;
  totalDistributionInstalls?: number;
  platformCoverageScore?: number;
  rating?: number;
  aisaFitScore?: number;
  monetizationScore?: number;
  factoryScore?: number;
  aisaOpportunityScore?: number;
  aisaConversionScore?: number;
  priorityScore?: number;
  opportunityScore?: number;
  theme?: string;
  path?: string;
  sectionTitle?: string;
  tags?: string[];
  platformScope?: string;
  sourceUrl?: string | null;
  url?: string;
}

export interface ClawhubTopSkill {
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

export interface ClawhubAuthorProfile {
  author: string;
  totalSkills: number;
  topSkills: Array<{
    slug: string;
    name: string;
    downloads: number;
    stars: number;
    installsCurrent: number;
    theme: string;
  }>;
}

export interface MarketOwnerProfile {
  owner: string;
  repoCount?: number;
  marketplaceCount?: number;
  skillCount?: number;
  totalStars: number;
  totalInstalls?: number;
  totalPlugins?: number;
  primaryCategories: string[];
  topSkills?: Array<{
    name: string;
    repo: string;
    stars: number;
    installs: number;
    category: string;
    targetTitle: string;
  }>;
  topRepos?: Array<{
    repo: string;
    stars: number;
    pluginCount: number;
    description: string;
  }>;
}

export interface MarketCategorySummary {
  name: string;
  count: number;
  href?: string;
}

export interface HermesCountRow {
  name: string;
  count: number;
}

export interface MarketEcosystemReport {
  generatedAt: string;
  sources: {
    clawhub: string[];
    claudeSkills: string;
    claudeMarketplaces: string;
    hermesSkills: string;
    hermesCatalog: string;
  };
  clawhub: {
    summary: {
      topSkillAcrossThreeLists: ClawhubTopSkill;
      downloadsTopCategory: string;
      existingAisaSkillsPlanned: number;
      top200ConvertibleCandidates: number;
    };
    topSkills: ClawhubTopSkill[];
    topAuthors: Array<{
      author: string;
      distinctSkills: number;
      appearances: number;
      score: number;
      bestRanks: Record<string, number>;
    }>;
    topAuthorProfiles: ClawhubAuthorProfile[];
    viralPlaybook: {
      keySuccessFactors: string[];
      authorPatterns: string[];
      productionSystem: string[];
      roadmap: string[];
    };
    flagshipAisaPriorities: MarketSkill[];
    topAisaConversionCandidates: MarketSkill[];
  };
  claude: {
    skills: {
      sourceUrl: string;
      summary: {
        totalSkills: number;
        totalSkillInstalls: number;
        totalSkillStars: number;
        categoriesTracked: number;
        topCategory: string | null;
      };
      categories: MarketCategorySummary[];
      topByInstalls: MarketSkill[];
      topByStars: MarketSkill[];
      topByComposite: MarketSkill[];
      topOwners: MarketOwnerProfile[];
      aisaCandidates: MarketSkill[];
      commonPatterns: string[];
    };
    marketplaces: {
      sourceUrl: string;
      summary: {
        totalMarketplaces: number;
        totalMarketplaceStars: number;
        totalPluginsListed: number;
        categoriesTracked: number;
        topCategory: string | null;
      };
      categories: MarketCategorySummary[];
      topByStars: MarketSkill[];
      topByPluginCount: MarketSkill[];
      topByComposite: MarketSkill[];
      topOwners: MarketOwnerProfile[];
      aisaCandidates: MarketSkill[];
      commonPatterns: string[];
    };
  };
  hermes: {
    sourceUrl: string;
    sourceDocUrl: string;
    liveGuide: {
      sourceUrl: string;
      advertisedSkillCategories: number;
      advertisedBundledSkills: number;
      categoryButtons: string[];
      liveFetchError: string;
    };
    rawCatalog: {
      sourceDocUrl: string;
      parsedSkillRows: number;
      bundledRows: number;
      optionalRows: number;
      totalSections: number;
      sectionBreakdown: HermesCountRow[];
      bundledSectionBreakdown: HermesCountRow[];
      optionalSectionBreakdown: HermesCountRow[];
      bundledSections: Array<{
        type: 'bundled' | 'optional';
        sectionTitle: string;
        sectionSlug: string;
        sectionDescription: string;
        skillCount: number;
      }>;
      optionalSections: Array<{
        type: 'bundled' | 'optional';
        sectionTitle: string;
        sectionSlug: string;
        sectionDescription: string;
        skillCount: number;
      }>;
    };
    summary: {
      totalSkills: number;
      bundledSkills: number;
      optionalSkills: number;
      sections: number;
      topSection: string | null;
      advertisedBundledSkills: number;
      advertisedSkillCategories: number;
    };
    categoryButtons: string[];
    sections: Array<{ name: string; count: number }>;
    tags: Array<{ name: string; count: number }>;
    bundled: MarketSkill[];
    optional: MarketSkill[];
    commonPatterns: string[];
  };
  combined: {
    combinedOpportunities: MarketSkill[];
    designPrinciples: string[];
    executionLanes: string[];
  };
}

export interface AgentSkillRankingFactor {
  factor: string;
  importance: string;
  evidence: string;
  whyItMatters: string;
}

export interface AgentSkillCreatorProfile {
  owner: string;
  sampledSkills: number;
  sampledPlugins: number;
  totalInstalls: number;
  totalGithubStars: number;
  avgQualityScore: number;
  avgSecurityScore: number;
  primaryCategories: string[];
}

export interface AgentSkillReport {
  generatedAt: string;
  sources: {
    skills: string;
    plugins: string[];
  };
  sampleNotes: {
    skills: string;
    plugins: string;
  };
  summary: {
    sampledSkills: number;
    sampledPlugins: number;
    sampledCreators: number;
    ownerPagesFetched: number;
    totalSkillInstalls: number;
    totalSkillGithubStars: number;
    avgQualityScore: number;
    avgSecurityScore: number;
    topSkillCategory: string | null;
    topPluginCategory: string | null;
  };
  rankingFactors: AgentSkillRankingFactor[];
  skills: {
    items: MarketSkill[];
    topByOpportunity: MarketSkill[];
    topByInstalls: MarketSkill[];
    topByQuality: MarketSkill[];
    topBySecurity: MarketSkill[];
    topCategories: MarketCategorySummary[];
    commonPatterns: string[];
  };
  plugins: {
    items: MarketSkill[];
    topByOpportunity: MarketSkill[];
    topBySkillCount: MarketSkill[];
    topByGithubStars: MarketSkill[];
    commonPatterns: string[];
  };
  creators: {
    topCreators: AgentSkillCreatorProfile[];
  };
}

export interface AgentSkillsSoAuthorProfile {
  owner: string;
  skillCount: number;
  totalWeeklyDownloads: number;
  totalGithubStars: number;
  avgSecurityScore: number;
  primaryCategories: string[];
}

export interface AgentSkillsSoReport {
  generatedAt: string;
  sources: {
    listings: string[];
  };
  sampleNotes: {
    pagesFetched: string[];
    listingCount: number;
    detailCount: number;
  };
  summary: {
    sampledSkills: number;
    sampledAuthors: number;
    totalWeeklyDownloads: number;
    totalGithubStars: number;
    avgPlatformCoverage: number;
    resolvedSecuritySamples: number;
    avgSecurityScore: number;
    topCategory: string | null;
  };
  rankingFactors: AgentSkillRankingFactor[];
  skills: {
    items: MarketSkill[];
    topByOpportunity: MarketSkill[];
    topByWeeklyDownloads: MarketSkill[];
    topByGithubStars: MarketSkill[];
    topBySecurity: MarketSkill[];
    topByPlatformCoverage: MarketSkill[];
    topCategories: MarketCategorySummary[];
    commonPatterns: string[];
  };
  authors: {
    topAuthors: AgentSkillsSoAuthorProfile[];
  };
}
