import { Elysia, t } from 'elysia';
import { jwt } from '@elysiajs/jwt';
import { compare } from 'bcryptjs';
import { db } from '../db/client';
import { adminUsers } from '../db/schema';
import { eq } from 'drizzle-orm';

export const authRoutes = new Elysia({ prefix: '/api/auth' })
  .use(jwt({ name: 'jwt', secret: process.env.JWT_SECRET! }))
  .post('/login', async ({ jwt, body, cookie: { auth }, set }) => {
    const { email, password } = body;
    const [user] = await db.select().from(adminUsers).where(eq(adminUsers.email, email));
    if (!user || !(await compare(password, user.passwordHash))) {
      set.status = 401;
      return { error: 'Email ou mot de passe incorrect' };
    }
    const token = await jwt.sign({ id: user.id, email: user.email });
    auth.set({ value: token, httpOnly: true, sameSite: 'strict', maxAge: 7 * 24 * 60 * 60, path: '/' });
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
