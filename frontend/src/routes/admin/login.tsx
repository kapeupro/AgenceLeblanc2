import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { api } from '../../lib/api';

export const Route = createFileRoute('/admin/login')({ component: LoginPage });

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    const { data, error: err } = await api.api.auth.login.post({ email, password });
    setLoading(false);
    if (err || !(data as any)?.ok) { setError('Email ou mot de passe incorrect'); return; }
    navigate({ to: '/admin' });
  };

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center p-6">
      <div className="bg-white rounded-[20px] p-10 w-full max-w-[420px] shadow-[var(--shadow-card)]">
        <div className="text-center mb-8">
          <div className="font-display text-navy text-[28px] uppercase tracking-[.02em]">Agence Leblanc</div>
          <div className="text-muted mt-1.5 text-[15px]">Espace administration</div>
        </div>
        <form onSubmit={submit}>
          <div className="mb-4.5">
            <label className="block font-semibold text-[14.5px] text-head mb-2">Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
              className="w-full border border-[#dfe3ec] rounded-[12px] px-4 py-3.5 text-[15px] focus:outline-none focus:border-navy" />
          </div>
          <div className="mb-6">
            <label className="block font-semibold text-[14.5px] text-head mb-2">Mot de passe</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
              className="w-full border border-[#dfe3ec] rounded-[12px] px-4 py-3.5 text-[15px] focus:outline-none focus:border-navy" />
          </div>
          {error && <p className="text-coral text-[14px] mb-4 text-center font-medium">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-navy text-white rounded-[12px] py-4 font-semibold text-[15px] hover:bg-navy-deep transition-colors disabled:opacity-60">
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
}
