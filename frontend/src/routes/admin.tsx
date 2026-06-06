import { createFileRoute, Outlet, redirect, Link, useNavigate, useRouterState } from '@tanstack/react-router';
import { api } from '../lib/api';

export const Route = createFileRoute('/admin')({
  beforeLoad: async ({ location }) => {
    if (location.pathname === '/admin/login') return;
    try {
      const { data } = await api.api.auth.me.get();
      if (!data || (data as any).error) {
        throw redirect({ to: '/admin/login', search: { redirect: location.pathname } });
      }
    } catch (e: any) {
      if (e?.isRedirect) throw e;
      throw redirect({ to: '/admin/login', search: { redirect: location.pathname } });
    }
  },
  component: AdminLayout,
});

const NAV = [
  { to: '/admin/', label: '📊 Dashboard', exact: true },
  { to: '/admin/biens', label: '🏠 Annonces', exact: false },
  { to: '/admin/contacts', label: '✉️ Messages', exact: false },
  { to: '/admin/equipe', label: '👥 Équipe', exact: false },
  { to: '/admin/parametres', label: '⚙️ Paramètres', exact: false },
];

function AdminLayout() {
  const navigate = useNavigate();
  const { location } = useRouterState();

  const logout = async () => {
    await api.api.auth.logout.post();
    navigate({ to: '/admin/login' });
  };

  return (
    <div className="min-h-screen flex bg-gray-bg font-sans">
      <aside className="w-[240px] bg-navy flex-none flex flex-col py-8 px-5">
        <div className="mb-10 px-2">
          <div className="font-display text-white text-[20px] uppercase tracking-[.02em]">Agence Leblanc</div>
          <div className="text-[#8ea0cf] text-[12px] mt-0.5">Administration</div>
        </div>
        <nav className="flex-1 flex flex-col gap-1">
          {NAV.map(item => (
            <Link key={item.to} to={item.to}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-[10px] text-[14.5px] font-medium transition-colors
                ${(item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to))
                  ? 'bg-white/15 text-white' : 'text-[#8ea0cf] hover:text-white hover:bg-white/10'}`}>
              {item.label}
            </Link>
          ))}
        </nav>
        <button onClick={logout} className="text-[#8ea0cf] hover:text-white text-[14px] font-medium px-3.5 py-2.5 text-left transition-colors">
          ← Déconnexion
        </button>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-line px-8 py-4 flex items-center justify-between">
          <h1 className="text-[18px] font-bold text-head">
            {NAV.find(n => n.exact ? location.pathname === n.to : location.pathname.startsWith(n.to))?.label ?? 'Admin'}
          </h1>
          <Link to="/" className="text-navy text-[14px] font-medium hover:underline">← Voir le site</Link>
        </header>
        <main className="flex-1 p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
