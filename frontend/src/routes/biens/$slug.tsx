import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { api } from '../../lib/api';
import { PropertyCard } from '../../components/PropertyCard';

export const Route = createFileRoute('/biens/$slug')({
  component: PropertyPage,
});

const DPE_SCALE = [
  { k: 'A', c: '#3aa856' }, { k: 'B', c: '#5fb949' }, { k: 'C', c: '#bfd02f' },
  { k: 'D', c: '#f4d100' }, { k: 'E', c: '#f3a32b' }, { k: 'F', c: '#ec6f2a' }, { k: 'G', c: '#e2231a' },
];

function fmtPrice(cents: number) {
  return (cents / 100).toLocaleString('fr-FR', { maximumFractionDigits: 0 }) + ' €';
}

function PropertyPage() {
  const { slug } = Route.useParams();
  const [expand, setExpand] = useState(false);
  const [visitSent, setVisitSent] = useState(false);

  const { data: p, isLoading, isError } = useQuery({
    queryKey: ['property', slug],
    queryFn: async () => {
      const res = await fetch(`/api/properties/${slug}`);
      if (!res.ok) throw new Error('Bien non trouvé');
      return res.json();
    },
  });

  const { data: similar = [] } = useQuery({
    queryKey: ['properties', { type: p?.type }],
    enabled: !!p,
    queryFn: async () => {
      const { data } = await api.api.properties.get({ query: { type: p!.type } });
      return (data ?? []).filter((x: any) => x.id !== p!.id).slice(0, 3);
    },
  });

  if (isLoading) return <div className="text-center py-32 text-muted text-[18px]">Chargement…</div>;
  if (isError || !p) return <div className="text-center py-32"><h2 className="text-[24px] font-bold text-head">Bien non trouvé</h2><Link to="/biens" className="text-navy underline mt-4 block">← Retour aux biens</Link></div>;

  const mainPhoto = p.photos[0]?.url;
  const photo2 = p.photos[1]?.url;
  const photo3 = p.photos[2]?.url;

  return (
    <main className="fade-up pt-10">
      <div className="max-w-[1240px] mx-auto px-10">
        <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-5.5">
          <div>
            <h1 className="text-[clamp(24px,2.8vw,32px)] font-bold text-head">{p.title}</h1>
            <p className="text-muted mt-1.5 text-[15px]">{p.city}</p>
            <div className="flex items-center gap-2 mt-3 text-coral font-semibold text-[14px]">
              <span>●</span>
              {p.status === 'a_vendre' ? 'À vendre' : p.status === 'vendu' ? 'Vendu' : 'Sous compromis'}
            </div>
          </div>
          <div className="flex flex-col items-start md:items-end gap-3.5">
            <div className="text-[30px] font-extrabold text-head whitespace-nowrap">{fmtPrice(p.price)}</div>
            {p.exclusive && <span className="bg-coral text-white text-[11.5px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-[9px]">Exclusivité</span>}
          </div>
        </div>

        <div className="grid grid-cols-[2fr_1fr] gap-3.5 h-[440px] mb-7.5 max-sm:grid-cols-1 max-sm:h-auto">
          <div className="rounded-[16px] overflow-hidden relative">
            {mainPhoto ? <img src={mainPhoto} alt={p.title} className="w-full h-full object-cover" /> : <div className="ph w-full h-full"><span className="ph-label">[ PHOTO principale ]</span></div>}
          </div>
          <div className="grid grid-rows-2 gap-3.5">
            <div className="rounded-[16px] overflow-hidden relative">
              {photo2 ? <img src={photo2} alt="" className="w-full h-full object-cover" /> : <div className="ph w-full h-full"><span className="ph-label">[ PHOTO 2 ]</span></div>}
            </div>
            <div className="rounded-[16px] overflow-hidden relative">
              {photo3 ? <img src={photo3} alt="" className="w-full h-full object-cover" /> : <div className="ph w-full h-full"><span className="ph-label">[ PHOTO 3 ]</span></div>}
              <button className="absolute bottom-3.5 right-3.5 bg-[rgba(20,30,60,.78)] text-white text-[13px] font-semibold px-4 py-2.5 rounded-[10px]">
                Voir les {p.photos.length || 3} photos
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-6 justify-between py-6 border-b border-line mb-9">
          {p.land != null && <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-[10px] border border-line flex items-center justify-center text-navy">📐</div><div><span className="block text-muted text-[13px]">Surface terrain</span><b className="text-head text-[16px]">{p.land} m²</b></div></div>}
          {p.year != null && <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-[10px] border border-line flex items-center justify-center text-navy">📅</div><div><span className="block text-muted text-[13px]">Année de construction</span><b className="text-head text-[16px]">{p.year}</b></div></div>}
          {p.area != null && <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-[10px] border border-line flex items-center justify-center text-navy">📏</div><div><span className="block text-muted text-[13px]">Surface habitable</span><b className="text-head text-[16px]">{p.area} m²</b></div></div>}
          {p.beds != null && <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-[10px] border border-line flex items-center justify-center text-navy">🛏</div><div><span className="block text-muted text-[13px]">Chambres</span><b className="text-head text-[16px]">{p.beds}</b></div></div>}
          {p.rooms != null && <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-[10px] border border-line flex items-center justify-center text-navy">🏠</div><div><span className="block text-muted text-[13px]">Pièces</span><b className="text-head text-[16px]">{p.rooms}</b></div></div>}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_372px] gap-12 items-start">
          <div>
            <div className="mb-9">
              <h2 className="text-[22px] font-bold text-head mb-4">À propos</h2>
              <p className="text-[#54596b] leading-[1.7]">{p.description}</p>
              {!expand && p.features.length > 0 && (
                <button className="text-navy font-semibold text-[14.5px] underline mt-3" onClick={() => setExpand(true)}>Voir plus</button>
              )}
            </div>

            {expand && p.features.length > 0 && (
              <div className="mb-9">
                <h3 className="text-[18px] font-bold text-head mb-4">Informations</h3>
                <ul className="columns-2 gap-10">
                  {p.features.map((f: string) => (
                    <li key={f} className="flex items-center gap-2.5 text-[#54596b] text-[14.5px] py-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-navy flex-none" />{f}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {p.dpeValue != null && p.dpeClass && (
              <div className="mb-9">
                <h3 className="text-[18px] font-bold text-head mb-4">Bilan énergétique</h3>
                <div className="flex flex-col gap-1.5">
                  {DPE_SCALE.map((s, i) => (
                    <div key={s.k} className={`h-[26px] rounded-r-[4px] flex items-center pl-3 font-bold text-[12px] text-white relative transition-all ${p.dpeClass === s.k ? 'h-[34px] shadow-lg' : ''}`}
                      style={{ background: s.c, width: `${58 + i * 14}px` }}>
                      {s.k}
                      {p.dpeClass === s.k && <span className="absolute left-[calc(100%+10px)] whitespace-nowrap text-head text-[14px] font-normal">{p.dpeValue} <small className="text-muted font-medium">kWh/m²/an</small></span>}
                    </div>
                  ))}
                </div>
                {p.energyCost && <p className="text-[13.5px] text-[#54596b] mt-5"><b>Dépenses annuelles estimées :</b> {p.energyCost}</p>}
              </div>
            )}

            {p.near.length > 0 && (
              <div className="mb-9">
                <h3 className="text-[18px] font-bold text-head mb-4">À proximité</h3>
                <div className="grid grid-cols-2 gap-x-14 max-w-[560px]">
                  {p.near.map((n: any) => (
                    <div key={n.label} className="flex justify-between border-b border-line py-2.5 text-[14.5px]">
                      <span className="text-muted">{n.label}</span><b className="text-head">{n.distance}</b>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <aside className="lg:sticky lg:top-[110px] flex flex-col gap-4.5">
            {p.agent && (
              <div className="flex items-center gap-3.5 border border-line rounded-[14px] p-4">
                <div className="w-[54px] h-[54px] rounded-full overflow-hidden bg-gray-bg flex-none">
                  {p.agent.photoUrl ? <img src={p.agent.photoUrl} alt={p.agent.name} className="w-full h-full object-cover" /> : <div className="ph w-full h-full" />}
                </div>
                <div>
                  <span className="block text-muted text-[12.5px]">Négociateur en charge :</span>
                  <b className="text-head text-[16px]">{p.agent.name}</b>
                </div>
              </div>
            )}
            <form className="border border-line rounded-[16px] p-6 shadow-[var(--shadow-soft)]"
              onSubmit={e => { e.preventDefault(); setVisitSent(true); setTimeout(() => setVisitSent(false), 3000); }}>
              <h3 className="text-[20px] font-bold text-head text-center mb-5 leading-[1.3]">
                Envie de le voir ?<br/><span className="text-[14px] font-medium text-muted">Organisons une visite !</span>
              </h3>
              {['Nom Prénom', 'Email', 'Téléphone'].map(label => (
                <div key={label} className="mb-4.5">
                  <label className="block font-semibold text-[14.5px] text-head mb-2">{label}</label>
                  <input type={label === 'Email' ? 'email' : 'text'} className="w-full border border-[#dfe3ec] rounded-[12px] px-4 py-3.5 text-[15px] focus:outline-none focus:border-navy" />
                </div>
              ))}
              <div className="mb-4.5">
                <label className="block font-semibold text-[14.5px] text-head mb-2">Message</label>
                <textarea className="w-full border border-[#dfe3ec] rounded-[12px] px-4 py-3.5 text-[15px] min-h-[90px] resize-y focus:outline-none focus:border-navy" />
              </div>
              <button type="submit" className="w-full bg-navy text-white rounded-[12px] py-4 font-semibold text-[15px] hover:bg-navy-deep transition-colors">
                {visitSent ? 'Message envoyé ✓' : 'Envoyer →'}
              </button>
            </form>
          </aside>
        </div>
      </div>

      {similar.length > 0 && (
        <section className="py-[84px]">
          <div className="max-w-[1240px] mx-auto px-10">
            <h2 className="text-[clamp(24px,2.6vw,32px)] font-bold text-head mb-7">Biens similaires</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
              {(similar as any[]).map((s: any) => <PropertyCard key={s.id} property={s} />)}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
