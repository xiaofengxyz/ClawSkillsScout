import { useEffect, useMemo, useState } from 'react';

export type AppLanguage = 'zh' | 'en';

const LANGUAGE_STORAGE_KEY = 'skillget-language';
const JSON_CACHE_PREFIX = 'skillget-json:';
const jsonMemoryCache = new Map<string, unknown>();

type NetworkNavigator = Navigator & {
  connection?: {
    saveData?: boolean;
    effectiveType?: string;
  };
};

function supportsStorage(storage: Storage) {
  try {
    const key = '__skillget_probe__';
    storage.setItem(key, '1');
    storage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

function resolveJsonUrl(path: string) {
  if (/^https?:\/\//.test(path)) return path;
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
}

function cacheKeyFor(path: string) {
  return `${JSON_CACHE_PREFIX}${resolveJsonUrl(path)}`;
}

function readCachedJson<T>(path: string): T | null {
  const url = resolveJsonUrl(path);
  if (jsonMemoryCache.has(url)) return jsonMemoryCache.get(url) as T;
  if (typeof window === 'undefined' || !supportsStorage(window.sessionStorage)) return null;

  const raw = window.sessionStorage.getItem(cacheKeyFor(path));
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as T;
    jsonMemoryCache.set(url, parsed);
    return parsed;
  } catch {
    window.sessionStorage.removeItem(cacheKeyFor(path));
    return null;
  }
}

function writeCachedJson<T>(path: string, value: T) {
  const url = resolveJsonUrl(path);
  jsonMemoryCache.set(url, value);
  if (typeof window === 'undefined' || !supportsStorage(window.sessionStorage)) return;

  try {
    window.sessionStorage.setItem(cacheKeyFor(path), JSON.stringify(value));
  } catch {
    // Ignore quota or serialization failures and keep the in-memory cache.
  }
}

function detectInitialLanguage(): AppLanguage {
  if (typeof window === 'undefined') return 'zh';

  const params = new URLSearchParams(window.location.search);
  const queryLanguage = params.get('lang');
  if (queryLanguage === 'zh' || queryLanguage === 'en') return queryLanguage;

  if (supportsStorage(window.localStorage)) {
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored === 'zh' || stored === 'en') return stored;
  }

  const browserLanguage = window.navigator.language.toLowerCase();
  return browserLanguage.startsWith('zh') ? 'zh' : 'en';
}

export function useAppLanguage() {
  const [language, setLanguage] = useState<AppLanguage>(detectInitialLanguage);

  useEffect(() => {
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';

    if (typeof window !== 'undefined' && supportsStorage(window.localStorage)) {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    }
  }, [language]);

  return useMemo(
    () => ({
      language,
      isZh: language === 'zh',
      setLanguage,
    }),
    [language],
  );
}

export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = title;
  }, [title]);
}

export async function loadJsonCached<T>(path: string): Promise<T> {
  const cached = readCachedJson<T>(path);
  if (cached) return cached;

  const response = await fetch(resolveJsonUrl(path));
  if (!response.ok) {
    throw new Error(`${path.split('/').pop() ?? path} ${response.status}`);
  }

  const json = (await response.json()) as T;
  writeCachedJson(path, json);
  return json;
}

export function peekJsonCache<T>(path: string): T | null {
  return readCachedJson<T>(path);
}

export function warmJsonCache(paths: string[]) {
  if (typeof window === 'undefined') return;

  const navigatorWithConnection = window.navigator as NetworkNavigator;
  const connection = navigatorWithConnection.connection;
  if (connection?.saveData) return;
  if (connection?.effectiveType === '2g' || connection?.effectiveType === 'slow-2g') return;

  const schedule =
    'requestIdleCallback' in window
      ? window.requestIdleCallback.bind(window)
      : ((callback: IdleRequestCallback) => window.setTimeout(() => callback({ didTimeout: false, timeRemaining: () => 0 } as IdleDeadline), 500));

  schedule(() => {
    paths.forEach((path) => {
      void loadJsonCached(path).catch(() => {
        // Best-effort warm cache only.
      });
    });
  });
}

export function formatMetricValue(value: number, language: AppLanguage) {
  return value.toLocaleString(language === 'zh' ? 'zh-CN' : 'en-US');
}

export function translateLevel(value: string, language: AppLanguage) {
  const normalized = value.toLowerCase();
  if (normalized === 'high') return language === 'zh' ? '高' : 'High';
  if (normalized === 'medium') return language === 'zh' ? '中' : 'Medium';
  if (normalized === 'low') return language === 'zh' ? '低' : 'Low';
  return value;
}

export function LanguageToggle({
  language,
  onChange,
}: {
  language: AppLanguage;
  onChange: (language: AppLanguage) => void;
}) {
  return (
    <div className="lang-toggle" role="group" aria-label={language === 'zh' ? '语言切换' : 'Language switch'}>
      <button
        type="button"
        className={`lang-toggle-button${language === 'zh' ? ' is-active' : ''}`}
        onClick={() => onChange('zh')}
        aria-pressed={language === 'zh'}
      >
        中文
      </button>
      <button
        type="button"
        className={`lang-toggle-button${language === 'en' ? ' is-active' : ''}`}
        onClick={() => onChange('en')}
        aria-pressed={language === 'en'}
      >
        EN
      </button>
    </div>
  );
}
