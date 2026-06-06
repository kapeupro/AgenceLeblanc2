import { Elysia, t } from 'elysia';
import { authPlugin } from '../plugins/auth-plugin';
import { propertyPhotos } from '../db/schema';
import { db } from '../db/client';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { join } from 'path';
import { unlink } from 'fs/promises';

const UPLOADS_DIR = join(import.meta.dir, '../../uploads');
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 10 * 1024 * 1024;

export const uploadRoutes = new Elysia({ prefix: '/api' })
  .use(authPlugin)

  .post('/upload', async ({ body, requireAdmin, set }) => {
    await requireAdmin();
    const file = body.file as File;
    if (!ALLOWED_TYPES.includes(file.type)) {
      set.status = 400;
      return { error: 'Type de fichier non supporté (jpeg, png, webp uniquement)' };
    }
    if (file.size > MAX_SIZE) {
      set.status = 400;
      return { error: 'Fichier trop volumineux (max 10 MB)' };
    }
    const ext = file.type.split('/')[1].replace('jpeg', 'jpg');
    const filename = `${randomUUID()}.${ext}`;
    await Bun.write(join(UPLOADS_DIR, filename), file);
    return { url: `/uploads/${filename}` };
  }, {
    body: t.Object({ file: t.File() }),
  })

  .post('/properties/:id/photos', async ({ params, body, requireAdmin }) => {
    await requireAdmin();
    const [photo] = await db.insert(propertyPhotos).values({
      propertyId: params.id,
      url: body.url,
      caption: body.caption ?? null,
      position: body.position ?? 0,
    }).returning();
    return photo;
  }, {
    body: t.Object({
      url: t.String(),
      caption: t.Optional(t.Nullable(t.String())),
      position: t.Optional(t.Number()),
    }),
  })

  .delete('/upload/:filename', async ({ params, requireAdmin, set }) => {
    await requireAdmin();
    const safeName = params.filename.replace(/[^a-zA-Z0-9._-]/g, '');
    try {
      await unlink(join(UPLOADS_DIR, safeName));
      return { ok: true };
    } catch {
      set.status = 404;
      return { error: 'Fichier non trouvé' };
    }
  })

  .delete('/photos/:id', async ({ params, requireAdmin, set }) => {
    await requireAdmin();
    const [deleted] = await db.delete(propertyPhotos)
      .where(eq(propertyPhotos.id, params.id))
      .returning();
    if (!deleted) { set.status = 404; return { error: 'Photo non trouvée' }; }
    return { ok: true };
  });
