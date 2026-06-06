import { createFileRoute, Link } from '@tanstack/react-router';
import { EstimationCTA } from '../components/EstimationCTA';

export const Route = createFileRoute('/vendre')({ component: VendrePage });

const BENEFITS = [
  { icon: '🏠', t: 'Expertise du marché immobilier local', d: "Avec des années d'expérience dans le marché immobilier local, nous évaluons votre bien avec précision." },
  { icon: '🛡', t: "Réseau d'acheteurs potentiels", d: "Notre réseau étendu d'acheteurs qualifiés est à la recherche de biens comme le vôtre." },
  { icon: '👥', t: 'Accompagnement complet et personnalisé', d: "Nous vous offrons un accompagnement sur-mesure à chaque étape, de l'estimation à la signature." },
  { icon: '⚡', t: "Gain de temps et d'énergie", d: "En nous confiant votre bien, vous évitez les tracas administratifs et logistiques." },
  { icon: '🔑', t: 'Résultats concrets', d: "Notre objectif est simple : obtenir les meilleurs résultats pour vous." },
];

function VendrePage() {
  return (
    <main className="fade-up">
      <section className="relative min-h-[340px] flex items-center justify-center text-center overflow-hidden">
        <div className="ph absolute inset-0"><span className="ph-label absolute top-4 right-4">[ PHOTO — toits de Gisors ]</span></div>
        <div className="absolute inset-0 z-10" style={{ background: 'linear-gradient(180deg,rgba(255,255,255,.55),rgba(255,255,255,.78))' }} />
        <div className="relative z-20 py-[70px] px-5">
          <h1 className="text-[clamp(28px,3.4vw,40px)] font-bold text-head">Vendez votre bien en toute sérénité<br/>avec l'Agence Leblanc</h1>
          <p className="mt-3.5 text-muted text-[14.5px]">Accueil / <b className="text-head font-semibold">Vendre</b></p>
        </div>
      </section>

      <section className="py-[84px] bg-blush">
        <div className="max-w-[1240px] mx-auto px-10 grid grid-cols-1 lg:grid-cols-[1.25fr_1fr] gap-14 items-start">
          <div>
            <h2 className="text-[clamp(24px,2.8vw,32px)] font-bold text-head mb-7">Faire confiance à l'Agence Leblanc, c'est :</h2>
            <ul className="flex flex-col gap-6 mb-8">
              {BENEFITS.map(b => (
                <li key={b.t} className="flex gap-4 items-start">
                  <span className="w-[46px] h-[46px] rounded-full bg-white text-coral flex items-center justify-center flex-none shadow-[0_8px_20px_-10px_rgba(199,93,72,.5)] text-xl">{b.icon}</span>
                  <div><b className="block text-head mb-1">{b.t}</b><p className="text-[#7a6d6c] text-[14.5px] m-0">{b.d}</p></div>
                </li>
              ))}
            </ul>
            <Link to="/contact" className="inline-flex items-center gap-2.5 bg-[#15161c] text-white rounded-full px-7 py-4 font-semibold text-[16px] hover:bg-black transition-colors">
              Je prends rendez-vous →
            </Link>
          </div>
          <div className="ph min-h-[520px] rounded-[18px]"><span className="ph-label">[ PHOTO — négociateurs avec clients ]</span></div>
        </div>
      </section>

      <EstimationCTA />
    </main>
  );
}
