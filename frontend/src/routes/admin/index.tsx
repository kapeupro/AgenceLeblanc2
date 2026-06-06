import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';

export const Route = createFileRoute('/admin/')({ component: Dashboard });

function Dashboard() {
  const { data: properties = [] } = useQuery({
    queryKey: ['admin-properties'],
    queryFn: async () => { const { data } = await api.api.properties.get(); return data ?? []; },
  });
  const { data: contacts = [] } = useQuery({
    queryKey: ['admin-contacts'],
    queryFn: async () => { const { data } = await api.api.contact.get(); return (data ?? []) as any[]; },
  });

  const unread = (contacts as any[]).filter((c: any) => !c.read).length;

  const stats = [
    { label: 'Annonces en ligne', value: (properties as any[]).length, to: '/admin/biens', color: 'bg-navy' },
    { label: 'Messages non lus', value: unread, to: '/admin/contacts', color: unread > 0 ? 'bg-coral' : 'bg-gray-400' },
    { label: 'Total messages', value: (contacts as any[]).length, to: '/admin/contacts', color: 'bg-sky' },
  ];

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
        {stats.map(s => (
          <Link key={s.label} to={s.to} className={`${s.color} text-white rounded-[16px] p-6 hover:opacity-90 transition-opacity`}>
            <div className="text-[40px] font-extrabold leading-none">{s.value}</div>
            <div className="mt-2 text-[15px] font-medium opacity-85">{s.label}</div>
          </Link>
        ))}
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
