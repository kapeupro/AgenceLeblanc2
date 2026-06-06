import { Elysia, t } from 'elysia';
import { db } from '../db/client';
import { contactSubmissions } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import { authPlugin } from '../plugins/auth-plugin';

export const contactRoutes = new Elysia({ prefix: '/api/contact' })
  .use(authPlugin)
  .post('/', async ({ body }) => {
    const [row] = await db.insert(contactSubmissions).values(body).returning();
    return row;
  }, {
    body: t.Object({
      intent: t.Union([t.Literal('achat'), t.Literal('vente')]),
      name: t.String({ minLength: 2 }),
      email: t.String({ format: 'email' }),
      phone: t.Optional(t.String()),
      message: t.String({ minLength: 5 }),
    }),
  })
  .get('/', async ({ requireAdmin }) => {
    await requireAdmin();
    return db.select().from(contactSubmissions).orderBy(desc(contactSubmissions.createdAt));
  })
  .put('/:id/read', async ({ params, requireAdmin }) => {
    await requireAdmin();
    const [row] = await db.update(contactSubmissions)
      .set({ read: true })
      .where(eq(contactSubmissions.id, params.id))
      .returning();
    return row;
  });
