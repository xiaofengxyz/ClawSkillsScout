import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { format } from 'date-fns';
import { AlertTriangle, Download, Layers, Package2, Search, ShieldAlert } from 'lucide-react';
import clsx from 'clsx';
import type { CatalogData, CatalogItem } from './types';

type FilterType = 'all' | 'skill' | 'plugin';
type FilterFlag = 'all' | 'aisa' | 'suspicious';

function StatCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: ReactNode;
  label: string;
  value: string | number;
  tone: 'sand' | 'mint' | 'ember' | 'sky';
}) {
  return (
    <div className={clsx('stat-card', `tone-${tone}`)}>
      <div className="stat-icon">{icon}</div>
      <div>
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
      </div>
    </div>
  );
}

function ItemCard({ item }: { item: CatalogItem }) {
  return (
    <a className="item-card" href={item.clawhubUrl} target="_blank" rel="noreferrer">
      <div className="item-topline">
        <span className={clsx('pill', item.type === 'plugin' ? 'pill-plugin' : 'pill-skill')}>
          {item.type}
        </span>
        {item.usesAisaApi ? <span className="pill pill-aisa">AISA API</span> : null}
        {item.suspicious ? <span className="pill pill-alert">{item.suspiciousLabel ?? 'Suspicious'}</span> : null}
      </div>
      <h3>{item.name}</h3>
      <p>{item.description || 'No description found.'}</p>
      <div className="item-meta">
        <span>@{item.owner}</span>
        <span>v{item.version || 'unknown'}</span>
        <span>
          <Download size={14} />
          {item.downloads ?? 'n/a'}
        </span>
      </div>
      {item.readmeSnippet ? <pre>{item.readmeSnippet}</pre> : null}
    </a>
  );
}

export default function App() {
  const [data, setData] = useState<CatalogData | null>(null);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<FilterType>('all');
  const [flagFilter, setFlagFilter] = useState<FilterFlag>('aisa');
  const [ownerFilter, setOwnerFilter] = useState('all');

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/catalog.json`)
      .then((response) => response.json())
      .then((json: CatalogData) => setData(json))
      .catch((error) => {
        console.error('Failed to load catalog data', error);
      });
  }, []);

  const ownersWithAisa = useMemo(() => {
    if (!data) return [];
    return [...new Set(data.items.filter((item) => item.usesAisaApi).map((item) => item.owner))].sort((a, b) =>
      a.localeCompare(b),
    );
  }, [data]);

  const visibleBaseItems = useMemo(() => {
    if (!data) return [];
    const aisaOwners = new Set(ownersWithAisa);
    return data.items.filter((item) => aisaOwners.has(item.owner));
  }, [data, ownersWithAisa]);

  const filteredItems = useMemo(() => {
    if (!data) return [];
    const normalizedQuery = query.trim().toLowerCase();
    return visibleBaseItems.filter((item) => {
      if (typeFilter !== 'all' && item.type !== typeFilter) return false;
      if (flagFilter === 'aisa' && !item.usesAisaApi) return false;
      if (flagFilter === 'suspicious' && !item.suspicious) return false;
      if (ownerFilter !== 'all' && item.owner !== ownerFilter) return false;
      if (!normalizedQuery) return true;
      const haystack = `${item.name} ${item.description} ${item.owner} ${item.tags.join(' ')}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [data, flagFilter, ownerFilter, query, typeFilter, visibleBaseItems]);

  const visibleStats = useMemo(() => {
    const ownerSet = new Set(filteredItems.map((item) => item.owner));
    return {
      total: filteredItems.length,
      plugins: filteredItems.filter((item) => item.type === 'plugin').length,
      aisa: filteredItems.filter((item) => item.usesAisaApi).length,
      suspicious: filteredItems.filter((item) => item.suspicious).length,
      owners: ownerSet.size,
    };
  }, [filteredItems]);

  if (!data) {
    return <main className="shell loading">Loading latest ClawHub snapshot...</main>;
  }

  return (
    <main className="shell">
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">ClawHub intelligence</span>
          <h1>Claw Skills Scout</h1>
          <p>
            A daily-updated tracker for ClawHub skills and plugins, focused on accounts that
            actually publish AISA API integrations. Non-AISA items are retained in data but hidden
            by default.
          </p>
          <div className="hero-meta">
            <span>Updated {format(new Date(data.generatedAt), 'yyyy-MM-dd HH:mm')}</span>
            <span>{ownersWithAisa.length} AISA accounts</span>
            <span>{filteredItems.length} visible items</span>
          </div>
        </div>
        <div className="hero-panel">
          <StatCard icon={<Layers size={20} />} label="Visible items" value={visibleStats.total} tone="sand" />
          <StatCard icon={<Package2 size={20} />} label="Visible plugins" value={visibleStats.plugins} tone="sky" />
          <StatCard icon={<ShieldAlert size={20} />} label="AISA API" value={visibleStats.aisa} tone="mint" />
          <StatCard icon={<AlertTriangle size={20} />} label="Suspicious" value={visibleStats.suspicious} tone="ember" />
        </div>
      </section>

      <section className="controls">
        <label className="search-box">
          <Search size={16} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, description, owner..." />
        </label>
        <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as FilterType)}>
          <option value="all">All types</option>
          <option value="skill">Skills</option>
          <option value="plugin">Plugins</option>
        </select>
        <select value={flagFilter} onChange={(event) => setFlagFilter(event.target.value as FilterFlag)}>
          <option value="aisa">AISA API only</option>
          <option value="all">All items from AISA owners</option>
          <option value="suspicious">Suspicious only</option>
        </select>
        <select value={ownerFilter} onChange={(event) => setOwnerFilter(event.target.value)}>
          <option value="all">All AISA owners</option>
          {ownersWithAisa.map((owner) => (
            <option key={owner} value={owner}>
              @{owner}
            </option>
          ))}
        </select>
      </section>

      <section className="notes">
        {data.notes.map((note) => (
          <div key={note} className="note">
            {note}
          </div>
        ))}
        <div className="note">Display rule: only AISA-using accounts are listed; non-AISA items stay in the dataset.</div>
      </section>

      <section className="grid">
        {filteredItems.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </section>
    </main>
  );
}
