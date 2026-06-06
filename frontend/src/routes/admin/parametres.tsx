import { createFileRoute } from '@tanstack/react-router';
import { useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';

export const Route = createFileRoute('/admin/parametres')({ component: AdminParametresPage });

type Settings = Record<string, string>;

const PHOTO_KEYS = [
  { key: 'hero_home',    label: 'Photo hero — Page d\'accueil', hint: 'Bandeau principal (vue de Gisors, toits…)' },
  { key: 'hero_agence',  label: 'Photo hero — Page Agence',     hint: 'Bandeau en-tête de la page Agence' },
  { key: 'photo_facade', label: 'Photo façade de l\'agence',    hint: 'Utilisée sur l\'accueil et la page Agence' },
];

const INFO_KEYS = [
  { key: 'phone',   label: 'Téléphone' },
  { key: 'email',   label: 'E-mail' },
  { key: 'address', label: 'Adresse' },
  { key: 'hours',   label: 'Horaires' },
];

function PhotoUploader({ settingKey, label, hint, currentUrl, onSaved }: {
  settingKey: string; label: string; hint: string; currentUrl: string; onSaved: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const qc = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: (url: string) =>
      fetch(`/api/settings/${settingKey}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: url }),
        credentials: 'include',
      }).then(r => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['settings'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
  });

  const handleFile = async (file: File) => {
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: fd, credentials: 'include' });
    const { url } = await res.json();
    setUploading(false);
    await saveMutation.mutateAsync(url);
    onSaved(url);
  };

  return (
    <div className="bg-white border border-line rounded-[16px] p-6 shadow-[var(--shadow-soft)]">
      <div className="font-semibold text-head text-[15px] mb-1">{label}</div>
      <div className="text-muted text-[13px] mb-4">{hint}</div>
      <div className="flex gap-4 items-start">
        <div className="w-[180px] h-[110px] rounded-[10px] overflow-hidden border border-line flex-shrink-0 bg-[#f0f2f8]">
          {currentUrl
            ? <img src={currentUrl} alt="" className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center text-muted text-[12px] text-center px-3">Aucune photo</div>
          }
        </div>
        <div className="flex flex-col gap-2">
          <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
            className="bg-navy text-white rounded-[10px] px-5 py-2.5 text-[14px] font-semibold hover:bg-navy-deep transition-colors disabled:opacity-50">
            {uploading ? 'Upload…' : currentUrl ? 'Changer la photo' : 'Ajouter une photo'}
          </button>
          {saved && <span className="text-green-600 text-[13px] font-medium">✓ Enregistré</span>}
          {currentUrl && (
            <button type="button" onClick={() => saveMutation.mutate('')}
              className="text-coral text-[13px] hover:underline text-left">
              Supprimer
            </button>
          )}
        </div>
      </div>
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
        onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
    </div>
  );
}

function AdminParametresPage() {
  const qc = useQueryClient();
  const [infoSaved, setInfoSaved] = useState(false);

  const { data: settings = {} } = useQuery<Settings>({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await fetch('/api/settings');
      return res.json();
    },
  });

  const [info, setInfo] = useState<Record<string, string>>({});
  const infoValues = (key: string) => key in info ? info[key] : (settings[key] ?? '');

  const saveInfoMutation = useMutation({
    mutationFn: async () => {
      await Promise.all(
        INFO_KEYS.map(({ key }) =>
          key in info
            ? fetch(`/api/settings/${key}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ value: info[key] }),
                credentials: 'include',
              })
            : Promise.resolve()
        )
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['settings'] });
      setInfo({});
      setInfoSaved(true);
      setTimeout(() => setInfoSaved(false), 2000);
    },
  });

  return (
    <div className="max-w-[760px]">
      <h2 className="text-[22px] font-bold text-head mb-2">Paramètres du site</h2>
      <p className="text-muted text-[14px] mb-8">Photos et informations de contact affichées sur le site public.</p>

      <h3 className="text-[16px] font-bold text-head mb-4">Photos du site</h3>
      <div className="flex flex-col gap-4 mb-10">
        {PHOTO_KEYS.map(({ key, label, hint }) => (
          <PhotoUploader key={key} settingKey={key} label={label} hint={hint}
            currentUrl={settings[key] ?? ''}
            onSaved={() => qc.invalidateQueries({ queryKey: ['settings'] })} />
        ))}
      </div>

      <h3 className="text-[16px] font-bold text-head mb-4">Informations de contact</h3>
      <div className="bg-white border border-line rounded-[16px] p-6 shadow-[var(--shadow-soft)]">
        <div className="grid grid-cols-1 gap-4 mb-5">
          {INFO_KEYS.map(({ key, label }) => (
            <div key={key}>
              <label className="block font-semibold text-[14px] text-head mb-1.5">{label}</label>
              <input
                type="text"
                value={infoValues(key)}
                onChange={e => setInfo(prev => ({ ...prev, [key]: e.target.value }))}
                className="w-full border border-[#dfe3ec] rounded-[12px] px-4 py-3 text-[14.5px] focus:outline-none focus:border-navy"
              />
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => saveInfoMutation.mutate()} disabled={saveInfoMutation.isPending || Object.keys(info).length === 0}
            className="bg-navy text-white rounded-[12px] px-6 py-3 font-semibold text-[14.5px] hover:bg-navy-deep transition-colors disabled:opacity-50">
            {saveInfoMutation.isPending ? 'Enregistrement…' : 'Enregistrer'}
          </button>
          {infoSaved && <span className="text-green-600 text-[13px] font-medium">✓ Enregistré</span>}
        </div>
      </div>
    </div>
  );
}
