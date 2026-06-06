import { Elysia, t } from 'elysia';
import { db } from '../db/client';
import { alertSubscriptions } from '../db/schema';

export const alertsRoutes = new Elysia({ prefix: '/api/alerts' })
  .post('/', async ({ body }) => {
    const [row] = await db.insert(alertSubscriptions).values({
      name: body.name,
      email: body.email,
      phone: body.phone ?? null,
      type: body.type ?? null,
      city: body.city,
      priceMax: body.priceMax ?? null,
      rooms: body.rooms ?? null,
      beds: body.beds ?? null,
      areaMin: body.areaMin ?? null,
      duration: body.duration,
    }).returning();
    return row;
  }, {
    body: t.Object({
      name: t.String({ minLength: 2 }),
      email: t.String({ format: 'email' }),
      phone: t.Optional(t.String()),
      type: t.Optional(t.String()),
      city: t.String({ minLength: 2 }),
      priceMax: t.Optional(t.Number()),
      rooms: t.Optional(t.Number()),
      beds: t.Optional(t.Number()),
      areaMin: t.Optional(t.Number()),
      duration: t.String(),
    }),
  });
