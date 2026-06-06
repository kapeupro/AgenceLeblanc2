import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

await sql`CREATE TABLE IF NOT EXISTS site_settings (key text PRIMARY KEY, value text NOT NULL DEFAULT '')`;
await sql`
  INSERT INTO site_settings (key, value) VALUES
    ('hero_home', ''),
    ('hero_agence', ''),
    ('photo_facade', ''),
    ('phone', '02 32 55 06 20'),
    ('email', 'b.leblanc@wanadoo.fr'),
    ('address', '5 rue Dauphine, 27140 Gisors'),
    ('hours', '9h-12h / 14h-19h · Lundi au samedi')
  ON CONFLICT (key) DO NOTHING
`;
console.log('✅ site_settings créé');
process.exit(0);
