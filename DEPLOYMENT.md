# Déploiement — Agence Leblanc

L'application se déploie comme **un seul service** : le backend Bun sert
l'API (`/api/*`), les photos (`/uploads/*`) **et** le SPA React buildé
(`frontend/dist`). Tout est sur la même origine → pas de CORS, les cookies
d'authentification fonctionnent sans configuration.

---

## 1. Variables d'environnement

| Variable | Obligatoire | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | URL Neon PostgreSQL (`?sslmode=require`) |
| `JWT_SECRET` | ✅ | Secret long et aléatoire (`openssl rand -hex 32`) |
| `ADMIN_EMAIL` | ✅ | Email de connexion admin |
| `ADMIN_PASSWORD` | ✅ | Mot de passe admin (à changer !) |
| `NODE_ENV` | ✅ | `production` → active le cookie `secure` (HTTPS requis) |
| `PORT` | — | Port d'écoute (défaut 3001 ; souvent imposé par l'hébergeur) |
| `FRONTEND_URL` | — | **Uniquement** si le front est sur une autre origine que l'API. En image unique, laisser vide. |

Voir `.env.example`.

---

## 2. Commandes de build / run

```bash
bun install            # installe le monorepo
bun run build          # build le frontend → frontend/dist
bun run start          # démarre le backend (sert l'API + le SPA)
```

Le backend détecte automatiquement `frontend/dist` :
- présent → il sert le SPA + fallback deep-links (`/admin`, `/biens/:slug`)
- absent → mode API seule (dev, le front tourne via Vite sur :5173)

---

## 3. Base de données (à faire une fois)

```bash
bun db:migrate         # applique le schéma
bun db:seed            # crée l'admin (ADMIN_EMAIL / ADMIN_PASSWORD)
bun db:import          # importe les 63 annonces + photos depuis l'ancien site
```

> `db:import` télécharge les photos dans `backend/uploads/` et insère les
> prix **en centimes** (convention de l'app). Si besoin, `bun db:fix-prices`
> corrige des prix stockés par erreur en euros (idempotent).

---

## 4. Photos (`backend/uploads/`) — point d'attention

Les ~178 Mo de photos **ne sont pas** dans le dépôt git ni dans l'image Docker
(voir `.dockerignore`). Trois stratégies possibles selon l'hébergeur :

1. **Volume persistant** (recommandé) : monter un volume sur `backend/uploads`,
   puis lancer `bun db:import` une fois → les photos y sont téléchargées et
   persistent. Les uploads admin futurs y restent aussi.
2. **Régénération au déploiement** : si un volume n'est pas possible mais que le
   conteneur a un disque inscriptible durable, lancer `bun db:import` après le
   premier démarrage.
3. **Stockage objet** (S3/R2) : pour un setup sans état — nécessite d'adapter la
   route d'upload (non implémenté à ce jour).

⚠️ Sans l'une de ces stratégies, les fiches s'affichent **sans photos** (la base
référence `/uploads/xxx.jpg` mais les fichiers n'existent pas sur le serveur).

---

## 5. Déploiement Docker (universel)

```bash
docker build -t agence-leblanc .
docker run -p 3001:3001 --env-file .env \
  -v $(pwd)/backend/uploads:/app/backend/uploads \
  agence-leblanc
```

Le `Dockerfile` installe les deps, build le frontend et lance le backend.
Healthcheck intégré sur `GET /health`.

---

## 6. Déploiement sans Docker (buildpack / Git)

Si l'hébergeur build depuis le dépôt :

- **Build command** : `bun install && bun run build`
- **Start command** : `bun run start`
- **Runtime** : Bun (ou Node ≥ 20 avec Bun installé)
- Définir les variables d'env de la section 1.
- Prévoir un disque/volume persistant pour `backend/uploads` (section 4).

---

## 7. Checklist mise en ligne

- [ ] Variables d'env définies (dont `NODE_ENV=production`, `JWT_SECRET` fort)
- [ ] `ADMIN_PASSWORD` changé (ne pas laisser la valeur par défaut)
- [ ] `bun db:migrate` + `bun db:seed` exécutés
- [ ] Photos disponibles (volume + `bun db:import`, section 4)
- [ ] HTTPS actif (sinon le cookie `secure` empêche la connexion admin)
- [ ] `GET /health` répond `{ "status": "ok" }`
- [ ] Page d'accueil + une fiche bien + `/admin/login` testés
