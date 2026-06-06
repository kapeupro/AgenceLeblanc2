import { createFileRoute, Link } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api';

export const Route = createFileRoute('/admin/biens/')({ component: AdminBiensPage });

function fmtPrice(cents: number) {
  return (cents / 100).toLocaleString('fr-FR', { maximumFractionDigits: 0 }) + ' €';
}

const TYPE_LABEL: Record<string, string> = {
  maison: 'Maison', appartement: 'Appt', terrain: 'Terrain',
  local: 'Local', immeuble: 'Immeuble', cave: 'Cave',
};

const STATUS_META: Record<string, { label: string; cls: string }> = {
  a_vendre: { label: 'À vendre', cls: 'bg-green-100 text-green-700' },
  vendu: { label: 'Vendu', cls: 'bg-gray-100 text-gray-600' },
  sous_compromis: { label: 'Compromis', cls: 'bg-yellow-100 text-yellow-700' },
};

type SortKey = 'recent' | 'price_asc' | 'price_desc';
const PAGE_SIZE = 15;

function AdminBiensPage() {
  const qc = useQueryClient();
  const { data: properties = [], isLoading } = useQuery({
    queryKey: ['admin-properties'],
    queryFn: async () => { const { data } = await api.api.properties.get(); return (data ?? []) as any[]; },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/properties/${id}`, { method: 'DELETE', credentials: 'include' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-properties'] }),
  });

  const [search, setSearch] = useState('');
  const [typeF, setTypeF] = useState('');
  const [statusF, setStatusF] = useState('');
  const [sort, setSort] = useState<SortKey>('recent');
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = (properties as any[]).filter(p => {
      if (typeF && p.type !== typeF) return false;
      if (statusF && p.status !== statusF) return false;
      if (q && !(`${p.title} ${p.city}`.toLowerCase().includes(q))) return false;
      return true;
    });
    list = [...list].sort((a, b) => {
      if (sort === 'price_asc') return a.price - b.price;
      if (sort === 'price_desc') return b.price - a.price;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    return list;
  }, [properties, search, typeF, statusF, sort]);

  // Reset to first page whenever filters change the result length out from under us
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pageCount - 1);
  const pageRows = filtered.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE);

  const resetPageThen = <T,>(setter: (v: T) => void) => (v: T) => { setter(v); setPage(0); };

  const selectCls = 'border border-[#dfe3ec] rounded-[10px] px-3 py-2.5 text-[14px] bg-white focus:outline-none focus:border-navy';

  return (
    <div>
      <div className="flex justify-between items-center mb-5 gap-4 flex-wrap">
        <p className="text-muted">
          <b className="text-head">{filtered.length}</b>
          {filtered.length !== (properties as any[]).length && <> / {(properties as any[]).length}</>} annonces
        </p>
        <Link to="/admin/biens/nouveau" className="inline-flex items-center gap-2 bg-navy text-white rounded-[12px] px-5 py-2.5 font-semibold text-[14.5px] hover:bg-navy-deep transition-colors">
          + Nouvelle annonce
        </Link>
      </div>

      {/* Barre de filtres */}
      <div className="flex gap-3 mb-5 flex-wrap items-center">
        <input
          value={search}
          onChange={e => resetPageThen(setSearch)(e.target.value)}
          placeholder="Rechercher (titre, ville)…"
          className="flex-1 min-w-[220px] border border-[#dfe3ec] rounded-[10px] px-4 py-2.5 text-[14px] focus:outline-none focus:border-navy"
        />
        <select value={typeF} onChange={e => resetPageThen(setTypeF)(e.target.value)} className={selectCls}>
          <option value="">Tous types</option>
          {Object.entries(TYPE_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select value={statusF} onChange={e => resetPageThen(setStatusF)(e.target.value)} className={selectCls}>
          <option value="">Tous statuts</option>
          {Object.entries(STATUS_META).map(([v, m]) => <option key={v} value={v}>{m.label}</option>)}
        </select>
        <select value={sort} onChange={e => setSort(e.target.value as SortKey)} className={selectCls}>
          <option value="recent">Plus récentes</option>
          <option value="price_desc">Prix décroissant</option>
          <option value="price_asc">Prix croissant</option>
        </select>
        {(search || typeF || statusF) && (
          <button onClick={() => { setSearch(''); setTypeF(''); setStatusF(''); setPage(0); }}
            className="text-muted text-[13.5px] hover:text-coral hover:underline">Réinitialiser</button>
        )}
      </div>

      {isLoading ? <div className="text-muted">Chargement…</div> : filtered.length === 0 ? (
        <div className="bg-white rounded-[16px] border border-line p-12 text-center text-muted">
          Aucune annonce ne correspond à ces critères.
        </div>
      ) : (
        <>
          <div className="bg-white rounded-[16px] border border-line overflow-hidden shadow-[var(--shadow-soft)]">
            <table className="w-full text-[14px]">
              <thead className="bg-gray-bg text-muted text-[13px] uppercase tracking-wide">
                <tr>
                  {['', 'Titre', 'Type', 'Ville', 'Prix', 'Statut', 'Actions'].map((h, i) => (
                    <th key={i} className="text-left px-5 py-3.5 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageRows.map((p: any, i: number) => {
                  const sm = STATUS_META[p.status] ?? { label: p.status, cls: 'bg-gray-100 text-gray-600' };
                  const cover = p.photos?.[0]?.url;
                  return (
                    <tr key={p.id} className={`border-t border-line hover:bg-gray-bg/50 transition-colors ${i === 0 ? 'border-t-0' : ''}`}>
                      <td className="pl-5 py-3 w-[64px]">
                        <div className="w-12 h-9 rounded-[6px] bg-gray-bg overflow-hidden flex items-center justify-center text-[11px] text-muted relative">
                          {cover ? <img src={cover} alt="" className="w-full h-full object-cover" /> : '—'}
                          {p.photos?.length > 1 && (
                            <span className="absolute bottom-0 right-0 bg-navy/80 text-white text-[9px] px-1 rounded-tl-[4px] leading-tight">{p.photos.length}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3 font-medium text-head max-w-[220px] truncate">{p.title}</td>
                      <td className="px-5 py-3 text-muted">{TYPE_LABEL[p.type] ?? p.type}</td>
                      <td className="px-5 py-3 text-muted max-w-[160px] truncate">{p.city}</td>
                      <td className="px-5 py-3 font-semibold text-head whitespace-nowrap">{fmtPrice(p.price)}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-semibold ${sm.cls}`}>{sm.label}</span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <Link to="/admin/biens/$id" params={{ id: p.id }}
                            className="text-navy font-semibold hover:underline text-[13.5px]">Modifier</Link>
                          <button
                            onClick={() => { if (confirm(`Supprimer « ${p.title} » ?`)) deleteMutation.mutate(p.id); }}
                            className="text-coral font-semibold hover:underline text-[13.5px] disabled:opacity-50"
                            disabled={deleteMutation.isPending}>
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {pageCount > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={current === 0}
                className="px-3.5 py-2 rounded-[9px] border border-line text-[14px] text-head disabled:opacity-40 hover:bg-gray-bg transition-colors">←</button>
              {Array.from({ length: pageCount }, (_, i) => i).map(i => (
                <button key={i} onClick={() => setPage(i)}
                  className={`w-9 h-9 rounded-[9px] text-[14px] font-semibold transition-colors ${i === current ? 'bg-navy text-white' : 'border border-line text-head hover:bg-gray-bg'}`}>
                  {i + 1}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(pageCount - 1, p + 1))} disabled={current === pageCount - 1}
                className="px-3.5 py-2 rounded-[9px] border border-line text-[14px] text-head disabled:opacity-40 hover:bg-gray-bg transition-colors">→</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
