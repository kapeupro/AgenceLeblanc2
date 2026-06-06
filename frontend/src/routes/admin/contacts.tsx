import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';

export const Route = createFileRoute('/admin/contacts')({ component: AdminContactsPage });

type Contact = {
  id: string;
  intent: 'achat' | 'vente';
  name: string;
  email: string;
  phone: string | null;
  message: string;
  read: boolean;
  createdAt: string;
};

function AdminContactsPage() {
  const qc = useQueryClient();

  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ['admin-contacts'],
    queryFn: async () => {
      const { data } = await api.api.contact.get();
      return (data ?? []) as unknown as Contact[];
    },
  });

  const markRead = useMutation({
    mutationFn: async (id: string) => {
      await api.api.contact({ id }).read.put();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-contacts'] }),
    onError: () => alert('Erreur lors du marquage. Veuillez réessayer.'),
  });

  const sorted = [...contacts].sort((a, b) => {
    if (a.read === b.read) return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    return a.read ? 1 : -1;
  });

  const unreadCount = contacts.filter(c => !c.read).length;

  return (
    <div>
      <div className="flex items-center gap-3 mb-7">
        <h2 className="text-[22px] font-bold text-[#1f2433]">Messages reçus</h2>
        {unreadCount > 0 && (
          <span className="inline-flex items-center justify-center bg-[#c75d48] text-white text-[12px] font-bold rounded-full px-2.5 py-0.5 min-w-[24px]">
            {unreadCount}
          </span>
        )}
        <span className="text-gray-400 text-[14px]">{contacts.length} au total</span>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-[14px] border border-gray-200 p-5 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
              <div className="h-3 bg-gray-100 rounded w-2/3 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-full" />
            </div>
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="bg-white rounded-[16px] border border-gray-200 p-12 text-center">
          <div className="text-[40px] mb-3">✉️</div>
          <p className="text-[#1f2433] font-semibold text-[16px]">Aucun message reçu</p>
          <p className="text-gray-400 text-[14px] mt-1">Les demandes de contact apparaîtront ici.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sorted.map(c => (
            <div
              key={c.id}
              className={`rounded-[14px] border p-5 transition-colors ${c.read ? 'bg-white border-gray-200' : 'bg-[#fef4f3] border-[#f0c8c0]'}`}
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-bold uppercase tracking-wide
                    ${c.intent === 'achat' ? 'bg-[#122866] text-white' : 'bg-[#c75d48] text-white'}`}>
                    {c.intent === 'achat' ? 'Achat' : 'Vente'}
                  </span>
                  {!c.read && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#c75d48]/10 text-[#c75d48] text-[11px] font-semibold">
                      Non lu
                    </span>
                  )}
                  <span className="font-bold text-[#1f2433] text-[15px]">{c.name}</span>
                  <a href={`mailto:${c.email}`} className="text-[#122866] text-[14px] hover:underline">{c.email}</a>
                  {c.phone && <span className="text-gray-400 text-[14px]">{c.phone}</span>}
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-gray-400 text-[13px] whitespace-nowrap">
                    {new Date(c.createdAt).toLocaleDateString('fr-FR')}
                  </span>
                  {!c.read && (
                    <button
                      onClick={() => markRead.mutate(c.id)}
                      disabled={markRead.isPending && markRead.variables === c.id}
                      className="text-[13.5px] font-semibold text-[#122866] hover:underline disabled:opacity-50 whitespace-nowrap"
                    >
                      Marquer comme lu
                    </button>
                  )}
                </div>
              </div>
              <p className="mt-3 text-[#1f2433] text-[14px] leading-relaxed whitespace-pre-wrap">{c.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
