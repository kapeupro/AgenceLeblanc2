import { useState, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { Property } from 'shared';

export type FormData = {
  slug: string; type: string; title: string; city: string;
  price: string; status: string; exclusive: boolean;
  description: string; heat: string; beds: string; rooms: string;
  area: string; land: string; year: string;
  dpeValue: string; dpeClass: string; gesValue: string; gesClass: string;
  energyCost: string; hasVideo: boolean; hasTour: boolean; agentId: string;
};

export function toFormData(p: Property): FormData {
  return {
    slug: p.slug, type: p.type, title: p.title, city: p.city,
    price: String(p.price / 100), status: p.status, exclusive: p.exclusive,
    description: p.description ?? '', heat: p.heat ?? '',
    beds: p.beds != null ? String(p.beds) : '', rooms: p.rooms != null ? String(p.rooms) : '',
    area: p.area != null ? String(p.area) : '', land: p.land != null ? String(p.land) : '',
    year: p.year != null ? String(p.year) : '',
    dpeValue: p.dpeValue != null ? String(p.dpeValue) : '', dpeClass: p.dpeClass ?? '',
    gesValue: p.gesValue != null ? String(p.gesValue) : '', gesClass: p.gesClass ?? '',
    energyCost: p.energyCost ?? '', hasVideo: p.hasVideo, hasTour: p.hasTour,
    agentId: p.agentId ?? '',
  };
}

export function fromFormData(f: FormData) {
  return {
    slug: f.slug, type: f.type, title: f.title, city: f.city,
    price: Math.round(Number(f.price) * 100),
    status: f.status, exclusive: f.exclusive,
    description: f.description || null, heat: f.heat || null,
    beds: f.beds ? Number(f.beds) : null, rooms: f.rooms ? Number(f.rooms) : null,
    area: f.area ? Number(f.area) : null, land: f.land ? Number(f.land) : null,
    year: f.year ? Number(f.year) : null,
    dpeValue: f.dpeValue ? Number(f.dpeValue) : null, dpeClass: f.dpeClass || null,
    gesValue: f.gesValue ? Number(f.gesValue) : null, gesClass: f.gesClass || null,
    energyCost: f.energyCost || null, hasVideo: f.hasVideo, hasTour: f.hasTour,
    agentId: f.agentId || null,
  };
}

export const EMPTY: FormData = {
  slug: '', type: 'maison', title: '', city: '', price: '', status: 'a_vendre',
  exclusive: false, description: '', heat: '', beds: '', rooms: '', area: '',
  land: '', year: '', dpeValue: '', dpeClass: '', gesValue: '', gesClass: '',
  energyCost: '', hasVideo: false, hasTour: false, agentId: '',
};

export function PropertyForm({ initial, propertyId, initialPhotos, initialFeatures, initialNear, onSubmit, isLoading }: {
  initial?: FormData; propertyId?: string; initialPhotos?: { id: string; url: string }[];
  initialFeatures?: string[]; initialNear?: unknown[];
  onSubmit: (data: any) => void; isLoading: boolean;
}) {
  const [form, setForm] = useState<FormData>(initial ?? EMPTY);
  const [photos, setPhotos] = useState<{ id: string; url: string }[]>(initialPhotos ?? []);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const qc = useQueryClient();

  const set = (k: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value }));

  const uploadPhoto = async (file: File) => {
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: fd, credentials: 'include' });
    const { url } = await res.json();
    if (propertyId) {
      const r = await fetch(`/api/properties/${propertyId}/photos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, position: photos.length }),
        credentials: 'include',
      });
      const newPhoto = await r.json();
      setPhotos(prev => [...prev, { id: newPhoto.id ?? url, url }]);
      qc.invalidateQueries({ queryKey: ['property-admin', propertyId] });
    } else {
      setPhotos(prev => [...prev, { id: url, url }]);
    }
    setUploading(false);
  };

  const deletePhoto = async (photoId: string) => {
    if (propertyId) {
      await fetch(`/api/photos/${photoId}`, { method: 'DELETE', credentials: 'include' });
      qc.invalidateQueries({ queryKey: ['property-admin', propertyId] });
    }
    setPhotos(prev => prev.filter(p => p.id !== photoId));
  };

  const Field = ({ label, k, type = 'text', ...rest }: { label: string; k: keyof FormData; type?: string; [key: string]: any }) => (
    <div className="mb-4">
      <label className="block font-semibold text-[14px] text-head mb-1.5">{label}</label>
      <input type={type} value={String(form[k])} onChange={set(k)}
        className="w-full border border-[#dfe3ec] rounded-[12px] px-4 py-3 text-[14.5px] focus:outline-none focus:border-navy" {...rest} />
    </div>
  );

  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit({ ...fromFormData(form), features: initialFeatures ?? [], near: initialNear ?? [] }); }}
      className="bg-white rounded-[16px] border border-line p-8 shadow-[var(--shadow-soft)] max-w-[900px]">

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
        <Field label="Titre *" k="title" required />
        <Field label="Slug (URL) *" k="slug" required placeholder="ex: pavillon-jardin-gisors" />
        <div className="mb-4">
          <label className="block font-semibold text-[14px] text-head mb-1.5">Type *</label>
          <select value={form.type} onChange={set('type')} className="w-full border border-[#dfe3ec] rounded-[12px] px-4 py-3 font-[inherit] text-[14.5px] focus:outline-none focus:border-navy">
            {['maison', 'appartement', 'terrain', 'local', 'immeuble', 'cave'].map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        <div className="mb-4">
          <label className="block font-semibold text-[14px] text-head mb-1.5">Statut</label>
          <select value={form.status} onChange={set('status')} className="w-full border border-[#dfe3ec] rounded-[12px] px-4 py-3 font-[inherit] text-[14.5px] focus:outline-none focus:border-navy">
            <option value="a_vendre">À vendre</option>
            <option value="vendu">Vendu</option>
            <option value="sous_compromis">Sous compromis</option>
          </select>
        </div>
        <Field label="Ville *" k="city" required />
        <Field label="Prix (€) *" k="price" type="number" required />
        <Field label="Surface habitable (m²)" k="area" type="number" />
        <Field label="Surface terrain (m²)" k="land" type="number" />
        <Field label="Chambres" k="beds" type="number" />
        <Field label="Pièces" k="rooms" type="number" />
        <Field label="Année de construction" k="year" type="number" />
        <Field label="Chauffage" k="heat" />
        <Field label="DPE (kWh/m²/an)" k="dpeValue" type="number" />
        <div className="mb-4">
          <label className="block font-semibold text-[14px] text-head mb-1.5">Classe DPE</label>
          <select value={form.dpeClass} onChange={set('dpeClass')} className="w-full border border-[#dfe3ec] rounded-[12px] px-4 py-3 font-[inherit] text-[14.5px] focus:outline-none focus:border-navy">
            <option value="">—</option>
            {['A','B','C','D','E','F','G'].map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        <Field label="GES (kg CO₂/m²/an)" k="gesValue" type="number" />
        <div className="mb-4">
          <label className="block font-semibold text-[14px] text-head mb-1.5">Classe GES</label>
          <select value={form.gesClass} onChange={set('gesClass')} className="w-full border border-[#dfe3ec] rounded-[12px] px-4 py-3 font-[inherit] text-[14.5px] focus:outline-none focus:border-navy">
            <option value="">—</option>
            {['A','B','C','D','E','F','G'].map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        <Field label="Coût énergétique estimé" k="energyCost" placeholder="ex: 1 290 €" />
      </div>

      <div className="mb-4">
        <label className="block font-semibold text-[14px] text-head mb-1.5">Description</label>
        <textarea value={form.description} onChange={set('description')}
          className="w-full border border-[#dfe3ec] rounded-[12px] px-4 py-3 text-[14.5px] min-h-[120px] resize-y focus:outline-none focus:border-navy" />
      </div>

      <div className="flex gap-6 mb-6">
        {(['exclusive', 'hasVideo', 'hasTour'] as const).map(k => (
          <label key={k} className="flex items-center gap-2 text-[14.5px] font-medium text-head cursor-pointer">
            <input type="checkbox" checked={!!form[k]} onChange={set(k)} className="w-4 h-4" />
            {k === 'exclusive' ? 'Exclusivité' : k === 'hasVideo' ? 'Visite vidéo' : 'Visite 360°'}
          </label>
        ))}
      </div>

      <div className="mb-6">
        <div className="font-semibold text-[14px] text-head mb-3">Photos</div>
        <div className="flex flex-wrap gap-3 mb-3">
          {photos.map(ph => (
            <div key={ph.id} className="relative group">
              <img src={ph.url} alt="" className="w-[100px] h-[75px] object-cover rounded-[8px] border border-line" />
              <button type="button" onClick={() => deletePhoto(ph.id)}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-coral text-white text-[11px] font-bold
                  opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center leading-none">
                ×
              </button>
            </div>
          ))}
          <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
            className="w-[100px] h-[75px] border-2 border-dashed border-[#dfe3ec] rounded-[8px] flex items-center justify-center text-muted hover:border-navy hover:text-navy transition-colors disabled:opacity-50">
            {uploading ? '…' : '+'}
          </button>
        </div>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
          onChange={e => { if (e.target.files?.[0]) uploadPhoto(e.target.files[0]); }} />
        <p className="text-muted text-[12.5px]">JPEG, PNG ou WebP — max 10 MB. {!propertyId && 'Les photos seront associées après la création du bien.'}</p>
      </div>

      <button type="submit" disabled={isLoading}
        className="bg-navy text-white rounded-[12px] px-8 py-3.5 font-semibold text-[15px] hover:bg-navy-deep transition-colors disabled:opacity-60">
        {isLoading ? 'Enregistrement…' : 'Enregistrer'}
      </button>
    </form>
  );
}
