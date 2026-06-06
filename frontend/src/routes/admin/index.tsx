import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';

export const Route = createFileRoute('/admin/')({ component: Dashboard });

const TYPE_LABEL: Record<string, string> = {
  maison: 'Maisons', appartement: 'Appartements', terrain: 'Terrains',
  local: 'Locaux', immeuble: 'Immeubles', cave: 'Caves',
};

function fmtEur(cents: number) {
  return (cents / 100).toLocaleString('fr-FR', { maximumFractionDigits: 0 }) + ' €';
}
function fmtCompact(cents: number) {
  const eur = cents / 100;
  if (eur >= 1_000_000) return (eur / 1_000_000).toLocaleString('fr-FR', { maximumFractionDigits: 1 }) + ' M€';
  if (eur >= 1_000) return Math.round(eur / 1_000) + ' k€';
  return Math.round(eur) + ' €';
}

function Dashboard() {
  const { data: properties = [] } = useQuery({
    queryKey: ['admin-properties'],
    queryFn: async () => { const { data } = await api.api.properties.get(); return (data ?? []) as any[]; },
  });
  const { data: contacts = [] } = useQuery({
    queryKey: ['admin-contacts'],
    queryFn: async () => { const { data } = await api.api.contact.get(); return (data ?? []) as any[]; },
  });

  const props = properties as any[];
  const msgs = contacts as any[];

  const forSale = props.filter(p => p.status === 'a_vendre');
  const compromis = props.filter(p => p.status === 'sous_compromis');
  const sold = props.filter(p => p.status === 'vendu');
  const portfolio = forSale.reduce((s, p) => s + p.price, 0);
  const avg = forSale.length ? Math.round(portfolio / forSale.length) : 0;
  const unread = msgs.filter(c => !c.read).length;

  // Répartition par type (sur les biens à vendre)
  const byType = Object.entries(
    forSale.reduce<Record<string, number>>((acc, p) => { acc[p.type] = (acc[p.type] ?? 0) + 1; return acc; }, {})
  ).sort((a, b) => b[1] - a[1]);
  const maxType = Math.max(1, ...byType.map(([, n]) => n));

  const recentProps = [...props]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);
  const recentMsgs = [...msgs]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  const cards = [
    { label: 'Biens à vendre', value: String(forSale.length), sub: `${compromis.length} compromis · ${sold.length} vendus`, to: '/admin/biens', color: 'bg-navy' },
    { label: 'Valeur du portefeuille', value: fmtCompact(portfolio), sub: `Prix moyen ${fmtCompact(avg)}`, to: '/admin/biens', color: 'bg-sky' },
    { label: 'Messages non lus', value: String(unread), sub: `${msgs.length} au total`, to: '/admin/contacts', color: unread > 0 ? 'bg-coral' : 'bg-gray-400' },
  ];

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        {cards.map(c => (
          <Link key={c.label} to={c.to} className={`${c.color} text-white rounded-[16px] p-6 hover:opacity-90 transition-opacity`}>
            <div className="text-[36px] font-extrabold leading-none">{c.value}</div>
            <div className="mt-2 text-[15px] font-semibold opacity-90">{c.label}</div>
            <div className="mt-0.5 text-[12.5px] opacity-70">{c.sub}</div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Répartition par type */}
        <div className="bg-white rounded-[16px] border border-line p-6 shadow-[var(--shadow-soft)]">
          <h3 className="font-bold text-head text-[16px] mb-4">Répartition des biens à vendre</h3>
          {byType.length === 0 ? <p className="text-muted text-[14px]">Aucun bien à vendre.</p> : (
            <div className="space-y-2.5">
              {byType.map(([type, n]) => (
                <div key={type} className="flex items-center gap-3">
                  <span className="w-24 text-[13.5px] text-muted flex-none">{TYPE_LABEL[type] ?? type}</span>
                  <div className="flex-1 h-2.5 bg-gray-bg rounded-full overflow-hidden">
                    <div className="h-full bg-navy rounded-full" style={{ width: `${(n / maxType) * 100}%` }} />
                  </div>
                  <span className="w-7 text-right text-[13.5px] font-semibold text-head flex-none">{n}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Derniers messages */}
        <div className="bg-white rounded-[16px] border border-line p-6 shadow-[var(--shadow-soft)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-head text-[16px]">Derniers messages</h3>
            <Link to="/admin/contacts" className="text-navy text-[13px] font-semibold hover:underline">Tout voir →</Link>
          </div>
          {recentMsgs.length === 0 ? <p className="text-muted text-[14px]">Aucun message.</p> : (
            <div className="space-y-3">
              {recentMsgs.map(c => (
                <div key={c.id} className="flex items-center gap-3">
                  <span className={`w-1.5 h-1.5 rounded-full flex-none ${c.read ? 'bg-gray-300' : 'bg-coral'}`} />
                  <span className="font-medium text-head text-[14px] truncate flex-1">{c.name}</span>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full flex-none ${c.intent === 'achat' ? 'bg-navy/10 text-navy' : 'bg-coral/10 text-coral'}`}>
                    {c.intent === 'achat' ? 'Achat' : 'Vente'}
                  </span>
                  <span className="text-muted text-[12px] flex-none whitespace-nowrap">{new Date(c.createdAt).toLocaleDateString('fr-FR')}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Dernières annonces */}
      <div className="bg-white rounded-[16px] border border-line p-6 shadow-[var(--shadow-soft)] mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-head text-[16px]">Dernières annonces ajoutées</h3>
          <Link to="/admin/biens" className="text-navy text-[13px] font-semibold hover:underline">Tout voir →</Link>
        </div>
        {recentProps.length === 0 ? <p className="text-muted text-[14px]">Aucune annonce.</p> : (
          <div className="space-y-2">
            {recentProps.map(p => (
              <Link key={p.id} to="/admin/biens/$id" params={{ id: p.id }}
                className="flex items-center gap-3 py-2 px-2 -mx-2 rounded-[10px] hover:bg-gray-bg transition-colors">
                <div className="w-12 h-9 rounded-[6px] bg-gray-bg overflow-hidden flex-none flex items-center justify-center text-[11px] text-muted">
                  {p.photos?.[0]?.url ? <img src={p.photos[0].url} alt="" className="w-full h-full object-cover" /> : '—'}
                </div>
                <span className="font-medium text-head text-[14px] truncate flex-1">{p.title}</span>
                <span className="text-muted text-[13px] truncate max-w-[120px] hidden sm:block">{p.city}</span>
                <span className="font-semibold text-head text-[14px] whitespace-nowrap flex-none">{fmtEur(p.price)}</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-4 flex-wrap">
        <Link to="/admin/biens/nouveau" className="inline-flex items-center gap-2 bg-navy text-white rounded-[12px] px-6 py-3.5 font-semibold text-[15px] hover:bg-navy-deep transition-colors">
          + Nouvelle annonce
        </Link>
        <Link to="/admin/biens" className="inline-flex items-center gap-2 border-[1.5px] border-navy text-navy rounded-[12px] px-6 py-3.5 font-semibold text-[15px] hover:bg-navy hover:text-white transition-colors">
          Voir toutes les annonces
        </Link>
      </div>
    </div>
  );
}
