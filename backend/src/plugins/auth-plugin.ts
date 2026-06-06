import { Elysia } from 'elysia';
import { jwt } from '@elysiajs/jwt';

export const authPlugin = new Elysia({ name: 'auth-plugin' })
  .use(jwt({ name: 'jwt', secret: process.env.JWT_SECRET! }))
  .derive({ as: 'scoped' }, async ({ jwt, cookie: { auth }, set }) => {
    return {
      async requireAdmin() {
        const payload = await jwt.verify(auth.value as string);
        if (!payload) {
          set.status = 401;
          throw new Error('Non autorisé');
        }
        return payload as { id: string; email: string };
      },
    };
  });
