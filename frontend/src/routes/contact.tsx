import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';

export const Route = createFileRoute('/contact')({ component: ContactPage });

function ContactPage() {
  const [tab, setTab] = useState<'achat' | 'vente'>('achat');
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });

  const mutation = useMutation({
    mutationFn: () => api.api.contact.post({ intent: tab, name: form.name, email: form.email, phone: form.phone || undefined, message: form.message }),
    onSuccess: () => { setSent(true); setTimeout(() => setSent(false), 3500); },
  });

  return (
    <main className="fade-up">
      <section className="relative bg-sky pb-20">
        <div className="ph h-[300px] absolute top-0 left-0 right-0 z-0"><span className="ph-label absolute top-4 right-4">[ PHOTO ]</span></div>
        <div className="max-w-[1240px] mx-auto px-10 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 items-stretch pt-[60px]">
            <div className="bg-sky rounded-[20px_0_0_20px] p-12">
              <p className="text-[#42506f] mb-6.5">Accueil / <b className="text-head font-semibold">Contact</b></p>
              <h2 className="text-[clamp(26px,3vw,34px)] font-bold text-head mb-4.5">Nous contacter</h2>
              <p className="text-[clamp(20px,2.2vw,26px)] font-bold text-head leading-[1.3] mb-2.5">Votre rêve immobilier commence par un simple message.</p>
              <p className="text-[clamp(20px,2.2vw,26px)] font-bold text-head leading-[1.3]">Laissez-nous vous accompagner.</p>
              <div className="flex flex-col sm:flex-row gap-12 mt-9">
                <div><div className="font-bold text-head mb-2">Adresse</div><div className="text-[#42506f] text-[14.5px]">5 rue Dauphine<br/>27140 Gisors</div></div>
                <div><div className="font-bold text-head mb-2">Nous contacter</div><div className="text-[#42506f] text-[14.5px]">02 32 55 06 20<br/>b.leblanc@wanadoo.fr</div></div>
              </div>
            </div>
            <div className="bg-white rounded-[0_20px_20px_0] p-12 shadow-[var(--shadow-card)]">
              <form onSubmit={e => { e.preventDefault(); mutation.mutate(); }}>
                <h3 className="text-[22px] font-bold text-head mb-6.5">Parlez-nous de votre projet immobilier</h3>
                <div className="mb-4.5">
                  <label className="block font-semibold text-[14.5px] text-head mb-2">Je souhaite <span className="text-coral">*</span></label>
                  <div className="flex flex-wrap gap-2">
                    {(['achat', 'vente'] as const).map(v => (
                      <button key={v} type="button" onClick={() => setTab(v)}
                        className={`px-4.5 py-3 rounded-[10px] font-medium text-[14.5px] transition-colors whitespace-nowrap border ${tab === v ? 'bg-sky text-navy font-semibold border-transparent' : 'text-muted border-transparent hover:border-line'}`}>
                        {v === 'achat' ? 'Acheter un bien' : 'Vente / estimation de mon bien'}
                      </button>
                    ))}
                  </div>
                </div>
                {[['Prénom Nom', 'name', 'text'], ['Email', 'email', 'email'], ['Téléphone', 'phone', 'tel']].map(([label, field, type]) => (
                  <div key={field} className="mb-4.5">
                    <label className="block font-semibold text-[14.5px] text-head mb-2">{label} {field !== 'phone' && <span className="text-coral">*</span>}</label>
                    <input type={type} required={field !== 'phone'} value={(form as any)[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                      className="w-full border border-[#dfe3ec] rounded-[12px] px-4 py-3.5 text-[15px] focus:outline-none focus:border-navy" />
                  </div>
                ))}
                <div className="mb-4.5">
                  <label className="block font-semibold text-[14.5px] text-head mb-2">Message</label>
                  <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    className="w-full border border-[#dfe3ec] rounded-[12px] px-4 py-3.5 text-[15px] min-h-[150px] resize-y focus:outline-none focus:border-navy" />
                </div>
                <button type="submit" disabled={mutation.isPending}
                  className="w-full bg-navy text-white rounded-[12px] py-4 font-semibold text-[15px] hover:bg-navy-deep transition-colors disabled:opacity-60">
                  {sent ? 'Message envoyé ✓' : mutation.isPending ? 'Envoi…' : 'Envoyer →'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
