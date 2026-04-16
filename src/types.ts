export type CatalogItemType = 'skill' | 'plugin';

export interface CatalogItem {
  id: string;
  type: CatalogItemType;
  owner: string;
  name: string;
  description: string;
  version: string;
  clawhubUrl: string;
  downloadUrl: string | null;
  downloads: number | null;
  stars: number | null;
  suspicious: boolean;
  suspiciousLabel: string | null;
  suspiciousReason: string;
  optimizationAdvice: string[];
  usesAisaApi: boolean;
  source: 'account' | 'catalog';
  tags: string[];
  lastCheckedAt: string;
  readmeSnippet: string;
}

export interface CatalogStats {
  total: number;
  skills: number;
  plugins: number;
  suspicious: number;
  aisa: number;
  owners: number;
}

export interface CatalogData {
  generatedAt: string;
  scannedAccounts: string[];
  sources: string[];
  notes: string[];
  stats: CatalogStats;
  items: CatalogItem[];
}

export interface OptimizedPackage {
  owner: string;
  slug: string;
  name: string;
  clawhubUrl: string | null;
  suspiciousReason: string;
  packageDir: string;
  downloadPath: string;
  verificationStatus: string;
  retainedChecks: Array<{ file: string; exists: boolean }>;
  removedChecks: Array<{ file: string; removed: boolean; existedInOriginal: boolean }>;
  manualTestRequired: string[];
  checklistPath: string;
}

export interface OptimizedPackageIndex {
  generatedAt: string;
  items: OptimizedPackage[];
}

export interface AisaAnalysisSkillEndpoint {
  endpoint: string;
  name: string;
  method: string;
  status: 'implemented' | 'documented_only' | 'referenced_only';
  files: string[];
  codeFiles: string[];
  docFiles: string[];
  comparisonToCreateChatCompletion: string;
  officialDocUrl: string | null;
}

export interface AisaAnalysisSkill {
  id: string;
  name: string;
  description: string;
  owner: string;
  sourceType: 'clawhub' | 'github';
  sourceLabel: string;
  sourceUrl: string;
  downloadFile: string;
  downloadPath: string;
  repo?: string;
  skillDir?: string;
  archiveType: string;
  endpoints: AisaAnalysisSkillEndpoint[];
  endpointCount: number;
  implementedEndpointCount: number;
  documentedOnlyEndpointCount: number;
  hasOfficialChatCompletion: boolean;
  implementationStatus: 'implemented' | 'documented_only' | 'not_found';
  primaryInterfaceGroup: string;
  interfaceGroups: string[];
}

export interface AisaAnalysisInterfaceSkillRef {
  skillId: string;
  skillName: string;
  owner: string;
  sourceType: 'clawhub' | 'github';
  sourceLabel: string;
  sourceUrl: string;
  downloadPath: string;
  status: 'implemented' | 'documented_only' | 'referenced_only';
}

export interface AisaAnalysisInterface {
  endpoint: string;
  name: string;
  method: string;
  inputSummary: string;
  outputSummary: string;
  comparisonToCreateChatCompletion: string;
  officialDocUrl: string | null;
  skills: AisaAnalysisInterfaceSkillRef[];
  skillsBySource: { clawhub: number; github: number };
  implementedSkillCount: number;
  inferredSkillCount: number;
  documentedOnlySkillCount: number;
  hasImplementation: boolean;
  skillCount: number;
  coverageStatus: 'implemented' | 'inferred_implementation' | 'documented_only';
}

export interface AisaAnalysisGroup {
  endpoint: string;
  name: string;
  skills: Array<{
    skillId: string;
    skillName: string;
    owner: string;
    sourceType: 'clawhub' | 'github';
    sourceUrl: string;
  }>;
}

export interface AisaApiAnalysisData {
  generatedAt: string;
  comparisonBase: {
    name: string;
    endpoint: string;
    docUrl: string;
    note: string;
  };
  summary: {
    totalSkills: number;
    clawhubSkills: number;
    githubSkills: number;
    skillsWithEndpoints: number;
    skillsWithoutEndpoints: number;
    totalInterfaces: number;
    implementedInterfaces: number;
    unimplementedDocumentedInterfaces: number;
  };
  interfaces: AisaAnalysisInterface[];
  skills: AisaAnalysisSkill[];
  implementationGroups: AisaAnalysisGroup[];
}
