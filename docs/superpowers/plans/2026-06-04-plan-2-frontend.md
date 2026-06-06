# Agence Leblanc — Plan 2 : Frontend public

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Prérequis :** Plan 1 terminé — backend tournant sur `:3001`, type `App` exporté.

**Goal:** Construire le site public Agence Leblanc avec React 19, TanStack Router v1 (file-based), TanStack Query v5, Tailwind CSS v4, et le client Eden Treaty typesafe. 8 pages publiques fidèles au prototype visuel.

**Architecture:** Vite proxifie `/api` et `/uploads` vers `:3001`. Eden Treaty génère un client HTTP typesafe depuis le type `App` du backend. TanStack Router gère le routing avec loaders pour prefetch. Tailwind v4 avec les tokens de marque (navy, sky, blush, coral) en CSS custom properties.

**Tech Stack:** React 19, Vite 5, TanStack Router v1, TanStack Query v5, `@elysiajs/eden`, Tailwind CSS v4, TypeScript 5.

---

## Fichiers créés par ce plan

```
frontend/
├── package.json
├── vite.config.ts
├── tsconfig.json
├── index.html
└── src/
    ├── main.tsx
    ├── routeTree.gen.ts          ← généré par TanStack Router (ne pas éditer)
    ├── router.tsx
    ├── lib/
    │   └── api.ts                ← client Eden Treaty
    ├── styles/
    │   └── globals.css           ← Tailwind v4 + tokens marque
    ├── components/
    │   ├── Wordmark.tsx
    │   ├── Header.tsx
    │   ├── Footer.tsx
    │   ├── PropertyCard.tsx
    │   ├── Placeholder.tsx
    │   └── EstimationCTA.tsx
    └── routes/
        ├── __root.tsx            ← layout global (Header + Footer)
        ├── index.tsx             ← /
        ├── biens/
        │   ├── index.tsx         ← /biens
        │   └── $slug.tsx         ← /biens/$slug
        ├── vendre.tsx
        ├── agence.tsx
        ├── contact.tsx
        ├── calcul.tsx
        └── alertes.tsx
```

---

## Task 1 — Setup Vite + TanStack Router + Tailwind

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/vite.config.ts`
- Create: `frontend/tsconfig.json`
- Create: `frontend/index.html`

- [ ] **Créer frontend/package.json**

```json
{
  "name": "frontend",
  "version": "0.0.1",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@tanstack/react-router": "^1.56.0",
    "@tanstack/react-query": "^5.50.0",
    "@tanstack/react-query-devtools": "^5.50.0",
    "@elysiajs/eden": "^1.0.27",
    "elysia": "^1.0.27",
    "shared": "workspace:*"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.0",
    "@tanstack/router-plugin": "^1.56.0",
    "vite": "^5.4.0",
    "typescript": "^5.4.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "tailwindcss": "^4.0.0",
    "@tailwindcss/vite": "^4.0.0"
  }
}
```

- [ ] **Installer les dépendances**

```bash
cd frontend && bun install
```

- [ ] **Créer frontend/vite.config.ts**

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    TanStackRouterVite({ routesDirectory: './src/routes', generatedRouteTree: './src/routeTree.gen.ts' }),
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:3001', changeOrigin: true },
      '/uploads': { target: 'http://localhost:3001', changeOrigin: true },
    },
  },
});
```

- [ ] **Créer frontend/tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "skipLibCheck": true,
    "paths": { "shared": ["../shared/types.ts"] }
  },
  "include": ["src"]
}
```

- [ ] **Créer frontend/index.html**

```html
<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Agence Leblanc — Immobilier à Gisors depuis 1926</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Anton&family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=Yellowtail&display=swap" rel="stylesheet" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Commit**

```bash
git add frontend/
git commit -m "chore(frontend): init Vite + TanStack Router + Tailwind v4"
```

---

## Task 2 — Tokens CSS + styles globaux

**Files:**
- Create: `frontend/src/styles/globals.css`

- [ ] **Créer frontend/src/styles/globals.css**

```css
@import "tailwindcss";

@theme {
  --color-navy: #122866;
  --color-navy-deep: #0e1f52;
  --color-sky: #dcebfd;
  --color-sky-soft: #eaf2fe;
  --color-blush: #fef4f3;
  --color-coral: #c75d48;
  --color-coral-soft: #e98a72;
  --color-gray-bg: #f7f7f8;
  --color-line: #e9eaee;
  --color-ink: #1f2433;
  --color-head: #22305e;
  --color-muted: #6c7184;
  --color-muted-2: #9aa0b0;

  --font-sans: 'Poppins', system-ui, sans-serif;
  --font-display: 'Anton', sans-serif;
  --font-script: 'Yellowtail', cursive;

  --radius-sm: 12px;
  --radius: 18px;
  --radius-lg: 28px;

  --shadow-card: 0 24px 60px -28px rgba(18,40,102,.28);
  --shadow-soft: 0 18px 40px -24px rgba(18,40,102,.20);
}

*, *::before, *::after { box-sizing: border-box; }

html { scroll-behavior: smooth; }

body {
  font-family: var(--font-sans);
  color: var(--color-ink);
  background: #fff;
  font-size: 16px;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  margin: 0;
}

img { max-width: 100%; display: block; }
a { color: inherit; text-decoration: none; }
button { font-family: inherit; cursor: pointer; border: none; background: none; }
ul { margin: 0; padding: 0; list-style: none; }
h1,h2,h3,h4 { margin: 0; color: var(--color-head); font-weight: 700; line-height: 1.15; }

/* Placeholder stripes */
.ph {
  position: relative;
  overflow: hidden;
  background: repeating-linear-gradient(135deg, #e7ecf6 0 14px, #dde4f1 14px 28px);
  display: flex; align-items: center; justify-content: center;
  color: #7c89a8;
}
.ph.navy {
  background: repeating-linear-gradient(135deg, #1b3072 0 14px, #16285f 14px 28px);
  color: #9fb3e6;
}
.ph-label {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  letter-spacing: .04em;
  text-align: center;
  padding: 8px 14px;
  border: 1px dashed currentColor;
  border-radius: 6px;
  background: rgba(255,255,255,.32);
  max-width: 80%;
}

@keyframes fadeUp { from { transform: translateY(14px); } to { transform: none; } }
.fade-up { animation: fadeUp .5s ease both; }
```

- [ ] **Commit**

```bash
git add frontend/src/styles/globals.css
git commit -m "feat(frontend): tokens CSS marque + Tailwind v4"
```

---

## Task 3 — Client Eden Treaty

**Files:**
- Create: `frontend/src/lib/api.ts`

- [ ] **Créer frontend/src/lib/api.ts**

```typescript
import { treaty } from '@elysiajs/eden';
import type { App } from '../../../backend/src/index';

// En dev, Vite proxifie /api vers localhost:3001 — on pointe sur le même origin
export const api = treaty<App>(
  typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173'
);
```

> **Note :** `treaty<App>` inspecte le type `App` exporté par ElysiaJS et génère des méthodes typées correspondant à chaque route. Toute modification de l'API (renommage de champ, nouveau paramètre) cause une erreur TypeScript ici.

- [ ] **Commit**

```bash
git add frontend/src/lib/api.ts
git commit -m "feat(frontend): client Eden Treaty typesafe"
```

---

## Task 4 — Router + main entry

**Files:**
- Create: `frontend/src/router.tsx`
- Create: `frontend/src/main.tsx`
- Create: `frontend/src/routes/__root.tsx` (stub)

- [ ] **Créer frontend/src/routes/__root.tsx** (stub — sera enrichi en Task 5)

```tsx
import { createRootRoute, Outlet } from '@tanstack/react-router';
import '../styles/globals.css';

export const Route = createRootRoute({
  component: () => <Outlet />,
});
```

- [ ] **Créer frontend/src/routes/index.tsx** (stub)

```tsx
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: () => <div className="p-8 text-2xl font-bold text-navy">Agence Leblanc 🏠</div>,
});
```

- [ ] **Créer frontend/src/router.tsx**

```tsx
import { createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
});

declare module '@tanstack/react-router' {
  interface Register { router: typeof router }
}
```

- [ ] **Créer frontend/src/main.tsx**

```tsx
import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { router } from './router';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>
);
```

- [ ] **Lancer le frontend et vérifier**

```bash
cd frontend && bun dev
```

Ouvrir http://localhost:5173 — doit afficher "Agence Leblanc 🏠".

- [ ] **Commit**

```bash
git add frontend/src/
git commit -m "feat(frontend): router TanStack + QueryClient + entry point"
```

---

## Task 5 — Composants partagés (Wordmark, Header, Footer, PropertyCard)

**Files:**
- Create: `frontend/src/components/Wordmark.tsx`
- Create: `frontend/src/components/Header.tsx`
- Create: `frontend/src/components/Footer.tsx`
- Create: `frontend/src/components/PropertyCard.tsx`
- Create: `frontend/src/components/EstimationCTA.tsx`
- Modify: `frontend/src/routes/__root.tsx`

- [ ] **Créer frontend/src/components/Wordmark.tsx**

```tsx
interface Props { size?: 'md' | 'lg'; tone?: 'light' | 'dark'; }

export function Wordmark({ size = 'md', tone = 'light' }: Props) {
  const nameSize = size === 'lg' ? 'text-[34px]' : 'text-[24px]';
  const sinceSize = size === 'lg' ? 'text-[29px]' : 'text-[21px]';
  const color = tone === 'light' ? 'text-white' : 'text-navy';
  return (
    <span className="inline-flex flex-col leading-none">
      <span className={`font-display font-normal tracking-[.02em] uppercase leading-none whitespace-nowrap ${nameSize} ${color}`}>
        Agence Leblanc
      </span>
      <span className={`font-script font-normal leading-none mt-1 ${sinceSize} ${color}`}>
        Depuis 1926
      </span>
    </span>
  );
}
```

- [ ] **Créer frontend/src/components/Header.tsx**

```tsx
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
                className={`flex items-center gap-1.5 text-[15px] font-medium px-0.5 py-2 transition-colors
                  ${location.pathname === item.to ? 'text-white' : 'text-[#eef2fb] hover:text-white'}`}>
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
            className="hidden lg:inline-flex items-center gap-2 text-white border border-white/55 rounded-full px-6 py-3 text-[15px] font-semibold hover:bg-white hover:text-navy transition-colors">
            Nous contacter →
          </Link>
          <button className="lg:hidden flex flex-col gap-1.5 p-2" onClick={() => setOpen(true)} aria-label="Menu">
            <span className="w-6 h-0.5 bg-white rounded" />
            <span className="w-6 h-0.5 bg-white rounded" />
            <span className="w-6 h-0.5 bg-white rounded" />
          </button>
        </div>
      </div>

      {/* Drawer mobile */}
      <div className={`fixed inset-0 z-80 transition-all ${open ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        style={{ background: 'rgba(8,16,40,.5)' }}
        onClick={e => { if (e.target === e.currentTarget) setOpen(false); }}>
        <div className={`absolute top-0 right-0 h-full w-[min(360px,86vw)] bg-navy px-6 py-6 overflow-y-auto transition-transform ${open ? 'translate-x-0' : 'translate-x-full'}`}>
          <button className="absolute top-5 right-5 text-white text-2xl" onClick={() => setOpen(false)}>✕</button>
          <div className="mb-6"><Wordmark size="md" tone="light" /></div>
          {NAV.map(item => (
            <Link key={item.label} to={item.to} onClick={() => setOpen(false)}
              className="block text-[#eef2fb] text-[17px] font-medium py-3.5 border-b border-white/10">
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Créer frontend/src/components/Footer.tsx**

```tsx
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
```

- [ ] **Créer frontend/src/components/PropertyCard.tsx**

```tsx
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
```

- [ ] **Créer frontend/src/components/EstimationCTA.tsx**

```tsx
import { Link } from '@tanstack/react-router';

export function EstimationCTA() {
  return (
    <section className="py-14">
      <div className="max-w-[1240px] mx-auto px-10">
        <div className="bg-gray-bg rounded-[16px] flex flex-col sm:flex-row items-center justify-between gap-6 px-11 py-9">
          <div>
            <h2 className="text-[26px] font-bold text-head">Connaissez-vous la valeur de votre bien ?</h2>
            <p className="text-muted mt-1.5">Faites une estimation gratuite de votre bien par l'un de nos experts.</p>
          </div>
          <Link to="/contact" className="inline-flex items-center gap-2.5 border-[1.5px] border-navy text-navy bg-white rounded-full px-7 py-4 text-[16px] font-semibold hover:bg-navy hover:text-white transition-colors whitespace-nowrap">
            Contactez-nous →
          </Link>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Mettre à jour frontend/src/routes/__root.tsx**

```tsx
import { createRootRoute, Outlet } from '@tanstack/react-router';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import '../styles/globals.css';

export const Route = createRootRoute({
  component: () => (
    <>
      <Header />
      <Outlet />
      <Footer />
    </>
  ),
});
```

- [ ] **Vérifier le rendu**

```bash
# Backend et frontend doivent tourner
# Ouvrir http://localhost:5173 — le Header navy doit apparaître
```

- [ ] **Commit**

```bash
git add frontend/src/components/ frontend/src/routes/__root.tsx
git commit -m "feat(frontend): composants partagés Header + Footer + PropertyCard"
```

---

## Task 6 — Page Accueil

**Files:**
- Modify: `frontend/src/routes/index.tsx`

- [ ] **Remplacer frontend/src/routes/index.tsx**

```tsx
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
  { icon: '📡', t: 'Multi-diffusion de l\'annonce', d: 'Assurez une visibilité maximale grâce à une diffusion étendue de votre annonce.' },
];

function HomePage() {
  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const { data } = await api.api.properties.get();
      return data ?? [];
    },
  });

  const latest = properties.slice(0, 6);

  return (
    <main className="fade-up">
      {/* Hero */}
      <section className="relative min-h-[620px] flex items-center overflow-hidden">
        <div className="ph absolute inset-0"><span className="ph-label absolute top-4 right-4">[ PHOTO — toits de Gisors ]</span></div>
        <div className="absolute inset-0 z-10" style={{ background: 'linear-gradient(105deg,rgba(10,20,55,.82) 0%,rgba(12,25,70,.55) 45%,rgba(12,25,70,.2) 100%)' }} />
        <div className="relative z-20 max-w-[1240px] mx-auto px-10 py-20 w-full">
          <p className="text-[#bcd0ff] text-[14px] tracking-[.12em] uppercase font-semibold mb-4">Agence familiale · Gisors · Depuis 1926</p>
          <h1 className="text-white text-[clamp(38px,5.2vw,64px)] leading-[1.04] font-bold max-w-[760px]">
            Trouvez le bien<br/>qui vous ressemble.
          </h1>
          <p className="text-[#dde6fb] text-[18px] max-w-[560px] mt-5 mb-8 leading-[1.55]">
            Acheter, vendre ou estimer à Gisors et dans tout le Vexin normand, accompagné par une équipe locale depuis près d'un siècle.
          </p>
          {/* Search bar */}
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
                <div className="w-12 h-12 rounded-[12px] bg-navy flex items-center justify-content-center mx-auto mb-4 text-2xl flex items-center justify-center">{s.icon}</div>
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
            <div className="ph min-h-[320px] rounded-[18px]"><span className="ph-label">[ PHOTO — façade agence ]</span></div>
          </div>
        </div>
      </section>

      <EstimationCTA />
    </main>
  );
}
```

- [ ] **Vérifier la page**

Ouvrir http://localhost:5173 — la page d'accueil doit s'afficher avec le hero navy, les annonces chargées depuis l'API, les stats, et les services.

- [ ] **Commit**

```bash
git add frontend/src/routes/index.tsx
git commit -m "feat(frontend): page Accueil avec hero + annonces + stats + services"
```

---

## Task 7 — Page Biens (liste + filtres)

**Files:**
- Create: `frontend/src/routes/biens/index.tsx`

- [ ] **Créer frontend/src/routes/biens/index.tsx**

```tsx
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { PropertyCard } from '../../components/PropertyCard';
import { EstimationCTA } from '../../components/EstimationCTA';

type Search = { type?: string; maxPrice?: string; q?: string; sort?: string };

export const Route = createFileRoute('/biens/')({
  validateSearch: (s: Record<string, unknown>): Search => ({
    type: typeof s.type === 'string' ? s.type : undefined,
    maxPrice: typeof s.maxPrice === 'string' ? s.maxPrice : undefined,
    q: typeof s.q === 'string' ? s.q : undefined,
    sort: typeof s.sort === 'string' ? s.sort : undefined,
  }),
  component: BiensPage,
});

const TYPE_LABEL: Record<string, string> = {
  maison: 'Maison', appartement: 'Appartement', terrain: 'Terrain',
  local: 'Local commercial', immeuble: 'Immeuble', cave: 'Cave',
};

function BiensPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: '/biens/' });
  const [q, setQ] = useState(search.q ?? '');

  const { data: properties = [], isLoading } = useQuery({
    queryKey: ['properties', search],
    queryFn: async () => {
      const { data } = await api.api.properties.get({ query: { type: search.type, maxPrice: search.maxPrice, q: search.q, sort: search.sort } });
      return data ?? [];
    },
  });

  const setFilter = (patch: Partial<Search>) =>
    navigate({ search: prev => ({ ...prev, ...patch }) });

  const hasFilters = !!(search.type || search.q || search.maxPrice);

  return (
    <main className="fade-up">
      {/* Hero */}
      <section className="relative min-h-[340px] flex items-center justify-center text-center overflow-hidden">
        <div className="ph absolute inset-0"><span className="ph-label absolute top-4 right-4">[ PHOTO — toits Gisors ]</span></div>
        <div className="absolute inset-0 z-10" style={{ background: 'linear-gradient(180deg,rgba(255,255,255,.55),rgba(255,255,255,.78))' }} />
        <div className="relative z-20 py-[70px] px-5">
          <h1 className="text-[clamp(28px,3.4vw,40px)] font-bold text-head">Nos biens à vendre</h1>
          <p className="mt-3.5 text-muted text-[14.5px]">Accueil / <b className="text-head font-semibold">Biens</b></p>
        </div>
      </section>

      <section className="py-[84px]">
        <div className="max-w-[1240px] mx-auto px-10">
          {/* Filterbar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr] gap-3.5 bg-white border border-line rounded-[16px] p-3.5 shadow-[var(--shadow-soft)] mb-6.5">
            <div className="flex items-center gap-2.5 border border-[#dfe3ec] rounded-[12px] px-4">
              <span className="text-muted">🔍</span>
              <input
                placeholder="Rechercher une ville, un type de bien…"
                value={q}
                onChange={e => setQ(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') setFilter({ q: q || undefined }); }}
                className="flex-1 border-none outline-none py-3.5 text-[15px] text-ink placeholder:text-[#aab0c0]"
              />
            </div>
            <select className="border border-[#dfe3ec] rounded-[12px] px-4 py-3.5 font-[inherit] text-[15px] text-ink" value={search.type ?? ''} onChange={e => setFilter({ type: e.target.value || undefined })}>
              <option value="">Tous les types</option>
              {Object.entries(TYPE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <select className="border border-[#dfe3ec] rounded-[12px] px-4 py-3.5 font-[inherit] text-[15px] text-ink" value={search.maxPrice ?? ''} onChange={e => setFilter({ maxPrice: e.target.value || undefined })}>
              <option value="">Budget max</option>
              {[['5000000','50 000 €'],['15000000','150 000 €'],['25000000','250 000 €'],['40000000','400 000 €'],['60000000','600 000 €']].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <select className="border border-[#dfe3ec] rounded-[12px] px-4 py-3.5 font-[inherit] text-[15px] text-ink" value={search.sort ?? 'recent'} onChange={e => setFilter({ sort: e.target.value })}>
              <option value="recent">Plus récents</option>
              <option value="asc">Prix croissant</option>
              <option value="desc">Prix décroissant</option>
            </select>
          </div>

          {/* Results head */}
          <div className="flex items-center justify-between mb-5.5 text-muted">
            <span><b className="text-head">{properties.length}</b> bien{properties.length > 1 ? 's' : ''}{search.type ? ` · ${TYPE_LABEL[search.type]}` : ''}</span>
            {hasFilters && (
              <button onClick={() => navigate({ search: {} })} className="inline-flex items-center gap-1.5 text-navy font-semibold text-[14px]">
                ✕ Réinitialiser
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="text-center py-20 text-muted">Chargement…</div>
          ) : properties.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
              {properties.map(p => <PropertyCard key={p.id} property={p} />)}
            </div>
          ) : (
            <div className="text-center py-[70px]">
              <div className="text-[42px] mb-4">🔍</div>
              <h3 className="text-[22px] font-bold text-head mb-2">Aucun bien ne correspond</h3>
              <p className="text-muted max-w-[420px] mx-auto mb-5">Élargissez vos critères ou créez une alerte e-mail pour être prévenu·e des nouveautés.</p>
              <Link to="/alertes" className="inline-flex items-center gap-2 bg-navy text-white rounded-[12px] px-6 py-3.5 font-semibold hover:bg-navy-deep transition-colors">
                Créer une alerte →
              </Link>
            </div>
          )}
        </div>
      </section>
      <EstimationCTA />
    </main>
  );
}
```

- [ ] **Commit**

```bash
git add frontend/src/routes/biens/
git commit -m "feat(frontend): page Biens avec filtres + tri"
```

---

## Task 8 — Page Détail bien

**Files:**
- Create: `frontend/src/routes/biens/$slug.tsx`

- [ ] **Créer frontend/src/routes/biens/$slug.tsx**

```tsx
import { createFileRoute, Link, notFound } from '@tanstack/react-router';
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
      const { data, error } = await api.api.properties({ slug }).get();
      if (error || !data) throw new Error('Bien non trouvé');
      return data;
    },
  });

  const { data: similar = [] } = useQuery({
    queryKey: ['properties', { type: p?.type }],
    enabled: !!p,
    queryFn: async () => {
      const { data } = await api.api.properties.get({ query: { type: p!.type } });
      return (data ?? []).filter(x => x.id !== p!.id).slice(0, 3);
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
        {/* Title bar */}
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

        {/* Gallery */}
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

        {/* Spec row */}
        <div className="flex flex-wrap gap-6 justify-between py-6 border-b border-line mb-9">
          {p.land != null && <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-[10px] border border-line flex items-center justify-center text-navy">📐</div><div><span className="block text-muted text-[13px]">Surface terrain</span><b className="text-head text-[16px]">{p.land} m²</b></div></div>}
          {p.year != null && <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-[10px] border border-line flex items-center justify-center text-navy">📅</div><div><span className="block text-muted text-[13px]">Année de construction</span><b className="text-head text-[16px]">{p.year}</b></div></div>}
          {p.area != null && <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-[10px] border border-line flex items-center justify-center text-navy">📏</div><div><span className="block text-muted text-[13px]">Surface habitable</span><b className="text-head text-[16px]">{p.area} m²</b></div></div>}
          {p.beds != null && <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-[10px] border border-line flex items-center justify-center text-navy">🛏</div><div><span className="block text-muted text-[13px]">Chambres</span><b className="text-head text-[16px]">{p.beds}</b></div></div>}
          {p.rooms != null && <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-[10px] border border-line flex items-center justify-center text-navy">🏠</div><div><span className="block text-muted text-[13px]">Pièces</span><b className="text-head text-[16px]">{p.rooms}</b></div></div>}
        </div>

        {/* Two columns */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_372px] gap-12 items-start">
          <div>
            {/* Description */}
            <div className="mb-9">
              <h2 className="text-[22px] font-bold text-head mb-4">À propos</h2>
              <p className="text-[#54596b] leading-[1.7]">{p.description}</p>
              {!expand && p.features.length > 0 && (
                <button className="text-navy font-semibold text-[14.5px] underline mt-3" onClick={() => setExpand(true)}>Voir plus</button>
              )}
            </div>

            {/* Features */}
            {expand && p.features.length > 0 && (
              <div className="mb-9">
                <h3 className="text-[18px] font-bold text-head mb-4">Informations</h3>
                <ul className="columns-2 gap-10">
                  {p.features.map(f => (
                    <li key={f} className="flex items-center gap-2.5 text-[#54596b] text-[14.5px] py-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-navy flex-none" />{f}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* DPE */}
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

            {/* À proximité */}
            {p.near.length > 0 && (
              <div className="mb-9">
                <h3 className="text-[18px] font-bold text-head mb-4">À proximité</h3>
                <div className="grid grid-cols-2 gap-x-14 max-w-[560px]">
                  {p.near.map(n => (
                    <div key={n.label} className="flex justify-between border-b border-line py-2.5 text-[14.5px]">
                      <span className="text-muted">{n.label}</span><b className="text-head">{n.distance}</b>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
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

      {/* Biens similaires */}
      {similar.length > 0 && (
        <section className="py-[84px]">
          <div className="max-w-[1240px] mx-auto px-10">
            <h2 className="text-[clamp(24px,2.6vw,32px)] font-bold text-head mb-7">Biens similaires</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
              {similar.map(s => <PropertyCard key={s.id} property={s} />)}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
```

- [ ] **Commit**

```bash
git add frontend/src/routes/biens/\$slug.tsx
git commit -m "feat(frontend): page détail bien + galerie + DPE + formulaire visite"
```

---

## Task 9 — Pages Vendre, Agence, Contact, Calcul, Alertes

Ces pages suivent le même pattern. Le code est complet pour chacune.

**Files:**
- Create: `frontend/src/routes/vendre.tsx`
- Create: `frontend/src/routes/agence.tsx`
- Create: `frontend/src/routes/contact.tsx`
- Create: `frontend/src/routes/calcul.tsx`
- Create: `frontend/src/routes/alertes.tsx`

- [ ] **Créer frontend/src/routes/vendre.tsx**

```tsx
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
      {/* Hero */}
      <section className="relative min-h-[340px] flex items-center justify-center text-center overflow-hidden">
        <div className="ph absolute inset-0"><span className="ph-label absolute top-4 right-4">[ PHOTO — toits de Gisors ]</span></div>
        <div className="absolute inset-0 z-10" style={{ background: 'linear-gradient(180deg,rgba(255,255,255,.55),rgba(255,255,255,.78))' }} />
        <div className="relative z-20 py-[70px] px-5">
          <h1 className="text-[clamp(28px,3.4vw,40px)] font-bold text-head">Vendez votre bien en toute sérénité<br/>avec l'Agence Leblanc</h1>
          <p className="mt-3.5 text-muted text-[14.5px]">Accueil / <b className="text-head font-semibold">Vendre</b></p>
        </div>
      </section>

      {/* Benefits */}
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
```

- [ ] **Créer frontend/src/routes/agence.tsx**

```tsx
import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export const Route = createFileRoute('/agence')({ component: AgencePage });

function AgencePage() {
  const { data: team = [] } = useQuery({
    queryKey: ['team'],
    queryFn: async () => { const { data } = await api.api.team.get(); return data ?? []; },
  });

  return (
    <main className="fade-up">
      {/* Hero */}
      <section className="relative min-h-[340px] flex items-center justify-center text-center overflow-hidden">
        <div className="ph absolute inset-0"><span className="ph-label absolute top-4 right-4">[ PHOTO — clocher Gisors ]</span></div>
        <div className="absolute inset-0 z-10" style={{ background: 'linear-gradient(180deg,rgba(255,255,255,.55),rgba(255,255,255,.78))' }} />
        <div className="relative z-20 py-[70px] px-5">
          <h1 className="text-[clamp(28px,3.4vw,40px)] font-bold text-head">Une agence immobilière<br/>au cœur de Gisors</h1>
          <p className="mt-3.5 text-muted text-[14.5px]">Accueil / <b className="text-head font-semibold">L'agence</b></p>
        </div>
      </section>

      {/* Histoire */}
      <section className="py-[84px]">
        <div className="max-w-[1240px] mx-auto px-10 grid grid-cols-1 md:grid-cols-2 gap-14 items-center">
          <div className="ph min-h-[400px] rounded-[18px]"><span className="ph-label">[ PHOTO — façade agence ]</span></div>
          <div>
            <h2 className="text-[clamp(24px,2.8vw,34px)] font-bold text-head mb-4.5">Tout commence ici</h2>
            <p className="text-muted mb-4">C'est en 1926 que la famille Leblanc crée une agence immobilière spécialisée dans la location et la vente de biens. Cette entreprise familiale s'est rapidement fait un nom, prospérant au fil des années.</p>
            <p className="text-muted mb-4">Après la Seconde Guerre mondiale, l'agence a su ouvrir une extension dédiée à l'assurance. Grâce à cette évolution, elle a su répondre aux besoins changeants de ses clients.</p>
            <p className="text-muted">En 2018, Bruno Fressard reprend l'agence. C'est aujourd'hui une équipe de deux négociateurs et d'une secrétaire, avec un seul objectif : vous accompagner dans votre projet immobilier.</p>
          </div>
        </div>
      </section>

      {/* Big statement */}
      <section className="py-14">
        <div className="max-w-[1240px] mx-auto px-10">
          <p className="text-center text-[clamp(22px,2.8vw,32px)] font-bold text-head max-w-[880px] mx-auto leading-[1.35] tracking-[-0.01em]">
            Nous sommes là pour vous aider à réaliser vos rêves immobiliers, aujourd'hui et pour les générations à venir.
          </p>
        </div>
      </section>

      {/* Team */}
      <section className="py-[84px]">
        <div className="max-w-[1240px] mx-auto px-10">
          <div className="text-center max-w-[760px] mx-auto mb-13">
            <h2 className="text-[clamp(26px,3vw,38px)] font-bold text-head">Des professionnels au service de vos rêves</h2>
            <p className="text-muted mt-3.5">Une équipe locale, expérimentée et disponible.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6.5">
            {team.map(m => (
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

      {/* Coords */}
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
```

- [ ] **Créer frontend/src/routes/contact.tsx**

```tsx
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
            <div className="bg-sky rounded-[20px_0_0_20px] md:rounded-[20px_0_0_20px] rounded-b-none md:rounded-b-none p-12">
              <p className="text-[#42506f] mb-6.5">Accueil / <b className="text-head font-semibold">Contact</b></p>
              <h2 className="text-[clamp(26px,3vw,34px)] font-bold text-head mb-4.5">Nous contacter</h2>
              <p className="text-[clamp(20px,2.2vw,26px)] font-bold text-head leading-[1.3] mb-2.5">Votre rêve immobilier commence par un simple message.</p>
              <p className="text-[clamp(20px,2.2vw,26px)] font-bold text-head leading-[1.3]">Laissez-nous vous accompagner.</p>
              <div className="flex flex-col sm:flex-row gap-12 mt-9">
                <div><div className="font-bold text-head mb-2">Adresse</div><div className="text-[#42506f] text-[14.5px]">5 rue Dauphine<br/>27140 Gisors</div></div>
                <div><div className="font-bold text-head mb-2">Nous contacter</div><div className="text-[#42506f] text-[14.5px]">02 32 55 06 20<br/>b.leblanc@wanadoo.fr</div></div>
              </div>
            </div>
            <div className="bg-white rounded-[0_20px_20px_0] md:rounded-[0_20px_20px_0] rounded-t-none md:rounded-t-none p-12 shadow-[var(--shadow-card)]">
              <form onSubmit={e => { e.preventDefault(); mutation.mutate(); }}>
                <h3 className="text-[22px] font-bold text-head mb-6.5">Parlez-nous de votre projet immobilier</h3>
                <div className="mb-4.5">
                  <label className="block font-semibold text-[14.5px] text-head mb-2">Je souhaite <span className="text-coral">*</span></label>
                  <div className="flex flex-wrap gap-2 bg-white rounded-[10px]">
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
```

- [ ] **Créer frontend/src/routes/calcul.tsx**

```tsx
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
            {properties.slice(0, 3).map(p => <PropertyCard key={p.id} property={p} />)}
          </div>
        </div>
      </section>
    </main>
  );
}
```

- [ ] **Créer frontend/src/routes/alertes.tsx**

```tsx
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
```

- [ ] **Vérifier toutes les routes**

```bash
# Ouvrir chacune et vérifier le rendu :
# http://localhost:5173/vendre
# http://localhost:5173/agence
# http://localhost:5173/contact
# http://localhost:5173/calcul
# http://localhost:5173/alertes
```

- [ ] **Commit**

```bash
git add frontend/src/routes/vendre.tsx frontend/src/routes/agence.tsx frontend/src/routes/contact.tsx frontend/src/routes/calcul.tsx frontend/src/routes/alertes.tsx
git commit -m "feat(frontend): pages Vendre + Agence + Contact + Calcul + Alertes"
```

---

## Résumé Plan 2

À l'issue de ce plan :
- ✅ Frontend React + TanStack Router + TanStack Query opérationnel sur `:5173`
- ✅ 8 pages publiques avec données réelles depuis l'API
- ✅ Client Eden Treaty typesafe
- ✅ Tailwind v4 avec tokens de marque

**Suite → Plan 3 :** Admin back-office (login, CRUD biens avec upload photos, contacts, équipe).
