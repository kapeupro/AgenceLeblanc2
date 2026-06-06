# Agence Leblanc — Plan 1 : Monorepo + Backend

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Créer le monorepo Bun, les types partagés, et l'API ElysiaJS complète avec Drizzle + Neon (auth JWT, properties CRUD, upload photos, contact, alertes, équipe).

**Architecture:** Bun workspaces avec trois packages (`shared`, `backend`, `frontend`). Le backend ElysiaJS expose son type `App` pour Eden Treaty. Auth via JWT en cookie httpOnly. Photos sauvegardées dans `backend/uploads/` et servies en statique.

**Tech Stack:** Bun 1.x, ElysiaJS 1.x, `@elysiajs/jwt`, `@elysiajs/cors`, `@elysiajs/static`, Drizzle ORM 0.30+, `@neondatabase/serverless`, bcryptjs, TypeScript 5.

---

## Fichiers créés par ce plan

```
agence-leblanc/
├── package.json                          ← workspace root
├── .env.example
├── shared/
│   ├── package.json
│   └── types.ts                          ← types partagés front+back
├── backend/
│   ├── package.json
│   ├── drizzle.config.ts
│   ├── uploads/                          ← photos (gitignored)
│   └── src/
│       ├── index.ts                      ← app Elysia + export type App
│       ├── db/
│       │   ├── schema.ts                 ← tables Drizzle
│       │   ├── client.ts                 ← connexion Neon
│       │   ├── migrate.ts                ← script de migration
│       │   └── seed.ts                   ← seed des 9 annonces prototype
│       ├── plugins/
│       │   ├── auth-plugin.ts            ← JWT cookie plugin
│       │   └── upload-plugin.ts          ← multipart + save file
│       └── routes/
│           ├── auth.ts                   ← POST /login /logout GET /me
│           ├── properties.ts             ← GET list/detail + CRUD admin
│           ├── upload.ts                 ← POST /upload DELETE /upload/:name
│           ├── contact.ts                ← POST /contact
│           ├── alerts.ts                 ← POST /alerts
│           └── team.ts                   ← GET + CRUD admin
```

---

## Task 1 — Monorepo Bun workspaces

**Files:**
- Create: `package.json`
- Create: `.gitignore`
- Create: `.env.example`

- [ ] **Créer le workspace root**

```json
// package.json
{
  "name": "agence-leblanc",
  "private": true,
  "workspaces": ["shared", "backend", "frontend"],
  "scripts": {
    "dev:backend": "bun run --cwd backend dev",
    "dev:frontend": "bun run --cwd frontend dev",
    "db:generate": "bun run --cwd backend db:generate",
    "db:migrate": "bun run --cwd backend db:migrate",
    "db:seed": "bun run --cwd backend db:seed"
  }
}
```

- [ ] **Créer .gitignore**

```
node_modules/
.env
backend/uploads/*
!backend/uploads/.gitkeep
dist/
.superpowers/
```

- [ ] **Créer .env.example**

```
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require
JWT_SECRET=change-me-min-32-chars-random-string
ADMIN_EMAIL=admin@agence-leblanc.fr
ADMIN_PASSWORD=changeme
PORT=3001
```

- [ ] **Créer backend/uploads/.gitkeep**

```bash
mkdir -p backend/uploads && touch backend/uploads/.gitkeep
```

- [ ] **Commit**

```bash
git add package.json .gitignore .env.example backend/uploads/.gitkeep
git commit -m "chore: init monorepo bun workspaces"
```

---

## Task 2 — Package shared (types TypeScript)

**Files:**
- Create: `shared/package.json`
- Create: `shared/types.ts`

- [ ] **Créer shared/package.json**

```json
{
  "name": "shared",
  "version": "0.0.1",
  "main": "./types.ts",
  "types": "./types.ts"
}
```

- [ ] **Créer shared/types.ts**

```typescript
export type PropertyType = 'maison' | 'appartement' | 'terrain' | 'local' | 'immeuble' | 'cave';
export type PropertyStatus = 'a_vendre' | 'vendu' | 'sous_compromis';
export type DpeClass = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
export type ContactIntent = 'achat' | 'vente';

export interface PropertyPhoto {
  id: string;
  propertyId: string;
  url: string;
  caption: string | null;
  position: number;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  photoUrl: string | null;
  displayOrder: number;
}

export interface Property {
  id: string;
  slug: string;
  type: PropertyType;
  title: string;
  city: string;
  price: number;           // centimes
  status: PropertyStatus;
  exclusive: boolean;
  description: string | null;
  features: string[];
  near: { label: string; distance: string }[];
  beds: number | null;
  rooms: number | null;
  area: number | null;
  land: number | null;
  year: number | null;
  heat: string | null;
  dpeValue: number | null;
  dpeClass: DpeClass | null;
  gesValue: number | null;
  gesClass: DpeClass | null;
  energyCost: string | null;
  hasVideo: boolean;
  hasTour: boolean;
  agentId: string | null;
  createdAt: string;
  updatedAt: string;
  photos: PropertyPhoto[];
  agent: TeamMember | null;
}

export interface ContactSubmission {
  id: string;
  intent: ContactIntent;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface AlertSubscription {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  type: string | null;
  city: string;
  priceMax: number | null;
  rooms: number | null;
  beds: number | null;
  areaMin: number | null;
  duration: string;
  createdAt: string;
}

// Payloads API
export interface CreatePropertyInput {
  slug: string;
  type: PropertyType;
  title: string;
  city: string;
  price: number;
  status: PropertyStatus;
  exclusive: boolean;
  description: string | null;
  features: string[];
  near: { label: string; distance: string }[];
  beds: number | null;
  rooms: number | null;
  area: number | null;
  land: number | null;
  year: number | null;
  heat: string | null;
  dpeValue: number | null;
  dpeClass: DpeClass | null;
  gesValue: number | null;
  gesClass: DpeClass | null;
  energyCost: string | null;
  hasVideo: boolean;
  hasTour: boolean;
  agentId: string | null;
}

export type UpdatePropertyInput = Partial<CreatePropertyInput>;

export interface ContactInput {
  intent: ContactIntent;
  name: string;
  email: string;
  phone?: string;
  message: string;
}

export interface AlertInput {
  name: string;
  email: string;
  phone?: string;
  type?: string;
  city: string;
  priceMax?: number;
  rooms?: number;
  beds?: number;
  areaMin?: number;
  duration: string;
}
```

- [ ] **Commit**

```bash
git add shared/
git commit -m "feat(shared): types TypeScript partagés"
```

---

## Task 3 — Backend : package.json + drizzle.config.ts

**Files:**
- Create: `backend/package.json`
- Create: `backend/drizzle.config.ts`
- Create: `backend/tsconfig.json`

- [ ] **Créer backend/package.json**

```json
{
  "name": "backend",
  "version": "0.0.1",
  "scripts": {
    "dev": "bun run --hot src/index.ts",
    "start": "bun run src/index.ts",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "bun run src/db/migrate.ts",
    "db:seed": "bun run src/db/seed.ts"
  },
  "dependencies": {
    "elysia": "^1.0.27",
    "@elysiajs/cors": "^1.0.3",
    "@elysiajs/jwt": "^1.0.2",
    "@elysiajs/static": "^1.0.3",
    "drizzle-orm": "^0.30.10",
    "@neondatabase/serverless": "^0.9.3",
    "bcryptjs": "^2.4.3",
    "shared": "workspace:*"
  },
  "devDependencies": {
    "drizzle-kit": "^0.21.4",
    "@types/bcryptjs": "^2.4.6",
    "typescript": "^5.4.5"
  }
}
```

- [ ] **Créer backend/tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "skipLibCheck": true,
    "paths": {
      "shared": ["../shared/types.ts"]
    }
  }
}
```

- [ ] **Créer backend/drizzle.config.ts**

```typescript
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

- [ ] **Installer les dépendances**

```bash
cd backend && bun install
```

- [ ] **Commit**

```bash
git add backend/package.json backend/tsconfig.json backend/drizzle.config.ts
git commit -m "chore(backend): init package + drizzle config"
```

---

## Task 4 — Drizzle schema

**Files:**
- Create: `backend/src/db/schema.ts`
- Create: `backend/src/db/client.ts`

- [ ] **Créer backend/src/db/schema.ts**

```typescript
import {
  pgTable, uuid, text, integer, boolean, timestamp, pgEnum, jsonb
} from 'drizzle-orm/pg-core';

export const propertyTypeEnum = pgEnum('property_type',
  ['maison', 'appartement', 'terrain', 'local', 'immeuble', 'cave']);
export const propertyStatusEnum = pgEnum('property_status',
  ['a_vendre', 'vendu', 'sous_compromis']);
export const dpeClassEnum = pgEnum('dpe_class', ['A', 'B', 'C', 'D', 'E', 'F', 'G']);
export const contactIntentEnum = pgEnum('contact_intent', ['achat', 'vente']);

export const teamMembers = pgTable('team_members', {
  id:           uuid('id').defaultRandom().primaryKey(),
  name:         text('name').notNull(),
  role:         text('role').notNull(),
  photoUrl:     text('photo_url'),
  displayOrder: integer('display_order').notNull().default(0),
});

export const properties = pgTable('properties', {
  id:          uuid('id').defaultRandom().primaryKey(),
  slug:        text('slug').notNull().unique(),
  type:        propertyTypeEnum('type').notNull(),
  title:       text('title').notNull(),
  city:        text('city').notNull(),
  price:       integer('price').notNull(),
  status:      propertyStatusEnum('status').notNull().default('a_vendre'),
  exclusive:   boolean('exclusive').notNull().default(false),
  description: text('description'),
  features:    text('features').array().notNull().default([]),
  near:        jsonb('near').notNull().default([]),
  beds:        integer('beds'),
  rooms:       integer('rooms'),
  area:        integer('area'),
  land:        integer('land'),
  year:        integer('year'),
  heat:        text('heat'),
  dpeValue:    integer('dpe_value'),
  dpeClass:    dpeClassEnum('dpe_class'),
  gesValue:    integer('ges_value'),
  gesClass:    dpeClassEnum('ges_class'),
  energyCost:  text('energy_cost'),
  hasVideo:    boolean('has_video').notNull().default(false),
  hasTour:     boolean('has_tour').notNull().default(false),
  agentId:     uuid('agent_id').references(() => teamMembers.id, { onDelete: 'set null' }),
  createdAt:   timestamp('created_at').defaultNow().notNull(),
  updatedAt:   timestamp('updated_at').defaultNow().notNull(),
});

export const propertyPhotos = pgTable('property_photos', {
  id:         uuid('id').defaultRandom().primaryKey(),
  propertyId: uuid('property_id').notNull().references(() => properties.id, { onDelete: 'cascade' }),
  url:        text('url').notNull(),
  caption:    text('caption'),
  position:   integer('position').notNull().default(0),
});

export const adminUsers = pgTable('admin_users', {
  id:           uuid('id').defaultRandom().primaryKey(),
  email:        text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt:    timestamp('created_at').defaultNow().notNull(),
});

export const contactSubmissions = pgTable('contact_submissions', {
  id:        uuid('id').defaultRandom().primaryKey(),
  intent:    contactIntentEnum('intent').notNull(),
  name:      text('name').notNull(),
  email:     text('email').notNull(),
  phone:     text('phone'),
  message:   text('message').notNull(),
  read:      boolean('read').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const alertSubscriptions = pgTable('alert_subscriptions', {
  id:        uuid('id').defaultRandom().primaryKey(),
  name:      text('name').notNull(),
  email:     text('email').notNull(),
  phone:     text('phone'),
  type:      text('type'),
  city:      text('city').notNull(),
  priceMax:  integer('price_max'),
  rooms:     integer('rooms'),
  beds:      integer('beds'),
  areaMin:   integer('area_min'),
  duration:  text('duration').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

- [ ] **Créer backend/src/db/client.ts**

```typescript
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
```

- [ ] **Commit**

```bash
git add backend/src/db/
git commit -m "feat(backend): drizzle schema + neon client"
```

---

## Task 5 — Migrations + seed

**Files:**
- Create: `backend/src/db/migrate.ts`
- Create: `backend/src/db/seed.ts`

- [ ] **Créer backend/src/db/migrate.ts**

```typescript
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { migrate } from 'drizzle-orm/neon-http/migrator';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

await migrate(db, { migrationsFolder: './src/db/migrations' });
console.log('✅ Migrations applied');
process.exit(0);
```

- [ ] **Générer les migrations (nécessite DATABASE_URL dans .env)**

```bash
cp .env.example .env
# Remplir DATABASE_URL avec votre URL Neon
cd backend && bun db:generate
```

Résultat attendu : dossier `backend/src/db/migrations/` créé avec des fichiers SQL.

- [ ] **Appliquer les migrations**

```bash
bun db:migrate
```

Résultat attendu : `✅ Migrations applied`

- [ ] **Créer backend/src/db/seed.ts**

```typescript
import { db } from './client';
import { teamMembers, properties, adminUsers } from './schema';
import { hash } from 'bcryptjs';

// Team
const [fressard] = await db.insert(teamMembers).values([
  { name: 'Bruno FRESSARD', role: "Président de l'agence\net négociateur immobilier", displayOrder: 0 },
]).returning();
const [delmas] = await db.insert(teamMembers).values([
  { name: 'Arnault DELMAS', role: 'Négociateur immobilier', displayOrder: 1 },
]).returning();
const [gueffier] = await db.insert(teamMembers).values([
  { name: 'Florence GUEFFIER', role: 'Négociatrice immobilière', displayOrder: 2 },
]).returning();
await db.insert(teamMembers).values([
  { name: 'Emmanuelle HÉRY', role: 'Secrétaire', displayOrder: 3 },
]);

// Properties (9 annonces du prototype)
await db.insert(properties).values([
  {
    slug: 'pavillon-jardin', type: 'maison',
    title: 'Pavillon traditionnel avec grand jardin',
    city: 'À 11 minutes de Gournay-en-Bray',
    price: 21000000, status: 'a_vendre', exclusive: true,
    description: "Pavillon traditionnel offrant de beaux volumes, implanté sur un terrain clos et arboré de 620 m².",
    features: ['Garage attenant', 'Petit chalet de jardin', 'Chauffage central', 'Dépendance de 25 m²', 'Double vitrage en PVC', 'Gaz de ville'],
    near: [{ label: 'Centre ville', distance: '1,5 km' }, { label: 'Supermarché', distance: '0,6 km' }],
    beds: 4, rooms: 6, area: 92, land: 620, year: 1986,
    heat: 'Radiateurs électriques', dpeValue: 187, dpeClass: 'D', gesValue: 43, gesClass: 'D',
    energyCost: '1 290 €', hasVideo: true, hasTour: true, agentId: gueffier.id,
  },
  {
    slug: 'appart-balcon', type: 'appartement',
    title: 'Appartement avec balcon',
    city: 'À 11 minutes de Gournay-en-Bray',
    price: 21000000, status: 'a_vendre', exclusive: false,
    description: "Appartement traversant au cœur de Gisors, entièrement rénové.",
    features: ['Balcon 9 m²', 'Place de parking', 'Cuisine équipée', 'Double vitrage en PVC', 'Cave', 'Ascenseur'],
    near: [{ label: 'Centre ville', distance: '0,2 km' }, { label: 'Gare', distance: '0,4 km' }],
    beds: 2, rooms: 3, area: 52, year: 1998,
    heat: 'Chauffage collectif', dpeValue: 165, dpeClass: 'D', gesValue: 34, gesClass: 'C',
    energyCost: '980 €', hasVideo: true, hasTour: true, agentId: gueffier.id,
  },
  {
    slug: 'cave-centre', type: 'cave',
    title: 'Grande cave en centre-ville', city: 'Gisors',
    price: 21000000, status: 'a_vendre', exclusive: false,
    description: "Vaste cave voûtée en pierre située au cœur de Gisors.",
    features: ['Accès indépendant', 'Hauteur sous plafond confortable'],
    near: [{ label: 'Centre ville', distance: '20 m' }],
    rooms: 1, area: 292, year: 1947, heat: 'Aucun',
    hasVideo: false, hasTour: true, agentId: gueffier.id,
  },
  {
    slug: 'usage-mixte', type: 'immeuble',
    title: 'Ensemble immobilier à usage mixte',
    city: 'À 11 minutes de Gournay-en-Bray',
    price: 23000000, status: 'a_vendre', exclusive: false,
    description: "Ensemble immobilier à usage mixte composé d'un local commercial en rez-de-chaussée et d'un logement à l'étage.",
    features: ['Garage attenant', 'Chauffage central', 'Dépendance de 25 m²', 'Double vitrage en PVC', 'Gaz de ville'],
    near: [{ label: 'Centre ville', distance: '1,5 km' }],
    beds: 4, rooms: 6, area: 82, land: 620, year: 1907,
    heat: 'Chauffage central gaz', dpeValue: 187, dpeClass: 'D', gesValue: 43, gesClass: 'D',
    energyCost: '1 290 €', hasVideo: false, hasTour: true, agentId: delmas.id,
  },
  {
    slug: 'local-commercial', type: 'local',
    title: 'Local commercial en centre-ville', city: 'Gisors',
    price: 21000000, status: 'a_vendre', exclusive: false,
    description: "Local commercial de grande surface en centre-ville, en parfait état.",
    features: ['Garage attenant', 'Chauffage central', 'Double vitrage en PVC', 'Gaz de ville'],
    near: [{ label: 'Centre ville', distance: '10 m' }],
    rooms: 5, area: 292, land: 620, year: 1990,
    heat: 'Chauffage central', dpeValue: 187, dpeClass: 'D', gesValue: 43, gesClass: 'D',
    energyCost: '1 290 €', hasVideo: true, hasTour: true, agentId: gueffier.id,
  },
  {
    slug: 'terrain-village', type: 'terrain',
    title: 'Terrain dans charmant village', city: 'À 8 minutes de Gisors',
    price: 1500000, status: 'a_vendre', exclusive: true,
    description: "Terrain arboré au cœur d'un charmant village normand.",
    features: ['Terrain arboré', 'Au calme'],
    near: [{ label: 'Centre ville', distance: '1,5 km' }],
    land: 620, year: 1996, hasVideo: true, hasTour: false, agentId: fressard.id,
  },
  {
    slug: 'plain-pied', type: 'maison',
    title: 'Maison de plain-pied', city: 'Étrepagny',
    price: 25800000, status: 'a_vendre', exclusive: true,
    description: "Maison de plain-pied récente offrant un séjour lumineux, trois chambres.",
    features: ['Garage', 'Pompe à chaleur', 'Terrain clos', 'Double vitrage en PVC', 'Cellier'],
    near: [{ label: 'Centre ville', distance: '0,8 km' }, { label: 'École', distance: '0,3 km' }],
    beds: 3, rooms: 5, area: 95, land: 430, year: 2008,
    heat: 'Pompe à chaleur', dpeValue: 110, dpeClass: 'C', gesValue: 12, gesClass: 'A',
    energyCost: '760 €', hasVideo: false, hasTour: true, agentId: delmas.id,
  },
  {
    slug: 'familiale-campagne', type: 'maison',
    title: 'Maison familiale à la campagne', city: '9 km de Gisors',
    price: 35200000, status: 'a_vendre', exclusive: false,
    description: "Maison familiale spacieuse à la campagne, quatre chambres, double séjour.",
    features: ['Garage double', 'Cheminée', 'Dépendances', 'Jardin paysager', 'Buanderie'],
    near: [{ label: 'Centre ville', distance: '9 km' }],
    beds: 4, rooms: 7, area: 150, land: 460, year: 1975,
    heat: 'Chauffage central fioul', dpeValue: 210, dpeClass: 'E', gesValue: 48, gesClass: 'D',
    energyCost: '1 980 €', hasVideo: false, hasTour: true, agentId: gueffier.id,
  },
  {
    slug: 'maison-jardin', type: 'maison',
    title: 'Charmante maison avec grand jardin', city: 'Trie-de-Gournay',
    price: 21300000, status: 'a_vendre', exclusive: false,
    description: "Charmante maison de caractère avec son jardin clos de 610 m².",
    features: ['Garage', 'Cheminée', 'Jardin clos', 'Combles aménageables', 'Double vitrage'],
    near: [{ label: 'Centre ville', distance: '1 km' }, { label: 'École', distance: '0,6 km' }],
    beds: 3, rooms: 5, area: 90, land: 610, year: 1969,
    heat: 'Chauffage central gaz', dpeValue: 175, dpeClass: 'D', gesValue: 38, gesClass: 'D',
    energyCost: '1 320 €', hasVideo: false, hasTour: true, agentId: fressard.id,
  },
]);

// Admin user
await db.insert(adminUsers).values({
  email: process.env.ADMIN_EMAIL!,
  passwordHash: await hash(process.env.ADMIN_PASSWORD!, 10),
});

console.log('✅ Seed terminé');
process.exit(0);
```

- [ ] **Lancer le seed**

```bash
bun db:seed
```

Résultat attendu : `✅ Seed terminé`

- [ ] **Commit**

```bash
git add backend/src/db/migrate.ts backend/src/db/seed.ts
git commit -m "feat(backend): migration script + seed 9 annonces"
```

---

## Task 6 — Auth plugin + route

**Files:**
- Create: `backend/src/plugins/auth-plugin.ts`
- Create: `backend/src/routes/auth.ts`

- [ ] **Créer backend/src/plugins/auth-plugin.ts**

```typescript
import { Elysia } from 'elysia';
import { jwt } from '@elysiajs/jwt';

export const authPlugin = new Elysia({ name: 'auth-plugin' })
  .use(jwt({ name: 'jwt', secret: process.env.JWT_SECRET! }))
  .derive({ as: 'scoped' }, async ({ jwt, cookie: { auth }, set }) => {
    return {
      async requireAdmin() {
        const payload = await jwt.verify(auth.value);
        if (!payload) {
          set.status = 401;
          throw new Error('Non autorisé');
        }
        return payload as { id: string; email: string };
      },
    };
  });
```

- [ ] **Créer backend/src/routes/auth.ts**

```typescript
import { Elysia, t } from 'elysia';
import { jwt } from '@elysiajs/jwt';
import { compare } from 'bcryptjs';
import { db } from '../db/client';
import { adminUsers } from '../db/schema';
import { eq } from 'drizzle-orm';

export const authRoutes = new Elysia({ prefix: '/api/auth' })
  .use(jwt({ name: 'jwt', secret: process.env.JWT_SECRET! }))
  .post('/login', async ({ jwt, body, cookie: { auth }, set }) => {
    const { email, password } = body;
    const [user] = await db.select().from(adminUsers).where(eq(adminUsers.email, email));
    if (!user || !(await compare(password, user.passwordHash))) {
      set.status = 401;
      return { error: 'Email ou mot de passe incorrect' };
    }
    const token = await jwt.sign({ id: user.id, email: user.email });
    auth.set({ value: token, httpOnly: true, sameSite: 'strict', maxAge: 7 * 24 * 60 * 60, path: '/' });
    return { ok: true };
  }, {
    body: t.Object({ email: t.String(), password: t.String() }),
  })
  .post('/logout', ({ cookie: { auth } }) => {
    auth.remove();
    return { ok: true };
  })
  .get('/me', async ({ jwt, cookie: { auth }, set }) => {
    const payload = await jwt.verify(auth.value);
    if (!payload) { set.status = 401; return { error: 'Non autorisé' }; }
    return { id: (payload as any).id, email: (payload as any).email };
  });
```

- [ ] **Vérifier TypeScript**

```bash
cd backend && bun tsc --noEmit
```

Résultat attendu : pas d'erreurs.

- [ ] **Commit**

```bash
git add backend/src/plugins/auth-plugin.ts backend/src/routes/auth.ts
git commit -m "feat(backend): auth JWT login/logout/me"
```

---

## Task 7 — Routes Properties (public + admin)

**Files:**
- Create: `backend/src/routes/properties.ts`

- [ ] **Créer backend/src/routes/properties.ts**

```typescript
import { Elysia, t } from 'elysia';
import { db } from '../db/client';
import { properties, propertyPhotos, teamMembers } from '../db/schema';
import { eq, and, lte, ilike, or, desc, asc } from 'drizzle-orm';
import { authPlugin } from '../plugins/auth-plugin';

// Helper : sérialise une row properties en objet Property
async function withPhotosAndAgent(rows: (typeof properties.$inferSelect)[]) {
  if (!rows.length) return [];
  const ids = rows.map(r => r.id);
  const photos = await db.select().from(propertyPhotos)
    .where(ids.length === 1
      ? eq(propertyPhotos.propertyId, ids[0])
      : undefined  // fetch all then filter for multi
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

  // GET /api/properties?type=&maxPrice=&q=&sort=recent|asc|desc
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

  // GET /api/properties/:slug
  .get('/:slug', async ({ params, set }) => {
    const [row] = await db.select().from(properties)
      .where(eq(properties.slug, params.slug));
    if (!row) { set.status = 404; return { error: 'Bien non trouvé' }; }
    const [result] = await withPhotosAndAgent([row]);
    return result;
  })

  // POST /api/properties (admin)
  .post('/', async ({ body, requireAdmin }) => {
    await requireAdmin();
    const [row] = await db.insert(properties).values({
      ...body,
      near: body.near,
      features: body.features,
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

  // PUT /api/properties/:id (admin)
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

  // DELETE /api/properties/:id (admin)
  .delete('/:id', async ({ params, requireAdmin, set }) => {
    await requireAdmin();
    const [deleted] = await db.delete(properties)
      .where(eq(properties.id, params.id))
      .returning();
    if (!deleted) { set.status = 404; return { error: 'Bien non trouvé' }; }
    return { ok: true };
  });
```

- [ ] **Commit**

```bash
git add backend/src/routes/properties.ts
git commit -m "feat(backend): routes properties public + admin CRUD"
```

---

## Task 8 — Upload route + plugin

**Files:**
- Create: `backend/src/routes/upload.ts`

- [ ] **Créer backend/src/routes/upload.ts**

```typescript
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
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

export const uploadRoutes = new Elysia({ prefix: '/api' })
  .use(authPlugin)

  // POST /api/upload — multipart, retourne { url }
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

  // POST /api/properties/:id/photos — ajoute une photo à un bien
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

  // DELETE /api/upload/:filename — supprime le fichier du disque
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

  // DELETE /api/photos/:id — supprime la ligne en BDD
  .delete('/photos/:id', async ({ params, requireAdmin, set }) => {
    await requireAdmin();
    const [deleted] = await db.delete(propertyPhotos)
      .where(eq(propertyPhotos.id, params.id))
      .returning();
    if (!deleted) { set.status = 404; return { error: 'Photo non trouvée' }; }
    return { ok: true };
  });
```

- [ ] **Commit**

```bash
git add backend/src/routes/upload.ts
git commit -m "feat(backend): upload photos VPS + routes photos"
```

---

## Task 9 — Routes contact, alertes, équipe

**Files:**
- Create: `backend/src/routes/contact.ts`
- Create: `backend/src/routes/alerts.ts`
- Create: `backend/src/routes/team.ts`

- [ ] **Créer backend/src/routes/contact.ts**

```typescript
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
```

- [ ] **Créer backend/src/routes/alerts.ts**

```typescript
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
```

- [ ] **Créer backend/src/routes/team.ts**

```typescript
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
```

- [ ] **Commit**

```bash
git add backend/src/routes/contact.ts backend/src/routes/alerts.ts backend/src/routes/team.ts
git commit -m "feat(backend): routes contact + alertes + équipe"
```

---

## Task 10 — App ElysiaJS principale + smoke test

**Files:**
- Create: `backend/src/index.ts`

- [ ] **Créer backend/src/index.ts**

```typescript
import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { staticPlugin } from '@elysiajs/static';
import { join } from 'path';
import { authRoutes } from './routes/auth';
import { propertiesRoutes } from './routes/properties';
import { uploadRoutes } from './routes/upload';
import { contactRoutes } from './routes/contact';
import { alertsRoutes } from './routes/alerts';
import { teamRoutes } from './routes/team';

const app = new Elysia()
  .use(cors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
    credentials: true,
  }))
  .use(staticPlugin({
    assets: join(import.meta.dir, '../uploads'),
    prefix: '/uploads',
  }))
  .use(authRoutes)
  .use(propertiesRoutes)
  .use(uploadRoutes)
  .use(contactRoutes)
  .use(alertsRoutes)
  .use(teamRoutes)
  .get('/health', () => ({ ok: true }))
  .listen(process.env.PORT ?? 3001);

console.log(`🦊 Backend Agence Leblanc — http://localhost:${app.server?.port}`);

export type App = typeof app;
```

- [ ] **Lancer le backend**

```bash
cd backend && bun dev
```

Résultat attendu :
```
🦊 Backend Agence Leblanc — http://localhost:3001
```

- [ ] **Smoke test GET /health**

```bash
curl http://localhost:3001/health
```

Résultat attendu : `{"ok":true}`

- [ ] **Smoke test GET /api/properties**

```bash
curl http://localhost:3001/api/properties | bun -e "const d=await Bun.stdin.json(); console.log(d.length, 'biens')"
```

Résultat attendu : `9 biens`

- [ ] **Smoke test POST /api/auth/login**

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@agence-leblanc.fr","password":"changeme"}' \
  -c /tmp/cookies.txt
```

Résultat attendu : `{"ok":true}` + cookie `auth` dans `/tmp/cookies.txt`

- [ ] **Smoke test GET /api/auth/me (avec cookie)**

```bash
curl http://localhost:3001/api/auth/me -b /tmp/cookies.txt
```

Résultat attendu : `{"id":"...","email":"admin@agence-leblanc.fr"}`

- [ ] **Commit final**

```bash
git add backend/src/index.ts
git commit -m "feat(backend): app Elysia complète + export type App"
```

---

## Résumé Plan 1

À l'issue de ce plan :
- ✅ Monorepo Bun avec `shared`, `backend`, `frontend` (dossier vide)
- ✅ Schéma Drizzle migré sur Neon, seed avec 9 annonces
- ✅ API ElysiaJS opérationnelle sur `:3001`
- ✅ Type `App` exporté, prêt pour Eden Treaty côté frontend

**Suite → Plan 2 :** Frontend public (TanStack Router + TanStack Query + Tailwind v4 + Eden Treaty).
