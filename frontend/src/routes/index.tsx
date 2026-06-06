import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { PropertyCard } from '../components/PropertyCard';
import { EstimationCTA } from '../components/EstimationCTA';

export const Route = createFileRoute('/')({
  component: HomePage,
});

const SERVICES = [
  { icon: '✍️', t: 'Signature électronique', d: 'Signez vos contrats en ligne, en toute sécurité et simplicité.' },
  { icon: '📋', t: 'Compte rendu des visites', d: 'Restez informé grâce à nos rapports détaillés après chaque visite.' },
  { icon: '📊', t: 'Estimation gratuite', d: 'Découvrez la valeur réelle de votre bien sans engagement.' },
  { icon: '🔄', t: 'Visite virtuelle 360°', d: 'Explorez chaque détail de votre future propriété depuis chez vous.' },
  { icon: '🔨', t: 'Estimation des travaux', d: 'Planifiez en toute confiance avec notre évaluation des travaux nécessaires.' },
  { icon: '📡', t: "Multi-diffusion de l'annonce", d: "Assurez une visibilité maximale grâce à une diffusion étendue de votre annonce." },
];

function HomePage() {
  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const { data } = await api.api.properties.get();
      return data ?? [];
    },
  });

  const { data: settings = {} } = useQuery<Record<string, string>>({
    queryKey: ['settings'],
    queryFn: () => fetch('/api/settings').then(r => r.json()),
  });

  const latest = properties.slice(0, 6);

  return (
    <main className="fade-up">
      {/* Hero */}
      <section className="relative min-h-[620px] flex items-center overflow-hidden">
        {settings.hero_home
          ? <img src={settings.hero_home} alt="" className="absolute inset-0 w-full h-full object-cover" />
          : <div className="ph absolute inset-0"><span className="ph-label absolute top-4 right-4">[ PHOTO — toits de Gisors ]</span></div>
        }
        <div className="absolute inset-0 z-10" style={{ background: 'linear-gradient(105deg,rgba(10,20,55,.82) 0%,rgba(12,25,70,.55) 45%,rgba(12,25,70,.2) 100%)' }} />
        <div className="relative z-20 max-w-[1240px] mx-auto px-10 py-20 w-full">
          <p className="text-[#bcd0ff] text-[14px] tracking-[.12em] uppercase font-semibold mb-4">Agence familiale · Gisors · Depuis 1926</p>
          <h1 className="text-white text-[clamp(38px,5.2vw,64px)] leading-[1.04] font-bold max-w-[760px]">
            Trouvez le bien<br/>qui vous ressemble.
          </h1>
          <p className="text-[#dde6fb] text-[18px] max-w-[560px] mt-5 mb-8 leading-[1.55]">
            Acheter, vendre ou estimer à Gisors et dans tout le Vexin normand, accompagné par une équipe locale depuis près d'un siècle.
          </p>
          <form className="bg-white rounded-[18px] p-4.5 grid grid-cols-1 sm:grid-cols-[1.1fr_1.1fr_1fr_auto] gap-3.5 items-end max-w-[920px] shadow-[var(--shadow-card)]"
            onSubmit={e => { e.preventDefault(); }}>
            <div>
              <label className="block text-[12.5px] font-semibold text-head mb-1.5 uppercase tracking-[.04em] mx-1">Type de bien</label>
              <select className="w-full border border-[#dfe3ec] rounded-[12px] px-4 py-3.5 font-[inherit] text-[15px] text-ink focus:outline-none focus:border-navy">
                <option value="">Tous les biens</option>
                <option value="maison">Maison</option>
                <option value="appartement">Appartement</option>
                <option value="terrain">Terrain</option>
                <option value="local">Local commercial</option>
              </select>
            </div>
            <div>
              <label className="block text-[12.5px] font-semibold text-head mb-1.5 uppercase tracking-[.04em] mx-1">Localisation</label>
              <input placeholder="Gisors, Étrepagny…" className="w-full border border-[#dfe3ec] rounded-[12px] px-4 py-3.5 text-[15px] text-ink focus:outline-none focus:border-navy" />
            </div>
            <div>
              <label className="block text-[12.5px] font-semibold text-head mb-1.5 uppercase tracking-[.04em] mx-1">Budget maximum</label>
              <select className="w-full border border-[#dfe3ec] rounded-[12px] px-4 py-3.5 font-[inherit] text-[15px] text-ink focus:outline-none focus:border-navy">
                <option>Indifférent</option><option>100 000 €</option><option>200 000 €</option>
                <option>300 000 €</option><option>500 000 €</option>
              </select>
            </div>
            <Link to="/biens" className="bg-navy text-white rounded-[12px] px-6 py-3.5 font-semibold text-[15px] flex items-center gap-2 hover:bg-navy-deep transition-colors justify-center h-[50px]">
              🔍 Rechercher
            </Link>
          </form>
        </div>
      </section>

      {/* Derniers biens */}
      <section className="py-[84px]">
        <div className="max-w-[1240px] mx-auto px-10">
          <div className="flex items-end justify-between gap-5 mb-9">
            <div>
              <h2 className="text-[clamp(24px,2.6vw,32px)] font-bold text-head">Derniers biens publiés</h2>
              <p className="text-muted mt-1.5">Découvrez notre sélection de biens à vendre dans la région.</p>
            </div>
            <Link to="/biens" className="hidden sm:inline-flex items-center gap-2 border-[1.5px] border-navy text-navy rounded-full px-6 py-3 font-semibold text-[15px] hover:bg-navy hover:text-white transition-colors whitespace-nowrap">
              Tous les biens →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {latest.map(p => <PropertyCard key={p.id} property={p} />)}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-14">
        <div className="max-w-[1240px] mx-auto px-10">
          <div className="bg-gray-bg rounded-[16px] grid grid-cols-1 sm:grid-cols-3 text-center py-10 px-6">
            {[['4,8/5', "d'évaluation clients"], ['3', 'négociateurs expérimentés'], ['+ 4000', 'biens vendus']].map(([num, lbl]) => (
              <div key={lbl} className="relative py-4 [&:not(:first-child)]:before:absolute [&:not(:first-child)]:before:left-0 [&:not(:first-child)]:before:top-2 [&:not(:first-child)]:before:bottom-2 [&:not(:first-child)]:before:w-px [&:not(:first-child)]:before:bg-line">
                <div className="text-[34px] font-extrabold text-head">{num}</div>
                <div className="text-muted text-[14px] mt-1">{lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-[84px]">
        <div className="max-w-[1240px] mx-auto px-10">
          <div className="text-center max-w-[760px] mx-auto mb-13">
            <h2 className="text-[clamp(26px,3vw,38px)] font-bold text-head">Nos services proposés pour vous</h2>
            <p className="text-muted mt-3.5">Un ensemble de services pour vous accompagner au mieux dans la vente de votre bien, au meilleur prix et dans les meilleurs délais.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map(s => (
              <div key={s.t} className="bg-white border border-line rounded-[16px] p-6.5 text-center shadow-[0_18px_40px_-32px_rgba(18,40,102,.3)] hover:-translate-y-1 transition-transform">
                <div className="w-12 h-12 rounded-[12px] bg-navy flex items-center justify-center mx-auto mb-4 text-2xl">{s.icon}</div>
                <h3 className="text-[17px] font-bold text-head">{s.t}</h3>
                <p className="text-muted text-[14px] mt-2">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Teaser agence */}
      <section className="py-14">
        <div className="max-w-[1240px] mx-auto px-10">
          <div className="bg-blush rounded-[24px] grid grid-cols-1 md:grid-cols-2 gap-12 items-center p-[54px]">
            <div>
              <p className="text-muted text-[15px]">L'agence</p>
              <h2 className="text-[clamp(24px,2.6vw,32px)] font-bold text-head mt-2.5 mb-4">Une agence familiale au cœur de Gisors, depuis 1926.</h2>
              <p className="text-[#7a6d6c] mb-6">Quatre générations au service de l'immobilier local. Notre objectif : vous accompagner à travers les époques dans votre projet immobilier.</p>
              <Link to="/agence" className="inline-flex items-center gap-2.5 bg-navy text-white rounded-[12px] px-6 py-4 font-semibold text-[16px] hover:bg-navy-deep transition-colors">
                Découvrir l'agence →
              </Link>
            </div>
            {settings.photo_facade
              ? <img src={settings.photo_facade} alt="Agence Leblanc" className="min-h-[320px] rounded-[18px] w-full object-cover" />
              : <div className="ph min-h-[320px] rounded-[18px]"><span className="ph-label">[ PHOTO — façade agence ]</span></div>
            }
          </div>
        </div>
      </section>

      <EstimationCTA />
    </main>
  );
}
