import { Elysia, t } from 'elysia';
import { db } from '../db/client';
import { properties, propertyPhotos, teamMembers } from '../db/schema';
import { eq, and, lte, ilike, or, desc, asc } from 'drizzle-orm';
import { authPlugin } from '../plugins/auth-plugin';

async function withPhotosAndAgent(rows: (typeof properties.$inferSelect)[]) {
  if (!rows.length) return [];
  const ids = rows.map(r => r.id);
  const photos = await db.select().from(propertyPhotos)
    .where(ids.length === 1
      ? eq(propertyPhotos.propertyId, ids[0])
      : undefined
    ).orderBy(asc(propertyPhotos.position));

  const agentIds = [...new Set(rows.map(r => r.agentId).filter(Boolean))] as string[];
  const agents = agentIds.length
    ? await db.select().from(teamMembers).where(
        agentIds.length === 1
          ? eq(teamMembers.id, agentIds[0])
          : undefined
      )
    : [];

  return rows.map(r => ({
    ...r,
    price: r.price,
    near: r.near as { label: string; distance: string }[],
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
    photos: photos.filter(p => p.propertyId === r.id),
    agent: agents.find(a => a.id === r.agentId) ?? null,
  }));
}

export const propertiesRoutes = new Elysia({ prefix: '/api/properties' })
  .use(authPlugin)

  .get('/', async ({ query }) => {
    const { type, maxPrice, q, sort } = query;
    let base = db.select().from(properties).$dynamic();

    const conditions = [];
    if (type) conditions.push(eq(properties.type, type as any));
    if (maxPrice) conditions.push(lte(properties.price, Number(maxPrice)));
    if (q) conditions.push(or(
      ilike(properties.title, `%${q}%`),
      ilike(properties.city, `%${q}%`)
    ));
    if (conditions.length) base = base.where(and(...conditions));

    if (sort === 'asc') base = base.orderBy(asc(properties.price));
    else if (sort === 'desc') base = base.orderBy(desc(properties.price));
    else base = base.orderBy(desc(properties.createdAt));

    const rows = await base;
    return withPhotosAndAgent(rows);
  }, {
    query: t.Object({
      type: t.Optional(t.String()),
      maxPrice: t.Optional(t.String()),
      q: t.Optional(t.String()),
      sort: t.Optional(t.String()),
    }),
  })

  .get('/:id', async ({ params, set }) => {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.id);
    const [row] = await db.select().from(properties)
      .where(isUuid ? eq(properties.id, params.id) : eq(properties.slug, params.id));
    if (!row) { set.status = 404; return { error: 'Bien non trouvé' }; }
    const [result] = await withPhotosAndAgent([row]);
    return result;
  })

  .post('/', async ({ body, requireAdmin }) => {
    await requireAdmin();
    const [row] = await db.insert(properties).values({
      slug: body.slug,
      type: body.type as any,
      title: body.title,
      city: body.city,
      price: body.price,
      status: (body.status ?? 'a_vendre') as any,
      exclusive: body.exclusive ?? false,
      description: body.description ?? null,
      features: body.features ?? [],
      near: body.near ?? [],
      beds: body.beds ?? null,
      rooms: body.rooms ?? null,
      area: body.area ?? null,
      land: body.land ?? null,
      year: body.year ?? null,
      heat: body.heat ?? null,
      dpeValue: body.dpeValue ?? null,
      dpeClass: (body.dpeClass ?? null) as any,
      gesValue: body.gesValue ?? null,
      gesClass: (body.gesClass ?? null) as any,
      energyCost: body.energyCost ?? null,
      hasVideo: body.hasVideo ?? false,
      hasTour: body.hasTour ?? false,
      agentId: body.agentId ?? null,
      updatedAt: new Date(),
    }).returning();
    const [result] = await withPhotosAndAgent([row]);
    return result;
  }, { body: t.Object({
    slug: t.String(), type: t.String(), title: t.String(), city: t.String(),
    price: t.Number(), status: t.Optional(t.String()),
    exclusive: t.Optional(t.Boolean()), description: t.Optional(t.Nullable(t.String())),
    features: t.Optional(t.Array(t.String())), near: t.Optional(t.Array(t.Any())),
    beds: t.Optional(t.Nullable(t.Number())), rooms: t.Optional(t.Nullable(t.Number())),
    area: t.Optional(t.Nullable(t.Number())), land: t.Optional(t.Nullable(t.Number())),
    year: t.Optional(t.Nullable(t.Number())), heat: t.Optional(t.Nullable(t.String())),
    dpeValue: t.Optional(t.Nullable(t.Number())), dpeClass: t.Optional(t.Nullable(t.String())),
    gesValue: t.Optional(t.Nullable(t.Number())), gesClass: t.Optional(t.Nullable(t.String())),
    energyCost: t.Optional(t.Nullable(t.String())),
    hasVideo: t.Optional(t.Boolean()), hasTour: t.Optional(t.Boolean()),
    agentId: t.Optional(t.Nullable(t.String())),
  })})

  .put('/:id', async ({ params, body, requireAdmin, set }) => {
    await requireAdmin();
    const [row] = await db.update(properties)
      .set({ ...body, updatedAt: new Date() } as any)
      .where(eq(properties.id, params.id))
      .returning();
    if (!row) { set.status = 404; return { error: 'Bien non trouvé' }; }
    const [result] = await withPhotosAndAgent([row]);
    return result;
  }, { body: t.Object({
    title: t.Optional(t.String()), city: t.Optional(t.String()),
    price: t.Optional(t.Number()), status: t.Optional(t.String()),
    exclusive: t.Optional(t.Boolean()), description: t.Optional(t.Nullable(t.String())),
    features: t.Optional(t.Array(t.String())), near: t.Optional(t.Array(t.Any())),
    beds: t.Optional(t.Nullable(t.Number())), rooms: t.Optional(t.Nullable(t.Number())),
    area: t.Optional(t.Nullable(t.Number())), land: t.Optional(t.Nullable(t.Number())),
    year: t.Optional(t.Nullable(t.Number())), heat: t.Optional(t.Nullable(t.String())),
    dpeValue: t.Optional(t.Nullable(t.Number())), dpeClass: t.Optional(t.Nullable(t.String())),
    gesValue: t.Optional(t.Nullable(t.Number())), gesClass: t.Optional(t.Nullable(t.String())),
    energyCost: t.Optional(t.Nullable(t.String())),
    hasVideo: t.Optional(t.Boolean()), hasTour: t.Optional(t.Boolean()),
    agentId: t.Optional(t.Nullable(t.String())),
  })})

  .delete('/:id', async ({ params, requireAdmin, set }) => {
    await requireAdmin();
    const [deleted] = await db.delete(properties)
      .where(eq(properties.id, params.id))
      .returning();
    if (!deleted) { set.status = 404; return { error: 'Bien non trouvé' }; }
    return { ok: true };
  });
