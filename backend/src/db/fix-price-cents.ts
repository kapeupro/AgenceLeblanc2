import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { sql as dsql } from 'drizzle-orm';
import * as schema from './schema';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

/**
 * Corrige les prix importés en EUROS vers la convention CENTS du projet.
 *
 * Le script d'import a stocké le prix brut en euros (ex: 573000) alors que
 * toute l'app (fromFormData ×100, fmtPrice /100) attend des centimes.
 * Résultat : un bien à 573 000 € s'affichait 5 730 €.
 *
 * GARDE-FOU : on ne multiplie ×100 que si la médiane des prix est < 50 000,
 * ce qui ne peut être vrai que si les prix sont encore en euros. Une fois
 * corrigés (centimes), la médiane dépasse largement ce seuil → relancer le
 * script est sans effet (idempotent).
 */
async function main() {
  const rows = await db.select({ id: schema.properties.id, price: schema.properties.price })
    .from(schema.properties);

  if (rows.length === 0) { console.log('Aucune annonce.'); process.exit(0); }

  const prices = rows.map(r => r.price).sort((a, b) => a - b);
  const median = prices[Math.floor(prices.length / 2)];
  console.log(`📊 ${rows.length} annonces — médiane actuelle: ${median} (${Math.round(median / 100)} € affiché)`);

  // Seuil : un prix immobilier réel en centimes est forcément >> 50 000 (= 500 €).
  // Si la médiane stockée est < 5 000 000 centimes, les valeurs sont en euros.
  const THRESHOLD = 5_000_000;
  if (median >= THRESHOLD) {
    console.log('✅ Prix déjà en centimes (médiane au-dessus du seuil). Rien à faire.');
    process.exit(0);
  }

  console.log('🔧 Prix détectés en euros → multiplication ×100 pour passer en centimes…');
  const res = await db.update(schema.properties).set({ price: dsql`${schema.properties.price} * 100` });
  console.log(`✅ Prix corrigés (×100) sur toutes les annonces.`);

  const after = await db.select({ price: schema.properties.price }).from(schema.properties);
  const ap = after.map(r => r.price).sort((a, b) => a - b);
  console.log(`📊 Nouvelle médiane: ${ap[Math.floor(ap.length / 2)]} (${Math.round(ap[Math.floor(ap.length / 2)] / 100).toLocaleString('fr-FR')} € affiché)`);
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
