# Agence Leblanc — Site immobilier

Site vitrine et back-office de l'Agence Leblanc (Gisors, 27140).  
Stack full-TypeScript, monorepo Bun, base de données PostgreSQL sur Neon.

---

## Stack technique

| Couche | Technologie |
|---|---|
| Runtime | [Bun](https://bun.sh) |
| Backend | [ElysiaJS](https://elysiajs.com) + [Drizzle ORM](https://orm.drizzle.team) |
| Base de données | [Neon PostgreSQL](https://neon.tech) (serverless) |
| Frontend | [React 19](https://react.dev) + [Vite 5](https://vitejs.dev) |
| Routing frontend | [TanStack Router v1](https://tanstack.com/router) (file-based) |
| Data fetching | [TanStack Query v5](https://tanstack.com/query) |
| CSS | [Tailwind CSS v4](https://tailwindcss.com) |
| Auth | JWT en cookie httpOnly + bcrypt |
| Client API | [Eden Treaty](https://elysiajs.com/eden/treaty) (typesafe depuis `App`) |

---

## Structure du projet

```
agence-leblanc/
├── shared/          # Types TypeScript partagés (Property, TeamMember…)
├── backend/         # API ElysiaJS
│   └── src/
│       ├── db/      # Schema Drizzle, migrations, seed, import
│       ├── routes/  # auth, properties, upload, contact, alerts, team, settings
│       └── plugins/ # auth-plugin (JWT + requireAdmin)
├── frontend/        # Application React
│   └── src/
│       ├── routes/  # Pages publiques + admin (file-based routing)
│       ├── components/
│       └── lib/     # Client Eden Treaty (api.ts)
└── package.json     # Workspace Bun (shared + backend + frontend)
```

---

## Prérequis

- [Bun](https://bun.sh) ≥ 1.1
- Un projet [Neon](https://neon.tech) avec l'URL de connexion PostgreSQL

---

## Installation

```bash
# Cloner et installer les dépendances
git clone <repo>
cd agence-leblanc
bun install
```

---

## Configuration

Créer un fichier `.env` à la racine **et** dans `backend/` avec le même contenu :

```env
DATABASE_URL=postgresql://user:password@host/db?sslmode=require
JWT_SECRET=<chaîne aléatoire longue>
ADMIN_EMAIL=admin@agence-leblanc.fr
ADMIN_PASSWORD=<mot_de_passe_admin>
PORT=3001
FRONTEND_URL=http://localhost:5173
```

---

## Base de données

```bash
# Générer les migrations depuis le schema
bun db:generate

# Appliquer les migrations
bun db:migrate

# Insérer les données de test
bun db:seed

# (Optionnel) Importer les 63 annonces depuis l'ancien site
bun db:import

# Exporter les annonces vers data/annonces.json + data/annonces.csv
bun db:export
```

> Les prix sont stockés en **centimes** (convention de l'app : `× 100` à la
> saisie, `/ 100` à l'affichage). L'export inclut `priceEuros` **et**
> `priceCents` pour lever toute ambiguïté côté consommateur.

---

## Développement

```bash
# Lancer backend (port 3001) + frontend (port 5173) simultanément
bun dev

# Ou séparément
bun dev:backend
bun dev:frontend
```

Le frontend est accessible sur `http://localhost:5173`.  
L'admin est sur `http://localhost:5173/admin` (identifiants dans `.env`).

---

## Build production

```bash
bun run --cwd frontend build
# Sortie dans frontend/dist/
```

Le backend sert les assets statiques depuis `backend/uploads/` via le préfixe `/uploads`.

---

## Pages publiques

| Route | Description |
|---|---|
| `/` | Accueil — hero, recherche, annonces récentes |
| `/biens` | Liste des annonces avec filtres type/ville/budget |
| `/biens/:slug` | Fiche détaillée d'un bien (photos, DPE, carte) |
| `/agence` | Présentation de l'agence et de l'équipe |
| `/vendre` | Page vendre + formulaire d'estimation |
| `/contact` | Formulaire de contact |
| `/calcul` | Calculateur de mensualités |
| `/alertes` | Inscription aux alertes e-mail |

---

## Back-office admin

Accessible sur `/admin/login`.

| Section | Description |
|---|---|
| Dashboard | Vue d'ensemble — nb annonces, contacts, équipe |
| Annonces | Liste, création, édition complète, suppression, upload photos |
| Messages | Contacts reçus avec statut lu/non-lu |
| Équipe | Membres avec photo, rôle et ordre d'affichage |
| Paramètres | Photos du site (hero, façade) + infos de contact |

---

## API backend

Préfixe : `/api`

| Méthode | Route | Auth | Description |
|---|---|---|---|
| `GET` | `/properties` | — | Liste des annonces (filtres: type, maxPrice, q, sort) |
| `GET` | `/properties/:id` | — | Détail par UUID ou slug |
| `POST` | `/properties` | admin | Créer une annonce |
| `PUT` | `/properties/:id` | admin | Modifier une annonce |
| `DELETE` | `/properties/:id` | admin | Supprimer une annonce |
| `POST` | `/properties/:id/photos` | admin | Ajouter une photo |
| `DELETE` | `/photos/:id` | admin | Supprimer une photo |
| `POST` | `/upload` | admin | Upload fichier → retourne URL |
| `GET` | `/team` | — | Liste de l'équipe |
| `POST` | `/team` | admin | Ajouter un membre |
| `DELETE` | `/team/:id` | admin | Supprimer un membre |
| `GET` | `/contact` | admin | Messages de contact |
| `PUT` | `/contact/:id/read` | admin | Marquer comme lu |
| `GET` | `/alerts` | admin | Abonnements alertes |
| `GET` | `/settings` | — | Paramètres du site (clé/valeur) |
| `PUT` | `/settings/:key` | admin | Modifier un paramètre |
| `POST` | `/auth/login` | — | Connexion admin |
| `POST` | `/auth/logout` | — | Déconnexion |
| `GET` | `/auth/me` | — | Session courante |

---

## Variables d'environnement

| Variable | Description |
|---|---|
| `DATABASE_URL` | URL de connexion Neon PostgreSQL |
| `JWT_SECRET` | Secret pour signer les tokens JWT |
| `ADMIN_EMAIL` | Email de l'administrateur |
| `ADMIN_PASSWORD` | Mot de passe de l'administrateur |
| `PORT` | Port du backend (défaut : 3001) |
| `FRONTEND_URL` | URL du frontend pour CORS (défaut : http://localhost:5173) |

---

## Identifiants par défaut

```
URL admin : http://localhost:5173/admin
Email     : admin@agence-leblanc.fr
Mot de passe : leblanc2026
```

> Changer le mot de passe avant la mise en production via `ADMIN_PASSWORD` dans `.env` puis `bun db:seed`.
