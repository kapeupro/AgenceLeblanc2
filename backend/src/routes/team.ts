import { Elysia, t } from 'elysia';
import { db } from '../db/client';
import { teamMembers } from '../db/schema';
import { eq, asc } from 'drizzle-orm';
import { authPlugin } from '../plugins/auth-plugin';

export const teamRoutes = new Elysia({ prefix: '/api/team' })
  .use(authPlugin)
  .get('/', () => db.select().from(teamMembers).orderBy(asc(teamMembers.displayOrder)))
  .post('/', async ({ body, requireAdmin }) => {
    await requireAdmin();
    const [row] = await db.insert(teamMembers).values(body).returning();
    return row;
  }, {
    body: t.Object({
      name: t.String(), role: t.String(),
      photoUrl: t.Optional(t.Nullable(t.String())),
      displayOrder: t.Optional(t.Number()),
    }),
  })
  .put('/:id', async ({ params, body, requireAdmin }) => {
    await requireAdmin();
    const [row] = await db.update(teamMembers).set(body)
      .where(eq(teamMembers.id, params.id)).returning();
    return row;
  }, {
    body: t.Object({
      name: t.Optional(t.String()), role: t.Optional(t.String()),
      photoUrl: t.Optional(t.Nullable(t.String())),
      displayOrder: t.Optional(t.Number()),
    }),
  })
  .delete('/:id', async ({ params, requireAdmin }) => {
    await requireAdmin();
    await db.delete(teamMembers).where(eq(teamMembers.id, params.id));
    return { ok: true };
  });
