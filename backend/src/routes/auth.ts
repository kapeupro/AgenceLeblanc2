import { Elysia, t } from 'elysia';
import { jwt } from '@elysiajs/jwt';
import { compare } from 'bcryptjs';
import { db } from '../db/client';
import { adminUsers } from '../db/schema';
import { eq } from 'drizzle-orm';

const IS_PROD = process.env.NODE_ENV === 'production';

/**
 * Rate-limiter en mémoire pour /login : bloque une clé (IP) après trop d'échecs
 * sur une fenêtre glissante. Suffisant pour un backend Bun mono-process ;
 * à remplacer par un store partagé (Redis) si l'app est répliquée.
 */
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 min
const attempts = new Map<string, { count: number; first: number }>();

function rateState(key: string) {
  const now = Date.now();
  const rec = attempts.get(key);
  if (!rec || now - rec.first > WINDOW_MS) return { blocked: false, retryAfter: 0 };
  if (rec.count >= MAX_ATTEMPTS) {
    return { blocked: true, retryAfter: Math.ceil((WINDOW_MS - (now - rec.first)) / 1000) };
  }
  return { blocked: false, retryAfter: 0 };
}

function recordFailure(key: string) {
  const now = Date.now();
  const rec = attempts.get(key);
  if (!rec || now - rec.first > WINDOW_MS) attempts.set(key, { count: 1, first: now });
  else rec.count++;
}

export const authRoutes = new Elysia({ prefix: '/api/auth' })
  .use(jwt({ name: 'jwt', secret: process.env.JWT_SECRET! }))
  .post('/login', async ({ jwt, body, cookie: { auth }, set, request, server }) => {
    const ip = server?.requestIP(request)?.address
      ?? request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      ?? 'unknown';

    const state = rateState(ip);
    if (state.blocked) {
      set.status = 429;
      set.headers['retry-after'] = String(state.retryAfter);
      return { error: `Trop de tentatives. Réessayez dans ${Math.ceil(state.retryAfter / 60)} min.` };
    }

    const { email, password } = body;
    const [user] = await db.select().from(adminUsers).where(eq(adminUsers.email, email));
    if (!user || !(await compare(password, user.passwordHash))) {
      recordFailure(ip);
      set.status = 401;
      return { error: 'Email ou mot de passe incorrect' };
    }
    attempts.delete(ip); // succès → on remet le compteur à zéro
    const token = await jwt.sign({ id: user.id, email: user.email });
    auth.set({ value: token, httpOnly: true, secure: IS_PROD, sameSite: 'strict', maxAge: 7 * 24 * 60 * 60, path: '/' });
    return { ok: true };
  }, {
    body: t.Object({ email: t.String(), password: t.String() }),
  })
  .post('/logout', ({ cookie: { auth } }) => {
    auth.remove();
    return { ok: true };
  })
  .get('/me', async ({ jwt, cookie: { auth }, set }) => {
    const payload = await jwt.verify(auth.value as string);
    if (!payload) { set.status = 401; return { error: 'Non autorisé' }; }
    return { id: (payload as any).id, email: (payload as any).email };
  });
