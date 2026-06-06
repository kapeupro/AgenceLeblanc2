import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PropertyForm, fromFormData, EMPTY } from '../../../components/admin/PropertyForm';
import { api } from '../../../lib/api';

export const Route = createFileRoute('/admin/biens/nouveau')({ component: NouveauBienPage });

function NouveauBienPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: (body: any) => api.api.properties.post(body),
    onSuccess: (result: any) => {
      qc.invalidateQueries({ queryKey: ['admin-properties'] });
      const id = result?.data?.id;
      if (id) navigate({ to: '/admin/biens/$id', params: { id } });
      else navigate({ to: '/admin/biens' });
    },
  });

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-[22px] font-bold text-head">Nouvelle annonce</h2>
      </div>
      <PropertyForm
        onSubmit={d => mutation.mutate(d)}
        isLoading={mutation.isPending}
      />
    </div>
  );
}
