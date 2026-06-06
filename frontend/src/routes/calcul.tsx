import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { PropertyCard } from '../components/PropertyCard';

export const Route = createFileRoute('/calcul')({ component: CalcPage });

function CalcPage() {
  const [montant, setMontant] = useState(250000);
  const [apport, setApport] = useState(42000);
  const [duree, setDuree] = useState(20);
  const [taux, setTaux] = useState(3.5);

  const emprunte = Math.max(0, montant - apport);
  const r = taux / 100 / 12;
  const n = duree * 12;
  const mensualite = r > 0 ? emprunte * r / (1 - Math.pow(1 + r, -n)) : (n ? emprunte / n : 0);
  const cout = Math.max(0, mensualite * n - emprunte);
  const fmt = (v: number) => Math.round(v).toLocaleString('fr-FR') + ' €';

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => { const { data } = await api.api.properties.get(); return data ?? []; },
  });

  return (
    <main className="fade-up">
      <section className="relative min-h-[580px] flex items-center overflow-hidden">
        <div className="ph absolute inset-0"><span className="ph-label absolute top-4 right-4">[ PHOTO — couple + ordinateur ]</span></div>
        <div className="absolute inset-0 z-10" style={{ background: 'linear-gradient(100deg,rgba(10,20,55,.6),rgba(12,25,70,.25))' }} />
        <div className="relative z-20 max-w-[1240px] mx-auto px-10 py-[70px] grid grid-cols-1 lg:grid-cols-[1fr_460px] gap-10 items-center w-full">
          <div>
            <p className="text-[#d8e2fb] text-[14.5px] mb-3">Accueil / <b className="text-white font-semibold">Calcul des mensualités</b></p>
            <h1 className="text-white text-[clamp(30px,4vw,46px)] font-bold mb-8">Calculez vos mensualités</h1>
            <div className="bg-blush rounded-[16px] p-7 shadow-[var(--shadow-card)] max-w-[380px]">
              <h3 className="text-[18px] font-bold text-head mb-4">Résultats</h3>
              {[['Montant emprunté :', fmt(emprunte)], ['Mensualités :', fmt(mensualite)], ['Coût total du crédit :', fmt(cout)]].map(([lbl, val]) => (
                <div key={lbl as string} className="flex justify-between gap-4 text-[14.5px] text-[#54596b] py-2 border-b border-black/[.06]">
                  <span>{lbl}</span><b className="text-head whitespace-nowrap">{val}</b>
                </div>
              ))}
            </div>
          </div>
          <form className="bg-white rounded-[18px] p-8 shadow-[var(--shadow-card)]" onSubmit={e => e.preventDefault()}>
            <h3 className="text-[20px] font-bold text-head text-center mb-5.5">Estimez vos mensualités</h3>
            {([['Montant du bien', montant, setMontant, '€'], ['Apport initial', apport, setApport, '€']] as const).map(([label, val, set, suf]) => (
              <div key={label as string} className="mb-4.5">
                <label className="block font-semibold text-[14.5px] text-head mb-2">{label}</label>
                <div className="relative">
                  <input type="number" value={val as number} onChange={e => (set as (v: number) => void)(Math.max(0, Number(e.target.value) || 0))}
                    className="w-full border border-[#dfe3ec] rounded-[12px] px-4 pr-10 py-3.5 text-[15px] focus:outline-none focus:border-navy" />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted text-[14px]">{suf}</span>
                </div>
              </div>
            ))}
            <div className="mb-4.5">
              <label className="block font-semibold text-[14.5px] text-head mb-2">Durée de l'emprunt</label>
              <select value={duree} onChange={e => setDuree(Number(e.target.value))}
                className="w-full border border-[#dfe3ec] rounded-[12px] px-4 py-3.5 font-[inherit] text-[15px] focus:outline-none focus:border-navy">
                {[5, 10, 15, 20, 25, 30].map(y => <option key={y} value={y}>{y} ans</option>)}
              </select>
            </div>
            <div className="mb-5.5">
              <label className="block font-semibold text-[14.5px] text-head mb-2">Taux</label>
              <div className="relative">
                <input type="number" step="0.1" value={taux} onChange={e => setTaux(Math.max(0, Number(e.target.value) || 0))}
                  className="w-full border border-[#dfe3ec] rounded-[12px] px-4 pr-10 py-3.5 text-[15px] focus:outline-none focus:border-navy" />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted text-[14px]">%</span>
              </div>
            </div>
          </form>
        </div>
      </section>

      <section className="py-[84px]">
        <div className="max-w-[1240px] mx-auto px-10">
          <div className="flex items-end justify-between gap-5 mb-9">
            <div><h2 className="text-[clamp(24px,2.6vw,32px)] font-bold text-head">Derniers biens publiés</h2><p className="text-muted mt-1.5">Trouvez le bien qui correspond à votre budget.</p></div>
            <Link to="/biens" className="hidden sm:inline-flex items-center gap-2 border-[1.5px] border-navy text-navy rounded-full px-6 py-3 font-semibold text-[15px] hover:bg-navy hover:text-white transition-colors whitespace-nowrap">Tous les biens →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {(properties as any[]).slice(0, 3).map((p: any) => <PropertyCard key={p.id} property={p} />)}
          </div>
        </div>
      </section>
    </main>
  );
}
