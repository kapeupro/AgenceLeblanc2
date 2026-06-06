import { useState } from 'react';
import { Link, useRouterState } from '@tanstack/react-router';
import { Wordmark } from './Wordmark';

const NAV = [
  { label: 'Accueil', to: '/' },
  { label: 'Biens', to: '/biens', menu: [
    { label: 'Toutes les annonces', to: '/biens' },
    { label: 'Maisons', to: '/biens?type=maison' },
    { label: 'Appartements', to: '/biens?type=appartement' },
    { label: 'Terrains', to: '/biens?type=terrain' },
    { label: 'Locaux commerciaux', to: '/biens?type=local' },
  ]},
  { label: 'Agence', to: '/agence' },
  { label: 'Vendre', to: '/vendre' },
  { label: 'Contact', to: '/contact' },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const { location } = useRouterState();

  return (
    <header className="sticky top-0 z-60 bg-navy">
      <div className="max-w-[1240px] mx-auto px-10 flex items-center gap-7 h-[88px]">
        <Link to="/"><Wordmark size="md" tone="light" /></Link>

        <nav className="hidden lg:flex items-center gap-7 mx-auto">
          {NAV.map(item => (
            <div key={item.label} className="relative group">
              <Link to={item.to}
                className={`flex items-center gap-1.5 text-[15px] font-semibold px-0.5 py-2 transition-all border-b-2
                  ${location.pathname === item.to
                    ? 'text-white border-white'
                    : 'text-white border-transparent hover:border-white/50'}`}>
                {item.label}
                {item.menu && <span className="text-[10px] opacity-70 group-hover:rotate-180 transition-transform">▼</span>}
              </Link>
              {item.menu && (
                <div className="absolute top-[calc(100%+14px)] left-1/2 -translate-x-1/2 translate-y-2
                  bg-white rounded-[14px] shadow-[0_24px_50px_-18px_rgba(8,18,50,.4)] p-2.5 min-w-[248px]
                  opacity-0 invisible group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all">
                  {item.menu.map(m => (
                    <Link key={m.label} to={m.to}
                      className="flex items-center gap-3 px-3.5 py-2.5 rounded-[10px] text-head text-[14.5px] font-medium hover:bg-sky-soft">
                      {m.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="flex items-center gap-4 ml-auto lg:ml-0">
          <Link to="/contact"
            className="hidden lg:inline-flex items-center gap-2 text-white border-2 border-white/70 rounded-full px-6 py-3 text-[15px] font-semibold hover:bg-white hover:text-[#122866] transition-colors">
            Nous contacter →
          </Link>
          <button className="lg:hidden flex flex-col gap-1.5 p-2" onClick={() => setOpen(true)} aria-label="Menu">
            <span className="w-6 h-0.5 bg-white rounded" />
            <span className="w-6 h-0.5 bg-white rounded" />
            <span className="w-6 h-0.5 bg-white rounded" />
          </button>
        </div>
      </div>

      <div className={`fixed inset-0 z-80 transition-all ${open ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        style={{ background: 'rgba(8,16,40,.5)' }}
        onClick={e => { if (e.target === e.currentTarget) setOpen(false); }}>
        <div className={`absolute top-0 right-0 h-full w-[min(360px,86vw)] bg-navy px-6 py-6 overflow-y-auto transition-transform ${open ? 'translate-x-0' : 'translate-x-full'}`}>
          <button className="absolute top-5 right-5 text-white text-2xl" onClick={() => setOpen(false)}>✕</button>
          <div className="mb-6"><Wordmark size="md" tone="light" /></div>
          {NAV.map(item => (
            <Link key={item.label} to={item.to} onClick={() => setOpen(false)}
              className="block text-white text-[17px] font-semibold py-3.5 border-b border-white/15">
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
