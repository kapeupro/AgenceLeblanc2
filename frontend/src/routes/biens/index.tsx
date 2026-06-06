import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { api } from '../../lib/api';
import { PropertyCard } from '../../components/PropertyCard';
import { EstimationCTA } from '../../components/EstimationCTA';

type Search = { type?: string; maxPrice?: string; q?: string; sort?: string };

export const Route = createFileRoute('/biens/')({
  validateSearch: (s: Record<string, unknown>): Search => ({
    type: typeof s.type === 'string' ? s.type : undefined,
    maxPrice: typeof s.maxPrice === 'string' ? s.maxPrice : undefined,
    q: typeof s.q === 'string' ? s.q : undefined,
    sort: typeof s.sort === 'string' ? s.sort : undefined,
  }),
  component: BiensPage,
});

const TYPE_LABEL: Record<string, string> = {
  maison: 'Maison', appartement: 'Appartement', terrain: 'Terrain',
  local: 'Local commercial', immeuble: 'Immeuble', cave: 'Cave',
};

function BiensPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: '/biens/' });
  const [q, setQ] = useState(search.q ?? '');

  const { data: properties = [], isLoading } = useQuery({
    queryKey: ['properties', search],
    queryFn: async () => {
      const { data } = await api.api.properties.get({ query: { type: search.type, maxPrice: search.maxPrice, q: search.q, sort: search.sort } });
      return data ?? [];
    },
  });

  const setFilter = (patch: Partial<Search>) =>
    navigate({ search: prev => ({ ...prev, ...patch }) });

  const hasFilters = !!(search.type || search.q || search.maxPrice);

  return (
    <main className="fade-up">
      <section className="relative min-h-[340px] flex items-center justify-center text-center overflow-hidden">
        <div className="ph absolute inset-0"><span className="ph-label absolute top-4 right-4">[ PHOTO — toits Gisors ]</span></div>
        <div className="absolute inset-0 z-10" style={{ background: 'linear-gradient(180deg,rgba(255,255,255,.55),rgba(255,255,255,.78))' }} />
        <div className="relative z-20 py-[70px] px-5">
          <h1 className="text-[clamp(28px,3.4vw,40px)] font-bold text-head">Nos biens à vendre</h1>
          <p className="mt-3.5 text-muted text-[14.5px]">Accueil / <b className="text-head font-semibold">Biens</b></p>
        </div>
      </section>

      <section className="py-[84px]">
        <div className="max-w-[1240px] mx-auto px-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr] gap-3.5 bg-white border border-line rounded-[16px] p-3.5 shadow-[var(--shadow-soft)] mb-6.5">
            <div className="flex items-center gap-2.5 border border-[#dfe3ec] rounded-[12px] px-4">
              <span className="text-muted">🔍</span>
              <input
                placeholder="Rechercher une ville, un type de bien…"
                value={q}
                onChange={e => setQ(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') setFilter({ q: q || undefined }); }}
                className="flex-1 border-none outline-none py-3.5 text-[15px] text-ink placeholder:text-[#aab0c0]"
              />
            </div>
            <select className="border border-[#dfe3ec] rounded-[12px] px-4 py-3.5 font-[inherit] text-[15px] text-ink" value={search.type ?? ''} onChange={e => setFilter({ type: e.target.value || undefined })}>
              <option value="">Tous les types</option>
              {Object.entries(TYPE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <select className="border border-[#dfe3ec] rounded-[12px] px-4 py-3.5 font-[inherit] text-[15px] text-ink" value={search.maxPrice ?? ''} onChange={e => setFilter({ maxPrice: e.target.value || undefined })}>
              <option value="">Budget max</option>
              {[['5000000','50 000 €'],['15000000','150 000 €'],['25000000','250 000 €'],['40000000','400 000 €'],['60000000','600 000 €']].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <select className="border border-[#dfe3ec] rounded-[12px] px-4 py-3.5 font-[inherit] text-[15px] text-ink" value={search.sort ?? 'recent'} onChange={e => setFilter({ sort: e.target.value })}>
              <option value="recent">Plus récents</option>
              <option value="asc">Prix croissant</option>
              <option value="desc">Prix décroissant</option>
            </select>
          </div>

          <div className="flex items-center justify-between mb-5.5 text-muted">
            <span><b className="text-head">{properties.length}</b> bien{properties.length > 1 ? 's' : ''}{search.type ? ` · ${TYPE_LABEL[search.type]}` : ''}</span>
            {hasFilters && (
              <button onClick={() => navigate({ search: {} })} className="inline-flex items-center gap-1.5 text-navy font-semibold text-[14px]">
                ✕ Réinitialiser
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="text-center py-20 text-muted">Chargement…</div>
          ) : properties.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
              {properties.map(p => <PropertyCard key={p.id} property={p} />)}
            </div>
          ) : (
            <div className="text-center py-[70px]">
              <div className="text-[42px] mb-4">🔍</div>
              <h3 className="text-[22px] font-bold text-head mb-2">Aucun bien ne correspond</h3>
              <p className="text-muted max-w-[420px] mx-auto mb-5">Élargissez vos critères ou créez une alerte e-mail pour être prévenu·e des nouveautés.</p>
              <Link to="/alertes" className="inline-flex items-center gap-2 bg-navy text-white rounded-[12px] px-6 py-3.5 font-semibold hover:bg-navy-deep transition-colors">
                Créer une alerte →
              </Link>
            </div>
          )}
        </div>
      </section>
      <EstimationCTA />
    </main>
  );
}
