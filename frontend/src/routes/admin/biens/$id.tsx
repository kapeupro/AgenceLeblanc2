import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PropertyForm, toFormData } from '../../../components/admin/PropertyForm';
import type { Property } from 'shared';

export const Route = createFileRoute('/admin/biens/$id')({ component: EditBienPage });

function EditBienPage() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const navigate = useNavigate();

  const { data: p } = useQuery({
    queryKey: ['property-admin', id],
    queryFn: async () => {
      const res = await fetch(`/api/properties/${id}`, { credentials: 'include' });
      if (!res.ok) return null;
      return res.json();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (body: any) =>
      fetch(`/api/properties/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'include',
      }).then(r => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-properties'] });
      qc.invalidateQueries({ queryKey: ['property-admin', id] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () =>
      fetch(`/api/properties/${id}`, { method: 'DELETE', credentials: 'include' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-properties'] });
      navigate({ to: '/admin/biens' });
    },
  });

  if (!p) return <div className="text-muted">Chargement…</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Link to="/admin/biens" className="text-navy text-[14px] hover:underline">← Liste des annonces</Link>
        <div className="flex gap-3">
          <a href={`/biens/${p.slug}`} target="_blank" rel="noopener" className="text-muted text-[14px] hover:underline">Voir la page publique ↗</a>
          <button
            onClick={() => { if (confirm(`Supprimer « ${p.title} » ?`)) deleteMutation.mutate(); }}
            className="text-coral text-[14px] font-semibold hover:underline disabled:opacity-50"
            disabled={deleteMutation.isPending}>
            Supprimer
          </button>
        </div>
      </div>
      <PropertyForm
        initial={toFormData(p as unknown as Property)}
        propertyId={id}
        initialPhotos={(p as Property).photos?.map(ph => ({ id: ph.id, url: ph.url })) ?? []}
        initialFeatures={(p as Property).features ?? []}
        initialNear={(p as Property).near ?? []}
        onSubmit={d => updateMutation.mutate(d)}
        isLoading={updateMutation.isPending}
      />
    </div>
  );
}
