export type CatalogItemType = 'skill' | 'plugin';

export interface CatalogItem {
  id: string;
  type: CatalogItemType;
  owner: string;
  name: string;
  description: string;
  version: string;
  clawhubUrl: string;
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
