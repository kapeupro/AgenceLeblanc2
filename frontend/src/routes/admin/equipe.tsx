import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';

export const Route = createFileRoute('/admin/equipe')({ component: AdminEquipePage });

type TeamMember = {
  id: string;
  name: string;
  role: string;
  photoUrl: string | null;
  displayOrder: number;
};

const emptyForm = { name: '', role: '', photoUrl: '', displayOrder: 0 };

function AdminEquipePage() {
  const qc = useQueryClient();
  const [form, setForm] = useState(emptyForm);

  const { data: members = [], isLoading } = useQuery({
    queryKey: ['team'],
    queryFn: async () => {
      const { data } = await api.api.team.get();
      return (data ?? []) as TeamMember[];
    },
  });

  const addMember = useMutation({
    mutationFn: async () => {
      await api.api.team.post({
        name: form.name,
        role: form.role,
        photoUrl: form.photoUrl.trim() || null,
        displayOrder: form.displayOrder,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['team'] });
      setForm(emptyForm);
    },
  });

  const deleteMember = useMutation({
    mutationFn: async (id: string) => {
      await api.api.team({ id }).delete();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['team'] }),
    onError: () => alert('Erreur lors de la suppression. Veuillez réessayer.'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.role.trim()) return;
    addMember.mutate();
  };

  return (
    <div className="flex gap-8 items-start">
      <div className="flex-1 min-w-0">
        <h2 className="text-[22px] font-bold text-[#1f2433] mb-6">
          Membres de l'équipe
          <span className="ml-2 text-[16px] font-normal text-gray-400">({members.length})</span>
        </h2>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-[12px] border border-gray-200 p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-1/4" />
              </div>
            ))}
          </div>
        ) : members.length === 0 ? (
          <div className="bg-white rounded-[16px] border border-gray-200 p-10 text-center">
            <div className="text-[36px] mb-3">👥</div>
            <p className="text-[#1f2433] font-semibold">Aucun membre pour l'instant</p>
            <p className="text-gray-400 text-[14px] mt-1">Ajoutez votre premier membre via le formulaire.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {members.map(m => (
              <div key={m.id} className="bg-white rounded-[12px] border border-gray-200 p-4 flex items-center gap-4">
                {m.photoUrl ? (
                  <img src={/^https?:\/\//.test(m.photoUrl ?? '') ? m.photoUrl! : ''} alt={m.name} className="w-12 h-12 rounded-full object-cover flex-none" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[#dcebfd] flex items-center justify-center flex-none text-[#122866] font-bold text-[16px]">
                    {m.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[#1f2433] text-[15px] truncate">{m.name}</div>
                  <div className="text-gray-400 text-[13px] truncate">{m.role}</div>
                </div>
                <div className="text-[12px] text-gray-400 whitespace-nowrap">
                  Ordre&nbsp;{m.displayOrder}
                </div>
                <button
                  onClick={() => {
                    if (confirm(`Supprimer « ${m.name} » ?`)) deleteMember.mutate(m.id);
                  }}
                  disabled={deleteMember.isPending && deleteMember.variables === m.id}
                  className="text-[#c75d48] font-semibold text-[13.5px] hover:underline disabled:opacity-50 whitespace-nowrap"
                >
                  Supprimer
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="w-[320px] flex-none">
        <div className="bg-white rounded-[16px] border border-gray-200 p-6 shadow-sm">
          <h3 className="text-[17px] font-bold text-[#1f2433] mb-5">Ajouter un membre</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="member-name" className="block text-[13px] font-semibold text-[#1f2433] mb-1.5">
                Nom <span className="text-[#c75d48]">*</span>
              </label>
              <input
                id="member-name"
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Sophie Martin"
                required
                className="w-full border border-gray-200 rounded-[10px] px-3.5 py-2.5 text-[14px] text-[#1f2433] placeholder-gray-300 focus:outline-none focus:border-[#122866] transition-colors"
              />
            </div>

            <div>
              <label htmlFor="member-role" className="block text-[13px] font-semibold text-[#1f2433] mb-1.5">
                Rôle <span className="text-[#c75d48]">*</span>
              </label>
              <input
                id="member-role"
                type="text"
                value={form.role}
                onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                placeholder="Négociatrice immobilière"
                required
                className="w-full border border-gray-200 rounded-[10px] px-3.5 py-2.5 text-[14px] text-[#1f2433] placeholder-gray-300 focus:outline-none focus:border-[#122866] transition-colors"
              />
            </div>

            <div>
              <label htmlFor="member-photo" className="block text-[13px] font-semibold text-[#1f2433] mb-1.5">
                URL photo <span className="text-gray-400 font-normal">(optionnel)</span>
              </label>
              <input
                id="member-photo"
                type="url"
                value={form.photoUrl}
                onChange={e => setForm(f => ({ ...f, photoUrl: e.target.value }))}
                placeholder="https://..."
                className="w-full border border-gray-200 rounded-[10px] px-3.5 py-2.5 text-[14px] text-[#1f2433] placeholder-gray-300 focus:outline-none focus:border-[#122866] transition-colors"
              />
            </div>

            <div>
              <label htmlFor="member-order" className="block text-[13px] font-semibold text-[#1f2433] mb-1.5">
                Ordre d'affichage
              </label>
              <input
                id="member-order"
                type="number"
                value={form.displayOrder}
                onChange={e => setForm(f => ({ ...f, displayOrder: Number(e.target.value) }))}
                min={0}
                className="w-full border border-gray-200 rounded-[10px] px-3.5 py-2.5 text-[14px] text-[#1f2433] focus:outline-none focus:border-[#122866] transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={addMember.isPending || !form.name.trim() || !form.role.trim()}
              className="w-full bg-[#122866] text-white rounded-[10px] py-2.5 font-semibold text-[14.5px] hover:bg-[#0e1f52] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {addMember.isPending ? 'Ajout…' : '+ Ajouter'}
            </button>

            {addMember.isError && (
              <p className="text-[#c75d48] text-[13px] text-center">Une erreur est survenue.</p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
