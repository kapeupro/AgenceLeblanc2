import { createFileRoute } from '@tanstack/react-router';
import { useRef, useState } from 'react';
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

function Avatar({ m, size = 48 }: { m: { name: string; photoUrl: string | null }; size?: number }) {
  const s = `${size}px`;
  if (m.photoUrl) {
    return <img src={m.photoUrl} alt={m.name} style={{ width: s, height: s }} className="rounded-full object-cover flex-none" />;
  }
  return (
    <div style={{ width: s, height: s }}
      className="rounded-full bg-[#dcebfd] flex items-center justify-center flex-none text-[#122866] font-bold text-[16px]">
      {m.name.charAt(0).toUpperCase()}
    </div>
  );
}

async function uploadFile(file: File): Promise<string> {
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch('/api/upload', { method: 'POST', body: fd, credentials: 'include' });
  const { url } = await res.json();
  return url;
}

function AdminEquipePage() {
  const qc = useQueryClient();
  const [form, setForm] = useState(emptyForm);
  const [addUploading, setAddUploading] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [editUploading, setEditUploading] = useState(false);
  const addFileRef = useRef<HTMLInputElement>(null);
  const editFileRef = useRef<HTMLInputElement>(null);

  const { data: members = [], isLoading } = useQuery({
    queryKey: ['team'],
    queryFn: async () => {
      const { data } = await api.api.team.get();
      return (data ?? []) as TeamMember[];
    },
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['team'] });

  const addMember = useMutation({
    mutationFn: async () => {
      await api.api.team.post({
        name: form.name,
        role: form.role,
        photoUrl: form.photoUrl.trim() || null,
        displayOrder: form.displayOrder || members.length,
      });
    },
    onSuccess: () => { invalidate(); setForm(emptyForm); },
  });

  const updateMember = useMutation({
    mutationFn: async (patch: Partial<TeamMember> & { id: string }) => {
      const { id, ...body } = patch;
      await api.api.team({ id }).put(body);
    },
    onSuccess: invalidate,
    onError: () => alert('Erreur lors de la mise à jour.'),
  });

  const deleteMember = useMutation({
    mutationFn: async (id: string) => { await api.api.team({ id }).delete(); },
    onSuccess: invalidate,
    onError: () => alert('Erreur lors de la suppression. Veuillez réessayer.'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.role.trim()) return;
    addMember.mutate();
  };

  const startEdit = (m: TeamMember) => {
    setEditId(m.id);
    setEditForm({ name: m.name, role: m.role, photoUrl: m.photoUrl ?? '', displayOrder: m.displayOrder });
  };
  const saveEdit = () => {
    if (!editId || !editForm.name.trim() || !editForm.role.trim()) return;
    updateMember.mutate({
      id: editId,
      name: editForm.name,
      role: editForm.role,
      photoUrl: editForm.photoUrl.trim() || null,
      displayOrder: editForm.displayOrder,
    }, { onSuccess: () => { invalidate(); setEditId(null); } });
  };

  // Réordonner : échange le displayOrder avec le voisin (liste triée par displayOrder asc)
  const move = (index: number, dir: -1 | 1) => {
    const a = members[index];
    const b = members[index + dir];
    if (!a || !b) return;
    updateMember.mutate({ id: a.id, displayOrder: b.displayOrder });
    updateMember.mutate({ id: b.id, displayOrder: a.displayOrder });
  };

  const inputCls = 'w-full border border-gray-200 rounded-[10px] px-3.5 py-2.5 text-[14px] text-[#1f2433] placeholder-gray-300 focus:outline-none focus:border-[#122866] transition-colors';

  return (
    <div className="flex gap-8 items-start flex-col lg:flex-row">
      <div className="flex-1 min-w-0 w-full">
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
            {members.map((m, i) => editId === m.id ? (
              <div key={m.id} className="bg-white rounded-[12px] border border-[#122866] p-4 space-y-3">
                <div className="flex items-center gap-4">
                  <Avatar m={{ name: editForm.name || m.name, photoUrl: editForm.photoUrl || null }} />
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} placeholder="Nom" className={inputCls} />
                    <input value={editForm.role} onChange={e => setEditForm(f => ({ ...f, role: e.target.value }))} placeholder="Rôle" className={inputCls} />
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <button type="button" onClick={() => editFileRef.current?.click()} disabled={editUploading}
                    className="text-[13px] font-semibold text-[#122866] border border-[#122866] rounded-[8px] px-3 py-1.5 hover:bg-[#122866] hover:text-white transition-colors disabled:opacity-50">
                    {editUploading ? 'Envoi…' : '📷 Changer la photo'}
                  </button>
                  {editForm.photoUrl && (
                    <button type="button" onClick={() => setEditForm(f => ({ ...f, photoUrl: '' }))}
                      className="text-[13px] text-[#c75d48] hover:underline">Retirer la photo</button>
                  )}
                  <input ref={editFileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                    onChange={async e => {
                      const file = e.target.files?.[0]; if (!file) return;
                      setEditUploading(true);
                      try { const url = await uploadFile(file); setEditForm(f => ({ ...f, photoUrl: url })); }
                      finally { setEditUploading(false); }
                    }} />
                  <div className="flex-1" />
                  <button onClick={() => setEditId(null)} className="text-[13.5px] text-gray-500 hover:underline">Annuler</button>
                  <button onClick={saveEdit} disabled={updateMember.isPending}
                    className="bg-[#122866] text-white rounded-[8px] px-4 py-1.5 text-[13.5px] font-semibold hover:bg-[#0e1f52] disabled:opacity-50">
                    Enregistrer
                  </button>
                </div>
              </div>
            ) : (
              <div key={m.id} className="bg-white rounded-[12px] border border-gray-200 p-4 flex items-center gap-4">
                <div className="flex flex-col gap-0.5 flex-none">
                  <button onClick={() => move(i, -1)} disabled={i === 0 || updateMember.isPending}
                    className="text-gray-400 hover:text-[#122866] disabled:opacity-25 leading-none text-[12px]" aria-label="Monter">▲</button>
                  <button onClick={() => move(i, 1)} disabled={i === members.length - 1 || updateMember.isPending}
                    className="text-gray-400 hover:text-[#122866] disabled:opacity-25 leading-none text-[12px]" aria-label="Descendre">▼</button>
                </div>
                <Avatar m={m} />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[#1f2433] text-[15px] truncate">{m.name}</div>
                  <div className="text-gray-400 text-[13px] truncate">{m.role}</div>
                </div>
                <button onClick={() => startEdit(m)}
                  className="text-[#122866] font-semibold text-[13.5px] hover:underline whitespace-nowrap">Modifier</button>
                <button
                  onClick={() => { if (confirm(`Supprimer « ${m.name} » ?`)) deleteMember.mutate(m.id); }}
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

      <div className="w-full lg:w-[320px] flex-none">
        <div className="bg-white rounded-[16px] border border-gray-200 p-6 shadow-sm">
          <h3 className="text-[17px] font-bold text-[#1f2433] mb-5">Ajouter un membre</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="member-name" className="block text-[13px] font-semibold text-[#1f2433] mb-1.5">
                Nom <span className="text-[#c75d48]">*</span>
              </label>
              <input id="member-name" type="text" value={form.name} required placeholder="Sophie Martin"
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inputCls} />
            </div>

            <div>
              <label htmlFor="member-role" className="block text-[13px] font-semibold text-[#1f2433] mb-1.5">
                Rôle <span className="text-[#c75d48]">*</span>
              </label>
              <input id="member-role" type="text" value={form.role} required placeholder="Négociatrice immobilière"
                onChange={e => setForm(f => ({ ...f, role: e.target.value }))} className={inputCls} />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-[#1f2433] mb-1.5">
                Photo <span className="text-gray-400 font-normal">(optionnel)</span>
              </label>
              <div className="flex items-center gap-3">
                <Avatar m={{ name: form.name || '?', photoUrl: form.photoUrl || null }} size={40} />
                <button type="button" onClick={() => addFileRef.current?.click()} disabled={addUploading}
                  className="text-[13px] font-semibold text-[#122866] border border-[#122866] rounded-[8px] px-3 py-1.5 hover:bg-[#122866] hover:text-white transition-colors disabled:opacity-50">
                  {addUploading ? 'Envoi…' : 'Téléverser'}
                </button>
                {form.photoUrl && (
                  <button type="button" onClick={() => setForm(f => ({ ...f, photoUrl: '' }))}
                    className="text-[12.5px] text-[#c75d48] hover:underline">Retirer</button>
                )}
              </div>
              <input ref={addFileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                onChange={async e => {
                  const file = e.target.files?.[0]; if (!file) return;
                  setAddUploading(true);
                  try { const url = await uploadFile(file); setForm(f => ({ ...f, photoUrl: url })); }
                  finally { setAddUploading(false); }
                }} />
            </div>

            <button type="submit" disabled={addMember.isPending || !form.name.trim() || !form.role.trim()}
              className="w-full bg-[#122866] text-white rounded-[10px] py-2.5 font-semibold text-[14.5px] hover:bg-[#0e1f52] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {addMember.isPending ? 'Ajout…' : '+ Ajouter'}
            </button>

            {addMember.isError && (
              <p className="text-[#c75d48] text-[13px] text-center">Une erreur est survenue.</p>
            )}
          </form>
          <p className="text-gray-400 text-[12px] mt-4 leading-relaxed">
            Glissez l'ordre avec les flèches ▲▼ sur chaque membre. L'ordre détermine l'affichage sur la page Agence.
          </p>
        </div>
      </div>
    </div>
  );
}
