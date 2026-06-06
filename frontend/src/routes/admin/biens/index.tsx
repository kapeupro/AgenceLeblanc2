import { createFileRoute, Link } from '@tanstack/react-router';
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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <p className="text-muted"><b className="text-head">{(properties as any[]).length}</b> annonces</p>
        <Link to="/admin/biens/nouveau" className="inline-flex items-center gap-2 bg-navy text-white rounded-[12px] px-5 py-2.5 font-semibold text-[14.5px] hover:bg-navy-deep transition-colors">
          + Nouvelle annonce
        </Link>
      </div>

      {isLoading ? <div className="text-muted">Chargement…</div> : (
        <div className="bg-white rounded-[16px] border border-line overflow-hidden shadow-[var(--shadow-soft)]">
          <table className="w-full text-[14px]">
            <thead className="bg-gray-bg text-muted text-[13px] uppercase tracking-wide">
              <tr>
                {['Titre', 'Type', 'Ville', 'Prix', 'Statut', 'Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(properties as any[]).map((p: any, i: number) => (
                <tr key={p.id} className={`border-t border-line hover:bg-gray-bg/50 transition-colors ${i === 0 ? 'border-t-0' : ''}`}>
                  <td className="px-5 py-3.5 font-medium text-head max-w-[220px] truncate">{p.title}</td>
                  <td className="px-5 py-3.5 text-muted">{TYPE_LABEL[p.type] ?? p.type}</td>
                  <td className="px-5 py-3.5 text-muted max-w-[160px] truncate">{p.city}</td>
                  <td className="px-5 py-3.5 font-semibold text-head whitespace-nowrap">{fmtPrice(p.price)}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-semibold
                      ${p.status === 'a_vendre' ? 'bg-green-100 text-green-700' : p.status === 'vendu' ? 'bg-gray-100 text-gray-600' : 'bg-yellow-100 text-yellow-700'}`}>
                      {p.status === 'a_vendre' ? 'À vendre' : p.status === 'vendu' ? 'Vendu' : 'Compromis'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
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
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
