import { Elysia, t } from 'elysia';
import { db } from '../db/client';
import { siteSettings } from '../db/schema';
import { eq } from 'drizzle-orm';
import { authPlugin } from '../plugins/auth-plugin';

export const settingsRoutes = new Elysia({ prefix: '/api' })
  .use(authPlugin)

  .get('/settings', async () => {
    const rows = await db.select().from(siteSettings);
    return Object.fromEntries(rows.map(r => [r.key, r.value]));
  })

  .put('/settings/:key', async ({ params, body, requireAdmin, set }) => {
    await requireAdmin();
    const [row] = await db
      .insert(siteSettings).values({ key: params.key, value: body.value })
      .onConflictDoUpdate({ target: siteSettings.key, set: { value: body.value } })
      .returning();
    if (!row) { set.status = 404; return { error: 'Clé inconnue' }; }
    return row;
  }, {
    body: t.Object({ value: t.String() }),
  });
