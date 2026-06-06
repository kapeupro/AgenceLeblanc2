import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { asc } from 'drizzle-orm';
import { join } from 'path';
import * as schema from './schema';

const db = drizzle(neon(process.env.DATABASE_URL!), { schema });
const DATA_DIR = join(import.meta.dir, '../../../data');

/**
 * Exporte toutes les annonces (+ leurs photos) de la base Neon vers
 * data/annonces.json et data/annonces.csv.
 *
 * Source de vérité = la base. Les prix sont stockés en CENTIMES ;
 * on expose aussi `priceEuros` pour lever toute ambiguïté côté consommateur
 * (hipposaas.cloud) et éviter qu'un import refasse une division par 100.
 */
function csvCell(v: unknown): string {
  const s = v == null ? '' : String(v);
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

async function main() {
  const rawProps = await db.select().from(schema.properties)
    .orderBy(asc(schema.properties.city), asc(schema.properties.price));
  const allPhotos = await db.select().from(schema.propertyPhotos)
    .orderBy(asc(schema.propertyPhotos.position));

  const photosByProp = new Map<string, typeof allPhotos>();
  for (const ph of allPhotos) {
    const arr = photosByProp.get(ph.propertyId) ?? [];
    arr.push(ph);
    photosByProp.set(ph.propertyId, arr);
  }
  const props = rawProps.map(p => ({ ...p, photos: photosByProp.get(p.id) ?? [] }));

  // JSON : objet complet + priceEuros dérivé pour clarté
  const json = props.map(p => ({
    ...p,
    priceEuros: Math.round(p.price / 100),
    photoUrls: p.photos.map(ph => ph.url),
  }));
  await Bun.write(join(DATA_DIR, 'annonces.json'), JSON.stringify(json, null, 2));

  // CSV : colonnes plates + photos séparées par |
  const cols = ['slug', 'type', 'title', 'city', 'priceEuros', 'priceCents', 'status',
    'area', 'land', 'rooms', 'beds', 'dpeClass', 'photoCount', 'photoUrls'];
  const lines = [cols.join(',')];
  for (const p of props) {
    lines.push([
      p.slug, p.type, p.title, p.city,
      Math.round(p.price / 100), p.price, p.status,
      p.area, p.land, p.rooms, p.beds, p.dpeClass,
      p.photos.length, p.photos.map(ph => ph.url).join('|'),
    ].map(csvCell).join(','));
  }
  await Bun.write(join(DATA_DIR, 'annonces.csv'), lines.join('\n') + '\n');

  const totalPhotos = props.reduce((n, p) => n + p.photos.length, 0);
  console.log(`✅ Export: ${props.length} annonces, ${totalPhotos} photos`);
  console.log(`   → data/annonces.json (${json.length} objets, prix en centimes + priceEuros)`);
  console.log(`   → data/annonces.csv  (priceEuros + priceCents)`);
  const sample = props[0];
  if (sample) console.log(`   ex: ${sample.title} — ${Math.round(sample.price / 100).toLocaleString('fr-FR')} €`);
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
