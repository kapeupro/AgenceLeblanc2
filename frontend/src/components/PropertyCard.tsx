import { useNavigate } from '@tanstack/react-router';
import type { Property } from 'shared';

interface Props { property: Property; variant?: 'stacked' | 'overlay'; }

function fmtPrice(cents: number) {
  return (cents / 100).toLocaleString('fr-FR', { maximumFractionDigits: 0 }) + ' €';
}

export function PropertyCard({ property: p, variant = 'stacked' }: Props) {
  const navigate = useNavigate();
  const go = () => navigate({ to: '/biens/$slug', params: { slug: p.slug } });
  const mainPhoto = p.photos[0]?.url;

  if (variant === 'overlay') {
    return (
      <div onClick={go} className="rounded-[18px] overflow-hidden cursor-pointer shadow-[var(--shadow-card)] transition-transform hover:-translate-y-1">
        <div className="relative aspect-square">
          {mainPhoto ? <img src={mainPhoto} alt={p.title} className="w-full h-full object-cover" /> : <div className="ph w-full h-full"><span className="ph-label">[ PHOTO ]</span></div>}
          {p.exclusive && <span className="absolute top-3.5 left-3.5 bg-coral text-white text-[11.5px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-[9px]">Exclusivité</span>}
          <div className="absolute inset-0 bg-gradient-to-t from-[rgba(10,18,46,.78)] to-transparent flex flex-col justify-end p-4">
            <div className="flex items-end justify-between gap-2.5">
              <div><h3 className="text-white font-bold text-[17px]">{p.title}</h3><p className="text-white/80 text-[14px]">{p.city}</p></div>
              <span className="bg-white text-navy font-bold text-[16px] px-3.5 py-2 rounded-[10px] shadow whitespace-nowrap">{fmtPrice(p.price)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div onClick={go} className="bg-white rounded-[18px] overflow-hidden shadow-[var(--shadow-card)] cursor-pointer transition-transform hover:-translate-y-1 flex flex-col">
      <div className="relative" style={{ aspectRatio: '16/11' }}>
        {mainPhoto ? <img src={mainPhoto} alt={p.title} className="w-full h-full object-cover" /> : <div className="ph w-full h-full absolute inset-0"><span className="ph-label">[ PHOTO ]</span></div>}
        {p.exclusive && <span className="absolute top-3.5 left-3.5 bg-coral text-white text-[11.5px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-[9px]">Exclusivité</span>}
        <span className="absolute bottom-3.5 left-3.5 bg-white text-navy font-bold text-[16px] px-3.5 py-2 rounded-[10px] shadow">{fmtPrice(p.price)}</span>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-[18px] font-bold text-head">{p.title}</h3>
        <p className="text-muted text-[14px] mt-0.5">{p.city}</p>
        <div className="flex flex-wrap gap-3.5 mt-3.5 text-muted text-[13.5px]">
          {p.beds != null && <span>{p.beds} chambres</span>}
          {p.area != null && <span>{p.area} m²</span>}
          {p.land != null && <span>{p.land} m² terrain</span>}
        </div>
        <div className="flex items-center justify-between mt-4 pt-3.5 border-t border-line">
          <span className="text-navy font-semibold text-[14px]">{p.status === 'a_vendre' ? 'À vendre' : p.status === 'vendu' ? 'Vendu' : 'Sous compromis'}</span>
        </div>
      </div>
    </div>
  );
}
