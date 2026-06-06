import { Link } from '@tanstack/react-router';
import { Wordmark } from './Wordmark';

export function Footer() {
  return (
    <footer className="bg-navy text-[#cdd7f0] pt-[70px] pb-7 text-[14.5px]">
      <div className="max-w-[1240px] mx-auto px-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1.4fr] gap-[60px] pb-12">
          <div>
            <Wordmark size="lg" tone="light" />
            <div className="grid grid-cols-2 gap-y-5 gap-x-10 my-6">
              <div><div className="text-[#8ea0cf] text-[13px]">Téléphone</div><div className="text-white font-semibold mt-0.5">02 32 55 06 20</div></div>
              <div><div className="text-[#8ea0cf] text-[13px]">Email</div><div className="text-white font-semibold mt-0.5">b.leblanc@wanadoo.fr</div></div>
              <div><div className="text-[#8ea0cf] text-[13px]">Adresse</div><div className="text-white font-semibold mt-0.5">5 rue Dauphine<br/>27140 GISORS</div></div>
              <div><div className="text-[#8ea0cf] text-[13px]">Ouverture</div><div className="text-white font-semibold mt-0.5">9h-12h / 14h-19h<br/>Du lundi au samedi</div></div>
            </div>
          </div>
          <div>
            <div className="mb-8">
              <h4 className="text-white text-[16px] font-semibold mb-4">Restons en contact avec notre newsletter</h4>
              <div className="flex items-center bg-white/[.08] rounded-[12px] px-5 pr-1.5">
                <input placeholder="Votre email" className="flex-1 bg-transparent border-none text-white placeholder:text-[#9aa9d2] text-[14.5px] py-3.5 outline-none" />
                <button className="text-white font-semibold px-4 py-3">S'inscrire</button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-7">
              {[
                { title: 'Navigation', links: [['Accueil', '/'], ['Biens à vendre', '/biens'], ['Agence', '/agence'], ['Contact', '/contact']] },
                { title: 'Services', links: [['Vendre', '/vendre'], ['Acheter', '/biens'], ['Calcul mensualités', '/calcul'], ['Newsletter', '/alertes']] },
                { title: 'Légal', links: [['Mentions légales', '/'], ['Confidentialité', '/'], ['Honoraires', '/'], ['Alertes e-mail', '/alertes']] },
              ].map(col => (
                <div key={col.title}>
                  <h5 className="text-white text-[15px] font-semibold mb-4">{col.title}</h5>
                  {col.links.map(([label, to]) => (
                    <Link key={label} to={to} className="block py-1.5 text-[#b7c2e2] hover:text-white transition-colors">{label}</Link>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-center border-t border-white/[.14] pt-6 gap-3 text-[#8ea0cf] text-[13.5px]">
          <span>© Agence Leblanc – Tout droit réservé</span>
          <div className="flex gap-4">
            <Link to="/" className="hover:text-white">Privacy</Link>
            <Link to="/" className="hover:text-white">Terms</Link>
            <Link to="/" className="hover:text-white">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
