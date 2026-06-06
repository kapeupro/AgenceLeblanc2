# Agence Leblanc — Design Spec
_2026-06-04_

## Contexte

Refonte complète du site de l'Agence Leblanc (agence immobilière familiale, Gisors, depuis 1926). Le prototype HTML/React standalone existant sert de référence visuelle. L'objectif est un site production-ready avec frontend typesafe, API REST, back-office admin et persistance en base de données.

---

## Stack technique

| Couche | Technologie |
|---|---|
| Frontend | React 19 + Vite + TypeScript |
| Routing | TanStack Router (file-based) |
| Data fetching | TanStack Query v5 |
| Backend | ElysiaJS sur Bun |
| ORM | Drizzle ORM |
| Base de données | PostgreSQL (Neon) |
| Auth | JWT (email/mot de passe) — bcrypt pour les hash |
| Type-safety API | Eden Treaty (client ElysiaJS typesafe) |
| Stockage photos | Filesystem VPS (`/uploads`) servi en statique |
| CSS | Tailwind CSS v4 |
| Package manager | Bun workspaces (monorepo) |
| Dev proxy | Vite proxy → backend:3001 en développement |

---

## Structure du projet (monorepo)

```
agence-leblanc/
├── frontend/          # React + TanStack + Vite
│   ├── src/
│   │   ├── routes/        # Pages (TanStack Router file-based)
│   │   ├── components/    # Header, Footer, PropertyCard…
│   │   ├── lib/
│   │   │   └── api.ts     # Client Eden Treaty typesafe
│   │   └── hooks/         # useProperties, useAuth…
│   └── vite.config.ts
├── backend/           # ElysiaJS + Bun + Drizzle
│   ├── src/
│   │   ├── routes/        # Handlers API
│   │   ├── db/
│   │   │   ├── schema.ts  # Schéma Drizzle
│   │   │   └── index.ts   # Client Neon
│   │   └── plugins/       # auth JWT, cors, upload
│   ├── uploads/           # Photos stockées sur le VPS
│   └── index.ts
└── shared/            # Types TypeScript partagés
    └── types.ts
```

---

## Base de données (Drizzle schema)

### Table `properties`
```
id            uuid PK
slug          text UNIQUE         — URL-friendly (ex: pavillon-jardin-gisors)
type          enum(maison, appartement, terrain, local, immeuble, cave)
title         text
city          text
price         integer             — en centimes pour éviter les flottants
status        enum(a_vendre, vendu, sous_compromis)
exclusive     boolean DEFAULT false
description   text
features      text[]              — tableau de strings
near          jsonb               — [{label, distance}]
beds          integer NULLABLE
rooms         integer NULLABLE
area          integer NULLABLE    — m²
land          integer NULLABLE    — m² terrain
year          integer NULLABLE
heat          text NULLABLE
dpe_value     integer NULLABLE
dpe_class     char(1) NULLABLE
ges_value     integer NULLABLE
ges_class     char(1) NULLABLE
energy_cost   text NULLABLE
has_video     boolean DEFAULT false
has_tour      boolean DEFAULT false
agent_id      uuid FK → team_members
created_at    timestamp
updated_at    timestamp
```

### Table `property_photos`
```
id            uuid PK
property_id   uuid FK → properties
url           text               — chemin relatif /uploads/...
caption       text NULLABLE
position      integer            — ordre d'affichage
```

### Table `team_members`
```
id            uuid PK
name          text
role          text
photo_url     text NULLABLE
display_order integer
```

### Table `contact_submissions`
```
id            uuid PK
intent        enum(achat, vente)
name          text
email         text
phone         text NULLABLE
message       text
read          boolean DEFAULT false
created_at    timestamp
```

### Table `alert_subscriptions`
```
id            uuid PK
name          text
email         text
phone         text NULLABLE
type          text NULLABLE
city          text
price_max     integer NULLABLE
rooms         integer NULLABLE
beds          integer NULLABLE
area_min      integer NULLABLE
duration      text               — "1 mois", "3 mois"…
created_at    timestamp
```

### Table `admin_users`
```
id            uuid PK
email         text UNIQUE
password_hash text
created_at    timestamp
```

---

## API Backend (ElysiaJS)

### Auth
- `POST /api/auth/login` — email + password → JWT (httpOnly cookie)
- `POST /api/auth/logout` — supprime le cookie
- `GET /api/auth/me` — vérifie le token, retourne l'admin

### Biens (public)
- `GET /api/properties` — liste avec filtres `?type=&maxPrice=&q=&sort=`
- `GET /api/properties/:slug` — détail d'une annonce

### Biens (admin — JWT requis)
- `POST /api/properties` — créer
- `PUT /api/properties/:id` — modifier
- `DELETE /api/properties/:id` — supprimer

### Photos (admin)
- `POST /api/upload` — multipart, retourne le chemin `/uploads/...`
- `DELETE /api/upload/:filename` — supprime le fichier

### Contact & alertes (public)
- `POST /api/contact` — soumet un message
- `POST /api/alerts` — crée une alerte

### Admin divers
- `GET /api/contacts` — liste des messages (admin)
- `PUT /api/contacts/:id/read` — marquer comme lu
- `GET /api/team` — liste équipe
- `POST/PUT/DELETE /api/team/:id` — CRUD équipe (admin)

---

## Pages publiques (TanStack Router)

| Route | Composant | Description |
|---|---|---|
| `/` | `HomePage` | Hero + search + dernières annonces + stats + services + teaser agence |
| `/biens` | `BiensPage` | Filtres (type, budget, mot-clé) + grille de PropertyCard |
| `/biens/$slug` | `PropertyPage` | Galerie + specs + DPE + formulaire visite + biens similaires |
| `/vendre` | `VendrePage` | Pitch vendeur + avantages + services + CTA |
| `/agence` | `AgencePage` | Histoire + équipe + coordonnées |
| `/contact` | `ContactPage` | Formulaire Achat/Vente → API |
| `/calcul` | `CalcPage` | Calculatrice mensualités (client-side) |
| `/alertes` | `AlertesPage` | Formulaire d'alerte e-mail → API |

---

## Back-office admin (TanStack Router — route `/admin`)

Toutes les routes `/admin/*` sont protégées : redirect vers `/admin/login` si pas de JWT valide.

| Route | Description |
|---|---|
| `/admin/login` | Formulaire email/mot de passe |
| `/admin` | Dashboard : stats rapides (nb biens, messages non lus) |
| `/admin/biens` | Tableau des annonces + bouton Nouveau |
| `/admin/biens/nouveau` | Formulaire création complet + upload photos |
| `/admin/biens/$id` | Formulaire édition + gestion photos + suppression |
| `/admin/contacts` | Liste des messages, marquage lu/non lu |
| `/admin/equipe` | Gestion des membres de l'équipe |

---

## Auth flow

1. Admin poste email + mot de passe sur `POST /api/auth/login`
2. ElysiaJS vérifie le hash bcrypt, génère un JWT signé (secret env var)
3. JWT retourné dans un cookie `httpOnly; SameSite=Strict; Secure`
4. Chaque requête admin envoie le cookie automatiquement
5. Middleware ElysiaJS vérifie et décode le JWT à chaque route protégée
6. Côté frontend, TanStack Router `beforeLoad` vérifie l'auth via `GET /api/auth/me` pour protéger les routes `/admin/*`

---

## Gestion des photos

- Upload via `POST /api/upload` (multipart/form-data)
- ElysiaJS valide le type MIME (jpeg, png, webp) et la taille (max 10 MB)
- Fichier sauvegardé dans `backend/uploads/{uuid}.{ext}`
- URL retournée : `/uploads/{uuid}.{ext}` (servi en statique par ElysiaJS)
- Suppression via `DELETE /api/upload/:filename` lors d'une modification

---

## Charte graphique (conservée du prototype)

```css
--navy:    #122866
--sky:     #dcebfd
--blush:   #fef4f3
--coral:   #c75d48
--ink:     #1f2433
```
Fonts : Anton (titres) + Poppins (corps) + Yellowtail (script "Depuis 1926") — Google Fonts.

---

## Ce qui n'est pas dans le scope

- Envoi d'emails réel (les soumissions sont sauvegardées en BDD uniquement)
- Internationalisation
- PWA / app mobile
- Intégration portails (SeLoger, Bien'ici)
- Paiement
