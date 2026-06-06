import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';

export const Route = createFileRoute('/alertes')({ component: AlertesPage });

function AlertesPage() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', type: '', city: '', duration: '3 mois' });
  const up = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  const mutation = useMutation({
    mutationFn: () => api.api.alerts.post({ name: form.name, email: form.email, phone: form.phone || undefined, type: form.type || undefined, city: form.city, duration: form.duration }),
    onSuccess: () => { setSent(true); setTimeout(() => setSent(false), 3500); },
  });

  return (
    <main className="fade-up">
      <section className="relative pb-20 bg-sky overflow-hidden">
        <div className="ph h-[520px] absolute inset-0 opacity-90"><span className="ph-label absolute top-4 right-4">[ PHOTO ]</span></div>
        <div className="absolute top-0 left-0 right-0 h-[520px] z-10" style={{ background: 'linear-gradient(180deg,rgba(120,170,235,.5),rgba(220,235,253,.6))' }} />
        <div className="relative z-20 text-center max-w-[1240px] mx-auto px-10 pt-16 pb-9">
          <p className="text-[#42506f] mb-3.5">Accueil / <b className="text-head font-semibold">Alertes e-mail</b></p>
          <h1 className="text-[clamp(26px,3.2vw,38px)] font-bold text-head max-w-[820px] mx-auto">Et si vous passiez à côté d'une nouvelle propriété<br/>qui correspond à vos critères ?</h1>
          <p className="text-[#42506f] max-w-[680px] mx-auto mt-4.5 text-[15.5px]">Notre équipe est à votre service pour vous partager par email nos dernières propriétés correspondant à vos critères.</p>
        </div>

        <div className="relative z-20 max-w-[1240px] mx-auto px-10">
          <form className="bg-white rounded-[20px] p-11 shadow-[var(--shadow-card)]" onSubmit={e => { e.preventDefault(); mutation.mutate(); }}>
            <h3 className="text-[22px] font-bold text-head mb-6.5">Parlez-nous de votre projet immobilier</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-9">
              <div>
                {[['Prénom Nom', 'name', 'text', true], ['Email', 'email', 'email', true], ['Téléphone', 'phone', 'tel', false]].map(([label, field, type, req]) => (
                  <div key={field as string} className="mb-4.5">
                    <label className="block font-semibold text-[14.5px] text-head mb-2">{label as string} {req && <span className="text-coral">*</span>}</label>
                    <input type={type as string} required={!!req} value={(form as any)[field as string]} onChange={up(field as string)}
                      className="w-full border border-[#dfe3ec] rounded-[12px] px-4 py-3.5 text-[15px] focus:outline-none focus:border-navy" />
                  </div>
                ))}
                <div className="mb-4.5">
                  <label className="block font-semibold text-[14.5px] text-head mb-2">Recevoir les notifications pendant</label>
                  <select value={form.duration} onChange={up('duration')} className="w-full border border-[#dfe3ec] rounded-[12px] px-4 py-3.5 font-[inherit] text-[15px] focus:outline-none focus:border-navy">
                    {['1 mois', '3 mois', '6 mois', '1 an'].map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <div className="mb-4.5">
                  <label className="block font-semibold text-[14.5px] text-head mb-2">Type de bien</label>
                  <select value={form.type} onChange={up('type')} className="w-full border border-[#dfe3ec] rounded-[12px] px-4 py-3.5 font-[inherit] text-[15px] focus:outline-none focus:border-navy">
                    <option value="">Tous</option>
                    {['Maison', 'Appartement', 'Terrain', 'Local commercial'].map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <div className="mb-4.5">
                  <label className="block font-semibold text-[14.5px] text-head mb-2">Ville <span className="text-coral">*</span></label>
                  <input required value={form.city} onChange={up('city')} placeholder="Entrez la ville souhaitée"
                    className="w-full border border-[#dfe3ec] rounded-[12px] px-4 py-3.5 text-[15px] focus:outline-none focus:border-navy" />
                </div>
                <div className="mb-4.5">
                  <label className="block font-semibold text-[14.5px] text-head mb-2">Prix maximum</label>
                  <div className="relative">
                    <input type="number" placeholder="Entrez un prix" className="w-full border border-[#dfe3ec] rounded-[12px] px-4 pr-10 py-3.5 text-[15px] focus:outline-none focus:border-navy" />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted text-[14px]">€</span>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 text-[12.5px] text-muted mt-5 mb-5">
                  <input type="checkbox" required className="mt-0.5" />
                  <span>En cochant cette case, j'accepte les <a href="/" className="underline">CGU</a> et la <a href="/" className="underline">Politique de confidentialité</a>.</span>
                </div>
                <button type="submit" disabled={mutation.isPending}
                  className="w-full bg-navy text-white rounded-[12px] py-4 font-semibold text-[15px] hover:bg-navy-deep transition-colors disabled:opacity-60">
                  {sent ? 'Alerte créée ✓' : mutation.isPending ? 'Envoi…' : 'Envoyer →'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
