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
