import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export const Route = createFileRoute('/agence')({ component: AgencePage });

function AgencePage() {
  const { data: team = [] } = useQuery({
    queryKey: ['team'],
    queryFn: async () => { const { data } = await api.api.team.get(); return data ?? []; },
  });

  const { data: settings = {} } = useQuery<Record<string, string>>({
    queryKey: ['settings'],
    queryFn: () => fetch('/api/settings').then(r => r.json()),
  });

  return (
    <main className="fade-up">
      <section className="relative min-h-[340px] flex items-center justify-center text-center overflow-hidden">
        {settings.hero_agence
          ? <img src={settings.hero_agence} alt="" className="absolute inset-0 w-full h-full object-cover" />
          : <div className="ph absolute inset-0"><span className="ph-label absolute top-4 right-4">[ PHOTO — clocher Gisors ]</span></div>
        }
        <div className="absolute inset-0 z-10" style={{ background: 'linear-gradient(180deg,rgba(255,255,255,.55),rgba(255,255,255,.78))' }} />
        <div className="relative z-20 py-[70px] px-5">
          <h1 className="text-[clamp(28px,3.4vw,40px)] font-bold text-head">Une agence immobilière<br/>au cœur de Gisors</h1>
          <p className="mt-3.5 text-muted text-[14.5px]">Accueil / <b className="text-head font-semibold">L'agence</b></p>
        </div>
      </section>

      <section className="py-[84px]">
        <div className="max-w-[1240px] mx-auto px-10 grid grid-cols-1 md:grid-cols-2 gap-14 items-center">
          {settings.photo_facade
            ? <img src={settings.photo_facade} alt="Agence Leblanc" className="min-h-[400px] rounded-[18px] w-full object-cover" />
            : <div className="ph min-h-[400px] rounded-[18px]"><span className="ph-label">[ PHOTO — façade agence ]</span></div>
          }
          <div>
            <h2 className="text-[clamp(24px,2.8vw,34px)] font-bold text-head mb-4.5">Tout commence ici</h2>
            <p className="text-muted mb-4">C'est en 1926 que la famille Leblanc crée une agence immobilière spécialisée dans la location et la vente de biens. Cette entreprise familiale s'est rapidement fait un nom, prospérant au fil des années.</p>
            <p className="text-muted mb-4">Après la Seconde Guerre mondiale, l'agence a su ouvrir une extension dédiée à l'assurance. Grâce à cette évolution, elle a su répondre aux besoins changeants de ses clients.</p>
            <p className="text-muted">En 2018, Bruno Fressard reprend l'agence. C'est aujourd'hui une équipe de deux négociateurs et d'une secrétaire, avec un seul objectif : vous accompagner dans votre projet immobilier.</p>
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="max-w-[1240px] mx-auto px-10">
          <p className="text-center text-[clamp(22px,2.8vw,32px)] font-bold text-head max-w-[880px] mx-auto leading-[1.35] tracking-[-0.01em]">
            Nous sommes là pour vous aider à réaliser vos rêves immobiliers, aujourd'hui et pour les générations à venir.
          </p>
        </div>
      </section>

      <section className="py-[84px]">
        <div className="max-w-[1240px] mx-auto px-10">
          <div className="text-center max-w-[760px] mx-auto mb-13">
            <h2 className="text-[clamp(26px,3vw,38px)] font-bold text-head">Des professionnels au service de vos rêves</h2>
            <p className="text-muted mt-3.5">Une équipe locale, expérimentée et disponible.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6.5">
            {(team as any[]).map((m: any) => (
              <div key={m.id} className="text-center">
                <div className="aspect-square rounded-[14px] overflow-hidden">
                  {m.photoUrl ? <img src={m.photoUrl} alt={m.name} className="w-full h-full object-cover" /> : <div className="ph w-full h-full"><span className="ph-label">[ PHOTO ]</span></div>}
                </div>
                <b className="block text-head mt-4 mb-1 text-[16px]">{m.name}</b>
                <span className="text-muted text-[13.5px]">{m.role}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-sky py-[60px]">
        <div className="max-w-[1240px] mx-auto px-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.1fr_1fr_1fr_1fr_1fr] gap-7 items-start">
          <h2 className="text-[30px] font-bold text-head col-span-full lg:col-span-1">Les coordonnées<br/>de l'agence</h2>
          {[['Horaires', 'Du lundi au samedi\n9h-12h / 14h-19h'], ['Adresse', '5 rue Dauphine\n27140 Gisors'], ['Téléphone', '02 32 55 06 20\nb.leblanc@wanadoo.fr']].map(([lbl, val]) => (
            <div key={lbl}><div className="font-bold text-head mb-2">{lbl}</div>{val.split('\n').map((l, i) => <div key={i} className="text-[#42506f]">{l}</div>)}</div>
          ))}
        </div>
        <div className="max-w-[1240px] mx-auto px-10 pt-8">
          <div className="bg-white rounded-[16px] flex flex-col sm:flex-row items-center justify-between gap-6 px-10 py-7.5 shadow-[var(--shadow-soft)]">
            <div><h3 className="text-[21px] font-bold text-head">À vos côtés dans votre projet immobilier</h3><p className="text-muted mt-1.5">Parlez-nous de votre projet, notre équipe est là pour vous conseiller.</p></div>
            <Link to="/contact" className="inline-flex items-center gap-2 border-[1.5px] border-navy text-navy rounded-full px-7 py-4 font-semibold text-[16px] hover:bg-navy hover:text-white transition-colors whitespace-nowrap">Contactez-nous →</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
