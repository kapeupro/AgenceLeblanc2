import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { eq } from 'drizzle-orm';
import { join } from 'path';
import { randomUUID } from 'crypto';
import * as schema from './schema';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

const UPLOADS_DIR = join(import.meta.dir, '../../uploads');
const BASE_URL = 'https://www.agenceleblanc.fr';

const LISTING_URLS = [
  '6025-vente-maisons-proprietes-gisors-27140',
  '6050-vente-maisons-proprietes-gisors-27140',
  '6063-vente-maisons-proprietes-gisors-27140',
  '6065-vente-maisons-proprietes-gisors-27140',
  '6045-vente-maisons-proprietes-gisors-27140',
  '5992-vente-terrains-les-thilliers-en-vexin--27420',
  '6062-vente-maisons-proprietes-gisors-27140',
  '5933-vente-maisons-proprietes-gisors-27140',
  '6046-vente-maisons-proprietes-gisors-27140',
  '5241-vente-appartements-gisors-27140',
  '6041-vente-maisons-proprietes-magny-en-vexin-95420',
  '6015-vente-maisons-proprietes-gisors-27140',
  '5987-vente-maisons-proprietes-gisors-27140',
  '6049-vente-maisons-proprietes-gisors-27140',
  '6017-vente-maisons-proprietes-gisors-27140',
  '6024-vente-appartements-gisors-27140',
  '6054-vente-maisons-proprietes-gisors-27140',
  '6060-vente-maisons-proprietes-gisors-27140',
  '6001-vente-maisons-proprietes-gisors-27140',
  '6037-vente-maisons-proprietes-gisors-27140',
];

function slugify(text: string): string {
  return text.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function parseType(slug: string): schema.PropertyTypeEnum {
  if (slug.includes('appartement')) return 'appartement';
  if (slug.includes('terrain')) return 'terrain';
  if (slug.includes('local')) return 'local';
  if (slug.includes('immeuble')) return 'immeuble';
  if (slug.includes('cave')) return 'cave';
  return 'maison';
}

function extractNumber(text: string, pattern: RegExp): number | null {
  const m = text.match(pattern);
  return m ? parseInt(m[1].replace(/\s/g, ''), 10) : null;
}

function extractText(text: string, pattern: RegExp): string | null {
  const m = text.match(pattern);
  return m ? m[1].trim() : null;
}

async function scrapeProperty(slug: string) {
  const url = `${BASE_URL}/${slug}.html`;
  console.log(`\n📥 Scraping: ${slug}`);

  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' }
  });
  if (!res.ok) { console.log(`  ❌ HTTP ${res.status}`); return null; }

  // Decode as ISO-8859-1 (old PHP site)
  const buf = await res.arrayBuffer();
  const html = new TextDecoder('iso-8859-1').decode(buf);

  // Parse directly from HTML tags — data is in <strong>Label</strong>: Value<br>
  const field = (label: string) => {
    const re = new RegExp(`<strong>${label}</strong>\\s*:\\s*([^<\\n]+)`, 'i');
    return html.match(re)?.[1]?.trim() || null;
  };

  const ref = field('R.f.rence') || field('R&eacute;f&eacute;rence') || slug.split('-')[0];

  const priceStr = field('Prix');
  const priceRaw = priceStr ? parseInt(priceStr.replace(/\s/g, '').replace(/[^\d]/g, ''), 10) : 0;
  const price = priceRaw * 100;

  const cityRaw = field('Ville') || '';
  const city = cityRaw.charAt(0).toUpperCase() + cityRaw.slice(1).toLowerCase();

  const areaStr = field('Surface habitable m.²') || field('Surface habitable m&sup2;') || field('Surface habitable m²');
  const area = areaStr ? parseInt(areaStr.replace(/\s/g, ''), 10) : null;

  const landStr = field('Surface du terrain m.²') || field('Surface du terrain m&sup2;') || field('Surface du terrain m²');
  const land = landStr ? parseInt(landStr.replace(/\s/g, ''), 10) : null;

  const roomsStr = field('Nombre de pi.ces') || field('Nombre de pi&egrave;ces') || field('Nombre de pièces');
  const rooms = roomsStr ? parseInt(roomsStr, 10) : null;

  const bedsStr = field('Nombre de chambres');
  const beds = bedsStr ? parseInt(bedsStr, 10) : null;

  // DPE from image filename e.g. dpe-EC.jpg or dpe_D.jpg
  const dpeMatch = html.match(/dpe[_-]([A-G])[\._]/i);
  const dpeClass = dpeMatch ? dpeMatch[1].toUpperCase() : null;

  // Description between "Descriptif:" and "BILAN ÉNERGÉTIQUE" or "Tél.:"
  const descRe = /Descriptif\s*:\s*<\/strong>\s*([\s\S]+?)(?:BILAN|Tél|<aside|Les informations)/i;
  const descHtml = html.match(descRe)?.[1] || '';
  const description = descHtml
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 2000);

  // Photo URLs — full size from gallery links
  const photoUrls: string[] = [];
  const photoRe = /href="((?:https?:\/\/www\.agenceleblanc\.fr\/|\.\/)?images\/listing_photos\/[\w._-]+)"/g;
  let pm;
  while ((pm = photoRe.exec(html)) !== null) {
    const abs = pm[1].startsWith('http') ? pm[1] : `${BASE_URL}/${pm[1].replace('./', '')}`;
    if (!photoUrls.includes(abs)) photoUrls.push(abs);
  }

  const type = parseType(slug);
  const urlId = slug.split('-')[0];
  const citySlug = slugify(city || 'gisors');
  const uniqueSlug = `${citySlug}-${type}-${urlId}`;

  // Build title from type + surface + city
  const titleParts = [type.charAt(0).toUpperCase() + type.slice(1)];
  if (area) titleParts.push(`${area} m²`);
  titleParts.push(city || citySlug);
  const title = titleParts.join(' — ');

  console.log(`  📍 ${city || '?'} | ${type} | ${(price/100).toLocaleString('fr')}€ | ${area || '?'}m² | ${beds || '?'}ch | ${rooms || '?'}p | ${photoUrls.length} photos`);

  return {
    urlId, ref, slug: uniqueSlug, type, title,
    city: city || 'Gisors',
    price, area, land, rooms, beds,
    description,
    dpeClass: dpeClass as any || null,
    photoUrls,
  };
}

async function downloadPhoto(remoteUrl: string, localFilename: string): Promise<boolean> {
  try {
    const res = await fetch(remoteUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' }
    });
    if (!res.ok) return false;
    const buffer = await res.arrayBuffer();
    await Bun.write(join(UPLOADS_DIR, localFilename), buffer);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  console.log('🚀 Import depuis agenceleblanc.fr\n');

  // Clear existing seeded data
  console.log('🗑️  Suppression des données de seed...');
  await db.delete(schema.propertyPhotos);
  await db.delete(schema.properties);
  console.log('✅ Tables nettoyées\n');

  let imported = 0;
  let totalPhotos = 0;

  for (const slug of LISTING_URLS) {
    const data = await scrapeProperty(slug);
    if (!data) continue;

    // Make slug unique if collision
    let finalSlug = data.slug;
    const existing = await db.select({ id: schema.properties.id })
      .from(schema.properties)
      .where(eq(schema.properties.slug, finalSlug))
      .limit(1).catch(() => []);
    if (existing.length > 0) finalSlug = `${finalSlug}-${data.urlId}`;

    // Insert property
    const [property] = await db.insert(schema.properties).values({
      id: randomUUID(),
      slug: finalSlug,
      type: data.type,
      title: data.title,
      city: data.city,
      price: data.price,
      status: 'a_vendre',
      exclusive: false,
      description: data.description,
      features: [],
      near: [],
      area: data.area,
      land: data.land,
      rooms: data.rooms,
      beds: data.beds,
      dpeClass: data.dpeClass,
    }).returning();

    // Download + insert photos
    let position = 0;
    for (const photoUrl of data.photoUrls) {
      const ext = photoUrl.split('.').pop() || 'jpg';
      const filename = `${randomUUID()}.${ext}`;
      const ok = await downloadPhoto(photoUrl, filename);
      if (ok) {
        await db.insert(schema.propertyPhotos).values({
          id: randomUUID(),
          propertyId: property.id,
          url: `/uploads/${filename}`,
          position: position++,
        });
        totalPhotos++;
        process.stdout.write('.');
      }
      await new Promise(r => setTimeout(r, 150)); // polite delay
    }

    console.log(`\n  ✅ Importé: "${property.title}" (${position} photos)`);
    imported++;
    await new Promise(r => setTimeout(r, 300));
  }

  console.log(`\n\n🎉 Import terminé: ${imported} annonces, ${totalPhotos} photos`);
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
